import { describe, it, expect } from 'vitest'

describe('Playlist Search Flow Integration', () => {
  it('should search for playlists using Spotify API with genre filtering', async () => {
    // This test will fail until we implement the Spotify API wrapper
    const { searchPlaylistsByGenres } = await import('~/server/api/_spotify-api')

    const searchCriteria = {
      genres: ['rock', 'alternative'],
      minFollowerCount: 1000,
      limit: 10
    }

    const result = await searchPlaylistsByGenres(searchCriteria)

    expect(result).toBeTruthy()
    expect(result.playlists).toBeDefined()
    expect(Array.isArray(result.playlists)).toBe(true)
    expect(result.totalFound).toBeGreaterThanOrEqual(0)

    // If results found, validate they meet criteria
    if (result.playlists.length > 0) {
      result.playlists.forEach(playlist => {
        expect(playlist.followerCount).toBeGreaterThanOrEqual(1000)
        expect(playlist.id).toBeTruthy()
        expect(playlist.name).toBeTruthy()
        expect(playlist.url).toContain('spotify.com')
        expect(playlist.owner).toBeTruthy()
        expect(playlist.owner.id).toBeTruthy()
        expect(playlist.owner.displayName).toBeTruthy()
      })
    }

    expect(result.playlists.length).toBeLessThanOrEqual(10)
  })

  it('should handle empty search results gracefully', async () => {
    const { searchPlaylistsByGenres } = await import('~/server/api/_spotify-api')

    const restrictiveSearch = {
      genres: ['very-obscure-genre-that-does-not-exist'],
      minFollowerCount: 10000000, // Very high follower count
      limit: 50
    }

    const result = await searchPlaylistsByGenres(restrictiveSearch)

    expect(result).toBeTruthy()
    expect(result.playlists).toBeDefined()
    expect(Array.isArray(result.playlists)).toBe(true)
    expect(result.playlists.length).toBe(0)
    expect(result.totalFound).toBe(0)
  })

  it('should respect follower count filtering', async () => {
    const { searchPlaylistsByGenres } = await import('~/server/api/_spotify-api')

    const searchCriteria = {
      genres: ['pop'], // Popular genre likely to have high-follower playlists
      minFollowerCount: 50000,
      limit: 20
    }

    const result = await searchPlaylistsByGenres(searchCriteria)

    expect(result).toBeTruthy()
    
    // All returned playlists should meet minimum follower requirement
    result.playlists.forEach(playlist => {
      expect(playlist.followerCount).toBeGreaterThanOrEqual(50000)
    })
  })

  it('should handle multiple genres correctly', async () => {
    const { searchPlaylistsByGenres } = await import('~/server/api/_spotify-api')

    const multiGenreSearch = {
      genres: ['rock', 'jazz', 'electronic'],
      minFollowerCount: 1000,
      limit: 30
    }

    const result = await searchPlaylistsByGenres(multiGenreSearch)

    expect(result).toBeTruthy()
    expect(result.totalFound).toBeGreaterThanOrEqual(0)
    
    // Results should potentially include playlists from any of the specified genres
    // Since we're combining searches, totalFound could be quite high
    if (result.playlists.length > 0) {
      expect(result.playlists.length).toBeLessThanOrEqual(30)
    }
  })

  it('should handle API rate limiting gracefully', async () => {
    const { searchPlaylistsByGenres } = await import('~/server/api/_spotify-api')

    const searches = []
    
    // Make multiple concurrent requests to potentially trigger rate limiting
    for (let i = 0; i < 5; i++) {
      searches.push(
        searchPlaylistsByGenres({
          genres: ['pop'],
          minFollowerCount: 1000,
          limit: 10
        })
      )
    }

    // All searches should either succeed or handle rate limiting properly
    const results = await Promise.allSettled(searches)
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        expect(result.value).toBeTruthy()
        expect(result.value.playlists).toBeDefined()
      } else {
        // If rejected, should be due to rate limiting, not unhandled errors
        expect(result.reason.message).toMatch(/rate limit|too many requests/i)
      }
    })
  })

  it('should map Spotify API response to internal playlist format', async () => {
    const { searchPlaylistsByGenres } = await import('~/server/api/_spotify-api')

    const result = await searchPlaylistsByGenres({
      genres: ['indie'],
      minFollowerCount: 100,
      limit: 5
    })

    if (result.playlists.length > 0) {
      const playlist = result.playlists[0]
      
      // Validate complete mapping from Spotify API to internal format
      expect(playlist).toHaveProperty('id')
      expect(playlist).toHaveProperty('name')
      expect(playlist).toHaveProperty('url')
      expect(playlist).toHaveProperty('followerCount')
      expect(playlist).toHaveProperty('trackCount')
      expect(playlist).toHaveProperty('owner')
      expect(playlist).toHaveProperty('genres')
      expect(playlist).toHaveProperty('isPublic')

      // Owner should be properly mapped
      expect(playlist.owner).toHaveProperty('id')
      expect(playlist.owner).toHaveProperty('username')
      expect(playlist.owner).toHaveProperty('displayName')
      expect(playlist.owner).toHaveProperty('profileUrl')

      // Data types should be correct
      expect(typeof playlist.id).toBe('string')
      expect(typeof playlist.name).toBe('string')
      expect(typeof playlist.url).toBe('string')
      expect(typeof playlist.followerCount).toBe('number')
      expect(typeof playlist.trackCount).toBe('number')
      expect(Array.isArray(playlist.genres)).toBe(true)
      expect(typeof playlist.isPublic).toBe('boolean')
    }
  })
})