# Tasks: Backend API for Phase II Todo Application

**Input**: Design documents from `/specs/002-backend-api-spec/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included — the spec explicitly requires integration testing (Phase 9 of plan.md) and the user stories define acceptance scenarios that require test coverage.

**Organization**: Tasks are grouped into Setup, Foundational, then User Stories (by priority), then Integration Testing and Production Readiness.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` at repository root alongside `frontend/`
- Source: `backend/app/`
- Tests: `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the backend project skeleton with dependencies and configuration

- [x] T001 Create backend directory structure: `backend/`, `backend/app/`, `backend/app/routes/`, `backend/tests/`
- [x] T002 Create `backend/requirements.txt` with dependencies: fastapi, uvicorn, sqlmodel, pyjwt, asyncpg, python-dotenv, httpx, pytest, pytest-asyncio
- [x] T003 [P] Create `backend/.env.example` with BETTER_AUTH_SECRET, NEON_DB_URL, BETTER_AUTH_URL, CORS_ORIGINS documented
- [x] T004 [P] Create `backend/app/__init__.py` and `backend/app/routes/__init__.py` and `backend/tests/__init__.py` as empty init files
- [x] T005 Implement environment configuration loader in `backend/app/config.py` — load BETTER_AUTH_SECRET (required), NEON_DB_URL (required), CORS_ORIGINS (default: http://localhost:3000); fail at startup if required vars missing
- [x] T006 Create minimal FastAPI application in `backend/app/main.py` — app instance, health check at GET /health returning 200, import config on startup to validate env vars
- [x] T007 Verify setup: install dependencies, start app with uvicorn, confirm /health returns 200, confirm startup fails without required env vars

**Checkpoint**: Backend project skeleton is functional. App starts and serves /health.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database Layer

- [x] T008 Implement async database engine and session factory in `backend/app/database.py` — create async engine from NEON_DB_URL, define get_session dependency, add startup event to create tables via SQLModel.metadata.create_all
- [x] T009 Implement Task SQLModel in `backend/app/models.py` — 7 columns (id: UUID PK, user_id: String NOT NULL indexed, title: String(200) NOT NULL, description: String(2000) nullable, completed: Boolean NOT NULL default False, created_at: DateTime(tz) NOT NULL, updated_at: DateTime(tz) NOT NULL), composite index on (user_id, created_at DESC)

### Authentication Layer

- [x] T010 Implement JWT verification dependency in `backend/app/auth.py` — extract Bearer token from Authorization header, verify HS256 signature with BETTER_AUTH_SECRET, reject alg:none, check exp claim, extract sub claim as user_id, return 401 {"error": "Unauthorized"} for all failures

### Error Handling Layer

- [x] T011 [P] Implement custom exception handlers in `backend/app/exceptions.py` — handle RequestValidationError (400 with human-readable message), HTTPException (status with {"error": detail}), generic Exception (500 with {"error": "Internal server error"}), custom TaskNotFoundError (404 with {"error": "Task not found"})

### Schema Layer

- [x] T012 [P] Implement request/response Pydantic models in `backend/app/schemas.py` — TaskCreateRequest (title required max 200, description optional max 2000, title trimming, extra fields ignored), TaskUpdateRequest (optional title/description/status, at least one required, status must be "pending"/"completed"), TaskResponse (camelCase aliases: createdAt, updatedAt; status mapping: completed bool to "pending"/"completed" string; user_id excluded), ErrorResponse ({"error": "string"})

### Wire Foundation into App

- [x] T013 Register all foundational components in `backend/app/main.py` — add exception handlers from exceptions.py, configure CORS middleware (origins from CORS_ORIGINS, methods: GET/POST/PUT/PATCH/DELETE/OPTIONS, headers: Authorization/Content-Type, credentials: False), create /api router with auth dependency, include task routes
- [x] T014 Verify foundation: app starts, connects to database, tasks table created, unauthenticated /api request returns 401 {"error": "Unauthorized"}, CORS preflight returns correct headers

**Checkpoint**: Foundation ready — database connected, auth middleware active, error handling normalized, schemas defined. User story implementation can now begin.

---

## Phase 3: User Story 1 — Authenticated Task Creation (Priority: P1) MVP

**Goal**: Frontend can create tasks via POST /api/tasks with JWT auth, receiving a 201 response with the complete task object.

**Independent Test**: Send POST /api/tasks with valid JWT and title — verify 201 response with id, title, description, status="pending", createdAt, updatedAt.

### Implementation for User Story 1

- [x] T015 [US1] Implement POST /api/tasks endpoint in `backend/app/routes/tasks.py` — validate body via TaskCreateRequest, set user_id from JWT sub claim, generate UUID for id, set completed=False, set created_at/updated_at to UTC now, insert into database, return TaskResponse with status 201
- [x] T016 [US1] Verify POST /api/tasks: valid JWT + valid payload returns 201 with complete task object, missing title returns 400 "Title is required", title > 200 chars returns 400, description > 2000 chars returns 400, no JWT returns 401, body user_id field is ignored, status is always "pending", timestamps are ISO 8601 UTC

**Checkpoint**: Task creation works. Frontend can create tasks and receive structured responses.

---

## Phase 4: User Story 2 — Authenticated Task Listing (Priority: P1)

**Goal**: Frontend can list tasks via GET /api/tasks, receiving only the authenticated user's tasks ordered by creation date descending.

**Independent Test**: Create tasks for two users, call GET /api/tasks with each user's JWT — verify each sees only their own tasks.

### Implementation for User Story 2

- [x] T017 [US2] Implement GET /api/tasks endpoint in `backend/app/routes/tasks.py` — query tasks WHERE user_id = authenticated user, ORDER BY created_at DESC, return array of TaskResponse objects, return empty array [] if no tasks, status 200
- [x] T018 [US2] Verify GET /api/tasks: returns only authenticated user's tasks (cross-user isolation), returns empty array for user with no tasks, tasks ordered by created_at descending, response shape matches frontend contract (camelCase fields, status string), no JWT returns 401

**Checkpoint**: Task listing works with user isolation. Dashboard can display user's tasks.

---

## Phase 5: User Story 3 — Task Update with Ownership Enforcement (Priority: P1)

**Goal**: Frontend can update tasks via PUT /api/tasks/{id}, with partial updates and ownership enforcement.

**Independent Test**: Update a task's title and verify response, then attempt to update another user's task and verify 404.

### Implementation for User Story 3

- [x] T019 [US3] Implement PUT /api/tasks/{id} endpoint in `backend/app/routes/tasks.py` — validate body via TaskUpdateRequest, query task WHERE id AND user_id (404 if not found), apply provided fields only (title: trim and replace, description: replace or clear with null, status: map to completed boolean), set updated_at to UTC now, return updated TaskResponse with status 200
- [x] T020 [US3] Verify PUT /api/tasks/{id}: update title only returns 200 with updated task, update status "completed" maps to completed=true, update description to null clears it, other user's task returns 404, non-existent task returns 404, empty body returns 400 "At least one field must be provided", invalid status returns 400, created_at unchanged after update, updatedAt refreshed

**Checkpoint**: Task updates work with ownership enforcement and partial update support.

---

## Phase 6: User Story 4 — Task Deletion with Ownership Enforcement (Priority: P2)

**Goal**: Frontend can delete tasks via DELETE /api/tasks/{id}, with hard delete and ownership enforcement.

**Independent Test**: Delete a task and verify 204, then verify it no longer appears in GET /api/tasks.

### Implementation for User Story 4

- [x] T021 [US4] Implement DELETE /api/tasks/{id} endpoint in `backend/app/routes/tasks.py` — delete task WHERE id AND user_id, return 204 No Content if deleted, return 404 if no row deleted (not found or not owned)
- [x] T022 [US4] Verify DELETE /api/tasks/{id}: own task returns 204 with no body, deleted task no longer in GET /api/tasks list, other user's task returns 404 {"error": "Task not found"}, non-existent task returns 404, no JWT returns 401

**Checkpoint**: Task deletion works with ownership enforcement. Hard delete confirmed.

---

## Phase 7: User Story 5 — Task Completion Toggle (Priority: P2)

**Goal**: Frontend can toggle task completion via PATCH /api/tasks/{id}/complete, flipping the status.

**Independent Test**: Toggle a pending task to completed, then toggle again to pending — verify status changes each time.

### Implementation for User Story 5

- [x] T023 [US5] Implement PATCH /api/tasks/{id}/complete endpoint in `backend/app/routes/tasks.py` — query task WHERE id AND user_id (404 if not found), invert completed flag (false→true, true→false), set updated_at to UTC now, return updated TaskResponse with status 200
- [x] T024 [US5] Verify PATCH /api/tasks/{id}/complete: pending task toggles to status "completed", completed task toggles back to "pending", updatedAt refreshed on toggle, other user's task returns 404, no JWT returns 401, no request body needed

**Checkpoint**: Task completion toggle works. Frontend checkbox/toggle button can flip task status.

---

## Phase 8: User Story 6 — Task Detail Retrieval (Priority: P3)

**Goal**: Frontend can fetch a single task via GET /api/tasks/{id} for the detail page and edit form pre-population.

**Independent Test**: Retrieve a task by ID and verify all fields are present and correct.

### Implementation for User Story 6

- [x] T025 [US6] Implement GET /api/tasks/{id} endpoint in `backend/app/routes/tasks.py` — query task WHERE id AND user_id, return TaskResponse with status 200, return 404 if not found or not owned
- [x] T026 [US6] Verify GET /api/tasks/{id}: own task returns 200 with full task object, other user's task returns 404 (not 403), non-existent task returns 404, response shape matches frontend contract, no JWT returns 401

**Checkpoint**: Task detail retrieval works. Detail page and edit form can pre-populate.

---

## Phase 9: Integration Testing

**Purpose**: Comprehensive test suite verifying end-to-end behavior matches specs and frontend contract

### Test Infrastructure

- [x] T027 Create test configuration in `backend/tests/conftest.py` — test database setup (separate from production, use SQLite in-memory or test PostgreSQL), JWT token generation helpers for multiple test users, FastAPI TestClient fixture, database cleanup between tests

### Auth Tests

- [x] T028 [P] Write JWT authentication tests in `backend/tests/test_auth.py` — missing Authorization header returns 401, malformed Bearer token returns 401, invalid signature returns 401, expired token returns 401, missing sub claim returns 401, valid token allows request, 401 body is exactly {"error": "Unauthorized"}, no JWT content in logs

### CRUD Tests

- [x] T029 [P] Write task creation tests in `backend/tests/test_tasks_create.py` — valid payload returns 201 with complete task, missing title returns 400 "Title is required", empty title after trim returns 400, title at 200 chars accepted, title at 201 chars rejected, description at 2000 chars accepted, description > 2000 rejected, body user_id ignored, status always "pending" on create, timestamps are ISO 8601
- [x] T030 [P] Write task read tests in `backend/tests/test_tasks_read.py` — list returns only user's tasks (isolation test with 2 users), empty list returns [], list ordered by created_at DESC, detail returns own task, detail returns 404 for other user's task, detail returns 404 for non-existent ID
- [x] T031 [P] Write task update tests in `backend/tests/test_tasks_update.py` — update title only, update description only, update status to "completed", update status to "pending", clear description with null, empty body returns 400, invalid status returns 400, other user's task returns 404, created_at unchanged, updatedAt refreshed
- [x] T032 [P] Write task delete tests in `backend/tests/test_tasks_delete.py` — delete own task returns 204, deleted task gone from list, delete other user's task returns 404, delete non-existent returns 404
- [x] T033 [P] Write task toggle tests in `backend/tests/test_tasks_toggle.py` — toggle pending→completed, toggle completed→pending, toggle other user's task returns 404, updatedAt refreshed
- [x] T034 [P] Write validation edge case tests in `backend/tests/test_validation.py` — boundary title 200 chars (accepted), boundary title 201 chars (rejected), boundary description 2000 chars (accepted), null vs omitted description both work, extra fields silently ignored, error response shape is always {"error": "message"}

### Run All Tests

- [x] T035 Run full test suite: all tests pass, no cross-user data leakage, all error messages match spec's exact strings, all response shapes match frontend contract, no test touches production database

**Checkpoint**: All tests pass. Backend behavior verified against specs.

---

## Phase 10: Production Readiness & Polish

**Purpose**: Logging, security hardening, and final integration verification

### Logging

- [x] T036 [P] Configure structured logging in `backend/app/main.py` — INFO for request lifecycle (method, path, status, duration), WARNING for auth failures and validation errors, ERROR for database failures and unhandled exceptions, ensure JWT tokens never logged, ensure secrets never logged, ensure full request bodies never logged

### Security Hardening

- [x] T037 [P] Verify security invariants: no 403 responses anywhere (only 404 for foreign tasks), no stack traces in any error response, no DB info in any error response, alg:none tokens rejected, CORS restricted to configured origins, all /api/* routes require auth, health check outside /api/ prefix

### Integration Readiness

- [x] T038 Run integration readiness checklist: all 6 endpoints match frontend contract shapes, camelCase field names in responses, status is "pending"/"completed" string, error responses are {"error": "message"}, POST returns 201, DELETE returns 204 with no body, empty list returns 200 with [], timestamps are ISO 8601, CORS allows frontend origin, BETTER_AUTH_SECRET matches frontend value

### Final Validation

- [x] T039 End-to-end validation: start backend on port 8000, start frontend on port 3000, sign in on frontend, create a task from frontend UI, verify task appears in dashboard, edit task, toggle completion, delete task, verify all operations succeed through the full stack

**Checkpoint**: Backend is production-ready, fully tested, and verified compatible with the frontend.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Phase 2 completion
  - US1 (P1): No story dependencies — can start after Phase 2
  - US2 (P1): No story dependencies — can run parallel with US1
  - US3 (P1): No story dependencies — can run parallel with US1/US2
  - US4 (P2): No story dependencies — can run parallel
  - US5 (P2): No story dependencies — can run parallel
  - US6 (P3): No story dependencies — can run parallel
  - **Note**: All user stories share `backend/app/routes/tasks.py` so parallel work requires care; sequential execution within the same file is safer
- **Integration Testing (Phase 9)**: Depends on ALL user story phases
- **Production Readiness (Phase 10)**: Depends on Phase 9

### User Story Dependencies

- **US1 (Task Creation)**: Independent — foundational for having data to test
- **US2 (Task Listing)**: Independent — but more useful after US1 creates tasks
- **US3 (Task Update)**: Independent — needs tasks to exist (US1 recommended first)
- **US4 (Task Deletion)**: Independent — needs tasks to exist
- **US5 (Task Toggle)**: Independent — needs tasks to exist
- **US6 (Task Detail)**: Independent — needs tasks to exist

### Within Each User Story

1. Implement endpoint in routes/tasks.py
2. Verify behavior against acceptance criteria

### Parallel Opportunities

- Phase 1: T003 and T004 can run in parallel
- Phase 2: T011 and T012 can run in parallel (different files)
- Phase 9: All test files (T028-T034) can be written in parallel
- Phase 10: T036 and T037 can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Sequential (dependencies):
T008 database.py → T009 models.py → T013 main.py wiring

# Parallel (different files, no deps):
T010 auth.py  |  T011 exceptions.py  |  T012 schemas.py
```

