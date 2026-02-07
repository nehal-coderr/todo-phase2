# Authentication & Security Specification

**Feature Branch**: `002-backend-api-spec`
**Created**: 2026-02-06
**Status**: Draft

## Overview

This specification defines how the backend authenticates requests and
enforces authorization. The backend does NOT manage user accounts or
issue tokens. Better Auth on the frontend handles registration, login,
and token issuance. The backend's sole authentication responsibility
is to verify JWT tokens and derive user identity from them.

## JWT Handling Rules

### Token Source

- The JWT MUST be extracted from the `Authorization` HTTP header.
- Expected format: `Authorization: Bearer <token>`.
- No other sources of authentication are accepted:
  - NOT from cookies.
  - NOT from query parameters.
  - NOT from request body fields.
  - NOT from custom headers.

### Header Parsing Rules

- If the `Authorization` header is missing, reject with 401.
- If the header value does not start with `Bearer ` (case-sensitive,
  with a space after "Bearer"), reject with 401.
- If the token portion (after "Bearer ") is empty, reject with 401.
- Leading/trailing whitespace on the token should be trimmed before
  verification.

### Signature Verification

- The JWT signature MUST be verified using BETTER_AUTH_SECRET.
- The signing algorithm is HMAC-based (HS256), matching Better Auth's
  default configuration.
- If the signature is invalid (tampered token, wrong secret), reject
  with 401.
- The backend MUST NOT accept unsigned tokens (alg: "none").
- The backend MUST NOT accept tokens signed with a different
  algorithm than expected (algorithm confusion attack prevention).

### Token Expiration

- The `exp` (expiration) claim MUST be checked.
- If the token is expired (current time > exp), reject with 401.
- No grace period is applied. Expired means expired.
- If the `exp` claim is missing, reject with 401.

### Token Payload

- The `sub` (subject) claim is extracted as the user ID.
- If the `sub` claim is missing or empty, reject with 401.
- The user ID from `sub` is the sole source of identity for the
  entire request lifecycle.
- No other JWT claims are required by the backend for Phase II.

## Authorization Rules

### User Identity Derivation

- User identity MUST be derived ONLY from the verified JWT `sub`
  claim.
- The user ID is extracted once during authentication middleware and
  passed to endpoint handlers as a trusted, verified value.
- Endpoint handlers MUST use this verified user ID for all database
  operations.

### Untrusted Input

The backend MUST NEVER trust user identity from any of these sources:

- `user_id` in the request body — MUST be ignored entirely.
- `user_id` in URL path parameters — MUST be ignored entirely.
- `user_id` in query parameters — MUST be ignored entirely.
- `userId`, `owner`, `ownerId`, or any variant — MUST be ignored.
- Any header other than `Authorization` — MUST be ignored for auth.

If a request body includes a `user_id` field, the backend MUST
silently ignore it. It MUST NOT raise an error (to avoid revealing
that the field is recognized), but it MUST NOT use it.

### Ownership Enforcement

- Every task operation (read, create, update, delete) MUST be scoped
  to the authenticated user.
- For **read** operations: database queries MUST include
  `WHERE user_id = <authenticated_user_id>`.
- For **create** operations: the `user_id` field MUST be set to the
  authenticated user's ID, regardless of any user_id in the payload.
- For **update** operations: the query MUST filter by both task ID
  AND the authenticated user's ID.
- For **delete** operations: the query MUST filter by both task ID
  AND the authenticated user's ID.

### Cross-User Access Prevention

- If a user attempts to access a task that belongs to another user,
  the backend MUST return 404 Not Found.
- The backend MUST NOT return 403 Forbidden, as this would confirm
  the task exists (information leakage).
- From the requesting user's perspective, another user's task simply
  does not exist.

## Failure Behavior

### Missing Token (401 Unauthorized)

- **Trigger**: `Authorization` header is absent.
- **Response**: Status 401, body `{"error": "Unauthorized"}`.
- **Behavior**: No database query is executed. No logging of the
  attempt beyond the standard request log.

### Invalid Token (401 Unauthorized)

- **Trigger**: Token has an invalid signature, is malformed, uses an
  unexpected algorithm, or is missing required claims (`sub`, `exp`).
- **Response**: Status 401, body `{"error": "Unauthorized"}`.
- **Behavior**: No database query is executed. The specific reason
  for rejection is logged at WARNING level server-side but never
  exposed to the client.

### Expired Token (401 Unauthorized)

- **Trigger**: Token's `exp` claim is in the past.
- **Response**: Status 401, body `{"error": "Unauthorized"}`.
- **Behavior**: No database query is executed. The frontend is
  expected to handle token refresh or redirect the user to sign in.

### Valid Token, Resource Not Found (404 Not Found)

- **Trigger**: The authenticated user requests a task that either
  does not exist or belongs to another user.
- **Response**: Status 404, body `{"error": "Task not found"}`.
- **Behavior**: The database is queried with the user's ID filter;
  zero results triggers the 404.

### Common Error Response Rules

- All 401 responses use the identical message "Unauthorized" — no
  distinction between missing, invalid, or expired tokens.
- No response ever reveals whether a token was expired vs. invalid.
- No response ever reveals whether a task exists but belongs to
  someone else vs. does not exist at all.

## Middleware Behavior

### Authentication Middleware

- Runs on EVERY request to `/api/*` endpoints.
- Executes before any endpoint handler or validation logic.
- On success: attaches the verified user ID to the request context.
- On failure: returns 401 immediately; endpoint handler never runs.
- MUST be applied globally to the API router — individual endpoints
  MUST NOT need to opt in to authentication.

### No Endpoint-Level Auth Bypass

- No `/api/*` endpoint may bypass authentication.
- There are no public API endpoints in Phase II.
- Health check or status endpoints (if added) MUST be outside the
  `/api/` prefix.

## Security Invariants

These properties MUST hold at all times:

1. No database query executes without a verified user ID.
2. No task is ever returned to a user who does not own it.
3. No error response reveals information about other users' data.
4. No JWT content is ever logged.
5. No secret (BETTER_AUTH_SECRET) is ever exposed in responses or
   logs.
6. Token verification happens exactly once per request, in
   middleware, before any business logic.

## Constitution Compliance

This specification adheres to `.specify/memory/constitution.md` v1.0.0:

- Security Constitution: Frontend untrusted, JWT verified on every
  request, user identity from JWT only, user_id from body/params
  never trusted, 401 for invalid tokens.
- API Rules: Authorization via Bearer header, stateless.
