/**
 * GET /api/genres - Retrieve available music genres from Spotify
 */

import type { ErrorResponse, GenresResponse } from '../../types/search'
import { getAvailableGenres } from './_spotify-api'

export default defineEventHandler(async (event): Promise<GenresResponse | ErrorResponse> => {
  try {
    const genres = await getAvailableGenres()

    return {
      genres
    }
  } catch (error) {
    console.error('Failed to fetch genres:', error)

    // Set error status
    setResponseStatus(event, 500)

    return {
      error: 'SPOTIFY_API_ERROR',
      message: 'Unable to fetch available genres. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }
  }
})
