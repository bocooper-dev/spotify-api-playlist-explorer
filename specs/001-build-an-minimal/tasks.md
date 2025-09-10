# Tasks: Spotify Playlist Explorer

**Input**: Design documents from `/specs/001-build-an-minimal/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: Nuxt 4, TypeScript, Nuxt UI Pro, Tailwind, Spotify Web API
   → Structure: Web app with frontend + API routes
2. Load optional design documents:
   → data-model.md: Playlist, PlaylistOwner, SearchCriteria, SearchResult entities
   → contracts/: POST /api/search/playlists, GET /api/genres endpoints
   → research.md: Client Credentials Flow, direct fetch API calls
3. Generate tasks by category:
   → Setup: Nuxt project, dependencies, environment config
   → Tests: contract tests, integration tests (TDD required)
   → Core: types/models, API routes, UI components
   → Integration: Spotify API client, error handling
   → Polish: CSV export, styling, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. SUCCESS: 28 tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: Nuxt 4 app/ directory with components, pages, server/api
- All paths relative to repository root

## Phase 3.1: Setup & Configuration
- [ ] T001 Setup Spotify API credentials and environment variables in .env.example and .env.local
- [ ] T002 Install missing dependencies: @nuxt/ui-pro packages for advanced components
- [ ] T003 [P] Configure TypeScript types and Vitest test configuration in vitest.config.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [ ] T004 [P] Contract test POST /api/search/playlists in tests/api/search-playlists.test.ts
- [ ] T005 [P] Contract test GET /api/genres in tests/api/genres.test.ts

### Integration Tests  
- [ ] T006 [P] Integration test Spotify API authentication in tests/integration/spotify-auth.test.ts
- [ ] T007 [P] Integration test playlist search flow in tests/integration/playlist-search.test.ts
- [ ] T008 [P] Integration test genre validation in tests/integration/genre-validation.test.ts

### E2E Tests
- [ ] T009 [P] E2E test complete search workflow in tests/e2e/search-workflow.spec.ts
- [ ] T010 [P] E2E test CSV export functionality in tests/e2e/csv-export.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Type Definitions & Models
- [ ] T011 [P] Playlist types in types/playlist.ts based on data-model.md entities
- [ ] T012 [P] SearchCriteria types in types/search.ts for request/response schemas
- [ ] T013 [P] Spotify API types in types/spotify.ts for external API responses

### Spotify API Integration
- [ ] T014 [P] Spotify client credentials service in server/api/_spotify-client.ts
- [ ] T015 [P] Spotify API wrapper with error handling in server/api/_spotify-api.ts

### API Endpoints
- [ ] T016 GET /api/genres endpoint in server/api/genres.get.ts (retrieve available genres)
- [ ] T017 POST /api/search/playlists endpoint in server/api/search/playlists.post.ts (main search)

### Frontend Components
- [ ] T018 [P] SearchForm component in app/components/SearchForm.vue (genre multi-select + follower input)
- [ ] T019 [P] PlaylistTable component in app/components/PlaylistTable.vue (results display)
- [ ] T020 [P] CSVExport component in app/components/CSVExport.vue (download functionality)

### Main Page
- [ ] T021 Replace index.vue with playlist search interface in app/pages/index.vue

## Phase 3.4: Integration & Polish

### Error Handling & Validation
- [ ] T022 Input validation and error handling in SearchForm component
- [ ] T023 API error handling with user-friendly messages across all endpoints
- [ ] T024 Rate limiting and retry logic for Spotify API calls

### Performance & UX
- [ ] T025 Loading states and progress indicators in UI components
- [ ] T026 Responsive design and mobile optimization using Tailwind
- [ ] T027 CSV export implementation with proper filename and data formatting

### Final Integration
- [ ] T028 End-to-end testing validation using quickstart.md scenarios

## Dependencies
- Setup (T001-T003) before all other phases
- Tests (T004-T010) before implementation (T011-T027)
- T011-T013 (types) before T014-T017 (API implementation)  
- T014-T015 (Spotify client) before T016-T017 (endpoints)
- T016-T017 (API) before T018-T021 (UI components)
- T018-T020 (components) before T021 (page integration)
- Core implementation before polish (T022-T028)

## Parallel Execution Examples

### Phase 3.2: Launch all contract tests together
```bash
# All these tests work on different files - can run parallel:
Task: "Contract test POST /api/search/playlists in tests/api/search-playlists.test.ts"
Task: "Contract test GET /api/genres in tests/api/genres.test.ts"
Task: "Integration test Spotify API authentication in tests/integration/spotify-auth.test.ts"
Task: "Integration test playlist search flow in tests/integration/playlist-search.test.ts"
Task: "Integration test genre validation in tests/integration/genre-validation.test.ts"
```

### Phase 3.3: Launch type definitions together
```bash
# These work on separate type files - can run parallel:
Task: "Playlist types in types/playlist.ts based on data-model.md entities"
Task: "SearchCriteria types in types/search.ts for request/response schemas" 
Task: "Spotify API types in types/spotify.ts for external API responses"
```

### Phase 3.3: Launch UI components together
```bash
# Independent Vue components - can run parallel:
Task: "SearchForm component in app/components/SearchForm.vue"
Task: "PlaylistTable component in app/components/PlaylistTable.vue"
Task: "CSVExport component in app/components/CSVExport.vue"
```

## Context Integration
**From command args**: "Use the Spotify typescript API to find playlists that meet the criteria. Create the UI and replace the existing template's UI. Hookup endpoints and response data to UI."

Key implementation notes:
- Replace existing Nuxt UI starter template content with playlist search interface
- Use TypeScript throughout for type safety with Spotify API responses
- Implement proper data flow: Form → API → Results → Export
- Follow Nuxt 4 conventions for API routes and composables
- Use Nuxt UI Pro components for consistent styling
- Ensure CSV export works client-side without server dependency

## Validation Checklist
*GATE: All items must be checked before task execution*

- [x] All contracts have corresponding tests (T004-T005 cover API contracts)
- [x] All entities have model/type tasks (T011-T013 cover data-model.md entities)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (verified file paths don't overlap)
- [x] Each task specifies exact file path (all tasks include specific paths)
- [x] No task modifies same file as another [P] task (verified no conflicts)

## Notes
- [P] tasks = different files, no dependencies  
- Verify tests fail before implementing (critical for TDD)
- Commit after each task completion
- Follow quickstart.md for validation scenarios
- Use actual Spotify API (not mocks) per constitutional requirements