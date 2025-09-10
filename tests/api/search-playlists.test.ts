import { describe, it, expect } from 'vitest'

describe('POST /api/search/playlists', () => {
  it('should return playlist search results with valid request', async () => {
    const requestBody = {
      genres: ['rock', 'jazz'],
      minFollowerCount: 1000,
      limit: 50
    }

    // This will fail because the endpoint doesn't exist yet
    const response = await fetch('http://localhost:3000/api/search/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    
    // Validate response schema matches contract
    expect(data).toHaveProperty('playlists')
    expect(data).toHaveProperty('totalFound')
    expect(data).toHaveProperty('searchCriteria')
    expect(data).toHaveProperty('timestamp')

    expect(Array.isArray(data.playlists)).toBe(true)
    expect(typeof data.totalFound).toBe('number')
    expect(data.totalFound).toBeGreaterThanOrEqual(0)

    // Validate playlist objects if any results
    if (data.playlists.length > 0) {
      const playlist = data.playlists[0]
      expect(playlist).toHaveProperty('id')
      expect(playlist).toHaveProperty('name')
      expect(playlist).toHaveProperty('url')
      expect(playlist).toHaveProperty('followerCount')
      expect(playlist).toHaveProperty('trackCount')
      expect(playlist).toHaveProperty('owner')
      expect(playlist).toHaveProperty('genres')
      expect(playlist).toHaveProperty('isPublic')

      // Validate owner object
      expect(playlist.owner).toHaveProperty('id')
      expect(playlist.owner).toHaveProperty('username')
      expect(playlist.owner).toHaveProperty('displayName')
      expect(playlist.owner).toHaveProperty('profileUrl')

      // Validate follower count meets minimum requirement
      expect(playlist.followerCount).toBeGreaterThanOrEqual(1000)
    }
  })

  it('should return 400 for invalid request body', async () => {
    const invalidRequest = {
      // Missing required fields
      minFollowerCount: 1000
    }

    const response = await fetch('http://localhost:3000/api/search/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRequest)
    })

    expect(response.status).toBe(400)

    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error).toHaveProperty('message')
  })

  it('should return 400 for too many genres', async () => {
    const requestWithTooManyGenres = {
      genres: Array.from({ length: 15 }, (_, i) => `genre${i}`), // More than 10 genres
      minFollowerCount: 1000,
      limit: 50
    }

    const response = await fetch('http://localhost:3000/api/search/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestWithTooManyGenres)
    })

    expect(response.status).toBe(400)
  })

  it('should return 400 for negative minimum follower count', async () => {
    const requestWithNegativeFollowers = {
      genres: ['rock'],
      minFollowerCount: -1,
      limit: 50
    }

    const response = await fetch('http://localhost:3000/api/search/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestWithNegativeFollowers)
    })

    expect(response.status).toBe(400)
  })
})