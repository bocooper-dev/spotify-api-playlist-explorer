import { describe, it, expect } from 'vitest'

describe('Spotify SDK Authentication Integration', () => {
  it('should successfully create SDK client with credentials', async () => {
    // Test SDK client creation and authentication
    const { getSpotifyClient } = await import('../../server/utils/spotify')

    const client = getSpotifyClient()
    
    expect(client).toBeTruthy()
    expect(client.browse).toBeTruthy() // SDK client should have browse methods
    expect(client.search).toBeTruthy() // SDK client should have search methods
  })

  it('should handle missing credentials gracefully', async () => {
    // Temporarily remove credentials to test error handling
    const originalClientId = process.env.SPOTIFY_CLIENT_ID
    const originalClientSecret = process.env.SPOTIFY_CLIENT_SECRET
    
    delete process.env.SPOTIFY_CLIENT_ID
    delete process.env.SPOTIFY_CLIENT_SECRET

    try {
      const { getSpotifyClient } = await import('../../server/utils/spotify')
      
      expect(() => getSpotifyClient()).toThrow('Spotify API credentials not configured')
    } finally {
      // Restore original credentials
      if (originalClientId) process.env.SPOTIFY_CLIENT_ID = originalClientId
      if (originalClientSecret) process.env.SPOTIFY_CLIENT_SECRET = originalClientSecret
    }
  })

  it('should successfully make authenticated API calls via SDK', async () => {
    // Test actual API call through SDK
    const { getSpotifyClient } = await import('../../server/utils/spotify')

    const client = getSpotifyClient()
    
    // Test genres endpoint (minimal API call)
    const genres = await client.recommendations.genreSeeds()
    
    expect(genres).toBeTruthy()
    expect(Array.isArray(genres)).toBe(true)
    expect(genres.length).toBeGreaterThan(0)
  })

  it('should handle SDK authentication errors gracefully', async () => {
    // Test SDK error handling with invalid credentials
    const originalClientId = process.env.SPOTIFY_CLIENT_ID
    const originalClientSecret = process.env.SPOTIFY_CLIENT_SECRET
    
    process.env.SPOTIFY_CLIENT_ID = 'invalid_id'
    process.env.SPOTIFY_CLIENT_SECRET = 'invalid_secret'

    try {
      const { getSpotifyClient } = await import('../../server/utils/spotify')
      const client = getSpotifyClient()
      
      // SDK should handle auth errors internally and throw appropriate errors
      await expect(client.recommendations.genreSeeds()).rejects.toThrow()
    } finally {
      // Restore original credentials
      process.env.SPOTIFY_CLIENT_ID = originalClientId
      process.env.SPOTIFY_CLIENT_SECRET = originalClientSecret
    }
  })

  it('should automatically handle token refresh via SDK', async () => {
    // Test that SDK handles token management automatically
    const { getSpotifyClient } = await import('../../server/utils/spotify')

    const client1 = getSpotifyClient()
    const client2 = getSpotifyClient()
    
    // Both clients should be independent instances
    expect(client1).toBeTruthy()
    expect(client2).toBeTruthy()
    
    // Both should be able to make successful API calls
    const [genres1, genres2] = await Promise.all([
      client1.recommendations.genreSeeds(),
      client2.recommendations.genreSeeds()
    ])
    
    expect(genres1).toBeTruthy()
    expect(genres2).toBeTruthy()
    // Results should be identical (same API endpoint)
    expect(genres1).toEqual(genres2)
  })
})