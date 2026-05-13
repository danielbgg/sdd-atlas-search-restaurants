# Tasks: Busca de Restaurantes em Sao Paulo (MVP)

**Input**: Design documents from `/specs/001-busca-restaurantes-sp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by constitution. Every story MUST include tests mapped to its requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Tests**: `backend/tests/{contract,integration,unit}` and `frontend/tests/{integration,unit}`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [ ] T001 Create backend and frontend directory skeletons in backend/src and frontend/src
- [ ] T002 Initialize backend project configuration in backend/package.json
- [ ] T003 Initialize frontend project configuration in frontend/package.json
- [ ] T004 [P] Configure lint and format rules in backend/eslint.config.js and frontend/eslint.config.js
- [ ] T005 [P] Create shared environment templates in backend/.env.example and frontend/.env.example
- [ ] T006 [P] Define baseline run scripts in backend/package.json and frontend/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create MongoDB connection and health check module in backend/src/config/mongodb.ts
- [ ] T008 [P] Implement shared Restaurant and query DTO types in backend/src/models/restaurant.ts
- [ ] T009 [P] Implement viewport and query validation schemas in backend/src/validation/search.ts
- [ ] T010 Implement repository for geospatial and text lookups in backend/src/repositories/restaurantRepository.ts
- [ ] T011 Implement API error and response middleware in backend/src/api/middleware/errorHandler.ts
- [ ] T012 Implement base API router and app bootstrap in backend/src/api/server.ts
- [ ] T013 Implement frontend API client base and state model in frontend/src/services/apiClient.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Encontrar restaurantes proximos no mapa (Priority: P1) MVP

**Goal**: Permitir selecionar ponto no mapa, mover/zoom e visualizar restaurantes proximos no viewport

**Independent Test**: Com mapa aberto, selecionar ponto e alterar zoom/pan deve atualizar resultados geograficos no mapa e lista

### Tests for User Story 1 (REQUIRED)

- [ ] T014 [P] [US1] Add contract test for GET /v1/restaurants/search in backend/tests/contract/search.contract.test.ts
- [ ] T015 [P] [US1] Add integration test for viewport update flow in backend/tests/integration/searchByViewport.test.ts
- [ ] T016 [P] [US1] Add frontend integration test for map interactions in frontend/tests/integration/mapViewportResults.test.ts
- [ ] T017 [P] [US1] Add unit test for viewport validator in backend/tests/unit/viewportValidator.test.ts

### Implementation for User Story 1

- [ ] T018 [US1] Implement geospatial search service in backend/src/services/restaurantSearchService.ts
- [ ] T019 [US1] Implement search endpoint handler in backend/src/api/routes/searchRoutes.ts
- [ ] T020 [US1] Implement map container with pan/zoom events in frontend/src/components/MapView.tsx
- [ ] T021 [US1] Implement nearby restaurant results panel in frontend/src/components/RestaurantResultsList.tsx
- [ ] T022 [US1] Wire viewport state to backend search requests in frontend/src/state/searchSessionStore.ts
- [ ] T023 [US1] Add loading/empty/error/success UI states for map search in frontend/src/pages/HomePage.tsx

**Checkpoint**: User Story 1 fully functional and independently testable

---

## Phase 4: User Story 2 - Buscar restaurante por nome com tolerancia a erro (Priority: P2)

**Goal**: Entregar autocomplete por nome com fuzzy ate 2 caracteres

**Independent Test**: Digitar prefixos e termos com ate 2 erros deve retornar sugestoes relevantes quando houver correspondencia

### Tests for User Story 2 (REQUIRED)

- [ ] T024 [P] [US2] Add contract test for GET /v1/restaurants/autocomplete in backend/tests/contract/autocomplete.contract.test.ts
- [ ] T025 [P] [US2] Add integration test for fuzzy autocomplete behavior in backend/tests/integration/autocompleteFuzzy.test.ts
- [ ] T026 [P] [US2] Add frontend integration test for suggestion rendering in frontend/tests/integration/autocompleteSuggestions.test.ts
- [ ] T027 [P] [US2] Add unit test for query normalization in backend/tests/unit/queryNormalization.test.ts

### Implementation for User Story 2

- [ ] T028 [US2] Implement autocomplete service with fuzzy max 2 in backend/src/services/autocompleteService.ts
- [ ] T029 [US2] Implement autocomplete endpoint handler in backend/src/api/routes/autocompleteRoutes.ts
- [ ] T030 [US2] Implement search input with suggestion dropdown in frontend/src/components/RestaurantSearchBox.tsx
- [ ] T031 [US2] Connect search input to autocomplete API with debounce in frontend/src/services/autocompleteClient.ts

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Combinar localizacao e nome para refinar resultado (Priority: P3)

**Goal**: Combinar viewport do mapa e nome selecionado para refinar resultados

**Independent Test**: Com termo ativo e interacao de mapa, resultados devem obedecer filtros textuais e geograficos simultaneamente

### Tests for User Story 3 (REQUIRED)

- [ ] T032 [P] [US3] Add integration test for combined text + geo filtering in backend/tests/integration/combinedSearch.test.ts
- [ ] T033 [P] [US3] Add frontend integration test for combined filtering UI state in frontend/tests/integration/combinedFilterFlow.test.ts
- [ ] T034 [P] [US3] Add unit test for combined query builder in backend/tests/unit/combinedQueryBuilder.test.ts

### Implementation for User Story 3

- [ ] T035 [US3] Extend search service to apply combined filters in backend/src/services/restaurantSearchService.ts
- [ ] T036 [US3] Implement selected suggestion state and synchronization in frontend/src/state/searchSessionStore.ts
- [ ] T037 [US3] Update map and list rendering for combined filters in frontend/src/pages/HomePage.tsx
- [ ] T038 [US3] Add explicit no-results messaging for combined filter cases in frontend/src/components/RestaurantResultsList.tsx

**Checkpoint**: All user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories

- [ ] T039 [P] Update OpenAPI examples and response schemas in specs/001-busca-restaurantes-sp/contracts/restaurant-search.openapi.yaml
- [ ] T040 [P] Document run and validation workflow in specs/001-busca-restaurantes-sp/quickstart.md
- [ ] T041 Add performance instrumentation logs for search endpoints in backend/src/api/middleware/performanceLogger.ts
- [ ] T042 [P] Add backend regression test suite command in backend/package.json
- [ ] T043 [P] Add frontend regression test suite command in frontend/package.json
- [ ] T044 Validate end-to-end MVP flow manually and record findings in specs/001-busca-restaurantes-sp/research.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; delivers MVP
- **Phase 4 (US2)**: Depends on Phase 2; can proceed after or in parallel with US1 by team split
- **Phase 5 (US3)**: Depends on US1 and US2 capabilities
- **Phase 6 (Polish)**: Depends on completion of targeted user stories

### User Story Dependencies

- **US1**: Independent after Foundational phase
- **US2**: Independent after Foundational phase
- **US3**: Requires US1 map flow and US2 text flow available

### Within Each User Story

- Tests MUST be written and fail before implementation
- Backend service and endpoint wiring before frontend integration finalization
- UX state handling before story completion

---

## Parallel Opportunities

- Setup: T004, T005, T006 in parallel after T001-T003
- Foundational: T008 and T009 in parallel before T010
- US1: T014-T017 in parallel; T020 and T021 in parallel after T019
- US2: T024-T027 in parallel; T030 and T031 in parallel after T029
- US3: T032-T034 in parallel; T036 and T038 in parallel after T035
- Polish: T039, T040, T042, T043 in parallel

---

## Parallel Example: User Story 1

```bash
# Run tests in parallel
Task: "T014 [US1] contract test in backend/tests/contract/search.contract.test.ts"
Task: "T015 [US1] integration test in backend/tests/integration/searchByViewport.test.ts"
Task: "T016 [US1] frontend integration test in frontend/tests/integration/mapViewportResults.test.ts"
Task: "T017 [US1] unit test in backend/tests/unit/viewportValidator.test.ts"

# Build UI components in parallel after backend route is available
Task: "T020 [US1] map component in frontend/src/components/MapView.tsx"
Task: "T021 [US1] results list in frontend/src/components/RestaurantResultsList.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete US1 (Phase 3)
3. Validate independent test for map-driven nearby search
4. Demo MVP baseline

### Incremental Delivery

1. Deliver US1 (map proximity)
2. Add US2 (name autocomplete fuzzy)
3. Add US3 (combined filtering)
4. Finish polish and performance instrumentation

### Parallel Team Strategy

1. Team A: Backend services/routes and backend tests
2. Team B: Frontend map/search UI and frontend tests
3. Team C: Contract, quickstart, and performance verification

---

## Notes

- Every task follows required checklist format with explicit file path
- Story labels are applied only to user story phases
- Suggested MVP scope: complete through Phase 3 (US1)
- Total tasks: 44
- Tasks per story: US1=10, US2=8, US3=7
