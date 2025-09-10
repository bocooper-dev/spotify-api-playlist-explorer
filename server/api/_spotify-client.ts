/**
 * Spotify Client Credentials authentication service
 * Handles token management and caching for server-side API access
 */

import type { SpotifyTokenResponse, SpotifyTokenError, TokenCache } from '~/types/spotify'

// Token cache - in production, consider using Redis or other persistent storage
let tokenCache: TokenCache | null = null

/**
 * Get Spotify access token using Client Credentials flow
 * Handles caching and automatic token refresh
 */
export async function getSpotifyAccessToken(): Promise<string> {
  // Check if cached token is still valid
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.')
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const error: SpotifyTokenError = await response.json()
      throw new Error(`Spotify authentication failed: ${error.error_description || error.error}`)
    }

    const tokenData: SpotifyTokenResponse = await response.json()

    // Cache token with buffer time (subtract 5 minutes from expiry)
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000) - bufferTime
    }

    return tokenData.access_token
  } catch (error) {
    // Clear cache on error
    tokenCache = null
    
    if (error instanceof Error) {
      throw new Error(`Failed to obtain Spotify access token: ${error.message}`)
    }
    throw new Error('Failed to obtain Spotify access token: Unknown error')
  }
}

/**
 * Make authenticated request to Spotify API
 * Automatically includes authorization header and handles token refresh
 */
export async function makeSpotifyRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = await getSpotifyAccessToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    // Handle token expiry - retry once with fresh token
    if (response.status === 401 && tokenCache) {
      clearTokenCache()
      const freshToken = await getSpotifyAccessToken()
      
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!retryResponse.ok) {
        throw await createSpotifyError(retryResponse)
      }

      return retryResponse.json()
    }

    throw await createSpotifyError(response)
  }

  return response.json()
}

/**
 * Create standardized error from Spotify API response
 */
async function createSpotifyError(response: Response): Promise<Error> {
  try {
    const errorData = await response.json()
    const message = errorData.error?.message || errorData.error_description || 'Unknown Spotify API error'
    return new Error(`Spotify API error (${response.status}): ${message}`)
  } catch {
    return new Error(`Spotify API error (${response.status}): ${response.statusText}`)
  }
}

/**
 * Clear cached token (useful for testing or forcing refresh)
 */
export function clearTokenCache(): void {
  tokenCache = null
}

/**
 * Get current token cache status (useful for debugging)
 */
export function getTokenCacheStatus(): { cached: boolean; expiresAt?: number; timeUntilExpiry?: number } {
  if (!tokenCache) {
    return { cached: false }
  }

  return {
    cached: true,
    expiresAt: tokenCache.expiresAt,
    timeUntilExpiry: Math.max(0, tokenCache.expiresAt - Date.now())
  }
}