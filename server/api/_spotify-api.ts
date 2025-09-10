/**
 * Spotify Web API wrapper with error handling and business logic
 * Provides high-level functions for playlist search and genre operations
 */

import type { Playlist, PlaylistOwner } from '../../types/playlist'
import type { SearchCriteria, SearchResult } from '../../types/search'
import type {
  RateLimitConfig,
  SpotifyGenreSeedsResponse,
  SpotifyPlaylist,
  SpotifySearchResponse,
  SpotifyUser
} from '../../types/spotify'
import { makeSpotifyRequest } from './_spotify-client'

// Genre cache to reduce API calls
let genreCache: string[] | null = null
let genreCacheExpiry = 0

// Rate limiting configuration
const rateLimitConfig: RateLimitConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

/**
 * Get available music genres from Spotify
 * Uses caching to reduce API calls (genres don't change frequently)
 */
export async function getAvailableGenres(): Promise<string[]> {
  // Check cache validity (cache for 1 hour)
  if (genreCache && Date.now() < genreCacheExpiry) {
    return genreCache
  }

  try {
    const response = await makeSpotifyRequest<SpotifyGenreSeedsResponse>(
      'https://api.spotify.com/v1/recommendations/available-genre-seeds'
    )

    genreCache = response.genres.sort()
    genreCacheExpiry = Date.now() + (60 * 60 * 1000) // Cache for 1 hour

    return genreCache
  } catch (error) {
    // If API fails but we have cached data, return it
    if (genreCache) {
      return genreCache
    }

    throw new Error(`Failed to fetch available genres: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
 * Search for playlists by genres with follower count filtering
 * Combines multiple genre searches and filters by minimum follower count
 */
export async function searchPlaylistsByGenres(criteria: SearchCriteria): Promise<SearchResult> {
  const startTime = Date.now()

  try {
    // Validate genres first
    const genreValidation = await validateGenres(criteria.genres)
    if (!genreValidation.isValid) {
      throw new Error(`Invalid genres: ${genreValidation.invalidGenres.join(', ')}`)
    }

    // Build search queries for each genre
    const searchPromises = genreValidation.validGenres.map(genre =>
      searchPlaylistsByGenre(genre, Math.ceil(criteria.limit / genreValidation.validGenres.length))
    )

    // Execute searches concurrently
    const searchResults = await Promise.all(searchPromises)

    // Combine and deduplicate results
    const allPlaylists = new Map<string, Playlist>()
    let totalFound = 0

    for (const result of searchResults) {
      totalFound += result.total
      result.playlists.forEach(playlist => {
        if (playlist.followerCount >= criteria.minFollowerCount) {
          allPlaylists.set(playlist.id, playlist)
        }
      })
    }

    // Sort by follower count (descending) and limit results
    const sortedPlaylists = Array.from(allPlaylists.values())
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, criteria.limit)

    return {
      playlists: sortedPlaylists,
      totalFound: sortedPlaylists.length,
      searchCriteria: criteria,
      timestamp: new Date()
    }
  } catch (error) {
    throw new Error(`Playlist search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search playlists for a specific genre
 * Internal function used by searchPlaylistsByGenres
 */
async function searchPlaylistsByGenre(genre: string, limit: number = 50): Promise<{
  playlists: Playlist[]
  total: number
}> {
  const query = `genre:"${genre}"`

  try {
    const response = await makeSpotifyRequest<SpotifySearchResponse>(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=${Math.min(limit, 50)}`
    )

    const playlists = response.playlists.items
      .filter(playlist => playlist.owner && playlist.tracks) // Filter out incomplete data
      .map(mapSpotifyPlaylistToInternal)

    return {
      playlists,
      total: response.playlists.total
    }
  } catch (error) {
    // Log error but don't fail completely for single genre
    console.error(`Failed to search for genre "${genre}":`, error)
    return { playlists: [], total: 0 }
  }
}

/**
 * Map Spotify API playlist object to internal Playlist type
 */
function mapSpotifyPlaylistToInternal(spotifyPlaylist: SpotifyPlaylist): Playlist {
  return {
    id: spotifyPlaylist.id,
    name: spotifyPlaylist.name,
    description: spotifyPlaylist.description || undefined,
    url: spotifyPlaylist.external_urls.spotify,
    followerCount: spotifyPlaylist.followers.total,
    trackCount: spotifyPlaylist.tracks.total,
    imageUrl: spotifyPlaylist.images[0]?.url,
    owner: mapSpotifyUserToOwner(spotifyPlaylist.owner),
    genres: [], // Will be inferred from search context
    isPublic: spotifyPlaylist.public ?? true
  }
}

/**
 * Map Spotify API user object to internal PlaylistOwner type
 */
function mapSpotifyUserToOwner(spotifyUser: SpotifyUser): PlaylistOwner {
  return {
    id: spotifyUser.id,
    username: spotifyUser.id, // Spotify uses ID as username
    displayName: spotifyUser.display_name || spotifyUser.id,
    profileUrl: spotifyUser.external_urls.spotify,
    imageUrl: spotifyUser.images[0]?.url
  }
}

/**
 * Clear genre cache (useful for testing)
 */
export function clearGenreCache(): void {
  genreCache = null
  genreCacheExpiry = 0
}

/**
 * Get cache status for debugging
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
