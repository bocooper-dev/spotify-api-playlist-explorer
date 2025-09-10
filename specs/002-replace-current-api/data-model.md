# Data Model: Spotify SDK Integration Migration

**Date**: 2025-09-10  
**Status**: Complete  
**Context**: Migration from custom API to @spotify/web-api-ts-sdk

## Core Entities

*Note: All existing entities remain unchanged for user-facing compatibility. This document focuses on SDK type mappings.*

### Playlist (Existing Internal Type)
**Purpose**: Represents a Spotify playlist with metadata and owner information

**Fields**: *Unchanged from original implementation*
- `id: string` - Spotify playlist ID (primary key)
- `name: string` - Playlist display name
- `description?: string` - Optional playlist description
- `url: string` - Spotify web URL for the playlist
- `followerCount: number` - Number of users following this playlist
- `trackCount: number` - Number of tracks in the playlist
- `imageUrl?: string` - Playlist cover image URL
- `owner: PlaylistOwner` - Playlist creator information
- `genres: string[]` - Inferred/associated music genres
- `isPublic: boolean` - Whether playlist is publicly accessible

### PlaylistOwner (Existing Internal Type)
**Purpose**: Represents the creator/owner of a Spotify playlist

**Fields**: *Unchanged from original implementation*
- `id: string` - Spotify user ID
- `username: string` - Spotify username/handle  
- `displayName: string` - User's display name
- `profileUrl: string` - Spotify profile URL
- `imageUrl?: string` - Profile picture URL

### SearchCriteria (Existing Internal Type)
**Purpose**: User input parameters for playlist discovery

**Fields**: *Unchanged from original implementation*
- `genres: string[]` - Selected music genres (max 10)
- `minFollowerCount: number` - Minimum follower threshold
- `limit: number` - Maximum results to return (default: 50)

### SearchResult (Existing Internal Type)
**Purpose**: Response object containing playlists and metadata

**Fields**: *Unchanged from original implementation*
- `playlists: Playlist[]` - Found playlists matching criteria
- `totalFound: number` - Actual number of results
- `searchCriteria: SearchCriteria` - Original search parameters
- `timestamp: Date` - When search was performed

## SDK Type Mappings

### SDK Types → Internal Types

#### SimplifiedPlaylist (SDK) → Playlist (Internal)
```typescript
// SDK Type: SimplifiedPlaylist
interface SimplifiedPlaylist extends PlaylistBase {
  collaborative: boolean
  description: string
  external_urls: ExternalUrls
  followers: Followers
  href: string
  id: string
  images: Image[]
  name: string
  owner: UserReference
  primary_color: string
  public: boolean
  snapshot_id: string
  tracks: TrackReference | null
  type: string
  uri: string
}

// Mapping Function
function adaptSpotifyPlaylist(sdkPlaylist: SimplifiedPlaylist): Playlist {
  return {
    id: sdkPlaylist.id,
    name: sdkPlaylist.name,
    description: sdkPlaylist.description || undefined,
    url: sdkPlaylist.external_urls.spotify,
    followerCount: sdkPlaylist.followers.total,
    trackCount: sdkPlaylist.tracks?.total || 0,
    imageUrl: sdkPlaylist.images[0]?.url,
    owner: adaptSpotifyOwner(sdkPlaylist.owner),
    genres: [], // Will be populated from search context
    isPublic: sdkPlaylist.public
  }
}
```

#### UserReference (SDK) → PlaylistOwner (Internal)
```typescript
// SDK Type: UserReference
interface UserReference {
  display_name?: string
  external_urls: ExternalUrls
  followers?: Followers
  href: string
  id: string
  images?: Image[]
  type: string
  uri: string
}

// Mapping Function
function adaptSpotifyOwner(sdkOwner: UserReference): PlaylistOwner {
  return {
    id: sdkOwner.id,
    username: sdkOwner.id, // SDK uses ID consistently
    displayName: sdkOwner.display_name || sdkOwner.id,
    profileUrl: sdkOwner.external_urls.spotify,
    imageUrl: sdkOwner.images?.[0]?.url
  }
}
```

#### AvailableGenreSeedsResponse (SDK) → string[]
```typescript
// SDK Type: AvailableGenreSeedsResponse
interface AvailableGenreSeedsResponse {
  genres: string[]
}

// Direct mapping - no transformation needed
const genres = await spotify.browse.getAvailableGenreSeeds()
return genres.genres
```

## API Data Flow Changes

### Before (Custom Implementation)
```
HTTP Request → Custom Auth → Manual Parsing → Internal Types → Response
```

### After (SDK Implementation)
```
SDK Method → Auto Auth → SDK Types → Adapter → Internal Types → Response
```

### Authentication Flow Changes

#### Before: Manual Token Management
```typescript
// Custom token caching with manual refresh
let tokenCache: TokenCache | null = null

async function getSpotifyAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }
  
  // Manual fetch and cache logic
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { ... },
    body: new URLSearchParams({ ... })
  })
  
  // Manual error handling and caching
}
```

#### After: SDK Automatic Management
```typescript
// SDK handles all authentication automatically
const spotify = SpotifyApi.withClientCredentials(clientId, clientSecret)

// Token management, refresh, and caching handled internally by SDK
const result = await spotify.browse.getAvailableGenreSeeds()
```

## Error Handling Changes

### SDK Error Types Integration
```typescript
// SDK provides structured error types
import type { SpotifyApiError } from '@spotify/web-api-ts-sdk'

// Custom error handler maintaining existing error structure
export class SpotifyErrorHandler implements IHandleErrors {
  async handleErrors(error: SpotifyApiError): Promise<boolean> {
    // Map SDK errors to existing error response format
    const mappedError = {
      success: false,
      message: this.mapErrorMessage(error),
      details: error.message
    }
    
    // Maintain existing error categorization
    if (error.status === 429) return false // Rate limiting
    if (error.status >= 500) return false  // Server errors
    return true // Client errors - don't retry
  }
  
  private mapErrorMessage(error: SpotifyApiError): string {
    // Preserve existing user-friendly error messages
    switch (error.status) {
      case 401: return 'Spotify authentication failed. Please check configuration.'
      case 403: return 'Access denied. Please verify your Spotify app permissions.'
      case 429: return 'Too many requests. Please try again in a moment.'
      default: return 'Unable to connect to Spotify. Please try again later.'
    }
  }
}
```

## Migration Benefits

### Type Safety Improvements
- **SDK Types**: Comprehensive TypeScript definitions for all Spotify API responses
- **Compile-time Validation**: Catch type mismatches during development
- **IntelliSense**: Full autocomplete support for all SDK methods and properties
- **Backwards Compatibility**: Existing internal types preserved for API consistency

### Simplified Data Flow
- **Reduced Mapping**: Direct SDK types require minimal transformation
- **Automatic Parsing**: SDK handles JSON parsing and validation
- **Error Consistency**: Standardized error handling across all API calls
- **Performance**: Optimized request batching and caching built into SDK

### Maintenance Reduction
- **Custom Code Elimination**: Remove 144+ lines of authentication and HTTP handling
- **Official Support**: SDK maintained by Spotify team
- **Future-proof**: Automatic updates for new Spotify API features
- **Documentation**: Comprehensive SDK documentation and examples