# Data Model: Spotify Playlist Explorer

**Date**: 2025-09-10  
**Status**: Complete

## Core Entities

### Playlist
**Purpose**: Represents a Spotify playlist with metadata and owner information

**Fields**:
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

**Validation Rules**:
- `id` must be valid Spotify playlist ID format
- `name` required, max 255 characters
- `url` must be valid Spotify URL format
- `followerCount` must be >= 0
- `trackCount` must be >= 0

### PlaylistOwner
**Purpose**: Represents the creator/owner of a Spotify playlist

**Fields**:
- `id: string` - Spotify user ID
- `username: string` - Spotify username/handle  
- `displayName: string` - User's display name
- `profileUrl: string` - Spotify profile URL
- `imageUrl?: string` - Profile picture URL

**Validation Rules**:
- `id` must be valid Spotify user ID format
- `username` required, alphanumeric + underscores/hyphens only
- `displayName` required, max 255 characters
- `profileUrl` must be valid Spotify user URL format

### SearchCriteria
**Purpose**: User input parameters for playlist discovery

**Fields**:
- `genres: string[]` - Selected music genres (max 10)
- `minFollowerCount: number` - Minimum follower threshold
- `limit: number` - Maximum results to return (default: 50)

**Validation Rules**:
- `genres` array length <= 10
- Each genre must be valid per Spotify's genre seeds
- `minFollowerCount` must be >= 0
- `limit` must be between 1 and 50

### SearchResult
**Purpose**: Response object containing playlists and metadata

**Fields**:
- `playlists: Playlist[]` - Found playlists matching criteria
- `totalFound: number` - Actual number of results
- `searchCriteria: SearchCriteria` - Original search parameters
- `timestamp: Date` - When search was performed

**Validation Rules**:
- `playlists` array length <= 50
- `totalFound` must be >= 0
- `timestamp` must be valid Date object

## Relationships

### Playlist → PlaylistOwner
- **Type**: Many-to-One (many playlists can have the same owner)
- **Cardinality**: 1 playlist has exactly 1 owner
- **Implementation**: Embedded owner object within playlist

### SearchCriteria → SearchResult
- **Type**: One-to-One (each search has one result set)
- **Cardinality**: 1 search criteria produces 1 search result
- **Implementation**: SearchResult contains reference to original criteria

## State Transitions

### Search Flow State Machine
```
[Initial] → [Searching] → [Results] | [Error]
                ↓           ↓
              [Loading]   [Export]
```

**States**:
- `Initial`: User input form, ready to search
- `Searching`: API request in progress, loading state
- `Results`: Playlists displayed in table
- `Export`: CSV generation and download
- `Error`: Display error message, return to Initial
- `Loading`: Show loading spinner/progress

**Transitions**:
- Initial → Searching: User submits valid form
- Searching → Results: API returns playlists successfully  
- Searching → Error: API fails or returns error
- Results → Export: User clicks CSV export button
- Results → Initial: User modifies search criteria
- Error → Initial: User acknowledges error or modifies search

## API Data Mapping

### Spotify API Response → Playlist Entity
```typescript
// Spotify API playlist object
{
  id: string,
  name: string,
  description: string,
  external_urls: { spotify: string },
  followers: { total: number },
  tracks: { total: number },
  images: [{ url: string }],
  owner: SpotifyUser,
  public: boolean
}

// Maps to Playlist entity
{
  id: response.id,
  name: response.name,
  description: response.description,
  url: response.external_urls.spotify,
  followerCount: response.followers.total,
  trackCount: response.tracks.total,
  imageUrl: response.images[0]?.url,
  owner: mapSpotifyUser(response.owner),
  genres: [], // Inferred from tracks or search context
  isPublic: response.public
}
```

### Spotify User → PlaylistOwner Entity  
```typescript
// Spotify API user object
{
  id: string,
  display_name: string,
  external_urls: { spotify: string },
  images: [{ url: string }]
}

// Maps to PlaylistOwner entity
{
  id: response.id,
  username: response.id, // Spotify uses ID as username
  displayName: response.display_name,
  profileUrl: response.external_urls.spotify,
  imageUrl: response.images[0]?.url
}
```