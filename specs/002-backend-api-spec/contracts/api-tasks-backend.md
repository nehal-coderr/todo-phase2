# Backend API Contract: Tasks

**Branch**: `002-backend-api-spec` | **Date**: 2026-02-06

## Overview

This contract defines the backend's implementation perspective of the
task API. It aligns with the frontend contract at
`specs/001-frontend-ui-spec/contracts/api-tasks.md` and adds backend-
specific details (ownership enforcement, server-side defaults,
validation rules).

## Contract Alignment with Frontend

The frontend contract is the authoritative source for response shapes.
This backend contract MUST produce responses that exactly match
the frontend's expectations.

### Field Mapping: Database → API Response

| DB Column    | API Field    | Type Mapping                          |
|--------------|--------------|---------------------------------------|
| id           | id           | UUID → string                         |
| title        | title        | str → string                          |
| description  | description  | str/None → string/null                |
| completed    | status       | bool → "pending"/"completed"          |
| created_at   | createdAt    | datetime → ISO 8601 string            |
| updated_at   | updatedAt    | datetime → ISO 8601 string            |
| user_id      | (excluded)   | Never returned in API responses       |

### Consistency Rules

- Response field names are camelCase (matching frontend expectations).
- `status` is ALWAYS a string ("pending" or "completed"), never a boolean.
- `createdAt` and `updatedAt` are ALWAYS ISO 8601 strings with timezone.
- `description` is ALWAYS present in the response (as string or null).
- `user_id` is NEVER present in any API response.

## Endpoint Contracts

### POST /api/tasks

**Backend receives**:
```json
{
  "title": "string",
  "description": "string | null"
}
```

**Backend enforces**:
- Strips extra fields (especially `user_id`, `id`, `status`)
- Trims `title` whitespace before validation
- Sets `user_id` from JWT `sub` claim
- Generates UUID for `id`
- Sets `completed = false`
- Sets `created_at` and `updated_at` to UTC now

**Backend returns** (201):
```json
{
  "id": "uuid-string",
  "title": "trimmed string",
  "description": "string | null",
  "status": "pending",
  "createdAt": "2026-02-06T12:00:00Z",
  "updatedAt": "2026-02-06T12:00:00Z"
}
```

### PUT /api/tasks/{id}

**Backend receives**:
```json
{
  "title": "string (optional)",
  "description": "string | null (optional)",
  "status": "pending | completed (optional)"
}
```

**Backend enforces**:
- Strips extra fields
- Only updates provided fields
- Maps `status` → `completed` boolean
- Sets `updated_at` to UTC now
- Verifies task ownership via query-level filter

**Backend returns** (200): Full task object (same shape as POST).

### PATCH /api/tasks/{id}/complete

**Backend receives**: No body.

**Backend enforces**:
- Inverts `completed` flag
- Sets `updated_at` to UTC now
- Verifies task ownership

**Backend returns** (200): Full task object with toggled status.

### DELETE /api/tasks/{id}

**Backend receives**: No body.

**Backend enforces**:
- Hard-deletes the task row
- Verifies task ownership via query-level filter

**Backend returns**: 204 (no body).

## Error Contract

All error responses:

```json
{
  "error": "Human-readable message"
}
```

### Validation Error Messages (exact strings)

| Condition                    | Error Message                                     |
|------------------------------|---------------------------------------------------|
| Missing title                | "Title is required"                               |
| Empty title (after trim)     | "Title is required"                               |
| Title > 200 chars            | "Title must be 200 characters or fewer"           |
| Description > 2000 chars     | "Description must be 2000 characters or fewer"    |
| Invalid status               | "Status must be 'pending' or 'completed'"         |
| Empty update body            | "At least one field must be provided"             |
| Missing/invalid JWT          | "Unauthorized"                                    |
| Task not found/not owned     | "Task not found"                                  |
| Server error                 | "Internal server error"                           |

These messages are stable and the frontend depends on them for UX.
