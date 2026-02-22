# Implementation Plan: Backend API for Phase II Todo Application

**Branch**: `002-backend-api-spec` | **Date**: 2026-02-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-backend-api-spec/spec.md`

## Summary

Build a stateless FastAPI backend that verifies Better Auth JWTs,
enforces per-user data isolation, and provides a REST API for task
CRUD operations. The backend connects to Neon PostgreSQL via SQLModel
and produces API responses matching the frontend's approved contract.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLModel, PyJWT, asyncpg, uvicorn
**Storage**: Neon Serverless PostgreSQL (via NEON_DB_URL)
**Testing**: pytest + httpx TestClient
**Target Platform**: Linux/Windows server (ASGI via uvicorn)
**Project Type**: Web application (backend component)
**Performance Goals**: <500ms per request under normal single-user load (SC-001)
**Constraints**: Stateless, no server-side sessions, no in-memory user state
**Scale/Scope**: Small scale (hackathon), low hundreds of tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate (Pass)

| Principle                          | Status | Evidence                                    |
|------------------------------------|--------|---------------------------------------------|
| Spec-Driven Development            | PASS   | Full spec exists at spec.md with 18 FRs     |
| Separation of Responsibilities     | PASS   | Architecture Planner scope; no code written  |
| No Manual Coding                   | PASS   | All implementation via Claude Code           |
| Security: Frontend untrusted       | PASS   | Trust boundaries defined in architecture.md  |
| Security: JWT on every request     | PASS   | Authentication middleware spec complete      |
| Security: Identity from JWT only   | PASS   | authentication.md explicitly forbids body ID |
| Security: All queries filtered     | PASS   | task-crud.md mandates WHERE user_id filter   |
| API: RESTful, stateless, Bearer    | PASS   | rest-endpoints.md defines all 6 endpoints    |
| Data: Single-user ownership        | PASS   | schema.md defines user_id on tasks           |
| Workflow: Specs before plan        | PASS   | All 5 specs completed before this plan       |

### Post-Design Gate (Pass)

| Principle                          | Status | Evidence                                    |
|------------------------------------|--------|---------------------------------------------|
| No spec modification               | PASS   | Plan implements specs as-is                  |
| No invented endpoints              | PASS   | Only 6 spec'd endpoints implemented         |
| No invented schemas                | PASS   | Schema matches schema.md exactly             |
| No frontend logic leakage          | PASS   | Backend has no knowledge of UI components    |
| Smallest viable change             | PASS   | Minimal structure; no over-engineering       |

## Project Structure

### Documentation (this feature)

```text
specs/002-backend-api-spec/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (dev setup guide)
├── contracts/
│   └── api-tasks-backend.md  # Phase 1 output (backend contract)
├── checklists/
│   └── requirements.md  # Spec quality validation
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created here)
```

### Source Code (repository root)

```text
backend/
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Template for environment variables
├── requirements.txt        # Python dependencies
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app, middleware, CORS, startup
│   ├── config.py           # Environment variable loading + validation
│   ├── database.py         # SQLModel engine, session factory
│   ├── models.py           # Task SQLModel (database entity)
│   ├── schemas.py          # Pydantic request/response models
│   ├── auth.py             # JWT verification dependency
│   ├── exceptions.py       # Custom exception handlers
│   └── routes/
│       ├── __init__.py
│       └── tasks.py        # Task CRUD endpoint handlers
└── tests/
    ├── __init__.py
    ├── conftest.py          # Test fixtures (DB, client, JWT helpers)
    ├── test_auth.py         # JWT verification tests
    ├── test_tasks_create.py # POST /api/tasks tests
    ├── test_tasks_read.py   # GET /api/tasks, GET /api/tasks/{id}
    ├── test_tasks_update.py # PUT /api/tasks/{id} tests
    ├── test_tasks_delete.py # DELETE /api/tasks/{id} tests
    ├── test_tasks_toggle.py # PATCH /api/tasks/{id}/complete tests
    └── test_validation.py   # Input validation edge cases
