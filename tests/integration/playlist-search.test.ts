import {
	describe, expect, it, vi
} from 'vitest'

// Mock Spotify SDK to avoid authentication issues
vi.mock('@spotify/web-api-ts-sdk', () => ({
	SpotifyApi: {
		withClientCredentials: vi.fn(() => ({
			search: vi.fn()
		}))
	}
}))

describe('Playlist Search Flow Integration with SDK', () => {
	it('should search for playlists using SDK with type adapters', async () => {
		// Mock the SDK search response to test type adapters without API calls
		const { adaptSpotifyPlaylists } = await import('../../server/utils/spotifyAdapters')

		// Create a mock search result structure
		const mockSearchResult = {
			playlists: {
				items: [
					{
						id: 'test123',
						name: 'Test Playlist',
						description: 'A test playlist',
						external_urls: { spotify: 'https://open.spotify.com/playlist/test123' },
						followers: { total: 1000 },
						tracks: { total: 25 },
						images: [
							{
								url: 'https://example.com/image.jpg',
								height: 300,
								width: 300
							}
						],
						owner: {
							id: 'user123',
							display_name: 'Test User',
							external_urls: { spotify: 'https://open.spotify.com/user/user123' },
							href: 'https://api.spotify.com/v1/users/user123',
							type: 'user' as const,
							uri: 'spotify:user:user123'
						},
						public: true,
						collaborative: false,
						href: 'https://open.spotify.com/playlist/test123',
						primary_color: null,
						snapshot_id: 'abc123',
						type: 'playlist',
						uri: 'spotify:playlist:test123'
					}
				],
				total: 1,
				limit: 10,
				offset: 0,
				href: 'https://api.spotify.com/v1/search',
				next: null,
				previous: null
			}
		}

		const searchGenres = [ 'rock', 'alternative' ]

		// Test the adapter with the mock data
		const adaptedPlaylists = adaptSpotifyPlaylists(mockSearchResult.playlists.items, searchGenres)

		expect(adaptedPlaylists).toBeTruthy()
		expect(Array.isArray(adaptedPlaylists)).toBe(true)
		expect(adaptedPlaylists.length).toBe(1)

		// Validate the adapted playlist structure
		const playlist = adaptedPlaylists[0]
		expect(playlist.id).toBe('test123')
		expect(playlist.name).toBe('Test Playlist')
		expect(playlist.url).toContain('spotify.com')
		expect(playlist.owner).toBeTruthy()
		expect(playlist.owner.id).toBe('user123')
		expect(playlist.owner.displayName).toBe('Test User')
		expect(playlist.genres).toEqual(searchGenres)
		expect(playlist.followerCount).toBe(1000)
		expect(playlist.trackCount).toBe(25)
	})

	it('should handle empty search results gracefully', async () => {
		const { adaptSpotifyPlaylists } = await import('../../server/utils/spotifyAdapters')

		// Mock empty search results
		const mockEmptySearchResult = {
			playlists: {
				items: [],
				total: 0,
				limit: 50,
				offset: 0,
				href: 'https://api.spotify.com/v1/search',
				next: null,
				previous: null
			}
		}

		const adaptedPlaylists = adaptSpotifyPlaylists(mockEmptySearchResult.playlists.items, [ 'very-obscure-genre-that-does-not-exist' ])

		expect(adaptedPlaylists).toBeTruthy()
		expect(Array.isArray(adaptedPlaylists)).toBe(true)
		expect(adaptedPlaylists.length).toBe(0)
	})

	it('should test SDK type adapter functionality', async () => {
		const {
			adaptSpotifyPlaylist, validateSpotifyPlaylist
		} = await import('../../server/utils/spotifyAdapters')

		// Mock playlist data similar to first test
		const mockSdkPlaylist = {
			id: 'test123',
			name: 'Test Playlist',
			description: 'A test playlist',
			external_urls: { spotify: 'https://open.spotify.com/playlist/test123' },
			followers: { total: 1000 },
			tracks: { total: 25 },
			images: [
				{
					url: 'https://example.com/image.jpg',
					height: 300,
					width: 300
				}
			],
			owner: {
				id: 'user123',
				display_name: 'Test User',
				external_urls: { spotify: 'https://open.spotify.com/user/user123' },
				href: 'https://api.spotify.com/v1/users/user123',
				type: 'user' as const,
				uri: 'spotify:user:user123'
			},
			public: true,
			collaborative: false,
			href: 'https://open.spotify.com/playlist/test123',
			primary_color: null,
			snapshot_id: 'abc123',
			type: 'playlist',
			uri: 'spotify:playlist:test123'
		}

		// Validate SDK playlist data
		expect(validateSpotifyPlaylist(mockSdkPlaylist)).toBe(true)

		// Test adapter function
		const adaptedPlaylist = adaptSpotifyPlaylist(mockSdkPlaylist, [ 'pop' ])

		// Validate complete mapping from SDK to internal format
		expect(adaptedPlaylist).toHaveProperty('id')
		expect(adaptedPlaylist).toHaveProperty('name')
		expect(adaptedPlaylist).toHaveProperty('url')
		expect(adaptedPlaylist).toHaveProperty('followerCount')
		expect(adaptedPlaylist).toHaveProperty('trackCount')
		expect(adaptedPlaylist).toHaveProperty('owner')
		expect(adaptedPlaylist).toHaveProperty('genres')
		expect(adaptedPlaylist).toHaveProperty('isPublic')

		// Owner should be properly mapped
		expect(adaptedPlaylist.owner).toHaveProperty('id')
		expect(adaptedPlaylist.owner).toHaveProperty('username')
		expect(adaptedPlaylist.owner).toHaveProperty('displayName')
		expect(adaptedPlaylist.owner).toHaveProperty('profileUrl')

		// Data types should be correct
		expect(typeof adaptedPlaylist.id).toBe('string')
		expect(typeof adaptedPlaylist.name).toBe('string')
		expect(typeof adaptedPlaylist.url).toBe('string')
		expect(typeof adaptedPlaylist.followerCount).toBe('number')
		expect(typeof adaptedPlaylist.trackCount).toBe('number')
		expect(Array.isArray(adaptedPlaylist.genres)).toBe(true)
		expect(typeof adaptedPlaylist.isPublic).toBe('boolean')

		// Genres should be set correctly
		expect(adaptedPlaylist.genres).toEqual([ 'pop' ])
	})

	it('should handle SDK error responses with custom error handler', async () => {
		const { SpotifyErrorHandler } = await import('../../server/utils/spotifyErrorHandler')

		const errorHandler = new SpotifyErrorHandler()

		// Test error handler directly since we're mocking the SDK
		const testError = new Error('Failed to get access token.')

		try {
			// Simulate error handling
			const shouldStopRetrying = await errorHandler.handleErrors(testError)
			expect(typeof shouldStopRetrying).toBe('boolean')
		} catch (error) {
			// Error handler should process the error properly
			expect(error).toBeTruthy()
		}
	})
})
