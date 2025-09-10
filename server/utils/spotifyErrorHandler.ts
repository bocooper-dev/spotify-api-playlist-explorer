/**
 * Custom error handler for Spotify SDK integration
 *
 * Implements the SDK's IHandleErrors interface to:
 * - Maintain existing error message patterns for users
 * - Provide structured error handling and logging
 * - Handle SDK-specific error types and retry logic
 * - Map SDK errors to existing API response formats
 */

import type { IHandleErrors } from '@spotify/web-api-ts-sdk'

export class SpotifyErrorHandler implements IHandleErrors {
	/**
   * Handles errors from Spotify SDK calls
   *
   * @param error SDK error object
   * @returns Promise<boolean> - true to stop retrying, false to allow SDK retry
   */
	async handleErrors(error: any): Promise<boolean> {
		// Log all errors for debugging
		console.error('[Spotify SDK Error]', {
			status: error?.status,
			message: error?.message,
			url: error?.url,
			timestamp: new Date().toISOString()
		})

		// Rate limiting (429) - let SDK handle retry with exponential backoff
		if (error?.status === 429) {
			const retryAfter = error?.headers?.['retry-after'] || 1
			console.warn(`[Spotify SDK] Rate limited. Retrying after ${retryAfter}s`)
			return false // Allow SDK to retry
		}

		// Server errors (5xx) - let SDK retry with backoff
		if (error?.status >= 500) {
			console.error('[Spotify SDK] Server error, allowing retry:', error?.status)
			return false // Allow SDK to retry
		}

		// Authentication errors (401) - don't retry, likely config issue
		if (error?.status === 401) {
			console.error('[Spotify SDK] Authentication failed - check credentials')
			return true // Stop retrying
		}

		// Forbidden (403) - don't retry, likely permissions issue
		if (error?.status === 403) {
			console.error('[Spotify SDK] Access forbidden - check app permissions')
			return true // Stop retrying
		}

		// Bad request (400) - don't retry, likely invalid parameters
		if (error?.status === 400) {
			console.error('[Spotify SDK] Bad request:', error?.message)
			return true // Stop retrying
		}

		// Not found (404) - don't retry
		if (error?.status === 404) {
			console.warn('[Spotify SDK] Resource not found')
			return true // Stop retrying
		}

		// Network errors or other client errors - stop retrying
		return true
	}
}

/**
 * Maps SDK errors to user-friendly error responses for API endpoints
 *
 * @param error SDK error object
 * @returns Structured error response for API
 */
export function mapSpotifyError(error: any): {
	success: false
	message: string
	details?: string
} {
	// Default error response
	const defaultError = {
		success: false as const,
		message: 'Unable to connect to Spotify. Please try again later.',
		details: error?.message
	}

	if (!error?.status) {
		return defaultError
	}

	// Map specific HTTP status codes to user-friendly messages
	switch (error.status) {
		case 400:
			return {
				success: false,
				message: 'Invalid search parameters. Please check your genre selection and follower count.',
				details: error.message
			}

		case 401:
			return {
				success: false,
				message: 'Spotify authentication failed. Please check configuration.',
				details: 'API credentials may be invalid or expired'
			}

		case 403:
			return {
				success: false,
				message: 'Access denied. Please verify your Spotify app permissions.',
				details: error.message
			}

		case 404:
			return {
				success: false,
				message: 'The requested resource was not found.',
				details: error.message
			}

		case 429:
			return {
				success: false,
				message: 'Too many requests. Please try again in a moment.',
				details: 'Spotify API rate limit exceeded'
			}

		case 500:
		case 502:
		case 503:
		case 504:
			return {
				success: false,
				message: 'Spotify is temporarily unavailable. Please try again later.',
				details: `Server error: ${error.status}`
			}

		default:
			return defaultError
	}
}

/**
 * Creates a standardized error response for API endpoints
 *
 * @param error Original error (SDK error, Error, or unknown)
 * @param context Additional context about where the error occurred
 * @returns Standardized API error response
 */
export function createSpotifyErrorResponse(error: unknown, context: string = 'Spotify API') {
	console.error(`[${context}] Error:`, error)

	// Handle SDK errors
	if (error && typeof error === 'object' && 'status' in error) {
		return mapSpotifyError(error)
	}

	// Handle standard JavaScript errors
	if (error instanceof Error) {
		return {
			success: false as const,
			message: 'An unexpected error occurred while connecting to Spotify.',
			details: error.message
		}
	}

	// Handle unknown errors
	return {
		success: false as const,
		message: 'An unexpected error occurred. Please try again later.',
		details: 'Unknown error type'
	}
}

/**
 * Default error handler instance for use across the application
 */
export const defaultSpotifyErrorHandler = new SpotifyErrorHandler()
