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

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and baseline tooling

- [x] T001 Create backend and frontend directory skeletons in backend/src and frontend/src
- [x] T002 Initialize backend project configuration in backend/package.json
- [x] T003 Initialize frontend project configuration in frontend/package.json
- [x] T004 [P] Configure lint and format rules in backend/eslint.config.js and frontend/eslint.config.js
- [x] T005 [P] Create shared environment templates in backend/.env.example and frontend/.env.example
- [x] T006 [P] Define baseline run scripts in backend/package.json and frontend/package.json

**Checkpoint**: Project structure ready

---

## Phase 1b: Seed Data

**Purpose**: Popular o banco com 1.000 restaurantes antes de qualquer teste de integracao

**CRITICAL**: Deve ser executada antes da Phase 2 e de qualquer teste de integracao

- [x] T007A [P] Create .env.example with MONGODB_URI placeholder in seed/.env.example
- [x] T007B Create LLM-based restaurant generation script in seed/generate.js
- [x] T007C Create MongoDB ingestion script in seed/ingest.js
- [x] T007D Create Atlas Search index creation script in seed/createIndex.js
- [x] T007E Wire all seed steps into npm run seed command in backend/package.json

**Checkpoint**: Colecao `restaurants` com >= 1.000 documentos validos e indice Atlas Search criado

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create MongoDB connection and health check module in backend/src/config/mongodb.ts
- [x] T009 [P] Implement shared Restaurant and query DTO types in backend/src/models/restaurant.ts
- [x] T010 [P] Implement viewport and query validation schemas in backend/src/validation/search.ts
- [x] T011 Implement repository for geospatial and text lookups in backend/src/repositories/restaurantRepository.ts
- [x] T012 Implement API error and response middleware in backend/src/api/middleware/errorHandler.ts
- [x] T013 Implement base API router and app bootstrap in backend/src/api/server.ts
- [x] T014 Implement frontend API client base and state model in frontend/src/services/apiClient.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Encontrar restaurantes proximos no mapa (Priority: P1) MVP

**Goal**: Permitir selecionar ponto no mapa, mover/zoom e visualizar restaurantes proximos no viewport

**Independent Test**: Com mapa aberto, selecionar ponto e alterar zoom/pan deve atualizar resultados geograficos no mapa e lista

### Tests for User Story 1 (REQUIRED)

- [x] T015 [P] [US1] Add contract test for GET /v1/restaurants/search in backend/tests/contract/search.contract.test.ts
- [x] T016 [P] [US1] Add integration test for viewport update flow in backend/tests/integration/searchByViewport.test.ts
- [x] T017 [P] [US1] Add frontend integration test for map interactions in frontend/tests/integration/mapViewportResults.test.ts
- [x] T018 [P] [US1] Add unit test for viewport validator in backend/tests/unit/viewportValidator.test.ts

### Implementation for User Story 1

- [x] T019 [US1] Implement geospatial search service in backend/src/services/restaurantSearchService.ts
- [x] T020 [US1] Implement search endpoint handler in backend/src/api/routes/searchRoutes.ts
- [x] T021 [US1] Implement map container with pan/zoom events in frontend/src/components/MapView.tsx
- [x] T022 [US1] Implement nearby restaurant results panel in frontend/src/components/RestaurantResultsList.tsx
- [x] T023 [US1] Wire viewport state to backend search requests in frontend/src/state/searchSessionStore.ts
- [x] T024 [US1] Add loading/empty/error/success UI states for map search in frontend/src/pages/HomePage.tsx

**Checkpoint**: User Story 1 fully functional and independently testable

---

## Phase 4: User Story 2 - Buscar restaurante por nome com tolerancia a erro (Priority: P2)

**Goal**: Entregar autocomplete por nome com fuzzy ate 2 caracteres

**Independent Test**: Digitar prefixos e termos com ate 2 erros deve retornar sugestoes relevantes quando houver correspondencia

### Tests for User Story 2 (REQUIRED)

- [x] T025 [P] [US2] Add contract test for GET /v1/restaurants/autocomplete in backend/tests/contract/autocomplete.contract.test.ts
- [x] T026 [P] [US2] Add integration test for fuzzy autocomplete behavior in backend/tests/integration/autocompleteFuzzy.test.ts
- [x] T027 [P] [US2] Add frontend integration test for suggestion rendering in frontend/tests/integration/autocompleteSuggestions.test.ts
- [x] T028 [P] [US2] Add unit test for query normalization in backend/tests/unit/queryNormalization.test.ts

### Implementation for User Story 2

