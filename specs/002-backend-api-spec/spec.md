# Feature Specification: Backend API for Phase II Todo Application

**Feature Branch**: `002-backend-api-spec`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Complete backend API specifications for Phase II Todo Full-Stack Web Application — covering architecture, authentication, REST endpoints, task CRUD behavior, and database schema."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated Task Creation (Priority: P1)

A frontend client sends a POST request with a valid JWT and a task
payload. The backend verifies the token, validates the payload,
creates the task scoped to the authenticated user, and returns the
newly created task with all fields populated including server-generated
timestamps.

**Why this priority**: Task creation is the foundational write
operation. Without it the system has no data. All other CRUD operations
depend on tasks existing.

**Independent Test**: Can be fully tested by sending a POST request
with a valid JWT and verifying the response contains the created task
with correct ownership and timestamps.

**Acceptance Scenarios**:

1. **Given** a valid JWT and a valid task payload, **When** POST
   /api/tasks is called, **Then** a task is created, scoped to the
   authenticated user, and returned with status 201.
2. **Given** a valid JWT and a payload with a missing title, **When**
   POST /api/tasks is called, **Then** a 400 response is returned with
   a validation error message.
3. **Given** no JWT is provided, **When** POST /api/tasks is called,
   **Then** a 401 response is returned.
4. **Given** an expired JWT, **When** POST /api/tasks is called,
   **Then** a 401 response is returned.

---

### User Story 2 - Authenticated Task Listing (Priority: P1)

A frontend client sends a GET request with a valid JWT. The backend
returns only the tasks belonging to the authenticated user. No tasks
from other users are ever exposed.

**Why this priority**: The task list is the primary read operation
and powers the dashboard. It must enforce strict user isolation.

**Independent Test**: Can be fully tested by creating tasks for two
different users and verifying each user's GET request returns only
their own tasks.

**Acceptance Scenarios**:

1. **Given** a valid JWT for user A who has 3 tasks, **When** GET
   /api/tasks is called, **Then** exactly 3 tasks are returned, all
   belonging to user A.
2. **Given** a valid JWT for a user with no tasks, **When** GET
   /api/tasks is called, **Then** an empty array is returned with
   status 200.
3. **Given** no JWT, **When** GET /api/tasks is called, **Then** a
   401 response is returned.

---

### User Story 3 - Task Update with Ownership Enforcement (Priority: P1)

A frontend client sends a PUT request to update a specific task.
The backend verifies the JWT, confirms the task belongs to the
authenticated user, validates the payload, applies the update, and
returns the updated task.

**Why this priority**: Updates (including status changes) are core
to task management and must enforce ownership at every step.

**Independent Test**: Can be fully tested by updating a task's title
and verifying the response, then attempting to update another user's
task and verifying rejection.

**Acceptance Scenarios**:

1. **Given** a valid JWT and a valid update payload for a task owned
   by the user, **When** PUT /api/tasks/{id} is called, **Then** the
   task is updated and returned with status 200.
2. **Given** a valid JWT and a task ID belonging to another user,
   **When** PUT /api/tasks/{id} is called, **Then** a 404 response is
   returned (task appears not to exist).
3. **Given** a valid JWT and a non-existent task ID, **When** PUT
   /api/tasks/{id} is called, **Then** a 404 response is returned.

---

### User Story 4 - Task Deletion with Ownership Enforcement (Priority: P2)

A frontend client sends a DELETE request for a specific task. The
backend verifies the JWT, confirms ownership, deletes the task
permanently, and returns a 204 No Content response.

**Why this priority**: Deletion completes the CRUD lifecycle and must
be irreversible and ownership-enforced.

**Independent Test**: Can be fully tested by deleting a task and
verifying it no longer appears in subsequent GET requests.

**Acceptance Scenarios**:

1. **Given** a valid JWT and a task ID owned by the user, **When**
   DELETE /api/tasks/{id} is called, **Then** the task is permanently
   removed and status 204 is returned.
2. **Given** a valid JWT and a task ID belonging to another user,
   **When** DELETE /api/tasks/{id} is called, **Then** a 404 response
   is returned.

---

### User Story 5 - Task Completion Toggle (Priority: P2)

A frontend client sends a PATCH request to toggle a task's completion
status. The backend flips the task's completed state and returns the
updated task.

**Why this priority**: Quick completion toggling is a high-frequency
user action that needs a dedicated lightweight endpoint.

**Independent Test**: Can be fully tested by toggling a pending task
to completed and back, verifying the status changes each time.

**Acceptance Scenarios**:

1. **Given** a valid JWT and a pending task owned by the user, **When**
   PATCH /api/tasks/{id}/complete is called, **Then** the task status
   changes to completed and the updated task is returned.
2. **Given** a valid JWT and a completed task owned by the user,
   **When** PATCH /api/tasks/{id}/complete is called, **Then** the
   task status changes to pending and the updated task is returned.
3. **Given** a valid JWT and a task ID not owned by the user, **When**
   PATCH /api/tasks/{id}/complete is called, **Then** a 404 response
   is returned.

---

### User Story 6 - Task Detail Retrieval (Priority: P3)

A frontend client sends a GET request for a specific task by ID.
The backend returns the full task details if the task belongs to the
authenticated user.

**Why this priority**: Detail retrieval supports the task detail page
and edit form pre-population. Lower priority because listing already
provides most data.

**Independent Test**: Can be fully tested by retrieving a task by ID
and verifying all fields are present and correct.

**Acceptance Scenarios**:

1. **Given** a valid JWT and a task ID owned by the user, **When** GET
   /api/tasks/{id} is called, **Then** the full task is returned with
   status 200.
2. **Given** a valid JWT and a task ID not owned by the user, **When**
   GET /api/tasks/{id} is called, **Then** a 404 response is returned.
