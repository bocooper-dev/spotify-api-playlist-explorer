import {
  describe, expect, it
} from 'vitest'

describe('SDK Genre Integration', () => {
	it('should fetch available genres from Spotify SDK', async () => {
		// Test SDK genre fetching with adapter
		const { getSpotifyClient } = await import('../../server/utils/spotify')
		const { adaptSpotifyGenres } = await import('../../server/utils/spotifyAdapters')

		const client = getSpotifyClient()
		const genreResponse = await client.browse.getAvailableGenreSeeds()
		const genres = adaptSpotifyGenres(genreResponse)

		expect(genres).toBeTruthy()
		expect(Array.isArray(genres)).toBe(true)
		expect(genres.length).toBeGreaterThan(0)

		// Should contain common genres
		const commonGenres = [ 'rock', 'pop', 'jazz', 'electronic', 'hip-hop', 'country', 'classical' ]
		const foundCommonGenres = commonGenres.filter(genre =>
			genres.some(g => g.includes(genre) || genre.includes(g))
		)
		expect(foundCommonGenres.length).toBeGreaterThan(3)

		// All genres should be strings
		genres.forEach(genre => {
			expect(typeof genre).toBe('string')
			expect(genre.length).toBeGreaterThan(0)
		})
	})

	it('should handle SDK error responses gracefully', async () => {
		const { createSpotifyErrorResponse } = await import('../../server/utils/spotifyErrorHandler')

		// Test error response mapping
		const mockSdkError = {
			status: 401,
			message: 'Invalid client credentials'
		}

		const errorResponse = createSpotifyErrorResponse(mockSdkError, 'Genre fetch')

		expect(errorResponse.success).toBe(false)
		expect(errorResponse.message).toContain('authentication')
		expect(errorResponse.details).toBeTruthy()
	})

	it('should test adapter validation functions', async () => {
		const { validateSpotifyPlaylist } = await import('../../server/utils/spotifyAdapters')

		// Test with valid SDK-like playlist data
		const validPlaylistData = {
			id: 'test123',
			name: 'Test Playlist',
			external_urls: { spotify: 'https://open.spotify.com/playlist/test123' },
			followers: { total: 1000 },
			owner: { id: 'user123' },
			public: true
		}

		expect(validateSpotifyPlaylist(validPlaylistData)).toBe(true)

		// Test with invalid data
		const invalidPlaylistData = {
			id: 'test123'
			// Missing required fields
		}

		expect(validateSpotifyPlaylist(invalidPlaylistData)).toBe(false)
	})
})
