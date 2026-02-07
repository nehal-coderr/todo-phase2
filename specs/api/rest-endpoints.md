# REST API Endpoints Specification

**Feature Branch**: `002-backend-api-spec`
**Created**: 2026-02-06
**Status**: Draft

## Base Rules

- All endpoints are under the `/api` prefix.
- All endpoints require authentication (valid JWT in Authorization
  header).
- All request and response bodies are JSON (`Content-Type:
  application/json`).
- All responses include appropriate HTTP status codes.
- All error responses follow the standard error shape:
  `{"error": "Human-readable message"}`.
- All timestamps are ISO 8601 format (e.g., `2026-02-06T12:00:00Z`).
- Task IDs are UUIDs represented as strings.

## Standard Headers

### Request Headers (Required)

| Header         | Value                       | Required |
|----------------|-----------------------------|----------|
| Authorization  | Bearer <JWT>                | Yes      |
| Content-Type   | application/json            | Yes (for POST, PUT) |

### Response Headers

| Header         | Value                       |
|----------------|-----------------------------|
| Content-Type   | application/json            |

---

## GET /api/tasks

**Purpose**: List all tasks belonging to the authenticated user.

**Auth Requirement**: Valid JWT required. User identity derived from
JWT `sub` claim.

**Request Parameters**: None.

**Request Body**: None.

**Response 200 — Success**:

```json
[
  {
    "id": "string (UUID)",
    "title": "string",
    "description": "string | null",
    "status": "pending | completed",
    "createdAt": "ISO 8601 string",
    "updatedAt": "ISO 8601 string"
  }
]
```

- Returns an array of task objects.
- If the user has no tasks, returns an empty array `[]`.
- Tasks are ordered by `createdAt` descending (newest first).

**Error Cases**:

| Status | Condition            | Response Body                    |
|--------|----------------------|----------------------------------|
| 401    | Missing/invalid JWT  | `{"error": "Unauthorized"}`      |

**Ownership Enforcement**: The database query MUST filter by the
authenticated user's ID. Only tasks where `user_id` matches the JWT
`sub` claim are returned.

---

## POST /api/tasks

**Purpose**: Create a new task for the authenticated user.

**Auth Requirement**: Valid JWT required. The task's `user_id` is set
from the JWT `sub` claim. Any `user_id` in the request body is
ignored.

**Request Parameters**: None.

**Request Body**:

```json
{
  "title": "string (required, 1-200 characters after trim)",
  "description": "string | null (optional, max 2000 characters)"
}
```

**Validation Rules**:

- `title` is required. Must be a non-empty string after trimming
  whitespace. Maximum 200 characters.
- `description` is optional. If provided, maximum 2000 characters.
  If omitted or null, stored as null.
- Any extra fields in the body are silently ignored.

**Response 201 — Created**:

```json
{
  "id": "string (UUID, server-generated)",
  "title": "string",
  "description": "string | null",
  "status": "pending",
  "createdAt": "ISO 8601 string (server-generated)",
  "updatedAt": "ISO 8601 string (server-generated)"
}
```

- `id` is generated server-side (UUID).
- `status` is always "pending" for new tasks.
- `createdAt` and `updatedAt` are set to the current server time.

**Error Cases**:

| Status | Condition                    | Response Body                                    |
|--------|------------------------------|--------------------------------------------------|
| 400    | Missing title                | `{"error": "Title is required"}`                 |
| 400    | Empty title (after trim)     | `{"error": "Title is required"}`                 |
| 400    | Title exceeds 200 chars      | `{"error": "Title must be 200 characters or fewer"}` |
| 400    | Description exceeds 2000     | `{"error": "Description must be 2000 characters or fewer"}` |
| 401    | Missing/invalid JWT          | `{"error": "Unauthorized"}`                      |

**Ownership Enforcement**: The `user_id` is set from the JWT `sub`
claim. The client cannot specify or override the owner.

---

## GET /api/tasks/{id}

**Purpose**: Retrieve a single task by ID for the authenticated user.

**Auth Requirement**: Valid JWT required. Only returns the task if it
belongs to the authenticated user.

**Request Parameters**:

| Parameter | Location | Type   | Required | Description      |
|-----------|----------|--------|----------|------------------|
| id        | path     | string | Yes      | Task UUID        |

**Request Body**: None.

**Response 200 — Success**:

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string | null",
  "status": "pending | completed",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string"
}
```

**Error Cases**:

| Status | Condition                          | Response Body                    |
|--------|------------------------------------|----------------------------------|
| 401    | Missing/invalid JWT                | `{"error": "Unauthorized"}`      |
| 404    | Task not found or not owned        | `{"error": "Task not found"}`    |

**Ownership Enforcement**: The database query MUST filter by both
`id` AND `user_id`. If the task exists but belongs to another user,
404 is returned (not 403).

---

## PUT /api/tasks/{id}

**Purpose**: Update an existing task owned by the authenticated user.

**Auth Requirement**: Valid JWT required. Only updates the task if it
belongs to the authenticated user.

**Request Parameters**:

| Parameter | Location | Type   | Required | Description      |
|-----------|----------|--------|----------|------------------|
| id        | path     | string | Yes      | Task UUID        |

**Request Body**:

```json
{
  "title": "string (optional, 1-200 characters after trim)",
  "description": "string | null (optional, max 2000 characters)",
  "status": "pending | completed (optional)"
}
```

All fields are optional. Only provided fields are updated. Omitted
fields retain their current values.

**Validation Rules**:

- If `title` is provided, it must be non-empty after trimming and
  max 200 characters.
- If `description` is provided, max 2000 characters. Can be set to
  null to clear.
- If `status` is provided, must be exactly "pending" or "completed".
- At least one field must be provided. An empty body returns 400.
- Any `user_id` or `id` fields in the body are silently ignored.

**Response 200 — Success**:

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string | null",
  "status": "pending | completed",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string (updated to current time)"
}
```

