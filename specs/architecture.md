# Architecture Specification: Backend API

**Feature Branch**: `002-backend-api-spec`
**Created**: 2026-02-06
**Status**: Draft

## Overview

The backend is a stateless REST API that serves as the security
enforcement point for all task management operations. It receives
requests from the Next.js frontend, verifies JWT authentication,
validates input, executes database operations scoped to the
authenticated user, and returns structured JSON responses.

The backend does NOT manage user accounts, sessions, or token
issuance. Authentication is handled by Better Auth on the frontend;
the backend only verifies tokens.

## Technology Stack

- **Runtime**: Python
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Auth Verification**: JWT signature verification using shared secret

## Request Lifecycle

Every request follows this exact sequence:

1. **Receive** — FastAPI receives the HTTP request.
2. **Authenticate** — Middleware extracts the JWT from the
   `Authorization: Bearer <token>` header and verifies it.
   - If missing or invalid: return 401 immediately. No further
     processing occurs.
3. **Identify** — The verified JWT payload's `sub` claim is extracted
   as the authenticated user ID.
4. **Route** — The request is dispatched to the appropriate endpoint
   handler.
5. **Validate** — The request body (if any) is validated against the
   endpoint's schema. Invalid input returns 400.
6. **Authorize** — The endpoint handler ensures the requested resource
   belongs to the authenticated user. Foreign resources return 404.
7. **Execute** — The database operation is performed, scoped to the
   authenticated user's ID.
8. **Respond** — A structured JSON response is returned with the
   appropriate HTTP status code.

No step may be skipped. Authentication MUST complete before validation.
Validation MUST complete before database access.

## Trust Boundaries

### Boundary 1: Frontend to Backend (Untrusted)

- The frontend is treated as an **untrusted client**.
- All data from the frontend (headers, body, query params, path
  params) is untrusted and must be validated.
- The backend MUST NOT trust any user_id, ownership claim, or role
  assertion from the request body, query parameters, or URL path.
- The only trusted source of user identity is the verified JWT.

### Boundary 2: Backend to Database (Trusted)

- The backend has a trusted connection to the database via
  NEON_DB_URL.
- All queries MUST include a WHERE clause filtering by the
  authenticated user's ID.
- The backend is the sole accessor of the database; no direct
  frontend-to-database connections exist.

### Boundary 3: JWT Verification (Trust Anchor)

- The JWT is signed by Better Auth using BETTER_AUTH_SECRET.
- The backend verifies the signature using the same secret.
- A valid signature means the token was issued by the trusted auth
  system and has not been tampered with.
- Token expiration is enforced; expired tokens are rejected.

## JWT Authentication Flow

### Extraction

- The backend reads the `Authorization` header from the request.
- Expected format: `Bearer <token>`.
- If the header is missing, malformed, or the scheme is not "Bearer",
  the request is rejected with 401.

### Verification

- The JWT is decoded and its signature is verified using
  BETTER_AUTH_SECRET (HMAC-based).
- The `exp` (expiration) claim is checked; expired tokens are rejected.
- If verification fails for any reason (bad signature, expired,
  malformed), the request is rejected with 401.

### Identity Derivation

- The `sub` (subject) claim from the verified JWT payload is
  extracted as the authenticated user ID.
- This user ID is the ONLY source of identity for the entire request
  lifecycle.
- The user ID is passed to endpoint handlers as a verified,
  trusted value.

### Enforcement

- Every database query that reads, writes, updates, or deletes tasks
  MUST include the authenticated user ID as a filter.
- Task ownership is enforced at the query level, not by
  post-query filtering.
- If a query returns no results for a given task ID + user ID
  combination, the endpoint returns 404.

## Stateless Design Principles

- **No server-side sessions**: The backend stores no user state
  between requests. Each request is self-contained.
- **No in-memory caches of user data**: User identity is derived
  fresh from the JWT on every request.
- **No sticky sessions**: Any backend instance can handle any request
  from any user.
- **Horizontal scalability**: Multiple backend instances can run
  behind a load balancer without coordination.
- **Database as sole state**: All persistent state lives in the
  database. The backend is a stateless processor.

## Error Handling Strategy

### Error Response Format

All errors follow a consistent JSON structure:

```
{
  "error": "Human-readable error message"
}
```

The `error` field contains a message suitable for display to end
users. No internal details, stack traces, or database errors are
ever included.

### HTTP Status Code Conventions

| Code | Meaning                  | When Used                          |
|------|--------------------------|------------------------------------|
| 200  | Success                  | GET, PUT, PATCH success            |
| 201  | Created                  | POST success (task created)        |
| 204  | No Content               | DELETE success                     |
| 400  | Bad Request              | Validation errors                  |
| 401  | Unauthorized             | Missing/invalid/expired JWT        |
| 404  | Not Found                | Task not found or not owned        |
| 500  | Internal Server Error    | Unexpected server failures         |

### Security-Sensitive Error Rules

- **No 403 responses**: When a user attempts to access another user's
  task, the backend returns 404 (not 403) to avoid confirming the
  task's existence.
- **No detail in 401**: The 401 response never specifies whether the
  token was missing, expired, or invalid. The message is always
  "Unauthorized".
- **No detail in 500**: The 500 response always says "Internal server
  error". Detailed errors are logged server-side only.

## Logging Scope

### What MUST Be Logged

- Authentication failures (invalid/expired tokens) — without logging
  the token itself.
- Validation failures — endpoint, validation error type.
- Database errors — connection failures, query errors (server-side
  only).
- Request metadata — HTTP method, path, status code, response time.

### What MUST NOT Be Logged

- JWT tokens or any part of their content.
- User passwords or secrets.
- Full request bodies (may contain sensitive data).
- BETTER_AUTH_SECRET or NEON_DB_URL values.

### Log Levels

- **ERROR**: Database failures, unhandled exceptions.
- **WARNING**: Authentication failures, validation errors.
- **INFO**: Request lifecycle (method, path, status, duration).

## CORS Configuration

- The backend MUST configure CORS to allow requests from the
  frontend origin only.
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS.
- Allowed headers: Authorization, Content-Type.
- Credentials: Not required (JWT is sent via Authorization header,
  not cookies).

## Environment Variables

| Variable            | Purpose                                      | Required |
|---------------------|----------------------------------------------|----------|
| BETTER_AUTH_SECRET  | Shared secret for JWT verification           | Yes      |
| BETTER_AUTH_URL     | Frontend auth URL (documentation only)       | No       |
| NEON_DB_URL         | PostgreSQL connection string for Neon         | Yes      |

No secrets may be hardcoded. The application MUST fail to start if
required environment variables are missing.

## Constitution Compliance

This specification adheres to `.specify/memory/constitution.md` v1.0.0:

- Security Constitution: Frontend is untrusted; JWT verification on
  every request; user identity from JWT only; no trust of request
  body user_id.
- API Rules: RESTful, stateless, Bearer token auth.
- Data Rules: All queries scoped to authenticated user.
