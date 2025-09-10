import { test, expect } from '@playwright/test'

test.describe('Playlist Search Workflow', () => {
  test('should complete full search workflow from form to results', async ({ page }) => {
    // This test will fail until we implement the UI components
    await page.goto('/')

    // Should show search form
    await expect(page.locator('h1')).toContainText('Spotify Playlist Explorer')
    
    // Find genre selection component
    const genreSelect = page.locator('[data-testid="genre-select"]')
    await expect(genreSelect).toBeVisible()

    // Find minimum followers input
    const followersInput = page.locator('[data-testid="min-followers-input"]')
    await expect(followersInput).toBeVisible()

    // Find search button
    const searchButton = page.locator('[data-testid="search-button"]')
    await expect(searchButton).toBeVisible()

    // Fill out the form
    await genreSelect.click()
    await page.locator('text=rock').click()
    await page.locator('text=pop').click()
    await genreSelect.click() // Close dropdown

    await followersInput.fill('10000')

    // Submit search
    await searchButton.click()

    // Should show loading state
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible()

    // Should show results table (wait up to 10 seconds for API call)
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 })

    // Verify table headers
    await expect(page.locator('th:has-text("Playlist Name")')).toBeVisible()
    await expect(page.locator('th:has-text("Description")')).toBeVisible()
    await expect(page.locator('th:has-text("Followers")')).toBeVisible()
    await expect(page.locator('th:has-text("Tracks")')).toBeVisible()
    await expect(page.locator('th:has-text("Owner")')).toBeVisible()
    await expect(page.locator('th:has-text("Spotify Link")')).toBeVisible()

    // Should have some results (if API returns data)
    const rows = page.locator('[data-testid="playlist-row"]')
    const rowCount = await rows.count()
    
    if (rowCount > 0) {
      // Verify first row has expected data
      const firstRow = rows.first()
      await expect(firstRow.locator('[data-testid="playlist-name"]')).toBeVisible()
      await expect(firstRow.locator('[data-testid="playlist-followers"]')).toBeVisible()
      await expect(firstRow.locator('[data-testid="playlist-owner"]')).toBeVisible()
      await expect(firstRow.locator('[data-testid="spotify-link"]')).toBeVisible()

      // Verify follower count meets minimum requirement
      const followersText = await firstRow.locator('[data-testid="playlist-followers"]').textContent()
      const followerCount = parseInt(followersText?.replace(/[,\s]/g, '') || '0')
      expect(followerCount).toBeGreaterThanOrEqual(10000)
    }
  })

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/')

    // Fill form with restrictive criteria
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=grindcore').click() // Obscure genre
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('10000000') // Very high

    await page.locator('[data-testid="search-button"]').click()

    // Should show loading then empty state
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible()
    
    // Should show "no results" message
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=No playlists found')).toBeVisible()

    // Export button should be disabled
    await expect(page.locator('[data-testid="export-button"]')).toBeDisabled()
  })

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/')

    const searchButton = page.locator('[data-testid="search-button"]')
    
    // Search button should be disabled initially
    await expect(searchButton).toBeDisabled()

    // Try submitting with empty genres
    const followersInput = page.locator('[data-testid="min-followers-input"]')
    await followersInput.fill('1000')
    
    // Should still be disabled without genres
    await expect(searchButton).toBeDisabled()

    // Add a genre
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=rock').click()
    await page.locator('[data-testid="genre-select"]').click()

    // Should now be enabled
    await expect(searchButton).toBeEnabled()

    // Try invalid follower count
    await followersInput.fill('-1')
    
    // Should show validation error
    await expect(page.locator('text=must be greater than or equal to 0')).toBeVisible()
    await expect(searchButton).toBeDisabled()

    // Fix validation error
    await followersInput.fill('1000')
    await expect(searchButton).toBeEnabled()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/')

    // Mock API failure by intercepting requests
    await page.route('**/api/search/playlists', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'SPOTIFY_API_ERROR', message: 'Service unavailable' })
      })
    })

    // Fill and submit form
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=rock').click()
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('1000')
    await page.locator('[data-testid="search-button"]').click()

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Unable to search playlists')).toBeVisible()
    
    // Should not show technical details
    await expect(page.locator('text=SPOTIFY_API_ERROR')).not.toBeVisible()

    // Should show retry option
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should allow searching with multiple genres', async ({ page }) => {
    await page.goto('/')

    // Select multiple genres
    const genreSelect = page.locator('[data-testid="genre-select"]')
    await genreSelect.click()
    
    await page.locator('text=rock').click()
    await page.locator('text=jazz').click()
    await page.locator('text=electronic').click()
    
    await genreSelect.click() // Close dropdown

    // Should show selected genres
    await expect(page.locator('text=rock')).toBeVisible()
    await expect(page.locator('text=jazz')).toBeVisible() 
    await expect(page.locator('text=electronic')).toBeVisible()

    await page.locator('[data-testid="min-followers-input"]').fill('5000')
    await page.locator('[data-testid="search-button"]').click()

    // Should proceed with search
    await expect(page.locator('[data-testid="loading-state"]')).toBeVisible()
  })

  test('should prevent selecting more than 10 genres', async ({ page }) => {
    await page.goto('/')

    const genreSelect = page.locator('[data-testid="genre-select"]')
    await genreSelect.click()

    // Try to select 11 genres
    const genres = ['rock', 'pop', 'jazz', 'electronic', 'hip-hop', 'country', 'classical', 'reggae', 'blues', 'folk', 'punk']
    
    for (const genre of genres) {
      const genreOption = page.locator(`text=${genre}`)
      if (await genreOption.isVisible()) {
        await genreOption.click()
      }
    }

    // Should show validation message about 10 genre limit
    await expect(page.locator('text=maximum of 10 genres')).toBeVisible()
    
    // Search button should be disabled if over limit
    const selectedGenres = page.locator('[data-testid="selected-genre"]')
    const count = await selectedGenres.count()
    
    if (count > 10) {
      await expect(page.locator('[data-testid="search-button"]')).toBeDisabled()
    }
  })
})