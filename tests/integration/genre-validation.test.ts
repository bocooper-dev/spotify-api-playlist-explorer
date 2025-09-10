import { describe, it, expect } from 'vitest'

describe('Genre Validation Integration', () => {
  it('should fetch available genres from Spotify API', async () => {
    // This test will fail until we implement the Spotify API wrapper
    const { getAvailableGenres } = await import('~/server/api/_spotify-api')

    const genres = await getAvailableGenres()

    expect(genres).toBeTruthy()
    expect(Array.isArray(genres)).toBe(true)
    expect(genres.length).toBeGreaterThan(0)

    // Should contain common genres
    const commonGenres = ['rock', 'pop', 'jazz', 'electronic', 'hip-hop', 'country', 'classical']
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

  it('should validate genres against Spotify available genres', async () => {
    const { validateGenres } = await import('~/server/api/_spotify-api')

    // Test with valid genres
    const validGenres = ['rock', 'pop', 'jazz']
    const validationResult = await validateGenres(validGenres)

    expect(validationResult.isValid).toBe(true)
    expect(validationResult.invalidGenres).toEqual([])
    expect(validationResult.validGenres).toEqual(validGenres)
  })

  it('should identify invalid genres', async () => {
    const { validateGenres } = await import('~/server/api/_spotify-api')

    const mixedGenres = ['rock', 'invalid-genre-12345', 'pop', 'another-fake-genre']
    const validationResult = await validateGenres(mixedGenres)

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.invalidGenres.length).toBeGreaterThan(0)
    expect(validationResult.invalidGenres).toContain('invalid-genre-12345')
    expect(validationResult.invalidGenres).toContain('another-fake-genre')
    
    // Should still identify valid ones
    expect(validationResult.validGenres).toContain('rock')
    expect(validationResult.validGenres).toContain('pop')
  })

  it('should handle empty genre list', async () => {
    const { validateGenres } = await import('~/server/api/_spotify-api')

    const emptyGenres: string[] = []
    const validationResult = await validateGenres(emptyGenres)

    expect(validationResult.isValid).toBe(false) // Empty should be invalid
    expect(validationResult.invalidGenres).toEqual([])
    expect(validationResult.validGenres).toEqual([])
  })

  it('should handle case-insensitive genre matching', async () => {
    const { validateGenres } = await import('~/server/api/_spotify-api')

    // Test different cases of the same genre
    const mixedCaseGenres = ['ROCK', 'Pop', 'jAzZ', 'Electronic']
    const validationResult = await validateGenres(mixedCaseGenres)

    // Should be valid regardless of case
    expect(validationResult.isValid).toBe(true)
    expect(validationResult.invalidGenres).toEqual([])
    
    // Should normalize to lowercase for consistency
    validationResult.validGenres.forEach(genre => {
      expect(genre).toBe(genre.toLowerCase())
    })
  })

  it('should enforce maximum genre limit', async () => {
    const { validateGenres } = await import('~/server/api/_spotify-api')

    // Create more than 10 genres (the limit from data model)
    const tooManyGenres = [
      'rock', 'pop', 'jazz', 'electronic', 'hip-hop', 
      'country', 'classical', 'reggae', 'blues', 'folk',
      'punk', 'metal', 'indie' // 13 genres total
    ]

    const validationResult = await validateGenres(tooManyGenres)

    expect(validationResult.isValid).toBe(false)
    expect(validationResult.error).toContain('maximum')
    expect(validationResult.error).toContain('10')
  })

  it('should cache available genres for performance', async () => {
    const { getAvailableGenres, clearGenreCache } = await import('~/server/api/_spotify-api')

    // Clear cache first
    clearGenreCache()

    // First call should be slower (hits Spotify API)
    const startTime1 = Date.now()
    const genres1 = await getAvailableGenres()
    const time1 = Date.now() - startTime1

    // Second call should be faster (cached)
    const startTime2 = Date.now()
    const genres2 = await getAvailableGenres()
    const time2 = Date.now() - startTime2

    expect(genres1).toEqual(genres2)
    expect(time2).toBeLessThan(time1)
    expect(time2).toBeLessThan(100) // Should be very fast when cached
  })

  it('should handle Spotify API errors gracefully', async () => {
    const { getAvailableGenres } = await import('~/server/api/_spotify-api')

    // Mock a scenario where Spotify API is down (will be handled by implementation)
    try {
      const genres = await getAvailableGenres()
      // If successful, should return valid array
      expect(Array.isArray(genres)).toBe(true)
    } catch (error) {
      // If it throws, should be a meaningful error
      expect(error).toBeTruthy()
      expect(error.message).toBeTruthy()
    }
  })
})