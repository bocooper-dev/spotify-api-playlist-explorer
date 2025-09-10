/**
 * Spotify Web API response types for external API integration
 */

/**
 * Spotify API Authentication
 */
export interface SpotifyTokenResponse {
	access_token: string
	token_type: 'Bearer'
	expires_in: number
	scope?: string
}

export interface SpotifyTokenError {
	error: string
	error_description: string
}

/**
 * Spotify API User Object
 */
export interface SpotifyUser {
	id: string
	display_name: string | null
	external_urls: {
		spotify: string
	}
	followers?: {
		total: number
	}
	images: SpotifyImage[]
	type: 'user'
	uri: string
}

/**
 * Spotify API Playlist Object
 */
export interface SpotifyPlaylist {
	id: string
	name: string
	description: string | null
	external_urls: {
		spotify: string
	}
	followers: {
		total: number
	}
	images: SpotifyImage[]
	owner: SpotifyUser
	public: boolean | null
	tracks: {
		total: number
		items?: SpotifyTrack[]
	}
	type: 'playlist'
	uri: string
}

/**
 * Spotify API Image Object
 */
export interface SpotifyImage {
	height: number | null
	url: string
	width: number | null
}

/**
 * Spotify API Track Object (simplified)
 */
export interface SpotifyTrack {
	track: {
		id: string
		name: string
		artists: SpotifyArtist[]
		type: 'track'
		uri: string
	}
}

/**
 * Spotify API Artist Object (simplified)
 */
export interface SpotifyArtist {
	id: string
	name: string
	genres?: string[]
	type: 'artist'
	uri: string
}

/**
 * Spotify API Search Response
 */
export interface SpotifySearchResponse {
	playlists: {
		items: SpotifyPlaylist[]
		limit: number
		next: string | null
		offset: number
		previous: string | null
		total: number
	}
}

/**
 * Spotify API Available Genre Seeds
 */
export interface SpotifyGenreSeedsResponse {
	genres: string[]
}

/**
 * Spotify API Error Response
 */
export interface SpotifyErrorResponse {
	error: {
		status: number
		message: string
	}
}

/**
 * Search parameters for Spotify API
 */
export interface SpotifySearchParams {
	q: string
	type: 'playlist'
	limit?: number
	offset?: number
	market?: string
}

/**
 * Token cache interface
 */
export interface TokenCache {
	token: string
	expiresAt: number
}

/**
 * Spotify API endpoint constants
 */
export const SPOTIFY_ENDPOINTS = {
	TOKEN: 'https://accounts.spotify.com/api/token',
	SEARCH: 'https://api.spotify.com/v1/search',
	GENRE_SEEDS: 'https://api.spotify.com/v1/recommendations/available-genre-seeds',
	PLAYLIST: (id: string) => `https://api.spotify.com/v1/playlists/${id}`,
	USER: (id: string) => `https://api.spotify.com/v1/users/${id}`
} as const

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
	maxRetries: number
	baseDelay: number
	maxDelay: number
	backoffMultiplier: number
}
