/**
 * POST /api/search/playlists - Search for playlists by criteria
 */

import type {
  ErrorResponse, SearchResponse
} from '../../../types/search'
import { validateSearchRequest } from '../../../types/search'
import { searchPlaylistsByGenres } from '../_spotify-api'

export default defineEventHandler(async (event): Promise<SearchResponse | ErrorResponse> => {
	try {
		// Parse request body
		const body = await readBody(event)

		// Validate request format
		if (!validateSearchRequest(body)) {
			setResponseStatus(event, 400)
			return {
				error: 'VALIDATION_ERROR',
				message: 'Invalid request format. Required: genres (array, 1-10 items), minFollowerCount (number >= 0), optional: limit (number 1-50)',
				details: {
					received: body,
					expected: {
						genres: 'string[] (1-10 items)',
						minFollowerCount: 'number >= 0',
						limit: 'number 1-50 (optional, default 50)'
					}
				}
			}
		}

		// Build search criteria with defaults
		const searchCriteria = {
			genres: body.genres,
			minFollowerCount: body.minFollowerCount,
			limit: body.limit || 50
		}

		// Additional validation
		if (searchCriteria.genres.length === 0) {
			setResponseStatus(event, 400)
			return {
				error: 'VALIDATION_ERROR',
				message: 'At least one genre must be specified'
			}
		}

		if (searchCriteria.genres.length > 10) {
			setResponseStatus(event, 400)
			return {
				error: 'VALIDATION_ERROR',
				message: 'Maximum of 10 genres allowed'
			}
		}

		if (searchCriteria.minFollowerCount < 0) {
			setResponseStatus(event, 400)
			return {
				error: 'VALIDATION_ERROR',
				message: 'Minimum follower count cannot be negative'
			}
		}

		if (searchCriteria.limit < 1 || searchCriteria.limit > 50) {
			setResponseStatus(event, 400)
			return {
				error: 'VALIDATION_ERROR',
				message: 'Limit must be between 1 and 50'
			}
		}

		// Execute search
		const result = await searchPlaylistsByGenres(searchCriteria)

		// Return successful response
		return {
			playlists: result.playlists,
			totalFound: result.totalFound,
			searchCriteria: result.searchCriteria,
			timestamp: result.timestamp.toISOString()
		}
	} catch (error) {
		console.error('Playlist search error:', error)

		// Handle specific error types
		if (error instanceof Error) {
			// Rate limiting error
			if (error.message.includes('rate limit') || error.message.includes('429')) {
				setResponseStatus(event, 429)
				return {
					error: 'RATE_LIMIT_ERROR',
					message: 'Too many requests. Please wait a moment and try again.'
				}
			}

			// Invalid genre error
			if (error.message.includes('Invalid genres')) {
				setResponseStatus(event, 400)
				return {
					error: 'INVALID_GENRES',
					message: error.message
				}
			}

			// Authentication error
			if (error.message.includes('authentication') || error.message.includes('credentials')) {
				setResponseStatus(event, 500)
				return {
					error: 'SPOTIFY_AUTH_ERROR',
					message: 'Spotify service authentication failed. Please try again later.'
				}
			}
		}

		// Generic server error
		setResponseStatus(event, 500)
		return {
			error: 'SEARCH_ERROR',
			message: 'Unable to search playlists. Please try again later.',
			details: ((globalThis as any).process?.env?.NODE_ENV === 'development' || (import.meta as any).env?.DEV === true || (import.meta as any).dev === true)
				? (error instanceof Error ? error.message : String(error))
				: undefined
		}
	}
})
