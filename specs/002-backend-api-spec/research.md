# Research: Backend API Implementation

**Branch**: `002-backend-api-spec` | **Date**: 2026-02-06

## Technology Stack Confirmation

### Decision: Python 3.11+ / FastAPI / SQLModel

**Rationale**: The approved architecture specification (`specs/architecture.md`)
explicitly defines FastAPI as the backend framework and SQLModel as the ORM.
This is a fixed constraint, not a choice.

**Note**: The `/sp.plan` command input mentioned "Node.js (LTS) / TypeScript"
but the approved specifications state "Python / FastAPI / SQLModel". Per the
constitution, specifications are the source of truth. The plan follows the
approved specs.

**Alternatives considered**: None. Technology stack is fixed by spec.

---

## JWT Verification Strategy

### Decision: PyJWT library with HS256 algorithm

**Rationale**: Frontend research confirms Better Auth signs JWTs with HS256
(HMAC-SHA256) using the `BETTER_AUTH_SECRET` environment variable. PyJWT is the
standard Python library for JWT operations and supports HS256 natively.

**Key findings from frontend codebase**:

- Better Auth uses HS256 signing (confirmed in `node_modules/better-auth/dist/crypto/jwt.mjs`)
- JWT `sub` claim contains the user ID (UUID string format)
- JWT `exp` claim is set with a 1-hour default expiration
- Token is delivered via `Authorization: Bearer <token>` header
- The `BETTER_AUTH_SECRET` environment variable is the signing key

**Verification approach**:
- Use PyJWT `jwt.decode()` with `algorithms=["HS256"]` (explicitly restrict)
- Verify signature using `BETTER_AUTH_SECRET`
- Enforce `exp` claim validation (PyJWT does this by default)
- Extract `sub` claim for user identity
- Reject tokens with `alg: "none"` by only allowing HS256

**Alternatives considered**:
- python-jose: More features but heavier; PyJWT is sufficient for HS256
- Manual verification: Not recommended; cryptographic operations should use
  vetted libraries

---

## Better Auth Session Token Architecture

### Decision: Backend verifies JWT tokens, not session cookies

**Rationale**: The frontend's `api-client.ts` fetches the session token from
`/api/auth/get-session` and sends it as a Bearer token in the Authorization
header. The backend receives this token and verifies it as a JWT.

**Key architecture insight**: Better Auth manages sessions internally using
cookies (`better-auth.session_token`) for the frontend. The session has an
associated JWT token that the frontend extracts and forwards to the backend.
The backend only sees the JWT — never the session cookie.

**Token flow**:
1. User authenticates via Better Auth on frontend
2. Better Auth creates a session with a JWT token
3. Frontend calls `/api/auth/get-session` to get the token
4. Frontend sends token as `Authorization: Bearer <token>` to backend
5. Backend verifies JWT signature and extracts `sub` claim

**Alternatives considered**: None. This is the architecture defined by the
frontend implementation and approved specs.

---

## Database Connection Strategy

### Decision: SQLModel with asyncpg driver for Neon PostgreSQL

**Rationale**: SQLModel is the approved ORM. Neon PostgreSQL is serverless,
supporting standard PostgreSQL connections. Using an async driver (asyncpg)
aligns with FastAPI's async architecture for optimal performance.

