# Claude Code Context: Spotify Playlist Explorer

**Project**: Spotify API Playlist Explorer  
**Framework**: Nuxt 4 with TypeScript  
**Current Phase**: SDK Migration (002-replace-current-api)

## Current Implementation Status

### Completed Features (Branch: main)
- ✅ Spotify playlist search with genre filtering and follower counts
- ✅ Custom Spotify API client with Client Credentials authentication
- ✅ Vue 3 + Nuxt UI Pro frontend with SearchForm, PlaylistTable, CSVExport components  
- ✅ Server API routes: GET /api/genres, POST /api/search/playlists
- ✅ CSV export functionality with proper escaping
- ✅ Comprehensive test suite (contract, integration, E2E)
- ✅ Full TDD implementation with all 28 tasks completed

### Current Migration (Branch: 002-replace-current-api)
- 🔄 **IN PROGRESS**: Migrating from custom API to @spotify/web-api-ts-sdk
- 📋 **Goal**: Maintain identical functionality while improving reliability and type safety
- 🎯 **Approach**: Create adapter layer to preserve existing API contracts

## Current Architecture

### Frontend (Nuxt 4)
- **Framework**: Nuxt 4 with TypeScript
- **UI Library**: Nuxt UI Pro components  
- **Styling**: Tailwind CSS
- **State Management**: Built-in Nuxt composables (useState, useFetch)

### API Integration  
- **Current**: Custom Spotify API client (being replaced)
- **Target**: @spotify/web-api-ts-sdk with Client Credentials flow
- **Authentication**: SDK automatic token management
- **Rate Limiting**: SDK built-in handling with retry logic

### Key Components
- **Search Form**: Genre multi-select + follower count input
- **Results Table**: Playlist data with owner information  
- **CSV Export**: Client-side generation using Blob API

## Technical Stack

### Dependencies
```json
{
  "dependencies": {
    "@spotify/web-api-ts-sdk": "^1.2.0", // NEW - Official Spotify SDK
    "@nuxt/ui": "^4.0.0-alpha.1",
    "nuxt": "^4.1.0"
  },
  "devDependencies": {
    "@vitest/ui": "^2.0.0",
    "@playwright/test": "^1.55.0",
    "typescript": "^5.9.2"
  }
}
```

### Core Stack
- **Language**: TypeScript with Node.js
- **Framework**: Nuxt 4 (Vue 3)
- **UI**: Nuxt UI Pro, Tailwind CSS  
- **API**: Spotify Web API via official SDK
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Vercel

## Project Structure
```
app/
├── components/           # SearchForm.vue, PlaylistTable.vue, CSVExport.vue
├── pages/               # index.vue - main search interface  
├── plugins/             # NEW: spotify-sdk.client.ts (planned)
└── types/               # playlist.ts, search.ts, spotify.ts

server/
├── api/
│   ├── _spotify-client.ts    # MIGRATION TARGET: Replace with SDK
│   ├── _spotify-api.ts       # MIGRATION TARGET: Replace with SDK methods
│   ├── genres.get.ts         # UPDATE: Use SDK for genres
│   └── search/playlists.post.ts # UPDATE: Use SDK for search
└── utils/               # NEW: SDK utilities and adapters

tests/
├── api/                 # Contract tests (update for SDK compatibility)
├── integration/         # Integration tests (update for SDK)
└── e2e/                # E2E tests (should pass unchanged)

specs/
├── 001-build-an-minimal/    # Original implementation
│   ├── spec.md, plan.md, research.md, data-model.md
│   ├── quickstart.md, tasks.md (completed)
│   └── contracts/
└── 002-replace-current-api/ # Current SDK migration
    ├── spec.md, plan.md, research.md, data-model.md
    ├── quickstart.md, tasks.md (pending)
    └── contracts/
```

## Key Files to Know
- `app/pages/index.vue` - Main search interface
- `app/server/api/search/playlists.post.ts` - Playlist search endpoint
- `app/server/api/genres.get.ts` - Available genres endpoint
- `nuxt.config.ts` - Nuxt configuration
- `app.config.ts` - App-specific configuration

## Data Models

### Playlist Entity
```typescript
interface Playlist {
  id: string              // Spotify playlist ID
  name: string           // Display name  
  description?: string   // Optional description
  url: string           // Spotify web URL
  followerCount: number // Number of followers
  trackCount: number    // Number of tracks
  imageUrl?: string     // Cover image URL
  owner: PlaylistOwner  // Creator information
  genres: string[]      // Associated genres
  isPublic: boolean     // Public accessibility
}
```

