# Claude Code Context: Spotify Playlist Explorer

**Project**: Spotify API Playlist Explorer  
**Version**: 1.0.0  
**Last Updated**: 2025-09-10  

## Project Overview
Web application for discovering popular Spotify playlists by music genre and minimum follower count. Built with Nuxt 4, Nuxt UI Pro, and Tailwind CSS, hosted on Vercel.

## Current Architecture

### Frontend (Nuxt 4)
- **Framework**: Nuxt 4 with TypeScript
- **UI Library**: Nuxt UI Pro components  
- **Styling**: Tailwind CSS
- **State Management**: Built-in Nuxt composables (useState, useFetch)

### API Integration  
- **Spotify API**: Client Credentials flow for public playlist access
- **Authentication**: Server-side token management
- **Rate Limiting**: Exponential backoff retry logic

### Key Components
- **Search Form**: Genre multi-select + follower count input
- **Results Table**: Playlist data with owner information  
- **CSV Export**: Client-side generation using Blob API

## Tech Stack
- **Language**: TypeScript with Node.js
- **Framework**: Nuxt 4 (Vue 3)
- **UI**: Nuxt UI Pro, Tailwind CSS  
- **API**: Spotify Web API
- **Testing**: Vitest (unit), Playwright (E2E)
- **Deployment**: Vercel

## Project Structure
```
app/
├── components/       # Vue components  
├── pages/           # Nuxt pages/routes
├── server/api/      # API routes for Spotify integration
└── assets/css/      # Global styles

specs/001-build-an-minimal/
├── spec.md          # Feature specification  
├── plan.md          # Implementation plan
├── research.md      # Technical research
├── data-model.md    # Entity definitions
├── quickstart.md    # Validation guide
└── contracts/       # API contracts
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

## Recent Changes
- Created feature specification and implementation plan
- Designed data models for Playlist and SearchCriteria entities
- Defined API contracts for playlist search and genre endpoints  
- Established quickstart validation guide

## Testing Strategy
- Contract tests for API endpoints
- Integration tests for Spotify API integration  
- E2E tests for complete user workflows
- Unit tests for business logic components

## Deployment
- **Platform**: Vercel  
- **Build**: Automatic deployment from main branch
- **Environment**: Production environment variables configured in Vercel dashboard

## Constitutional Compliance  
- ✅ TDD approach enforced (tests before implementation)
- ✅ Simple architecture (direct API calls, no unnecessary patterns)
- ✅ Structured error handling and logging
- ⚠️ Non-library architecture (justified for web app requirements)