## Parallel Example: Phase 9 (Integration Testing)

```bash
# After T027 conftest.py is done, all test files in parallel:
T028 test_auth.py | T029 test_tasks_create.py | T030 test_tasks_read.py
T031 test_tasks_update.py | T032 test_tasks_delete.py | T033 test_tasks_toggle.py
T034 test_validation.py
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T014)
3. Complete Phase 3: User Story 1 — Task Creation (T015-T016)
4. **STOP and VALIDATE**: POST /api/tasks works with auth, validation, and ownership
5. This alone proves the full stack works: auth → validation → DB → response

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Task Creation) → Test → Deploy (MVP!)
3. Add US2 (Task Listing) → Test → Deploy (Dashboard works)
4. Add US3 (Task Update) → Test → Deploy (Edit works)
5. Add US4 (Task Deletion) → Test → Deploy (Delete works)
6. Add US5 (Task Toggle) → Test → Deploy (Quick toggle works)
7. Add US6 (Task Detail) → Test → Deploy (Detail page works)
8. Integration Tests → Production Readiness → Ship

### Suggested Execution Order (Single Developer)

T001 → T002 → T003/T004 → T005 → T006 → T007 (verify) →
T008 → T009 → T010/T011/T012 (parallel) → T013 → T014 (verify) →
T015 → T016 (verify US1) →
T017 → T018 (verify US2) →
T019 → T020 (verify US3) →
T021 → T022 (verify US4) →
T023 → T024 (verify US5) →
T025 → T026 (verify US6) →
T027 → T028-T034 (parallel tests) → T035 (run all) →
T036/T037 (parallel) → T038 → T039 (final validation)

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Setup | T001-T007 | Project skeleton, deps, config, health check |
| Phase 2: Foundational | T008-T014 | Database, auth, errors, schemas, wiring |
| Phase 3: US1 (P1) | T015-T016 | POST /api/tasks — task creation |
| Phase 4: US2 (P1) | T017-T018 | GET /api/tasks — task listing |
| Phase 5: US3 (P1) | T019-T020 | PUT /api/tasks/{id} — task update |
| Phase 6: US4 (P2) | T021-T022 | DELETE /api/tasks/{id} — task deletion |
| Phase 7: US5 (P2) | T023-T024 | PATCH /api/tasks/{id}/complete — toggle |
| Phase 8: US6 (P3) | T025-T026 | GET /api/tasks/{id} — task detail |
| Phase 9: Testing | T027-T035 | Full integration test suite |
| Phase 10: Polish | T036-T039 | Logging, security, integration readiness |
| **Total** | **39 tasks** | |

---

## Notes

- [P] tasks = different files, no dependencies on each other
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and verifiable
- All tasks reference exact file paths per plan.md structure
- Verification tasks (even-numbered in story phases) include specific acceptance criteria
- Error messages must match exact strings from contracts/api-tasks-backend.md
- Commit after each task or logical group
- Stop at any checkpoint to validate independently

## Constitution Compliance

This task list adheres to `.specify/memory/constitution.md` v1.0.0:

- Spec-Driven Development: Tasks map directly to approved plan phases
- Separation of Responsibilities: Backend Engineer scope; no frontend tasks
- No Manual Coding: All implementation via Claude Code
- Workflow Enforcement: Specs → Plan → Tasks (this step) → Implementation
