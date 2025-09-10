import { config } from 'dotenv'
import {
	beforeEach,
	vi
} from 'vitest'

// Load environment variables from .env file for tests
config()

// Mock Nuxt runtime environment
global.process = global.process || {}
global.process.env = global.process.env || {}

// Use real environment variables for integration tests if available,
// otherwise fall back to test credentials
process.env.SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'test_client_id'
process.env.SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'test_client_secret'

// Global test setup
beforeEach(() => {
	// Reset all mocks before each test
	vi.clearAllMocks()
})