**Connection approach**:
- Use `NEON_DB_URL` environment variable for connection string
- SQLModel engine configured with the connection URL
- Connection pooling managed by SQLAlchemy (SQLModel's underlying engine)
- Schema creation at application startup via `SQLModel.metadata.create_all()`

**Alternatives considered**:
- psycopg2 (sync driver): Works but suboptimal with FastAPI's async model
- SQLAlchemy Core only: SQLModel provides a cleaner Pydantic-integrated API

---

## UUID Generation Strategy

### Decision: Python uuid4 generated server-side

**Rationale**: The spec requires UUIDs as task IDs, generated server-side.
Python's `uuid.uuid4()` generates random UUIDs suitable for primary keys.
This aligns with the schema spec's requirement for server-generated UUIDs.

**Alternatives considered**:
- Database-generated UUIDs (gen_random_uuid()): Viable but creates a DB
  dependency for ID generation; application-side is simpler with SQLModel
- ULIDs: More sortable but not specified; UUID is the spec requirement

---

## Timestamp Handling

### Decision: Python datetime.utcnow() with timezone-aware storage

**Rationale**: Specs require ISO 8601 timestamps in UTC. Python's datetime
module with UTC timezone info, stored as PostgreSQL `TIMESTAMP WITH TIME ZONE`.

**JSON serialization**: FastAPI's default JSON serializer handles datetime
objects, producing ISO 8601 strings. The API response field mapping
(`created_at` → `createdAt`) requires alias configuration on the model.

**Alternatives considered**: None. This is standard FastAPI/Pydantic behavior.

---

## API Field Naming Convention

### Decision: camelCase in API, snake_case in Python/DB

**Rationale**: The frontend API contract uses camelCase (`createdAt`,
`updatedAt`). Python convention is snake_case (`created_at`, `updated_at`).
SQLModel/Pydantic alias feature maps between the two automatically.

**Approach**: Use Pydantic `Field(alias="createdAt")` or a `model_config`
with `alias_generator` to produce camelCase API responses from snake_case
Python models.

**Alternatives considered**: Using camelCase in Python code — rejected because
it violates Python conventions and makes the codebase inconsistent.

---

## Error Response Strategy

### Decision: Custom exception handlers in FastAPI

**Rationale**: The spec requires consistent `{"error": "message"}` responses
for all error codes. FastAPI's default validation error response uses a
different shape. Custom exception handlers are needed to normalize all errors.

**Approach**:
- Register custom exception handlers for `RequestValidationError` (→ 400),
  `HTTPException` (→ various), and generic `Exception` (→ 500)
- All handlers produce `{"error": "message"}` shape
- Validation errors are transformed from Pydantic's detailed format into
  human-readable messages

**Alternatives considered**: Using FastAPI's default error handling — rejected
because it produces `{"detail": [...]}` instead of `{"error": "message"}`.

---

## CORS Configuration

### Decision: Restrict to frontend origin only

**Rationale**: The spec requires CORS to allow the frontend origin. The
frontend runs on `http://localhost:3000` (dev). CORS must allow this origin
and the production origin (configured via environment variable).

**Approach**: Use FastAPI's `CORSMiddleware` with explicit allowed origins.
Do not use `allow_origins=["*"]` — restrict to known frontend URLs.

**Alternatives considered**: Wildcard CORS — rejected for security reasons.

---

## Testing Strategy

### Decision: pytest with httpx TestClient

**Rationale**: FastAPI's recommended testing approach uses pytest with
httpx's `AsyncClient` or Starlette's `TestClient`. This provides
synchronous test execution with async endpoint support.

**Test layers**:
- Unit tests: JWT verification, validation logic, status mapping
- Integration tests: Full endpoint tests with test database
- Contract tests: Verify response shapes match frontend expectations

**Alternatives considered**: unittest — less idiomatic for FastAPI; pytest
is the ecosystem standard.

---

## Summary of Resolved Decisions

| Topic                    | Decision                              | Confidence |
|--------------------------|---------------------------------------|------------|
| Language/Framework       | Python 3.11+ / FastAPI               | Fixed      |
| ORM                      | SQLModel                             | Fixed      |
| Database                 | Neon PostgreSQL                      | Fixed      |
| JWT Library              | PyJWT (HS256)                        | High       |
| UUID Generation          | Python uuid4                         | High       |
| Async Driver             | asyncpg                              | High       |
| Field Naming             | camelCase API / snake_case Python    | High       |
| Error Handling           | Custom FastAPI exception handlers    | High       |
| CORS                     | Restricted origin, CORSMiddleware    | High       |
| Testing                  | pytest + httpx TestClient            | High       |

No unresolved NEEDS CLARIFICATION items remain.
