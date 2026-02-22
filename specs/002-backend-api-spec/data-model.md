# Data Model: Backend API

**Branch**: `002-backend-api-spec` | **Date**: 2026-02-06

## Overview

This document defines the backend data model — the entities, their
fields, relationships, validation rules, and state transitions as
they exist in the backend application layer. This is NOT a database
schema (see `specs/database/schema.md`); it describes the application-
level model that maps between the database and the API.

## Entities

### Task (Database Model)

The core persistence entity. Maps directly to the `tasks` database
table.

| Field       | Python Type         | DB Column    | Nullable | Default               |
|-------------|---------------------|--------------|----------|-----------------------|
| id          | uuid.UUID           | id           | No       | uuid4() server-side   |
| user_id     | str                 | user_id      | No       | From JWT sub claim    |
| title       | str                 | title        | No       | Required from client  |
| description | str or None         | description  | Yes      | None                  |
| completed   | bool                | completed    | No       | False                 |
| created_at  | datetime (UTC)      | created_at   | No       | utcnow() server-side  |
| updated_at  | datetime (UTC)      | updated_at   | No       | utcnow() server-side  |

**Source**: Database (tasks table).
**Usage**: All CRUD operations. Never exposed directly to API — mapped
through response models.

### TaskCreatePayload (Request Model)

Represents the validated input for creating a new task.

| Field       | Python Type   | Required | Validation                     |
|-------------|---------------|----------|--------------------------------|
| title       | str           | Yes      | Non-empty after trim, max 200  |
| description | str or None   | No       | Max 2000 if provided           |

**Source**: POST /api/tasks request body.
**Usage**: Validated by Pydantic, then used to create a Task entity.
Any extra fields (including `user_id`) are silently ignored.

### TaskUpdatePayload (Request Model)

Represents the validated input for updating an existing task.

| Field       | Python Type             | Required | Validation                         |
|-------------|-------------------------|----------|------------------------------------|
| title       | str or None             | No       | Non-empty after trim, max 200      |
| description | str or None or Unset    | No       | Max 2000 if provided               |
| status      | str or None             | No       | Must be "pending" or "completed"   |

**Source**: PUT /api/tasks/{id} request body.
**Usage**: At least one field must be provided. `status` is mapped to
the `completed` boolean before saving.

### TaskResponse (Response Model)

Represents the API response shape for a task. Maps database fields to
camelCase API fields.

| Field       | API Name    | Type            | Source                        |
|-------------|-------------|-----------------|-------------------------------|
| id          | id          | string (UUID)   | Task.id                       |
| title       | title       | string          | Task.title                    |
| description | description | string or null  | Task.description              |
| status      | status      | string          | "completed" if completed else "pending" |
| created_at  | createdAt   | string (ISO)    | Task.created_at               |
| updated_at  | updatedAt   | string (ISO)    | Task.updated_at               |

**Source**: Task database entity, after status mapping.
**Usage**: All API responses that return task data.
**Note**: `user_id` is NEVER included in any API response.

### AuthenticatedUser (Request Context)

Represents the verified user identity extracted from JWT middleware.

| Field   | Type | Source                    |
|---------|------|---------------------------|
| user_id | str  | JWT `sub` claim (verified)|

**Source**: JWT middleware, after successful verification.
**Usage**: Passed to every endpoint handler. Used in every database
query as the ownership filter.
**Note**: This is NOT a database entity — it exists only in request
context.

### ErrorResponse (Response Model)

Represents the standard error response shape.

| Field | API Name | Type   | Description                 |
|-------|----------|--------|-----------------------------|
| error | error    | string | Human-readable error message|

**Source**: Exception handlers and validation logic.
**Usage**: All non-success API responses (400, 401, 404, 500).

## Validation Rules

| Entity            | Field       | Rule                                           |
|-------------------|-------------|------------------------------------------------|
| TaskCreatePayload | title       | Required, non-empty after trim, max 200 chars  |
| TaskCreatePayload | description | Optional, max 2000 chars if provided           |
| TaskUpdatePayload | title       | If present, non-empty after trim, max 200      |
| TaskUpdatePayload | description | If present, max 2000 chars; null clears value  |
| TaskUpdatePayload | status      | If present, must be "pending" or "completed"   |
| TaskUpdatePayload | (body)      | At least one field must be provided             |

## State Transitions

### Task Completion Status

```
completed=false (pending) ──(toggle/update)──> completed=true (completed)
completed=true (completed) ──(toggle/update)──> completed=false (pending)
```

- Only two states. No intermediate states.
- Toggle endpoint inverts current value.
- PUT endpoint can set explicitly via `status` field.
- Deletion removes the task entirely (no "deleted" state).

### Status Mapping (DB ↔ API)

| Database `completed` | API `status`  | Direction    |
|----------------------|---------------|--------------|
| false                | "pending"     | DB → API     |
| true                 | "completed"   | DB → API     |
| N/A                  | "pending"     | API → DB (= false) |
| N/A                  | "completed"   | API → DB (= true)  |

## Relationships

```
AuthenticatedUser (1) ──owns──> (many) Task
```

- A user can own zero or more tasks.
- A task belongs to exactly one user.
- The relationship is enforced by `user_id` on every query.
- No `users` table exists in the backend database — the relationship
  is virtual, anchored by the JWT-verified user ID.