```

**Structure Decision**: Web application layout with backend/ at repo
root alongside existing frontend/. Clear separation: `app/` for
source, `tests/` for tests, flat module structure (no nested packages
beyond routes/).

---

## Implementation Phases

### Phase 1: Project & Runtime Setup

**Purpose**: Establish the backend project skeleton with all
dependencies, configuration loading, and application entry point.

**What is implemented**:
- `backend/` directory structure
- `requirements.txt` with all dependencies
- `backend/.env.example` with required variables documented
- `app/config.py` — loads and validates environment variables;
  application fails to start if BETTER_AUTH_SECRET or NEON_DB_URL
  is missing
- `app/main.py` — minimal FastAPI application that starts and
  responds to a health check at `/health`

**Dependencies**: None (first phase).

**Validation before moving on**:
- [ ] `pip install -r requirements.txt` succeeds
- [ ] Application starts with `uvicorn app.main:app`
- [ ] `/health` returns 200 OK
- [ ] Application fails to start without required env vars
- [ ] No secrets in committed files

---

### Phase 2: Database Connection & Schema

**Purpose**: Establish database connectivity and create the tasks
table matching `specs/database/schema.md`.

**What is implemented**:
- `app/database.py` — async SQLModel engine from NEON_DB_URL,
  session factory, startup event to create tables
- `app/models.py` — Task SQLModel with all 7 columns, constraints,
  and indexes matching schema.md exactly:
  - `id`: UUID, primary key, server-generated
  - `user_id`: String, NOT NULL, indexed
  - `title`: String(200), NOT NULL
  - `description`: String(2000), nullable
  - `completed`: Boolean, NOT NULL, default False
  - `created_at`: DateTime(timezone=True), NOT NULL
  - `updated_at`: DateTime(timezone=True), NOT NULL
  - Index: `ix_tasks_user_id` on user_id
  - Index: `ix_tasks_user_id_created_at` on (user_id, created_at DESC)

**Dependencies**: Phase 1 (config.py provides NEON_DB_URL).

**Validation before moving on**:
- [ ] Application connects to Neon PostgreSQL on startup
- [ ] `tasks` table is created with correct schema
- [ ] All columns have correct types and constraints
- [ ] Indexes are created
- [ ] Application handles database unavailability gracefully

---

### Phase 3: JWT Authentication Middleware

**Purpose**: Implement the JWT verification layer that protects all
`/api/*` endpoints, following `specs/features/authentication.md`.

**What is implemented**:
- `app/auth.py` — FastAPI dependency that:
  1. Extracts `Authorization: Bearer <token>` header
  2. Verifies JWT signature with BETTER_AUTH_SECRET (HS256 only)
  3. Rejects unsigned tokens (alg: "none")
  4. Checks `exp` claim (rejects expired)
  5. Extracts `sub` claim as user_id
  6. Returns user_id as a verified string
  7. Returns 401 `{"error": "Unauthorized"}` for all failures
- Middleware is applied globally to the `/api` router
- No `/api/*` endpoint can bypass authentication

**Dependencies**: Phase 1 (config.py provides BETTER_AUTH_SECRET).

**Validation before moving on**:
- [ ] Request without Authorization header returns 401
- [ ] Request with "Bearer " (empty token) returns 401
- [ ] Request with invalid signature returns 401
- [ ] Request with expired token returns 401
- [ ] Request with valid token returns 200 (health or test endpoint)
- [ ] User ID extracted correctly from `sub` claim
- [ ] 401 response body is exactly `{"error": "Unauthorized"}`
- [ ] No JWT content is logged

---

### Phase 4: Error Handling & Response Normalization

**Purpose**: Ensure all error responses match the spec's
`{"error": "message"}` format, overriding FastAPI/Pydantic defaults.

**What is implemented**:
- `app/exceptions.py` — custom exception handlers:
  - `RequestValidationError` → 400 with human-readable message
  - `HTTPException` → appropriate status with `{"error": detail}`
  - Generic `Exception` → 500 with `{"error": "Internal server error"}`
- Custom `TaskNotFoundError` exception → 404 `{"error": "Task not found"}`
- All handlers produce `{"error": "message"}` consistently
- No stack traces, internal details, or database info in responses

**Dependencies**: Phase 1 (main.py registers handlers).

**Validation before moving on**:
- [ ] Validation error returns `{"error": "..."}` (not Pydantic detail)
- [ ] 404 returns `{"error": "Task not found"}`
- [ ] 500 returns `{"error": "Internal server error"}`
- [ ] No raw exception details exposed
- [ ] Error messages match spec's exact strings

---

### Phase 5: Request/Response Schemas

**Purpose**: Define Pydantic models for API input validation and
response serialization, matching the approved API contract.

**What is implemented**:
- `app/schemas.py`:
  - `TaskCreateRequest` — validates title (required, max 200),
    description (optional, max 2000); ignores extra fields
  - `TaskUpdateRequest` — validates optional title, description,
    status; requires at least one field
  - `TaskResponse` — maps DB fields to camelCase API fields;
    maps `completed` boolean to "pending"/"completed" string
  - `ErrorResponse` — `{"error": "string"}` shape
- Title trimming applied in validators
- camelCase aliases for API fields (createdAt, updatedAt)

**Dependencies**: Phase 2 (models.py for entity alignment).

**Validation before moving on**:
- [ ] TaskCreateRequest rejects empty/missing title
- [ ] TaskCreateRequest rejects title > 200 chars
- [ ] TaskCreateRequest rejects description > 2000 chars
- [ ] TaskUpdateRequest rejects empty body
- [ ] TaskUpdateRequest rejects invalid status values
- [ ] TaskResponse produces camelCase field names
- [ ] TaskResponse maps completed boolean to status string
- [ ] Extra fields in request body are silently ignored

---

### Phase 6: Task CRUD Endpoints

**Purpose**: Implement all 6 task endpoints following
`specs/api/rest-endpoints.md` and `specs/features/task-crud.md`.

**What is implemented**:
- `app/routes/tasks.py` — FastAPI APIRouter with:

  **GET /api/tasks** (list):
  - Queries tasks WHERE user_id = authenticated user
  - Orders by created_at DESC
  - Returns array (empty array if none)
  - Status 200

  **POST /api/tasks** (create):
  - Validates body via TaskCreateRequest
  - Sets user_id from JWT, generates UUID, sets defaults
  - Inserts into database
  - Returns created task, status 201

  **GET /api/tasks/{id}** (detail):
  - Queries WHERE id AND user_id
  - Returns task or 404
  - Status 200

  **PUT /api/tasks/{id}** (update):
  - Validates body via TaskUpdateRequest
  - Queries WHERE id AND user_id (404 if not found)
  - Applies provided fields only
  - Refreshes updated_at
  - Returns updated task, status 200

  **DELETE /api/tasks/{id}** (delete):
  - Deletes WHERE id AND user_id
  - 404 if no row deleted
  - Returns 204 No Content

  **PATCH /api/tasks/{id}/complete** (toggle):
  - Queries WHERE id AND user_id (404 if not found)
  - Inverts completed flag
  - Refreshes updated_at
  - Returns updated task, status 200

**Dependencies**: Phase 2 (database), Phase 3 (auth), Phase 4
(error handling), Phase 5 (schemas).

**Validation before moving on**:
- [ ] All 6 endpoints return correct status codes
- [ ] All response shapes match the frontend contract
- [ ] Ownership enforcement verified (cross-user returns 404)
- [ ] Timestamps are server-generated ISO 8601 UTC
- [ ] created_at never changes on update
- [ ] updated_at changes on every modification
- [ ] Status mapping (bool ↔ string) works correctly
- [ ] Empty task list returns 200 with []
- [ ] DELETE returns 204 with no body

---

### Phase 7: CORS Configuration

**Purpose**: Configure CORS to allow the frontend to make API
requests, following `specs/architecture.md`.

**What is implemented**:
- CORS middleware on the FastAPI app:
  - Allowed origins: from CORS_ORIGINS environment variable
    (default: `http://localhost:3000`)
  - Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  - Allowed headers: Authorization, Content-Type
  - Credentials: False (JWT via header, not cookies)

**Dependencies**: Phase 1 (main.py).

**Validation before moving on**:
- [ ] OPTIONS preflight returns correct CORS headers
- [ ] Frontend origin is allowed
- [ ] Non-allowed origins are rejected
- [ ] Authorization header is in allowed headers list

---

### Phase 8: Logging & Observability

**Purpose**: Add structured logging for request lifecycle, auth
failures, and errors, following `specs/architecture.md` logging scope.

**What is implemented**:
- Python `logging` module configuration:
  - INFO: Request method, path, status code, response time
  - WARNING: Auth failures (without token content), validation errors
  - ERROR: Database failures, unhandled exceptions
- Sensitive data exclusion:
  - JWT tokens never logged
  - BETTER_AUTH_SECRET never logged
  - Full request bodies never logged
  - NEON_DB_URL never logged

**Dependencies**: Phase 1 (main.py).

**Validation before moving on**:
- [ ] Request lifecycle is logged (method, path, status, duration)
- [ ] Auth failures produce WARNING logs
- [ ] Database errors produce ERROR logs
- [ ] No JWT tokens appear in logs
- [ ] No secrets appear in logs

---

### Phase 9: Integration Testing

**Purpose**: Verify end-to-end behavior matches specs and frontend
contract. This is the final validation phase before integration.

**What is implemented**:
- `tests/conftest.py`:
  - Test database setup (separate from production)
  - JWT token generation helper (for test users)
  - FastAPI TestClient fixture
  - Multiple test user fixtures
- `tests/test_auth.py`:
  - Missing token → 401
  - Invalid token → 401
  - Expired token → 401
  - Valid token → user_id extracted
- `tests/test_tasks_create.py`:
  - Create with valid payload → 201
  - Create with missing title → 400
  - Create with long title → 400
  - Create assigns user_id from JWT
  - Create ignores body user_id
- `tests/test_tasks_read.py`:
  - List returns only user's tasks
  - List returns empty array for no tasks
  - List orders by created_at DESC
  - Detail returns 404 for other user's task
- `tests/test_tasks_update.py`:
  - Update title only
  - Update status mapping
  - Update returns 404 for other user's task
  - Empty body returns 400
- `tests/test_tasks_delete.py`:
  - Delete returns 204
  - Delete returns 404 for other user's task
  - Deleted task no longer in list
- `tests/test_tasks_toggle.py`:
  - Toggle pending → completed
  - Toggle completed → pending
  - Toggle returns 404 for other user's task
- `tests/test_validation.py`:
  - Boundary: title at exactly 200 chars (accepted)
  - Boundary: title at 201 chars (rejected)
  - Boundary: description at 2000 chars (accepted)
  - Null vs omitted description
  - Extra fields silently ignored

**Dependencies**: All previous phases.

**Validation before moving on**:
- [ ] All test suites pass
- [ ] Cross-user isolation verified
- [ ] All error messages match spec
- [ ] Response shapes match frontend contract
- [ ] No test touches production database

---

## Authentication & Authorization Plan

### Token Lifecycle (Backend Perspective)

1. **Frontend issues token**: Better Auth on the frontend authenticates
   the user and creates a JWT signed with BETTER_AUTH_SECRET (HS256).
2. **Frontend sends token**: The API client attaches the JWT as
   `Authorization: Bearer <token>` on every request.
3. **Backend verifies token**: The auth dependency decodes the JWT,
   verifies the HS256 signature, checks expiration, extracts `sub`.
4. **Backend uses identity**: The verified user_id is passed to the
   endpoint handler and used in all database queries.
5. **Token expires**: After ~1 hour, the token expires. The backend
   returns 401. The frontend handles refresh or re-authentication.

### Protected Routes

- ALL routes under `/api/*` are protected.
- The auth dependency is applied at the router level, not per-endpoint.
- No `/api/*` endpoint can be accessed without a valid JWT.
- Health check (`/health`) is OUTSIDE `/api/` and is public.

### Middleware Flow

```
Request
  ↓
Extract Authorization header
  ↓ (missing?) → 401
Parse "Bearer <token>"
  ↓ (malformed?) → 401
Decode JWT with HS256 + BETTER_AUTH_SECRET
  ↓ (bad signature?) → 401
Check exp claim
  ↓ (expired?) → 401
Extract sub claim
  ↓ (missing?) → 401
Pass user_id to endpoint handler
  ↓
Endpoint executes with verified identity
```

### Failure Scenarios

| Scenario                    | HTTP Status | Response                         | DB Query |
|-----------------------------|-------------|----------------------------------|----------|
| No Authorization header     | 401         | {"error": "Unauthorized"}        | None     |
| Malformed Bearer token      | 401         | {"error": "Unauthorized"}        | None     |
| Invalid JWT signature       | 401         | {"error": "Unauthorized"}        | None     |
| Expired JWT                 | 401         | {"error": "Unauthorized"}        | None     |
| Missing sub claim           | 401         | {"error": "Unauthorized"}        | None     |
| Valid JWT, foreign task      | 404         | {"error": "Task not found"}      | Yes      |

---

## Database Execution Plan

### Schema Creation Order

1. **Create `tasks` table** — single table, no foreign keys, no
   dependencies. This is the only table in Phase II.

Order matters because:
- In Phase II there is only one table, so order is trivial.
- If future phases add tables with foreign keys, they must be created
  after the referenced table.

### Migration Strategy

- **Phase II**: Schema created at application startup via
  `SQLModel.metadata.create_all()`. No migration tool.
- **Why**: Single table, no existing data, hackathon context.
  Migration tooling (Alembic) is not justified for Phase II.
- **Future**: If the schema evolves, Alembic migrations should be
  introduced before any schema change to a production database.

### Indexing Strategy

Created at table creation time:

1. **pk_tasks** (id) — automatic with primary key.
2. **ix_tasks_user_id** (user_id) — critical for ownership filtering.
   Without this, every query scans the full table.
3. **ix_tasks_user_id_created_at** (user_id, created_at DESC) —
   optimizes the most common query (list user's tasks sorted by date).
   A composite index serves both WHERE and ORDER BY in one scan.

### Referential Integrity

- No foreign key on `user_id` — the backend has no `users` table.
  Integrity is enforced by the JWT verification layer: only verified
  user IDs reach the database.
- Primary key on `id` — prevents duplicate task IDs.
- NOT NULL constraints — prevent orphaned or incomplete records.

### Deletion Behavior

- **Hard delete** — DELETE removes the row permanently.
- No soft delete column. No `deleted_at` timestamp.
- This is specified in `specs/database/schema.md` and
  `specs/features/task-crud.md`.

### Transaction Boundaries

- Each API request operates within a single database session.
- Each endpoint handler gets a fresh session from the session factory.
- Session is committed on success, rolled back on failure.
- No cross-request transactions (stateless design).

---

## Error Handling & Validation Strategy

### Centralized Error Handling Flow

```
Exception raised in handler
  ↓
Custom exception handler catches it
  ↓
Maps to {"error": "message"} + HTTP status
  ↓
Returns JSON response
```

### Validation Layers

| Layer        | What is validated               | Response on failure |
|--------------|---------------------------------|---------------------|
| Auth middleware | JWT presence, signature, expiry | 401 Unauthorized   |
| Pydantic schema | Request body shape and types  | 400 Bad Request    |
| Custom validators | Business rules (title length) | 400 Bad Request   |
| Database query | Ownership (user_id match)      | 404 Not Found      |

### Error Response Shape

Every error response, regardless of source:

```json
{"error": "Human-readable message"}
```

No exceptions. FastAPI's default `{"detail": [...]}` is overridden.

### Mapping Backend Errors to Frontend UX

| Backend Error           | HTTP Status | Frontend Display              |
|-------------------------|-------------|-------------------------------|
| Validation error        | 400         | Inline error or toast         |
| Missing/invalid JWT     | 401         | Redirect to sign-in           |
| Task not found/owned    | 404         | "Not found" message           |
| Server error            | 500         | Generic error with retry      |

### Security-Safe Error Messages

- 401: Always "Unauthorized" — never "expired", "invalid", "missing"
- 404: Always "Task not found" — never "belongs to another user"
- 500: Always "Internal server error" — never stack traces or DB info

---

## Integration Readiness Checklist

- [ ] All 6 API endpoints match frontend contract shapes
- [ ] camelCase field names in all responses (id, title, description, status, createdAt, updatedAt)
- [ ] status field is "pending"/"completed" string (not boolean)
- [ ] Error responses are `{"error": "message"}` consistently
- [ ] 401 triggers frontend redirect to sign-in
- [ ] 204 DELETE has no response body
- [ ] Empty task list returns 200 with `[]`
- [ ] POST returns 201 (not 200)
- [ ] Timestamps are ISO 8601 with timezone
- [ ] CORS allows frontend origin
- [ ] Authorization header is in CORS allowed headers
- [ ] BETTER_AUTH_SECRET matches frontend value
- [ ] Backend runs on port 8000 (or configured port)
- [ ] Frontend NEXT_PUBLIC_API_URL points to backend

---

## Non-Functional Requirements Plan

### Security

- JWT verification with explicit algorithm restriction (HS256 only)
- Algorithm confusion attack prevention (reject alg: "none")
- No secrets in responses or logs
- No internal error details exposed
- CORS restricted to known frontend origins
- Query-level ownership enforcement (not post-query filtering)
- 404 for foreign tasks (not 403 — information leakage prevention)

### Performance

- Async database driver (asyncpg) for non-blocking I/O
- Database indexes on user_id and (user_id, created_at) for query speed
- No N+1 query patterns (single query per operation)
- Target: <500ms per request under normal load

### Scalability

- Stateless design: any instance handles any request
- No in-memory state between requests
- Database connection pooling via SQLAlchemy engine
- Horizontal scaling: add more backend instances behind a load balancer

### Logging

- Structured logging with Python's logging module
- Request lifecycle: method, path, status, duration (INFO)
- Auth failures: logged at WARNING (without token content)
- Database errors: logged at ERROR
- Sensitive data exclusions enforced

---

## Complexity Tracking

No constitution violations require justification. The plan implements
the minimum structure needed:

- 1 database table
- 6 API endpoints
- 1 auth middleware
- Flat module structure (no unnecessary abstractions)
- No patterns beyond what the spec requires

## Constitution Compliance

This plan adheres to `.specify/memory/constitution.md` v1.0.0:

- Spec-Driven Development: Plan implements approved specs without
  modification or reinterpretation.
- Separation of Responsibilities: Architecture Planner scope only;
  no implementation code in this document.
- Security Constitution: JWT verification, ownership enforcement,
  and trust boundaries all planned per spec.
- Data Rules: Query-level user isolation planned for all operations.
- Workflow Enforcement: Specs → Plan → Tasks → Implementation.