- [x] T029 [US2] Implement autocomplete service with fuzzy max 2 in backend/src/services/autocompleteService.ts
- [x] T030 [US2] Implement autocomplete endpoint handler in backend/src/api/routes/autocompleteRoutes.ts
- [x] T031 [US2] Implement search input with suggestion dropdown in frontend/src/components/RestaurantSearchBox.tsx
- [x] T032 [US2] Connect search input to autocomplete API with debounce in frontend/src/services/autocompleteClient.ts

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Combinar localizacao e nome para refinar resultado (Priority: P3)

**Goal**: Combinar viewport do mapa e nome selecionado para refinar resultados

**Independent Test**: Com termo ativo e interacao de mapa, resultados devem obedecer filtros textuais e geograficos simultaneamente

### Tests for User Story 3 (REQUIRED)

- [x] T033 [P] [US3] Add integration test for combined text + geo filtering in backend/tests/integration/combinedSearch.test.ts
- [x] T034 [P] [US3] Add frontend integration test for combined filtering UI state in frontend/tests/integration/combinedFilterFlow.test.ts
- [x] T035 [P] [US3] Add unit test for combined query builder in backend/tests/unit/combinedQueryBuilder.test.ts

### Implementation for User Story 3

- [x] T036 [US3] Extend search service to apply combined filters in backend/src/services/restaurantSearchService.ts
- [x] T037 [US3] Implement selected suggestion state and synchronization in frontend/src/state/searchSessionStore.ts
- [x] T038 [US3] Update map and list rendering for combined filters in frontend/src/pages/HomePage.tsx
- [x] T039 [US3] Add explicit no-results messaging for combined filter cases in frontend/src/components/RestaurantResultsList.tsx

**Checkpoint**: User Stories 1, 2 and 3 are independently functional

---

## Phase 5b: User Story 4 - Filtrar por culinaria e preco (Priority: P2)

**Goal**: Permitir filtrar restaurantes por cuisine e priceRange, demonstrando facets e filtros compostos do Atlas Search

**Independent Test**: Selecionar filtro de cuisine ou priceRange deve retornar apenas restaurantes correspondentes, combinando com viewport e texto ativos

### Tests for User Story 4 (REQUIRED)

- [x] T040 [P] [US4] Add contract test for cuisine and priceRange filter params in backend/tests/contract/searchFilters.contract.test.ts
- [x] T041 [P] [US4] Add integration test for cuisine + priceRange filtering in backend/tests/integration/searchFilters.test.ts
- [x] T042 [P] [US4] Add frontend integration test for filter UI state in frontend/tests/integration/filterControls.test.ts
- [x] T043 [P] [US4] Add unit test for filter query builder in backend/tests/unit/filterQueryBuilder.test.ts

### Implementation for User Story 4

- [x] T044 [US4] Extend search service to apply cuisine and priceRange filters in backend/src/services/restaurantSearchService.ts
- [x] T045 [US4] Extend search endpoint to accept cuisine and priceRange params in backend/src/api/routes/searchRoutes.ts
- [x] T046 [US4] Implement filter controls UI component in frontend/src/components/SearchFilters.tsx
- [x] T047 [US4] Wire filter state to search session store in frontend/src/state/searchSessionStore.ts
- [x] T048 [US4] Display rating and neighborhood in restaurant cards in frontend/src/components/RestaurantResultsList.tsx

**Checkpoint**: Filtros compostos funcionais e integrados ao fluxo principal

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple stories

- [x] T049 [P] Update OpenAPI examples and response schemas in specs/001-busca-restaurantes-sp/contracts/restaurant-search.openapi.yaml
- [x] T050 [P] Document run and validation workflow in specs/001-busca-restaurantes-sp/quickstart.md
- [x] T051 Add performance instrumentation logs for search endpoints in backend/src/api/middleware/performanceLogger.ts
- [x] T052 [P] Add backend regression test suite command in backend/package.json
- [x] T053 [P] Add frontend regression test suite command in frontend/package.json
- [x] T054 Validate end-to-end MVP flow manually and record findings in specs/001-busca-restaurantes-sp/research.md

---

## Post-Implementation Bug Fixes & UI Polish

> Registrados após o build inicial para rastreabilidade. Não alteram requisitos funcionais.

### BF-001 — ts-node-dev não resolvia imports `.js` em CommonJS
- **Arquivo**: `backend/src/**/*.ts` (todas as importações relativas)
- **Causa**: ts-node-dev com `module: commonjs` não consegue resolver extensões `.js` em tempo de execução
- **Correção**: Removidas extensões `.js` de todos os imports relativos internos do backend; adicionado `moduleNameMapper` no `backend/jest.config.js` para manter compatibilidade com ts-jest

