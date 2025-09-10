# Research Phase: Spotify Playlist Explorer

**Date**: 2025-09-10  
**Status**: Complete

## Research Tasks Completed

### 1. Spotify API Authentication Method
**Decision**: Client Credentials Flow  
**Rationale**: 
- Application only needs to search public playlists, no user-specific data access required
- Client Credentials flow is appropriate for server-side applications accessing public data  
- Simpler implementation without user OAuth flow
- Fits the "minimal application" requirement

**Alternatives considered**:
- Authorization Code Flow: Rejected - unnecessary complexity for public data access
- Implicit Grant Flow: Rejected - deprecated by Spotify for security reasons

### 2. Owner Contact Information Fields
**Decision**: Username, display name, and profile URL  
**Rationale**:
- Username and display name are always available from Spotify API
- Profile URL provides direct link to user's Spotify profile
- Email addresses are not publicly available via Spotify API
- These fields provide meaningful contact/identification information

**Alternatives considered**:
- Email addresses: Not available through public API
- Social media links: Not consistently available in Spotify user profiles

### 3. Spotify Web API Integration Patterns
**Decision**: Direct API calls using fetch with proper error handling  
**Rationale**:
- Keep implementation simple per constitutional principles
- Built-in fetch API is sufficient for HTTP requests
- Avoid additional dependencies for HTTP client libraries
- Implement retry logic for rate limiting

**Alternatives considered**:
- Axios library: Rejected - unnecessary dependency for simple HTTP requests
- Spotify Web SDK: Rejected - overkill for server-side playlist search

### 4. Genre Validation Strategy  
**Decision**: Use Spotify's available genre seeds endpoint  
**Rationale**:
- Spotify provides `/recommendations/available-genre-seeds` endpoint
- Returns current list of valid genres for search
- Ensures user input matches Spotify's genre taxonomy
- Prevents invalid API requests

**Alternatives considered**:
- Static genre list: Rejected - may become outdated
- No validation: Rejected - would result in poor user experience with invalid searches

### 5. CSV Export Implementation
**Decision**: Browser-based CSV generation using Blob API  
**Rationale**:
- Client-side export avoids server load
- JavaScript CSV generation is straightforward for structured data
- Browser download API handles file delivery to user
- Keeps server API focused on data retrieval

**Alternatives considered**:
- Server-side CSV generation: Rejected - unnecessary server complexity
- Third-party CSV library: Rejected - simple data structure doesn't require external dependency

### 6. Playlist Filtering Strategy
**Decision**: Server-side filtering using Spotify search with genre and follower parameters  
**Rationale**:
- Spotify search API supports genre filtering via `search` endpoint
- Follower count available in playlist objects for post-search filtering
- More efficient than client-side filtering of large result sets
- Reduces bandwidth and improves performance

**Alternatives considered**:
- Client-side filtering: Rejected - would require fetching all playlists first
- Multiple API requests per genre: Rejected - would exceed rate limits

### 7. Error Handling Strategy
**Decision**: Graceful degradation with user-friendly messages  
**Rationale**:
- Spotify API rate limiting requires retry mechanism with exponential backoff
- Network errors should display helpful messages to users
- Empty results should show clear "no playlists found" messaging
- API errors should not expose technical details to end users

**Alternatives considered**:
- Technical error messages: Rejected - poor user experience
- Silent failures: Rejected - confusing for users

## Technical Decisions Summary

1. **Authentication**: Client Credentials Flow for public playlist access
2. **Contact Info**: Username, display name, profile URL from Spotify user objects  
3. **API Integration**: Direct fetch API calls with error handling and retries
4. **Genre Validation**: Real-time validation against Spotify's genre seeds API
5. **CSV Export**: Client-side generation using browser Blob API
6. **Filtering**: Server-side filtering combining Spotify search and follower count
7. **Error Handling**: User-friendly messages with graceful degradation

## NEEDS CLARIFICATION Status
All clarifications from spec.md have been resolved:
- ✅ Authentication method: Client Credentials Flow
- ✅ User interface type: Web application (Nuxt 4 frontend)  
- ✅ Owner contact fields: Username, display name, profile URL