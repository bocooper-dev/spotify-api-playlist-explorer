import {
	describe, it, expect
} from 'vitest'

describe('GET /api/genres', () => {
	it('should return list of available genres', async () => {
		// This will fail because the endpoint doesn't exist yet
		const response = await fetch('http://localhost:3000/api/genres')

		expect(response.status).toBe(200)

		const data = await response.json()

		// Validate response schema matches contract
		expect(data).toHaveProperty('genres')
		expect(Array.isArray(data.genres)).toBe(true)

		// Should return some genres
		expect(data.genres.length).toBeGreaterThan(0)

		// Each genre should be a string
		data.genres.forEach((genre: unknown) => {
			expect(typeof genre).toBe('string')
			expect(genre).toBeTruthy()
		})

		// Should include some common genres (based on Spotify's genre seeds)
		const commonGenres = [ 'rock', 'pop', 'jazz', 'electronic', 'hip-hop' ]
		const hasCommonGenres = commonGenres.some(commonGenre =>
			data.genres.some((genre: string) => genre.includes(commonGenre))
		)
		expect(hasCommonGenres).toBe(true)
	})

	it('should handle server errors gracefully', async () => {
		// Test with invalid endpoint to simulate server error scenario
		const response = await fetch('http://localhost:3000/api/genres')

		// Even if endpoint fails, it should return proper error format
		if (response.status >= 500) {
			const error = await response.json()
			expect(error).toHaveProperty('error')
			expect(error).toHaveProperty('message')
		} else {
			// If successful, should be proper format
			expect(response.status).toBe(200)
		}
	})

	it('should return genres in consistent format', async () => {
		const response = await fetch('http://localhost:3000/api/genres')

		if (response.ok) {
			const data = await response.json()

			// Genres should be lowercase and contain no special characters except hyphens
			data.genres.forEach((genre: string) => {
				expect(genre).toMatch(/^[a-z0-9-]+$/)
				expect(genre.length).toBeGreaterThan(0)
				expect(genre.length).toBeLessThan(50) // Reasonable length limit
			})

			// Should be sorted alphabetically for consistency
			const sortedGenres = [ ...data.genres ].sort()
			expect(data.genres).toEqual(sortedGenres)
		}
	})
})
