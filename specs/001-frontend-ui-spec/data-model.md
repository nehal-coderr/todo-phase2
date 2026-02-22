# Data Model: Frontend UI

**Branch**: `001-frontend-ui-spec` | **Date**: 2026-02-05

## Overview

This document defines the frontend data model — the shapes of data
consumed and produced by the frontend. These are NOT database schemas;
they are the TypeScript interfaces the frontend uses to communicate
with the API and render UI.

## Entities

### User (from auth session)

| Field          | Type    | Notes                                   |
|----------------|---------|-----------------------------------------|
| id             | string  | Unique user identifier from auth        |
| email          | string  | User's email address                    |
| name           | string? | Display name (optional, derived from    |
|                |         | email prefix if absent)                 |

**Source**: Better Auth session object.
**Usage**: Header component (display email), API client (derive JWT).

### Task

| Field       | Type                       | Notes                       |
|-------------|----------------------------|-----------------------------|
| id          | string                     | Unique task identifier      |
| title       | string                     | Required, max 200 chars     |
| description | string?                    | Optional, max 2000 chars    |
| status      | "pending" \| "completed"   | Task completion state       |
| createdAt   | string (ISO 8601)          | Creation timestamp          |
| updatedAt   | string (ISO 8601)          | Last modification timestamp |

**Source**: Backend REST API.
**Usage**: TaskCard, TaskList, TaskDetail, TaskForm.

### CreateTaskPayload

| Field       | Type    | Notes                       |
|-------------|---------|-----------------------------|
| title       | string  | Required, max 200 chars     |
| description | string? | Optional, max 2000 chars    |

**Source**: TaskForm (create mode).
**Destination**: `POST /api/tasks`

### UpdateTaskPayload

| Field       | Type                       | Notes                       |
|-------------|----------------------------|-----------------------------|
| title       | string?                    | Optional update              |
| description | string?                    | Optional update              |
| status      | "pending" \| "completed"?  | Optional update              |

**Source**: TaskForm (edit mode).
**Destination**: `PUT /api/tasks/{id}`

## Validation Rules (Frontend-Enforced)

| Field           | Rule                                         |
|-----------------|----------------------------------------------|
| title           | Required, non-empty after trim, max 200 chars|
| description     | Optional, max 2000 chars                     |
| email (sign-up) | Valid email format                            |
| password        | Required, min 8 characters                   |
| confirmPassword | Must match password field                    |

## State Transitions

### Task Status

```
pending ──(user marks complete)──> completed
completed ──(user marks pending)──> pending
```

Only two states. No intermediate states, no "archived" or "deleted"
status. Deletion removes the task entirely.
