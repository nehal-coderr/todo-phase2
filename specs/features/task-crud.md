# Task CRUD Behavior Specification

**Feature Branch**: `002-backend-api-spec`
**Created**: 2026-02-06
**Status**: Draft

## Overview

This specification defines the backend behavior for task CRUD
operations. It describes what happens server-side for each operation,
including validation, ownership enforcement, default values, timestamp
management, and data access patterns. This is a behavior spec — not
an API contract (see `specs/api/rest-endpoints.md` for the API
contract).

## Task Creation

### Behavior

When a create request is received with a valid JWT and valid payload:

1. The `user_id` is set to the authenticated user's ID (from JWT).
2. The `title` is trimmed of leading/trailing whitespace.
3. The `description` is stored as-is, or null if omitted.
4. The `id` is generated as a new UUID (server-side).
5. The `completed` flag is set to `false` (default).
6. The `created_at` timestamp is set to the current server time (UTC).
7. The `updated_at` timestamp is set to the current server time (UTC).
8. The task is inserted into the database.
9. The created task is returned in the API response format.

### Validation Rules

| Field       | Rule                                              |
|-------------|---------------------------------------------------|
| title       | Required. Must be non-empty after trimming.       |
|             | Maximum 200 characters (post-trim).               |
| description | Optional. Maximum 2000 characters if provided.    |
|             | Null and omitted are treated identically.         |

### Default Values

| Field      | Default Value              |
|------------|----------------------------|
| id         | Server-generated UUID      |
| user_id    | From JWT `sub` claim       |
| completed  | false                      |
| created_at | Current server time (UTC)  |
| updated_at | Current server time (UTC)  |

### What the Client Cannot Override

- `id` — always server-generated.
- `user_id` — always from JWT; any body value is ignored.
- `completed` — always false on creation.
- `created_at` — always server time.
- `updated_at` — always server time.

---

## Task Retrieval (List)

### Behavior

When a list request is received with a valid JWT:

1. The database is queried for all tasks where `user_id` matches the
   authenticated user's ID.
2. Results are ordered by `created_at` descending (newest first).
3. All matching tasks are returned as an array.
4. If no tasks match, an empty array is returned.

### Ownership Check

- The WHERE clause MUST include `user_id = <authenticated_user_id>`.
- No post-query filtering. Filtering is at the query level.

### Sorting

- Default sort: `created_at` DESC (newest first).
- No client-controlled sorting in Phase II.

### Filtering

- No client-controlled filtering in Phase II.
- The only filter applied is `user_id` (ownership).

### Pagination

- No pagination in Phase II. All tasks for the user are returned.

---

## Task Retrieval (Detail)

### Behavior

When a detail request is received with a valid JWT and a task ID:

1. The database is queried for a task where `id` matches the
   requested ID AND `user_id` matches the authenticated user's ID.
2. If found, the task is returned.
3. If not found (either does not exist or belongs to another user),
   404 is returned.

### Ownership Check

- The WHERE clause MUST include both `id = <requested_id>` AND
  `user_id = <authenticated_user_id>`.
- A single query with both conditions. Not two separate queries.

---

## Task Update

### Behavior

When an update request is received with a valid JWT, a task ID, and
a valid payload:

1. The database is queried for a task where `id` matches AND
   `user_id` matches the authenticated user's ID.
2. If not found, return 404.
3. If found, apply the provided fields:
   - `title`: if provided, trim and replace. If not provided, keep
     current value.
   - `description`: if provided (including null), replace. If not
     provided (key absent), keep current value.
   - `status`: if provided, map to `completed` boolean. If not
     provided, keep current value.
4. Set `updated_at` to the current server time (UTC).
5. Save the changes to the database.
6. Return the full updated task.

### Validation Rules

| Field       | Rule                                              |
|-------------|---------------------------------------------------|
| title       | If provided, must be non-empty after trim.        |
|             | Maximum 200 characters (post-trim).               |
| description | If provided, maximum 2000 characters.             |
|             | Can be set to null to clear.                      |
| status      | If provided, must be "pending" or "completed".    |
| (body)      | At least one field must be provided.              |

### Status Mapping

- `"pending"` in API maps to `completed = false` in database.
- `"completed"` in API maps to `completed = true` in database.

### What the Client Cannot Override

- `id` — cannot be changed. Any body value is ignored.
- `user_id` — cannot be changed. Any body value is ignored.
- `created_at` — cannot be changed. Any body value is ignored.
- `updated_at` — always set to current server time on update.

### Ownership Check

- The WHERE clause MUST include both `id` AND `user_id`.
- Ownership is checked as part of the same query that fetches the
  task. Not a separate authorization query.

---

## Task Deletion

### Behavior

When a delete request is received with a valid JWT and a task ID:

1. The database attempts to delete the task where `id` matches AND
   `user_id` matches the authenticated user's ID.
2. If a row was deleted, return 204 No Content.
3. If no row was deleted (task does not exist or belongs to another
   user), return 404.

### Deletion Type

- **Hard delete**: The task row is permanently removed from the
  database.
- No soft delete, no trash, no recycle bin in Phase II.
- Deletion is irreversible at the backend level.

### Ownership Check

- The DELETE query MUST include both `id` AND `user_id` in the
  WHERE clause.
- A single query. Not a SELECT followed by a DELETE.

---

## Task Completion Toggle

### Behavior

When a completion toggle request is received with a valid JWT and a
task ID:

1. The database is queried for the task where `id` matches AND
   `user_id` matches the authenticated user's ID.
2. If not found, return 404.
3. If found, flip the `completed` flag:
   - `false` becomes `true` (pending to completed).
   - `true` becomes `false` (completed to pending).
4. Set `updated_at` to the current server time (UTC).
5. Save the changes.
6. Return the full updated task.

### No Request Body Required

- The toggle endpoint requires no request body.
- The server determines the new status by inverting the current value.

### Ownership Check

- Same as all other operations: WHERE clause includes both `id` AND
  `user_id`.

---

## Timestamp Behavior

### created_at

- Set once, on task creation.
- Never modified after creation.
- Always UTC.
- Always server-generated; client values are ignored.

### updated_at

- Set on task creation (same value as created_at).
- Updated to current server time on every modification (update,
  status toggle).
- Always UTC.
- Always server-generated; client values are ignored.

### Format

- Stored in the database as a timestamp with timezone.
- Returned in API responses as ISO 8601 strings
  (e.g., `2026-02-06T12:00:00Z`).

---

## API Response Status Mapping

The backend stores `completed` as a boolean in the database but
exposes it as a string status in the API:

| Database `completed` | API `status`  |
|----------------------|---------------|
| false                | "pending"     |
| true                 | "completed"   |

This mapping is applied on every read operation (list, detail,
update response, toggle response). The frontend never sees the raw
boolean.

## Constitution Compliance

This specification adheres to `.specify/memory/constitution.md` v1.0.0:

- Security Constitution: User identity from JWT only, ownership
  enforced at query level for all operations.
- Data Rules: Each task belongs to one user, queries filtered by
  user at SELECT/UPDATE/DELETE levels.
- Workflow Enforcement: Spec written before implementation.
