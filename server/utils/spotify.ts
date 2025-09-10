import type { SdkOptions } from '@spotify/web-api-ts-sdk'
import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import type { SpotifyErrorHandler } from './spotifyErrorHandler'

/**
 * Creates a Spotify SDK client instance configured for server-side use with Client Credentials flow
 *
 * Features:
 * - Automatic token management and refresh
 * - Built-in request optimization and caching
 * - Custom error handling integration
 * - Request/response logging for debugging
 *
 * @returns Configured SpotifyApi instance for server use
 */
export function getSpotifyClient(): SpotifyApi {
	const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
	const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET

	if (!spotifyClientId || !spotifyClientSecret) {
		throw new Error('Spotify API credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.')
	}

	// SDK configuration options
	const sdkOptions: SdkOptions = {
		beforeRequest: (url: string, options: RequestInit) => {
			// Log outgoing Spotify API requests for debugging
			console.log(`[Spotify SDK] Request: ${options.method || 'GET'} ${url}`)
		},

		afterRequest: (url: string, _options: RequestInit, response: Response) => {
			if (!response.ok) {
				console.error(`[Spotify SDK] Error Response: ${response.status} ${response.statusText} for ${url}`)
			} else {
				console.log(`[Spotify SDK] Success: ${response.status} for ${url}`)
			}
		}
	}

	// Create SDK client with Client Credentials flow
	// This automatically handles:
	// - Token acquisition and refresh
	// - Request batching and deduplication
	// - Built-in rate limiting and retry logic
	// - Response caching with TTL
	return SpotifyApi.withClientCredentials(
		spotifyClientId,
		spotifyClientSecret,
		[], // No scopes needed for Client Credentials (public data only)
		sdkOptions
	)
}

/**
 * Creates a Spotify SDK client with custom error handling
 *
 * @param errorHandler Custom error handler implementation
 * @returns Configured SpotifyApi instance with error handling
 */
export function getSpotifyClientWithErrorHandler(errorHandler: SpotifyErrorHandler): SpotifyApi {
	const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
	const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET

	if (!spotifyClientId || !spotifyClientSecret) {
		throw new Error('Spotify API credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.')
	}

	const sdkOptions: SdkOptions = {
		beforeRequest: (url: string, options: RequestInit) => {
			console.log(`[Spotify SDK] Request: ${options.method || 'GET'} ${url}`)
		},

		afterRequest: (url: string, _options: RequestInit, response: Response) => {
			if (!response.ok) {
				console.error(`[Spotify SDK] Error Response: ${response.status} ${response.statusText} for ${url}`)
			} else {
				console.log(`[Spotify SDK] Success: ${response.status} for ${url}`)
			}
		},

		// Integrate custom error handler
		errorHandler: errorHandler
	}

	return SpotifyApi.withClientCredentials(
		spotifyClientId,
		spotifyClientSecret,
		[],
		sdkOptions
	)
}
