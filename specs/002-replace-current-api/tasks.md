# Tasks: Spotify SDK Integration Migration

**Input**: Design documents from `/specs/002-replace-current-api/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md  
**Context**: "Implement new SDK rewrites" - Replace custom Spotify API with @spotify/web-api-ts-sdk

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Found: Nuxt 4, TypeScript, @spotify/web-api-ts-sdk migration
   → Structure: Web app with app/ frontend + server/api backend
2. Load optional design documents:
   → data-model.md: Adapter layer for SDK types → internal types
   → contracts/: API contracts (maintain existing endpoints)
   → research.md: SDK patterns, server utilities, error handling
   → quickstart.md: SDK-specific validation scenarios
3. Generate tasks by category:
   → Setup: SDK utilities, adapter functions, error handling
   → Tests: Update existing tests for SDK compatibility (TDD required)
   → Core: SDK client wrapper, authentication, API routes
   → Integration: Error handling, type adapters, validation
   → Polish: Performance validation, cleanup, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. SUCCESS: 18 tasks ready for execution
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Nuxt 4 web app structure**: app/ directory with server/api backend
- All paths relative to repository root

## Phase 3.1: Setup & SDK Infrastructure
- [ ] T001 [P] Create SDK client wrapper utility in server/utils/spotify.ts
- [ ] T002 [P] Create SDK type adapters in server/utils/spotifyAdapters.ts  
- [ ] T003 [P] Create SDK error handler in server/utils/spotifyErrorHandler.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be updated and MUST FAIL before SDK implementation**

### API Contract Tests (Update Existing)
- [ ] T004 [P] Update contract test POST /api/search/playlists in tests/api/search-playlists.test.ts for SDK compatibility
- [ ] T005 [P] Update contract test GET /api/genres in tests/api/genres.test.ts for SDK compatibility

### Integration Tests (Update Existing)
- [ ] T006 [P] Update integration test Spotify authentication in tests/integration/spotify-auth.test.ts for SDK
- [ ] T007 [P] Update integration test playlist search in tests/integration/playlist-search.test.ts for SDK  
- [ ] T008 [P] Update integration test genre validation in tests/integration/genre-validation.test.ts for SDK

### E2E Tests (Should Pass Unchanged)
- [ ] T009 [P] Verify E2E test search workflow in tests/e2e/search-workflow.spec.ts passes with SDK
- [ ] T010 [P] Verify E2E test CSV export in tests/e2e/csv-export.spec.ts passes with SDK

## Phase 3.3: Core SDK Implementation (ONLY after tests are failing)

### Replace Custom API Implementation
- [ ] T011 Replace custom authentication client in server/api/_spotify-client.ts with SDK wrapper
- [ ] T012 Replace custom API wrapper in server/api/_spotify-api.ts with SDK method calls and adapters

### Update API Endpoints  
- [ ] T013 Update GET /api/genres endpoint in server/api/genres.get.ts to use SDK
- [ ] T014 Update POST /api/search/playlists endpoint in server/api/search/playlists.post.ts to use SDK

## Phase 3.4: Integration & Error Handling
- [ ] T015 Integrate SDK error handler across all API routes for consistent error responses
- [ ] T016 Add SDK-specific input validation and error mapping in API endpoints  
- [ ] T017 Update server middleware to handle SDK authentication errors gracefully

## Phase 3.5: Validation & Polish
- [ ] T018 [P] Execute quickstart validation guide to verify identical functionality and performance

## Dependencies
- Setup (T001-T003) before all other phases
- Tests (T004-T010) before implementation (T011-T017)  
- T001-T003 (SDK infrastructure) before T011-T012 (API implementation)
- T011-T012 (custom replacement) before T013-T014 (endpoint updates)
- T013-T014 (endpoints) before T015-T017 (integration)
- Core implementation before validation (T018)

## Parallel Execution Examples

### Phase 3.1: Launch SDK infrastructure tasks together
```bash
# All these create separate utility files - can run parallel:
Task: "Create SDK client wrapper utility in server/utils/spotify.ts"
Task: "Create SDK type adapters in server/utils/spotifyAdapters.ts"  
Task: "Create SDK error handler in server/utils/spotifyErrorHandler.ts"
```

### Phase 3.2: Launch test updates together
```bash
# Independent test files - can run parallel:
Task: "Update contract test POST /api/search/playlists in tests/api/search-playlists.test.ts for SDK compatibility"
Task: "Update contract test GET /api/genres in tests/api/genres.test.ts for SDK compatibility"
Task: "Update integration test Spotify authentication in tests/integration/spotify-auth.test.ts for SDK"
Task: "Update integration test playlist search in tests/integration/playlist-search.test.ts for SDK"
Task: "Update integration test genre validation in tests/integration/genre-validation.test.ts for SDK"
```

## Context Integration
**From command args**: "Implement new SDK rewrites" - Replace all custom Spotify API handling with official SDK

Key implementation notes:
- Maintain identical API response formats for frontend compatibility
- Use adapter pattern to preserve existing internal types
- Implement proper error handling with SDK error types
- Follow TDD approach: update tests first, then implementation
- Ensure zero breaking changes for end users
- Leverage SDK benefits: automatic auth, caching, type safety

## Migration Strategy Details

### Files Being Replaced
1. **server/api/_spotify-client.ts**: Custom auth → SDK ClientCredentialsStrategy
2. **server/api/_spotify-api.ts**: Custom HTTP calls → SDK method calls with adapters

### Files Being Updated  
1. **server/api/genres.get.ts**: Use `spotify.browse.getAvailableGenreSeeds()`
2. **server/api/search/playlists.post.ts**: Use SDK search methods with type adapters

### New Files Being Created
1. **server/utils/spotify.ts**: SDK client wrapper factory
2. **server/utils/spotifyAdapters.ts**: SDK types → internal types mapping
3. **server/utils/spotifyErrorHandler.ts**: Custom error handling implementation

## Validation Checklist  
*GATE: All items must be checked before task execution*

- [x] All contracts have corresponding updated tests (T004-T005 cover API contracts)
- [x] All SDK utilities have creation tasks (T001-T003 cover infrastructure)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (verified file paths don't overlap)
- [x] Each task specifies exact file path (all tasks include specific paths)
- [x] No task modifies same file as another [P] task (verified no conflicts)

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail after updates before implementing SDK changes (critical for TDD)
- Maintain existing error messages and user experience 
- Use actual Spotify API (not mocks) per constitutional requirements
- All E2E tests should pass unchanged (user experience identical)