# API Contract: Tasks

**Branch**: `001-frontend-ui-spec` | **Date**: 2026-02-05

## Base URL

All endpoints are prefixed with the backend API base URL.
Authorization: `Authorization: Bearer <JWT>` header required on all
endpoints.

---

## GET /api/tasks

**Purpose**: List all tasks for the authenticated user.

**Request**:
- Method: GET
- Headers: Authorization: Bearer <JWT>
- Body: None

**Response 200**:
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string | null",
    "status": "pending | completed",
    "createdAt": "ISO 8601 string",
    "updatedAt": "ISO 8601 string"
  }
]
```

**Response 401**: `{ "error": "Unauthorized" }`

**Frontend usage**: Dashboard page fetches this on load.

---

## POST /api/tasks

**Purpose**: Create a new task for the authenticated user.

**Request**:
- Method: POST
- Headers: Authorization: Bearer <JWT>, Content-Type: application/json
- Body:
```json
{
  "title": "string (required, max 200)",
  "description": "string | null (optional, max 2000)"
}
```

**Response 201**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "status": "pending",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string"
}
```

**Response 400**: `{ "error": "Validation error message" }`
**Response 401**: `{ "error": "Unauthorized" }`

**Frontend usage**: Create Task page submits this.

---

## GET /api/tasks/{id}

**Purpose**: Get a single task by ID for the authenticated user.

**Request**:
- Method: GET
- Headers: Authorization: Bearer <JWT>
- Path params: `id` (string)

**Response 200**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "status": "pending | completed",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string"
}
```

**Response 401**: `{ "error": "Unauthorized" }`
**Response 404**: `{ "error": "Task not found" }`

**Frontend usage**: Task Detail page and Edit Task page (pre-populate form).

---

## PUT /api/tasks/{id}

**Purpose**: Update an existing task owned by the authenticated user.

**Request**:
- Method: PUT
- Headers: Authorization: Bearer <JWT>, Content-Type: application/json
- Path params: `id` (string)
- Body:
```json
{
  "title": "string (optional, max 200)",
  "description": "string | null (optional, max 2000)",
  "status": "pending | completed (optional)"
}
```

**Response 200**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "status": "pending | completed",
  "createdAt": "ISO 8601 string",
  "updatedAt": "ISO 8601 string"
}
```

**Response 400**: `{ "error": "Validation error message" }`
**Response 401**: `{ "error": "Unauthorized" }`
**Response 404**: `{ "error": "Task not found" }`

**Frontend usage**: Edit Task page submits this.

---

## DELETE /api/tasks/{id}

**Purpose**: Delete a task owned by the authenticated user.

**Request**:
- Method: DELETE
- Headers: Authorization: Bearer <JWT>
- Path params: `id` (string)
- Body: None

**Response 204**: No content.

**Response 401**: `{ "error": "Unauthorized" }`
**Response 404**: `{ "error": "Task not found" }`

**Frontend usage**: Triggered by ConfirmationModal on dashboard or
detail page.

---

## Error Response Shape

All error responses follow:
```json
{
  "error": "Human-readable error message"
}
```

The frontend MUST display the `error` field value in error toasts or
inline error banners. The frontend MUST NOT parse or display any
other fields.
