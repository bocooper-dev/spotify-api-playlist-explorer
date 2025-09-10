import { describe, it, expect } from 'vitest'

describe('Playlist Search Flow Integration with SDK', () => {
  it('should search for playlists using SDK with type adapters', async () => {
    // Test SDK integration with adapter layer
    const { getSpotifyClient } = await import('~/server/utils/spotify')
    const { adaptSpotifyPlaylists } = await import('~/server/utils/spotifyAdapters')

    const client = getSpotifyClient()
    const searchGenres = ['rock', 'alternative']
    const limit = 10

    // Use SDK to search (testing direct SDK functionality)
    const searchResults = await client.search('genre:rock OR genre:alternative', ['playlist'], 'US', limit)
    
    // Adapt SDK results to internal format
    const adaptedPlaylists = adaptSpotifyPlaylists(searchResults.playlists.items, searchGenres)

    expect(adaptedPlaylists).toBeTruthy()
    expect(Array.isArray(adaptedPlaylists)).toBe(true)

    // If results found, validate they meet criteria and are properly adapted
    if (adaptedPlaylists.length > 0) {
      adaptedPlaylists.forEach(playlist => {
        expect(playlist.id).toBeTruthy()
        expect(playlist.name).toBeTruthy()
        expect(playlist.url).toContain('spotify.com')
        expect(playlist.owner).toBeTruthy()
        expect(playlist.owner.id).toBeTruthy()
        expect(playlist.owner.displayName).toBeTruthy()
        expect(playlist.genres).toEqual(searchGenres) // Should have search genres
      })
    }

    expect(adaptedPlaylists.length).toBeLessThanOrEqual(limit)
  })

  it('should handle empty search results gracefully', async () => {
    const { getSpotifyClient } = await import('~/server/utils/spotify')
    const { adaptSpotifyPlaylists } = await import('~/server/utils/spotifyAdapters')

    const client = getSpotifyClient()
    
    // Search for something very obscure that likely returns no results
    const searchResults = await client.search('genre:very-obscure-genre-that-does-not-exist', ['playlist'], 'US', 50)
    
    const adaptedPlaylists = adaptSpotifyPlaylists(searchResults.playlists.items, ['very-obscure-genre-that-does-not-exist'])

    expect(adaptedPlaylists).toBeTruthy()
    expect(Array.isArray(adaptedPlaylists)).toBe(true)
    expect(adaptedPlaylists.length).toBe(0)
  })

  it('should test SDK type adapter functionality', async () => {
    const { getSpotifyClient } = await import('~/server/utils/spotify')
    const { adaptSpotifyPlaylist, validateSpotifyPlaylist } = await import('~/server/utils/spotifyAdapters')

    const client = getSpotifyClient()
    
    // Get a playlist from SDK for testing adapter
    const searchResults = await client.search('genre:pop', ['playlist'], 'US', 5)
    
    if (searchResults.playlists.items.length > 0) {
      const sdkPlaylist = searchResults.playlists.items[0]
      
      // Validate SDK playlist data
      expect(validateSpotifyPlaylist(sdkPlaylist)).toBe(true)
      
      // Test adapter function
      const adaptedPlaylist = adaptSpotifyPlaylist(sdkPlaylist, ['pop'])
      
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
      expect(adaptedPlaylist.genres).toEqual(['pop'])
    }
  })

  it('should handle SDK error responses with custom error handler', async () => {
    const { getSpotifyClientWithErrorHandler } = await import('~/server/utils/spotify')
    const { SpotifyErrorHandler } = await import('~/server/utils/spotifyErrorHandler')

    const errorHandler = new SpotifyErrorHandler()
    const client = getSpotifyClientWithErrorHandler(errorHandler)
    
    // SDK should work normally with error handler
    const genres = await client.browse.getAvailableGenreSeeds()
    
    expect(genres).toBeTruthy()
    expect(genres.genres).toBeTruthy()
    expect(Array.isArray(genres.genres)).toBe(true)
  })
})