- `updatedAt` is refreshed to the current server time on every
  successful update.

**Error Cases**:

| Status | Condition                          | Response Body                                            |
|--------|------------------------------------|----------------------------------------------------------|
| 400    | Empty body (no fields)             | `{"error": "At least one field must be provided"}`       |
| 400    | Title empty after trim             | `{"error": "Title is required"}`                         |
| 400    | Title exceeds 200 chars            | `{"error": "Title must be 200 characters or fewer"}`     |
| 400    | Description exceeds 2000           | `{"error": "Description must be 2000 characters or fewer"}` |
| 400    | Invalid status value               | `{"error": "Status must be 'pending' or 'completed'"}`   |
| 401    | Missing/invalid JWT                | `{"error": "Unauthorized"}`                              |
| 404    | Task not found or not owned        | `{"error": "Task not found"}`                            |

**Ownership Enforcement**: The database query MUST filter by both
`id` AND `user_id`. If the task exists but belongs to another user,
404 is returned.

---

## DELETE /api/tasks/{id}

**Purpose**: Permanently delete a task owned by the authenticated
user.

**Auth Requirement**: Valid JWT required. Only deletes the task if it
belongs to the authenticated user.

**Request Parameters**:

| Parameter | Location | Type   | Required | Description      |
|-----------|----------|--------|----------|------------------|
| id        | path     | string | Yes      | Task UUID        |

**Request Body**: None.

**Response 204 — No Content**:

- No response body.
- The task is permanently deleted (hard delete).

**Error Cases**:

| Status | Condition                          | Response Body                    |
|--------|------------------------------------|----------------------------------|
| 401    | Missing/invalid JWT                | `{"error": "Unauthorized"}`      |
| 404    | Task not found or not owned        | `{"error": "Task not found"}`    |

**Ownership Enforcement**: The database query MUST filter by both
`id` AND `user_id`. If the task exists but belongs to another user,
404 is returned.

---

## PATCH /api/tasks/{id}/complete

**Purpose**: Toggle the completion status of a task owned by the
authenticated user.

**Auth Requirement**: Valid JWT required. Only toggles the task if it
belongs to the authenticated user.

**Request Parameters**:

| Parameter | Location | Type   | Required | Description      |
|-----------|----------|--------|----------|------------------|
| id        | path     | string | Yes      | Task UUID        |

**Request Body**: None.

**Behavior**:

- If the task's current status is "pending", it becomes "completed".
- If the task's current status is "completed", it becomes "pending".
- `updatedAt` is refreshed to the current server time.

**Response 200 — Success**:

```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "string | null",
  "status": "pending | completed (toggled)",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string (updated to current time)"
}
```

**Error Cases**:

| Status | Condition                          | Response Body                    |
|--------|------------------------------------|----------------------------------|
| 401    | Missing/invalid JWT                | `{"error": "Unauthorized"}`      |
| 404    | Task not found or not owned        | `{"error": "Task not found"}`    |

**Ownership Enforcement**: The database query MUST filter by both
`id` AND `user_id`. If the task exists but belongs to another user,
404 is returned.

---

## Frontend Integration Rules

### Error Response Consistency

All error responses across all endpoints follow this shape:

```json
{
  "error": "Human-readable error message"
}
```

The frontend MUST:

- Display the `error` field value directly in error toasts or banners.
- NOT parse or display any other fields from error responses.
- NOT attempt to extract error codes or classify errors beyond the
  HTTP status code.

### Status Code Interpretation Guide

| Code | Frontend Should...                                        |
|------|-----------------------------------------------------------|
| 200  | Display/update the data from the response body.           |
| 201  | Display the created resource; navigate to dashboard.      |
| 204  | Remove the resource from local state; no body to parse.   |
| 400  | Display the `error` message inline or as a toast.         |
| 401  | Redirect user to sign-in page; session has expired or is invalid. |
| 404  | Display "not found" message; the resource does not exist for this user. |
| 500  | Display a generic error message with retry option.        |

### Empty Responses

- GET /api/tasks with no tasks: `200` with `[]` (empty array).
  The frontend renders the empty state.
- DELETE success: `204` with no body. The frontend removes the task
  from local state.

### Successful Mutations

- POST returns `201` with the full created task object.
- PUT returns `200` with the full updated task object.
- PATCH returns `200` with the full updated task object.
- The frontend can use these response bodies to update local state
  without making an additional GET request.

## Constitution Compliance

This specification adheres to `.specify/memory/constitution.md` v1.0.0:

- API Rules: RESTful conventions, stateless, Bearer auth.
- Security Constitution: JWT verification on every endpoint, no trust
  of body/param user_id, 401 for invalid tokens, 404 (not 403) for
  foreign tasks.
- Data Rules: All queries scoped to authenticated user.
