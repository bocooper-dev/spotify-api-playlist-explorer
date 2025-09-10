/**
 * Search criteria and response types for playlist discovery
 */

import type { Playlist } from './playlist'

export interface SearchCriteria {
  /** Selected music genres (max 10) */
  genres: string[]
  /** Minimum follower threshold */
  minFollowerCount: number
  /** Maximum results to return (default: 50) */
  limit: number
}

export interface SearchResult {
  /** Found playlists matching criteria */
  playlists: Playlist[]
  /** Actual number of results */
  totalFound: number
  /** Original search parameters */
  searchCriteria: SearchCriteria
  /** When search was performed */
  timestamp: Date
}

/**
 * API request/response schemas
 */
export interface SearchRequest {
  genres: string[]
  minFollowerCount: number
  limit?: number
}

export interface SearchResponse {
  playlists: Playlist[]
  totalFound: number
  searchCriteria: SearchCriteria
  timestamp: string
}

export interface GenresResponse {
  genres: string[]
}

export interface ErrorResponse {
  error: string
  message: string
  details?: any
}

/**
 * Validation functions
 */
export function validateSearchCriteria(criteria: any): criteria is SearchCriteria {
  return (
    typeof criteria === 'object' &&
    Array.isArray(criteria.genres) &&
    criteria.genres.length >= 1 &&
    criteria.genres.length <= 10 &&
    criteria.genres.every((genre: any) => typeof genre === 'string' && genre.length > 0) &&
    typeof criteria.minFollowerCount === 'number' &&
    criteria.minFollowerCount >= 0 &&
    typeof criteria.limit === 'number' &&
    criteria.limit >= 1 &&
    criteria.limit <= 50
  )
}

export function validateSearchRequest(request: any): request is SearchRequest {
  return (
    typeof request === 'object' &&
    Array.isArray(request.genres) &&
    request.genres.length >= 1 &&
    request.genres.length <= 10 &&
    request.genres.every((genre: any) => typeof genre === 'string' && genre.length > 0) &&
    typeof request.minFollowerCount === 'number' &&
    request.minFollowerCount >= 0 &&
    (request.limit === undefined || (typeof request.limit === 'number' && request.limit >= 1 && request.limit <= 50))
  )
}

/**
 * Search state management types
 */
export type SearchState = 'initial' | 'searching' | 'results' | 'error' | 'export'

export interface SearchStore {
  state: SearchState
  criteria: SearchCriteria | null
  results: SearchResult | null
  error: string | null
  isLoading: boolean
  isExporting: boolean
}