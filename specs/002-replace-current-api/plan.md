# Implementation Plan: Spotify SDK Integration Migration

**Branch**: `002-replace-current-api` | **Date**: 2025-09-10 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-replace-current-api/spec.md`  
**Context**: "Create a plugin to register the SDK. Replace all previous API usages with SDK methods and types."

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Found: Migration from custom Spotify API to @spotify/web-api-ts-sdk
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: web (Nuxt 4 app with server/api routes)
   → Structure: app/ directory with server/api backend routes
3. Evaluate Constitution Check section
   → No violations - maintaining existing architecture, improving implementation
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → Research SDK features, plugin architecture, migration patterns
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → Maintain existing contracts, update data model for SDK types
6. Re-evaluate Constitution Check section
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Task generation approach
8. STOP - Ready for /tasks command
```

## Summary
Replace custom Spotify Web API implementation with official @spotify/web-api-ts-sdk while maintaining identical functionality and user experience. Create a Nuxt plugin to register the SDK and migrate all existing API calls to use SDK methods and types for improved reliability and type safety.

## Technical Context
**Language/Version**: TypeScript with Nuxt 4  
**Primary Dependencies**: @spotify/web-api-ts-sdk, Nuxt 4, Vue 3  
**Storage**: Server-side token caching (existing)  
**Testing**: Vitest, Playwright (existing test framework)  
**Target Platform**: Web application (Nuxt SSR + client-side)  
**Project Type**: web - frontend+backend in single Nuxt app  
**Performance Goals**: Maintain current API response times (<2s)  
**Constraints**: No breaking changes for users, maintain CSV export functionality  
**Scale/Scope**: Single app migration, 2 API endpoints, 3 UI components

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (Nuxt web app) ✓
- Using framework directly? Yes (Nuxt + official SDK) ✓
- Single data model? Yes (maintaining existing playlist/search types) ✓
- Avoiding patterns? No unnecessary wrappers around SDK ✓

**Architecture**:
- EVERY feature as library? N/A - Web app migration, not library creation ✓
- Libraries listed: Using official @spotify/web-api-ts-sdk (external) ✓
- CLI per library: N/A - Web application ✓
- Library docs: N/A - Using external SDK documentation ✓

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes ✓
- Git commits show tests before implementation? Will ensure ✓
- Order: Contract→Integration→E2E→Unit strictly followed? Yes ✓
- Real dependencies used? Yes (actual Spotify API) ✓
- Integration tests for: contract changes, shared schemas? Yes ✓
- FORBIDDEN: Implementation before test ✓

**Observability**:
- Structured logging included? Maintaining existing error handling ✓
- Frontend logs → backend? Existing pattern maintained ✓
- Error context sufficient? Enhanced through SDK error types ✓

**Versioning**:
- Version number assigned? Using existing project versioning ✓
- BUILD increments on every change? Following existing pattern ✓
- Breaking changes handled? No breaking changes for users ✓

## Project Structure

### Documentation (this feature)
```
specs/002-replace-current-api/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Nuxt 4 web application structure (existing)
app/
├── components/          # Vue components (SearchForm, PlaylistTable, CSVExport)
├── pages/              # index.vue with playlist search interface
├── plugins/            # NEW: spotify-sdk.client.ts plugin
└── types/              # TypeScript types (existing)

server/
├── api/                # API routes
│   ├── _spotify-client.ts     # REPLACE: Custom auth → SDK auth
│   ├── _spotify-api.ts        # REPLACE: Custom wrapper → SDK methods
│   ├── genres.get.ts          # UPDATE: Use SDK types
│   └── search/
│       └── playlists.post.ts  # UPDATE: Use SDK methods
└── utils/              # Server utilities

tests/
├── api/                # Contract tests (update for SDK)
├── integration/        # Integration tests (update for SDK) 
└── e2e/               # E2E tests (should pass unchanged)
```

**Structure Decision**: Option 2 (Web application) - Nuxt app with app/ frontend and server/api backend

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context**:
   - SDK authentication patterns for Client Credentials flow
   - SDK error handling and retry mechanisms  
   - SDK caching strategies vs custom implementation
   - Nuxt plugin architecture for SDK registration
   - SDK type compatibility with existing data models

2. **Generate and dispatch research agents**:
   ```
   Task: "Research @spotify/web-api-ts-sdk Client Credentials authentication for Nuxt server"
   Task: "Find Nuxt plugin patterns for registering external SDKs"
   Task: "Research SDK error handling vs custom HTTP client error handling"
   Task: "Find SDK caching and performance optimization patterns"
   Task: "Research SDK TypeScript type compatibility with existing models"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen] 
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all SDK integration decisions documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Maintain existing Playlist, PlaylistOwner, SearchCriteria entities
   - Update with SDK-compatible type definitions
   - Map SDK response types to internal models

2. **Generate API contracts** from functional requirements:
   - Maintain existing REST endpoints (no changes)
   - Update internal request/response types for SDK compatibility
   - Preserve OpenAPI schemas in `/contracts/`

3. **Generate contract tests** from contracts:
   - Update existing contract tests for any type changes
   - Ensure tests still validate same functionality
   - Tests must fail (implementation not migrated yet)

4. **Extract test scenarios** from user stories:
   - All existing integration test scenarios remain valid
   - Add SDK-specific error handling test scenarios
   - Quickstart validation unchanged (user-facing identical)

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/update-agent-context.sh claude` to update CLAUDE.md
   - Add @spotify/web-api-ts-sdk context
   - Update with plugin architecture patterns
   - Keep migration goals and constraints

**Output**: data-model.md, /contracts/*, updated tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks for SDK plugin creation [P]
- Generate tasks for API client migration (auth, wrapper)
- Generate tasks for endpoint updates (genres, search)
- Generate tasks for test updates to use SDK
- Generate tasks for validation and cleanup

**Ordering Strategy**:
- TDD order: Update tests first, then implementation
- Dependency order: Plugin → Auth → API wrapper → Endpoints → UI (if needed)
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitutional violations identified - straightforward migration*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)  
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*