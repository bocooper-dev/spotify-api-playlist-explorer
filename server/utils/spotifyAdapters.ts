/**
 * Type adapters for converting Spotify SDK types to internal application types
 *
 * This adapter layer maintains existing API contracts while leveraging SDK benefits:
 * - Preserves frontend compatibility (no breaking changes)
 * - Maps SDK types to domain-specific internal types
 * - Handles data transformation and normalization
 * - Provides fallbacks for optional SDK fields
 */

import type {
	Genres,
	Image,
	SimplifiedPlaylist,
	UserReference
} from '@spotify/web-api-ts-sdk'
import type {
	Playlist, PlaylistOwner
} from '../../types/playlist'

// Type for search results that may have different structure than SimplifiedPlaylist
type SearchPlaylistResult = SimplifiedPlaylist | {
	id: string
	name: string
	description?: string
	external_urls: { spotify: string }
	followers: { total: number }
	tracks?: { total: number }
	images?: Image[]
	owner: UserReference
	public: boolean
	[key: string]: any
}

/**
 * Converts Spotify SDK playlist object to internal Playlist type
 * Handles both SimplifiedPlaylist and search result playlist objects
 *
 * @param sdkPlaylist SDK playlist object
 * @param genres Associated genres from search context
 * @returns Internal Playlist object
 */
export function adaptSpotifyPlaylist(sdkPlaylist: SearchPlaylistResult, genres: string[] = []): Playlist {
	return {
		id: sdkPlaylist.id,
		name: sdkPlaylist.name,
		description: sdkPlaylist.description || undefined,
		url: sdkPlaylist.external_urls.spotify,
		followerCount: sdkPlaylist.followers.total,
		trackCount: sdkPlaylist.tracks?.total || 0,
		imageUrl: getBestImageUrl(sdkPlaylist.images),
		owner: adaptSpotifyOwner(sdkPlaylist.owner),
		genres: genres, // Populated from search context since SDK doesn't include genres in playlist
		isPublic: sdkPlaylist.public
	}
}

/**
 * Converts Spotify SDK UserReference to internal PlaylistOwner type
 *
 * @param sdkOwner SDK user object
 * @returns Internal PlaylistOwner object
 */
export function adaptSpotifyOwner(sdkOwner: UserReference): PlaylistOwner {
	return {
		id: sdkOwner.id,
		username: sdkOwner.id, // SDK uses ID consistently as username
		displayName: sdkOwner.display_name || sdkOwner.id, // Fallback to ID if no display name
		profileUrl: sdkOwner.external_urls.spotify,
		imageUrl: getBestImageUrl((sdkOwner as any).images) // UserReference might not have images in all contexts
	}
}

/**
 * Converts SDK Genres response to string array
 *
 * @param genresResponse SDK genres response
 * @returns Array of genre strings
 */
export function adaptSpotifyGenres(genresResponse: Genres): string[] {
	return genresResponse.genres || []
}

/**
 * Converts array of SDK playlists to internal Playlist array
 * Handles both SimplifiedPlaylist and search result playlist objects
 *
 * @param sdkPlaylists Array of SDK playlist objects
 * @param searchGenres Genres used in the search (for context)
 * @returns Array of internal Playlist objects
 */
export function adaptSpotifyPlaylists(sdkPlaylists: SearchPlaylistResult[], searchGenres: string[] = []): Playlist[] {
	return sdkPlaylists.map(playlist => adaptSpotifyPlaylist(playlist, searchGenres))
}

/**
 * Helper function to get the best available image URL from SDK image array
 *
 * Spotify provides images in descending size order:
 * - index 0: largest image (~640x640)
 * - index 1: medium image (~300x300)
 * - index 2: smallest image (~64x64)
 *
 * @param images Array of SDK image objects
 * @returns Best image URL or undefined if no images
 */
function getBestImageUrl(images?: Image[]): string | undefined {
	if (!images || images.length === 0) {
		return undefined
	}

	// Return the first (largest) image URL
	return images[0]?.url
}

/**
 * Validates that SDK playlist data is complete for adaptation
 *
 * @param sdkPlaylist SDK playlist object
 * @returns true if valid, false otherwise
 */
export function validateSpotifyPlaylist(sdkPlaylist: any): sdkPlaylist is SearchPlaylistResult {
	return (
		sdkPlaylist
		&& typeof sdkPlaylist.id === 'string'
		&& typeof sdkPlaylist.name === 'string'
		&& sdkPlaylist.external_urls?.spotify
		&& typeof sdkPlaylist.followers?.total === 'number'
		&& sdkPlaylist.owner
		&& typeof sdkPlaylist.public === 'boolean'
	)
}

/**
 * Error-safe playlist adaptation with validation
 *
 * @param sdkPlaylist SDK playlist object (potentially malformed)
 * @param genres Associated genres
 * @returns Internal Playlist object or null if invalid
 */
export function safeAdaptSpotifyPlaylist(sdkPlaylist: unknown, genres: string[] = []): Playlist | null {
	try {
		if (!validateSpotifyPlaylist(sdkPlaylist)) {
			console.warn('[SpotifyAdapter] Invalid playlist data received from SDK:', sdkPlaylist)
			return null
		}

		return adaptSpotifyPlaylist(sdkPlaylist, genres)
	} catch (error) {
		console.error('[SpotifyAdapter] Error adapting playlist:', error)
		return null
	}
}
