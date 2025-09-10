/**
 * DEPRECATED - Replaced by Spotify SDK
 *
 * This file has been replaced with the official @spotify/web-api-ts-sdk.
 * The SDK handles authentication, token management, and API requests automatically.
 *
 * New implementations should use:
 * - getSpotifyClient() from ~/server/utils/spotify.ts for SDK client instances
 * - SDK automatically handles Client Credentials authentication and token refresh
 * - No manual token caching required - SDK includes built-in optimization
 */

import {
	getSpotifyClient,
	getSpotifyClientWithErrorHandler
} from '../utils/spotify'

/**
 * @deprecated Use getSpotifyClient() from ~/server/utils/spotify.ts instead
 *
 * Legacy wrapper for backwards compatibility with existing tests
 * Returns the access token from an SDK client instance
 */
export async function getSpotifyAccessToken(): Promise<string> {
	console.warn('[DEPRECATED] getSpotifyAccessToken() is deprecated. Use getSpotifyClient() from ~/server/utils/spotify.ts instead.')

	try {
		const client = getSpotifyClient()
		// SDK manages tokens internally, but we can test auth by making a simple API call
		await client.recommendations.genreSeeds()
		// Since SDK handles tokens internally, we return a placeholder for backwards compatibility
		return 'sdk-managed-token'
	} catch (error) {
		throw new Error(`SDK authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

/**
 * @deprecated Use getSpotifyClient() methods directly instead
 *
 * Legacy wrapper for backwards compatibility
 * SDK clients handle authentication automatically
 */
export async function makeSpotifyRequest<T>(
	url: string,
	_options: RequestInit = {}
): Promise<T> {
	console.warn('[DEPRECATED] makeSpotifyRequest() is deprecated. Use getSpotifyClient() methods directly instead.')

	// Extract endpoint from URL for SDK method routing
	if (url.includes('/recommendations/available-genre-seeds')) {
		const client = getSpotifyClient()
		const genres = await client.recommendations.genreSeeds()
		return genres as T
	}

	// For search endpoints, would need to parse URL and call appropriate SDK method
	throw new Error('makeSpotifyRequest is deprecated. Use appropriate SDK client methods instead.')
}

/**
 * @deprecated SDK handles token management automatically
 *
 * No-op function for backwards compatibility with tests
 */
export function clearTokenCache(): void {
	console.warn('[DEPRECATED] clearTokenCache() is deprecated. SDK handles token management automatically.')
	// SDK manages its own caching, nothing to clear
}

/**
 * @deprecated SDK handles token management automatically
 *
 * Returns placeholder status for backwards compatibility
 */
export function getTokenCacheStatus(): { cached: boolean
	expiresAt?: number
	timeUntilExpiry?: number } {
	console.warn('[DEPRECATED] getTokenCacheStatus() is deprecated. SDK handles token management automatically.')

	return {
		cached: true, // SDK always manages tokens
		expiresAt: Date.now() + 3600000, // Placeholder: 1 hour from now
		timeUntilExpiry: 3600000 // Placeholder: 1 hour
	}
}

// Export SDK-based functions for new code
export {
	getSpotifyClient,
	getSpotifyClientWithErrorHandler
}
