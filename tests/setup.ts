import { vi } from 'vitest'

// Mock Nuxt runtime environment
global.process = global.process || {}
global.process.env = global.process.env || {}

// Mock environment variables for tests
process.env.SPOTIFY_CLIENT_ID = 'test_client_id'
process.env.SPOTIFY_CLIENT_SECRET = 'test_client_secret'

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})