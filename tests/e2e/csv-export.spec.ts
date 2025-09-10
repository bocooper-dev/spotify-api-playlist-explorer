import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test.describe('CSV Export Functionality', () => {
  test('should export search results to CSV file', async ({ page }) => {
    // This test will fail until we implement CSV export functionality
    await page.goto('/')

    // Perform a search first
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=pop').click()
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('50000')
    await page.locator('[data-testid="search-button"]').click()

    // Wait for results
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 })

    // Export button should be enabled
    const exportButton = page.locator('[data-testid="export-button"]')
    await expect(exportButton).toBeEnabled()

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await exportButton.click()

    // Wait for download to start
    const download = await downloadPromise

    // Verify download filename
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/spotify-playlists-\d{4}-\d{2}-\d{2}.*\.csv/)

    // Save download to temp location for validation
    const downloadPath = path.join(__dirname, 'temp', filename)
    await download.saveAs(downloadPath)

    // Verify file exists and has content
    expect(fs.existsSync(downloadPath)).toBe(true)
    
    const csvContent = fs.readFileSync(downloadPath, 'utf-8')
    expect(csvContent.length).toBeGreaterThan(0)

    // Verify CSV headers
    const lines = csvContent.split('\n')
    expect(lines.length).toBeGreaterThan(1) // At least header + 1 data row

    const headers = lines[0].split(',')
    expect(headers).toContain('Playlist Name')
    expect(headers).toContain('Description')
    expect(headers).toContain('Followers')
    expect(headers).toContain('Tracks')
    expect(headers).toContain('Owner')
    expect(headers).toContain('Spotify URL')

    // Verify data rows (if any results)
    if (lines.length > 2) { // Header + at least 1 data row
      const firstDataRow = lines[1].split(',')
      expect(firstDataRow.length).toBe(headers.length)
      
      // First column should have playlist name
      expect(firstDataRow[0].length).toBeGreaterThan(0)
      expect(firstDataRow[0]).not.toBe('')
    }

    // Clean up
    fs.unlinkSync(downloadPath)
  })

  test('should disable export button when no results', async ({ page }) => {
    await page.goto('/')

    // Export button should be disabled initially
    const exportButton = page.locator('[data-testid="export-button"]')
    await expect(exportButton).toBeDisabled()

    // Search for something that returns no results
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=grindcore').click()
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('10000000')
    await page.locator('[data-testid="search-button"]').click()

    // Wait for empty results
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible({ timeout: 10000 })

    // Export button should remain disabled
    await expect(exportButton).toBeDisabled()
  })

  test('should export CSV with correct data formatting', async ({ page }) => {
    await page.goto('/')

    // Mock API response with known data for testing
    await page.route('**/api/search/playlists', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          playlists: [
            {
              id: 'test123',
              name: 'Test Playlist, With Comma',
              description: 'A test playlist with "quotes" and commas',
              url: 'https://open.spotify.com/playlist/test123',
              followerCount: 125000,
              trackCount: 50,
              imageUrl: 'https://example.com/image.jpg',
              owner: {
                id: 'testuser',
                username: 'testuser',
                displayName: 'Test User, Inc.',
                profileUrl: 'https://open.spotify.com/user/testuser',
                imageUrl: 'https://example.com/avatar.jpg'
              },
              genres: ['pop', 'rock'],
              isPublic: true
            }
          ],
          totalFound: 1,
          searchCriteria: {
            genres: ['pop'],
            minFollowerCount: 1000,
            limit: 50
          },
          timestamp: new Date().toISOString()
        })
      })
    })

    // Perform search
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=pop').click()
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('1000')
    await page.locator('[data-testid="search-button"]').click()

    // Wait for results
    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 })

    // Export CSV
    const downloadPromise = page.waitForEvent('download')
    await page.locator('[data-testid="export-button"]').click()
    const download = await downloadPromise

    // Verify CSV content
    const downloadPath = path.join(__dirname, 'temp', download.suggestedFilename())
    await download.saveAs(downloadPath)

    const csvContent = fs.readFileSync(downloadPath, 'utf-8')
    
    // Should properly escape commas and quotes in CSV
    expect(csvContent).toContain('"Test Playlist, With Comma"')
    expect(csvContent).toContain('"A test playlist with ""quotes"" and commas"')
    expect(csvContent).toContain('"Test User, Inc."')
    expect(csvContent).toContain('125000') // Numbers should not be quoted
    expect(csvContent).toContain('50')
    expect(csvContent).toContain('https://open.spotify.com/playlist/test123')

    // Clean up
    fs.unlinkSync(downloadPath)
  })

  test('should handle large result sets in CSV export', async ({ page }) => {
    await page.goto('/')

    // Mock API response with 50 playlists (maximum)
    const largePlaylists = Array.from({ length: 50 }, (_, i) => ({
      id: `playlist${i}`,
      name: `Test Playlist ${i}`,
      description: `Description for playlist ${i}`,
      url: `https://open.spotify.com/playlist/playlist${i}`,
      followerCount: 1000 + i * 100,
      trackCount: 25 + i,
      owner: {
        id: `user${i}`,
        username: `user${i}`,
        displayName: `User ${i}`,
        profileUrl: `https://open.spotify.com/user/user${i}`
      },
      genres: ['pop', 'rock'],
      isPublic: true
    }))

    await page.route('**/api/search/playlists', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          playlists: largePlaylists,
          totalFound: 50,
          searchCriteria: { genres: ['pop'], minFollowerCount: 1000, limit: 50 },
          timestamp: new Date().toISOString()
        })
      })
    })

    // Perform search
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=pop').click()
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('1000')
    await page.locator('[data-testid="search-button"]').click()

    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 })

    // Export should complete within reasonable time
    const downloadPromise = page.waitForEvent('download')
    await page.locator('[data-testid="export-button"]').click()
    const download = await downloadPromise

    const downloadPath = path.join(__dirname, 'temp', download.suggestedFilename())
    await download.saveAs(downloadPath)

    const csvContent = fs.readFileSync(downloadPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // Should have header + 50 data rows + empty final line
    expect(lines.length).toBe(52)
    
    // File size should be under 1MB (from constraints)
    const stats = fs.statSync(downloadPath)
    expect(stats.size).toBeLessThan(1024 * 1024) // 1MB limit

    // Clean up
    fs.unlinkSync(downloadPath)
  })

  test('should show loading state during export', async ({ page }) => {
    await page.goto('/')

    // Mock slower response to test loading state
    await page.route('**/api/search/playlists', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            playlists: [
              {
                id: 'test',
                name: 'Test',
                url: 'https://open.spotify.com/playlist/test',
                followerCount: 1000,
                trackCount: 25,
                owner: { id: 'test', username: 'test', displayName: 'Test', profileUrl: 'https://open.spotify.com/user/test' },
                genres: ['pop'],
                isPublic: true
              }
            ],
            totalFound: 1,
            searchCriteria: { genres: ['pop'], minFollowerCount: 1000, limit: 50 },
            timestamp: new Date().toISOString()
          })
        })
      }, 500)
    })

    // Perform search
    await page.locator('[data-testid="genre-select"]').click()
    await page.locator('text=pop').click()
    await page.locator('[data-testid="genre-select"]').click()

    await page.locator('[data-testid="min-followers-input"]').fill('1000')
    await page.locator('[data-testid="search-button"]').click()

    await expect(page.locator('[data-testid="results-table"]')).toBeVisible({ timeout: 10000 })

    // Click export - should show loading state briefly
    await page.locator('[data-testid="export-button"]').click()
    
    // Export button should show loading state
    await expect(page.locator('[data-testid="export-button"]')).toContainText('Exporting')
    
    // Should complete and return to normal
    await expect(page.locator('[data-testid="export-button"]')).toContainText('Export to CSV', { timeout: 5000 })
  })

  test.beforeEach(async () => {
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
  })
})