import { describe, it, expect } from 'vitest'

describe('Spotify API Authentication', () => {
  it('should successfully authenticate with Spotify using client credentials', async () => {
    // This test will fail until we implement the Spotify client
    const { getSpotifyAccessToken } = await import('~/server/api/_spotify-client')

    const token = await getSpotifyAccessToken()
    
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(50) // Spotify access tokens are quite long
  })

  it('should handle authentication failures gracefully', async () => {
    // Temporarily use invalid credentials to test error handling
    const originalClientId = process.env.SPOTIFY_CLIENT_ID
    const originalClientSecret = process.env.SPOTIFY_CLIENT_SECRET
    
    process.env.SPOTIFY_CLIENT_ID = 'invalid_id'
    process.env.SPOTIFY_CLIENT_SECRET = 'invalid_secret'

    try {
      const { getSpotifyAccessToken } = await import('~/server/api/_spotify-client')
      
      await expect(getSpotifyAccessToken()).rejects.toThrow()
    } finally {
      // Restore original credentials
      process.env.SPOTIFY_CLIENT_ID = originalClientId
      process.env.SPOTIFY_CLIENT_SECRET = originalClientSecret
    }
  })

  it('should cache authentication tokens appropriately', async () => {
    const { getSpotifyAccessToken } = await import('~/server/api/_spotify-client')

    const startTime = Date.now()
    const token1 = await getSpotifyAccessToken()
    const firstCallTime = Date.now() - startTime

    const startTime2 = Date.now()
    const token2 = await getSpotifyAccessToken()
    const secondCallTime = Date.now() - startTime2

    // Both calls should return the same token
    expect(token1).toBe(token2)
    
    // Second call should be faster (cached)
    expect(secondCallTime).toBeLessThan(firstCallTime)
  })

  it('should refresh token when expired', async () => {
    const { getSpotifyAccessToken, clearTokenCache } = await import('~/server/api/_spotify-client')

    // Get initial token
    const token1 = await getSpotifyAccessToken()
    expect(token1).toBeTruthy()

    // Clear cache to simulate expiration
    clearTokenCache()

    // Get new token
    const token2 = await getSpotifyAccessToken()
    expect(token2).toBeTruthy()
    
    // Tokens might be the same if Spotify returns same token, but call should succeed
    expect(typeof token2).toBe('string')
  })
})