3. **Given** a valid JWT and a non-existent task ID, **When** GET
   /api/tasks/{id} is called, **Then** a 404 response is returned.

---

### Edge Cases

- What happens when the JWT signature is invalid? The backend MUST
  return 401 Unauthorized with `{"error": "Unauthorized"}`.
- What happens when the JWT is expired? The backend MUST return 401
  Unauthorized with `{"error": "Unauthorized"}`.
- What happens when a request body contains a user_id field? The
  backend MUST ignore it completely; user identity comes only from JWT.
- What happens when a task title is exactly 200 characters? The
  backend MUST accept it (boundary is inclusive).
- What happens when a task title is 201 characters? The backend MUST
  reject it with a 400 validation error.
- What happens when the description is null vs. omitted? Both MUST be
  treated identically — the field is optional.
- What happens when the database is unreachable? The backend MUST
  return 500 with `{"error": "Internal server error"}` and log the
  failure. No stack traces or connection strings may be exposed.
- What happens when a concurrent request deletes a task while another
  is updating it? The update MUST return 404 (task no longer exists).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend MUST verify JWT signature on every request using
  the shared BETTER_AUTH_SECRET.
- **FR-002**: Backend MUST derive user identity exclusively from the
  verified JWT payload.
- **FR-003**: Backend MUST reject requests without a valid JWT with
  401 Unauthorized.
- **FR-004**: Backend MUST scope all database queries to the
  authenticated user's ID.
- **FR-005**: Backend MUST support creating a task with a title
  (required, max 200 characters) and description (optional, max 2000
  characters).
- **FR-006**: Backend MUST support listing all tasks for the
  authenticated user, ordered by creation date descending.
- **FR-007**: Backend MUST support retrieving a single task by ID,
  scoped to the authenticated user.
- **FR-008**: Backend MUST support updating a task's title,
  description, and/or status, scoped to the authenticated user.
- **FR-009**: Backend MUST support permanently deleting a task,
  scoped to the authenticated user.
- **FR-010**: Backend MUST support toggling a task's completion status
  via a dedicated endpoint.
- **FR-011**: Backend MUST return consistent JSON error responses with
  a human-readable "error" field.
- **FR-012**: Backend MUST validate all request payloads and return
  400 with specific validation error messages for invalid input.
- **FR-013**: Backend MUST set created_at and updated_at timestamps
  server-side; clients cannot override these values.
- **FR-014**: Backend MUST update the updated_at timestamp on every
  modification to a task.
- **FR-015**: Backend MUST return 404 (not 403) when a user attempts
  to access another user's task, to avoid revealing task existence.
- **FR-016**: Backend MUST be stateless — no server-side sessions,
  no in-memory user state between requests.
- **FR-017**: Backend MUST use environment variables for all secrets
  and connection strings; no hardcoded values.
- **FR-018**: Backend MUST never expose internal error details, stack
  traces, or database information in API responses.

### Key Entities

- **Task**: A to-do item owned by exactly one user. Key attributes:
  unique identifier, title, description, completion status, creation
  timestamp, last-modified timestamp. Relationship: belongs to one
  User (via user_id derived from JWT).
- **User**: The authenticated identity derived from JWT. The backend
  does not manage user accounts — it only consumes user identity from
  tokens issued by Better Auth on the frontend. Key attribute: user ID
  (from JWT sub claim).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All API endpoints return correct responses within 500ms
  under normal load for a single user.
- **SC-002**: No cross-user data leakage is possible — verified by
  testing with multiple user tokens.
- **SC-003**: 100% of invalid or missing JWT requests are rejected
  with 401 before any database query executes.
- **SC-004**: All validation errors return structured, human-readable
  messages that the frontend can display directly.
- **SC-005**: The API contract matches the frontend's expected request
  and response shapes exactly, enabling zero-guesswork integration.
- **SC-006**: The backend handles database unavailability gracefully,
  returning 500 with a safe error message.
- **SC-007**: All timestamps are server-generated in ISO 8601 format
  and consistent across create and update operations.

## Assumptions

- Authentication (user registration, login, token issuance) is handled
  entirely by Better Auth on the frontend. The backend only verifies
  tokens.
- The JWT contains a `sub` claim with the user ID. The backend uses
  this as the sole source of user identity.
- Task status is a boolean (completed true/false) stored in the
  database, mapped to "pending"/"completed" in API responses.
- The frontend API contract defined in
  `specs/001-frontend-ui-spec/contracts/api-tasks.md` is the
  authoritative source for request/response shapes.
- Hard delete is used for task deletion (no soft delete / no recycle
  bin in Phase II).
- No pagination is required for Phase II (reasonable task count per
  user assumed).
- No real-time notifications or WebSocket support in Phase II.
- CORS configuration will be required to allow frontend origin.

## Related Specifications

- `specs/architecture.md` — System architecture and trust boundaries
- `specs/api/rest-endpoints.md` — Full REST API contract
- `specs/features/authentication.md` — JWT verification and auth rules
- `specs/features/task-crud.md` — Task CRUD backend behavior
- `specs/database/schema.md` — Database schema and data rules
- `specs/001-frontend-ui-spec/contracts/api-tasks.md` — Frontend API
  contract (authoritative for response shapes)

## Constitution Compliance

This specification adheres to all principles in
`.specify/memory/constitution.md` v1.0.0:

- Spec-Driven Development: This spec is written before any
  implementation.
- Separation of Responsibilities: Spec Writer scope only; no
  architecture or code decisions.
- Security Constitution: All JWT, ownership, and isolation rules are
  explicitly specified.
- Data Rules: Single-user ownership and query-level enforcement are
  mandated.
- Workflow Enforcement: This is Step 1 (write specs) of the mandated
  workflow.
