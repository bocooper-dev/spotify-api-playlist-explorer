/**
 * Spotify Web API SDK-based wrapper with error handling and business logic
 * Provides high-level functions for playlist search and genre operations using @spotify/web-api-ts-sdk
 */

import type { Playlist } from '../../types/playlist'
import type { SearchCriteria, SearchResult } from '../../types/search'
import { getSpotifyClient } from '../utils/spotify'
import { 
  adaptSpotifyGenres, 
  adaptSpotifyPlaylists, 
  safeAdaptSpotifyPlaylist 
} from '../utils/spotifyAdapters'
import { createSpotifyErrorResponse } from '../utils/spotifyErrorHandler'

// SDK handles caching internally, but we can add application-level caching if needed
let genreCache: string[] | null = null
let genreCacheExpiry = 0

/**
 * Get available music genres from Spotify using SDK
 * Uses caching to reduce API calls (genres don't change frequently)
 */
export async function getAvailableGenres(): Promise<string[]> {
  // Check cache validity (cache for 1 hour)
  if (genreCache && Date.now() < genreCacheExpiry) {
    return genreCache
  }

  try {
    const client = getSpotifyClient()
    const response = await client.recommendations.genreSeeds()
    const genres = adaptSpotifyGenres(response)

    genreCache = genres.sort()
    genreCacheExpiry = Date.now() + (60 * 60 * 1000) // Cache for 1 hour

    return genreCache
  } catch (error) {
    // If API fails but we have cached data, return it
    if (genreCache) {
      console.warn('Spotify API error, returning cached genres:', error)
      return genreCache
    }

    const errorResponse = createSpotifyErrorResponse(error, 'Get available genres')
    throw new Error(errorResponse.message)
  }
}

/**
 * Validate genres against Spotify's available genre seeds
 */
export async function validateGenres(genres: string[]): Promise<{
  isValid: boolean
  validGenres: string[]
  invalidGenres: string[]
  error?: string
}> {
  if (genres.length === 0) {
    return {
      isValid: false,
      validGenres: [],
      invalidGenres: [],
      error: 'At least one genre is required'
    }
  }

  if (genres.length > 10) {
    return {
      isValid: false,
      validGenres: [],
      invalidGenres: [],
      error: 'Maximum of 10 genres allowed'
    }
  }

  try {
    const availableGenres = await getAvailableGenres()
    const lowerAvailableGenres = availableGenres.map(g => g.toLowerCase())

    const normalizedGenres = genres.map(g => g.toLowerCase().trim())
    const validGenres = normalizedGenres.filter(genre =>
      lowerAvailableGenres.includes(genre)
    )
    const invalidGenres = normalizedGenres.filter(genre =>
      !lowerAvailableGenres.includes(genre)
    )

    return {
      isValid: invalidGenres.length === 0,
      validGenres,
      invalidGenres,
    }
  } catch (error) {
    throw new Error(`Genre validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for playlists by genres with follower count filtering using SDK
 * Combines multiple genre searches and filters by minimum follower count
 */
export async function searchPlaylistsByGenres(criteria: SearchCriteria): Promise<SearchResult> {
  try {
    // Validate genres first
    const genreValidation = await validateGenres(criteria.genres)
    if (!genreValidation.isValid) {
      throw new Error(`Invalid genres: ${genreValidation.invalidGenres.join(', ')}`)
    }

    const client = getSpotifyClient()
    
    // Build search query combining all genres
    const genreQuery = genreValidation.validGenres
      .map(genre => `genre:${genre}`)
      .join(' OR ')
    
    // Use SDK search with combined genre query
    const searchResponse = await client.search(
      genreQuery,
      ['playlist'],
      'US', // Market - can be made configurable later
      Math.min(criteria.limit, 50) as any // SDK limit is 50, cast to satisfy type
    )

    // Adapt SDK results to internal format
    const adaptedPlaylists = adaptSpotifyPlaylists(
      searchResponse.playlists.items,
      genreValidation.validGenres
    )

    // Filter by follower count and sort
    const filteredPlaylists = adaptedPlaylists
      .filter(playlist => playlist.followerCount >= criteria.minFollowerCount)
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, criteria.limit)

    return {
      playlists: filteredPlaylists,
      totalFound: filteredPlaylists.length,
      searchCriteria: criteria,
      timestamp: new Date()
    }
  } catch (error) {
    const errorResponse = createSpotifyErrorResponse(error, 'Playlist search')
    throw new Error(errorResponse.message)
  }
}

/**
 * Search playlists for a specific genre using SDK
 * Internal function for single genre searches if needed
 */
async function searchPlaylistsByGenre(genre: string, limit: number = 50): Promise<{
  playlists: Playlist[]
  total: number
}> {
  try {
    const client = getSpotifyClient()
    const query = `genre:${genre}`

    const searchResponse = await client.search(
      query,
      ['playlist'],
      'US',
      Math.min(limit, 50) as any
    )

    // Adapt SDK results to internal format
    const playlists = searchResponse.playlists.items
      .map(sdkPlaylist => safeAdaptSpotifyPlaylist(sdkPlaylist, [genre]))
      .filter((playlist): playlist is Playlist => playlist !== null)

    return {
      playlists,
      total: searchResponse.playlists.total
    }
  } catch (error) {
    // Log error but don't fail completely for single genre
    console.error(`Failed to search for genre "${genre}":`, error)
    return { playlists: [], total: 0 }
  }
}

/**
 * Clear genre cache (useful for testing)
 * Note: SDK has its own internal caching which we cannot directly control
 */
export function clearGenreCache(): void {
  genreCache = null
  genreCacheExpiry = 0
}

/**
 * Get cache status for debugging
 * Note: This only shows application-level cache status, not SDK internal cache
 */
export function getCacheStatus(): {
  genresCached: boolean
  genresExpiry?: number
  genresTimeUntilExpiry?: number
} {
  return {
    genresCached: genreCache !== null && Date.now() < genreCacheExpiry,
    genresExpiry: genreCacheExpiry,
    genresTimeUntilExpiry: genreCache ? Math.max(0, genreCacheExpiry - Date.now()) : undefined
  }
}