### BF-002 — Leaflet `whenReady` enviava bounds inválidos (400 no backend)
- **Arquivo**: `frontend/src/components/MapView.tsx`
- **Causa**: O callback `whenReady` do `MapContainer` disparava antes do Leaflet calcular as dimensões reais do mapa, resultando em `neLat === swLat` — rejeitado pelo refinamento Zod `neLat must be greater than swLat`
- **Correção**: Removido `whenReady`; emissão do viewport inicial movida para `useEffect` dentro de `ViewportListener` (componente filho com acesso ao mapa via `useMapEvents`); adicionada guarda `if (neLat <= swLat) return`

### BF-003 — Mapa não renderizava (altura colapsada)
- **Arquivo**: `frontend/src/index.css`
- **Causa**: Classes CSS do layout (`.home-page`, `.app-main`, `.map-area`) não estavam definidas; `MapContainer` com `height: 100%` colapsava para 0
- **Correção**: Adicionadas regras CSS com `flex: 1` e `min-height: 0` em toda a cadeia de ancestrais até o `MapContainer`

### UI-001 — Reformulação visual da interface
- **Arquivos**: `frontend/src/index.css`, `frontend/src/pages/HomePage.tsx`, `frontend/src/components/SearchFilters.tsx`, `frontend/src/components/RestaurantResultsList.tsx`
- **Mudanças**:
  - Header escuro (`#001E2B`) com search box, filtro de culinária e botões de preço na mesma linha
  - Design tokens CSS (cores, sombras, raios)
  - Cards de resultado com rating alinhado à direita, badges de bairro e culinária, hierarquia tipográfica
  - Estados idle/empty/error com ícones centralizados

### BF-004 — Dropdown de autocomplete aparecia atrás do mapa Leaflet
- **Arquivo**: `frontend/src/index.css`
- **Causa**: `.app-header` não tinha `position` declarado, tornando `z-index` ineficaz; o Leaflet cria stacking context próprio com z-index até ~1000
- **Correção**: Adicionado `position: relative` e `z-index: 1000` ao `.app-header`; `overflow: visible` para o dropdown não ser cortado

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 1b (Seed)**: Depends on Phase 1; blocks integration tests in all user stories
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2 and Phase 1b; delivers MVP baseline
- **Phase 4 (US2)**: Depends on Phase 2; can proceed in parallel with US1
- **Phase 5 (US3)**: Depends on US1 and US2 capabilities
- **Phase 5b (US4)**: Depends on Phase 3 (US1) search service and endpoint
- **Phase 6 (Polish)**: Depends on completion of all user stories

### User Story Dependencies

- **US1**: Independent after Foundational phase
- **US2**: Independent after Foundational phase
- **US3**: Requires US1 map flow and US2 text flow available
- **US4**: Requires US1 search service and endpoint available

### Within Each User Story

- Tests MUST be written and fail before implementation
- Backend service and endpoint wiring before frontend integration finalization
- UX state handling before story completion

---

## Parallel Opportunities

- Setup: T004, T005, T006 in parallel after T001-T003
- Seed: T007A in parallel with T007B; T007C and T007D after T007B
- Foundational: T009 and T010 in parallel before T011
- US1: T015-T018 in parallel; T021 and T022 in parallel after T020
- US2: T025-T028 in parallel; T031 and T032 in parallel after T030
- US3: T033-T035 in parallel; T037 and T039 in parallel after T036
- US4: T040-T043 in parallel; T046 and T047 in parallel after T045
- Polish: T049, T050, T052, T053 in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 1b (seed)
2. Complete Phase 2 (foundational)
3. Complete US1 (Phase 3)
4. Validate independent test for map-driven nearby search
5. Demo MVP baseline

### Incremental Delivery

1. Deliver US1 (map proximity)
2. Add US2 (name autocomplete fuzzy)
3. Add US3 (combined filtering)
4. Add US4 (cuisine and priceRange filters)
5. Finish polish and performance instrumentation

### Parallel Team Strategy

1. Team A: Backend services/routes and backend tests
2. Team B: Frontend map/search UI and frontend tests
3. Team C: Seed data pipeline, contract, quickstart, and performance verification

---

## Notes

- Every task follows required checklist format with explicit file path
- Story labels are applied only to user story phases
- Suggested MVP scope: complete through Phase 3 (US1)
- Total tasks: 54
- Tasks per story: US1=10, US2=8, US3=7, US4=9, Seed=5, Polish=6