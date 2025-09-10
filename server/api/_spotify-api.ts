/**
 * Spotify Web API SDK-based wrapper with error handling and business logic
 * Provides high-level functions for playlist search and genre operations using @spotify/web-api-ts-sdk
 */

import { genres as availableGenres } from '../../constants/spotify-genres'
import type {
	SearchCriteria,
	SearchResult
} from '../../types/search'
import { getSpotifyClient } from '../utils/spotify'
import { adaptSpotifyPlaylists } from '../utils/spotifyAdapters'
import { createSpotifyErrorResponse } from '../utils/spotifyErrorHandler'

// SDK handles caching internally, but we can add application-level caching if needed
let genreCache: string[] | null = null
let genreCacheExpiry = 0

/**
 * Get available music genres from Spotify
 *
 * NOTE: The official /recommendations/available-genre-seeds endpoint has been
 * deprecated by Spotify, so we use a curated list of common genres that are
 * known to work with Spotify's search and recommendation APIs.
 */
export async function getAvailableGenres(): Promise<string[]> {
	// Check cache validity (cache for 1 hour)
	if (genreCache && Date.now() < genreCacheExpiry) {
		return genreCache
	}

	genreCache = availableGenres.map(genre => genre.name).sort()
	genreCacheExpiry = Date.now() + (60 * 60 * 1000) // Cache for 1 hour

	console.log('Using curated genre list with', availableGenres.length, 'genres')
	return genreCache
}/**
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
			invalidGenres
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
			[ 'playlist' ],
			'US', // Market - can be made configurable later
			Math.min(criteria.limit, 50) as any // SDK limit is 50, cast to satisfy type
		)

		// Adapt SDK results to internal format
		const adaptedPlaylists = adaptSpotifyPlaylists(
			searchResponse.playlists.items as any, // Cast to bypass type mismatch between SDK types
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