### Search Criteria
```typescript
interface SearchCriteria {
  genres: string[]        // Up to 10 music genres
  minFollowerCount: number // Minimum follower threshold  
  limit: number          // Max results (default: 50)
}
```

## API Endpoints
- `GET /api/genres` - Available Spotify genres
- `POST /api/search/playlists` - Search playlists by criteria

## Environment Variables
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

## Development Commands
```bash
pnpm dev          # Start development server
pnpm build        # Build for production  
pnpm test         # Run test suite
pnpm typecheck    # TypeScript validation
```

## Migration Strategy

### Key Files to Modify
1. **server/utils/spotify.ts** (NEW): SDK client wrapper
2. **server/utils/spotifyAdapters.ts** (NEW): Map SDK types to internal types
3. **server/api/_spotify-client.ts**: Replace with SDK authentication
4. **server/api/_spotify-api.ts**: Replace with SDK method calls
5. **server/api/genres.get.ts**: Update to use SDK
6. **server/api/search/playlists.post.ts**: Update to use SDK

### Code Patterns

#### Current Custom Implementation
```typescript
// server/api/_spotify-client.ts - TO BE REPLACED
let tokenCache: TokenCache | null = null
export async function getSpotifyAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token
  }
  // Manual token management...
}
```

#### Target SDK Implementation  
```typescript
// server/utils/spotify.ts - NEW
import { SpotifyApi } from '@spotify/web-api-ts-sdk'

export function getSpotifyClient() {
  const config = useRuntimeConfig()
  return SpotifyApi.withClientCredentials(
    config.spotifyClientId,
    config.spotifyClientSecret
  )
}

// server/utils/spotifyAdapters.ts - NEW
export function adaptSpotifyPlaylist(sdkPlaylist: SimplifiedPlaylist): Playlist {
  return {
    id: sdkPlaylist.id,
    name: sdkPlaylist.name,
    description: sdkPlaylist.description || undefined,
    url: sdkPlaylist.external_urls.spotify,
    followerCount: sdkPlaylist.followers.total,
    trackCount: sdkPlaylist.tracks?.total || 0,
    imageUrl: sdkPlaylist.images[0]?.url,
    owner: adaptSpotifyOwner(sdkPlaylist.owner),
    genres: [], // Populated from search context
    isPublic: sdkPlaylist.public
  }
}
```

### Migration Constraints

#### Must Maintain (NON-NEGOTIABLE)
- ✅ Identical user interface and experience
- ✅ Same API response formats for frontend compatibility  
- ✅ Same CSV export format and functionality
- ✅ Same error messages and handling behavior
- ✅ Same performance characteristics

#### SDK Benefits to Gain
- 🎯 Automatic token management and refresh
- 🎯 Enhanced error handling with structured error types
- 🎯 Better type safety with official SDK types
- 🎯 Reduced maintenance burden (eliminate ~144 lines of custom code)
- 🎯 Built-in request optimization and caching

## Recent Changes

### Completed (001-build-an-minimal)
- Full TDD implementation with comprehensive test coverage
- Vue 3 + Nuxt UI Pro frontend with responsive design
- Custom Spotify API integration with Client Credentials flow
- CSV export with proper data formatting and escaping
- Error handling and input validation
- Performance optimization and loading states

### In Progress (002-replace-current-api)  
- Research completed: SDK integration patterns identified
- Data model defined: Adapter layer approach confirmed
- Contracts preserved: Maintain existing API specifications
- Quickstart updated: SDK-specific validation scenarios

## Next Steps

1. **Create SDK utilities** (server/utils/spotify.ts, spotifyAdapters.ts)
2. **Replace authentication** (update _spotify-client.ts)
3. **Replace API wrapper** (update _spotify-api.ts) 
4. **Update endpoints** (genres.get.ts, search/playlists.post.ts)
5. **Update tests** for SDK compatibility
6. **Validate migration** using quickstart guide

## Testing Strategy

- **TDD Approach**: Update tests first, then implementation
- **Contract Tests**: Ensure API compatibility maintained
- **Integration Tests**: Verify SDK integration works end-to-end
- **E2E Tests**: Should pass unchanged (user experience identical)
- **Performance Tests**: Validate response times maintained or improved

## Deployment
- **Platform**: Vercel  
- **Build**: Automatic deployment from main branch
- **Environment**: Production environment variables configured in Vercel dashboard

## Constitutional Compliance  
- ✅ TDD approach enforced (tests before implementation)
- ✅ Simple architecture (direct API calls, no unnecessary patterns)
- ✅ Structured error handling and logging
- ⚠️ Non-library architecture (justified for web app requirements)