# Research: Frontend UI for Phase II Todo Application

**Branch**: `001-frontend-ui-spec` | **Date**: 2026-02-05

## Research Topics

### 1. Next.js 16+ App Router Structure for Todo App

**Decision**: Use Next.js App Router with file-based routing under
`frontend/src/app/`.

**Rationale**: App Router is the standard for Next.js 16+. It
provides built-in layouts, loading states, error boundaries, and
server/client component separation. All page specs map directly to
file-system routes.

**Alternatives considered**:
- Pages Router: Legacy pattern, lacks streaming and layouts. Rejected.

### 2. Better Auth Integration Pattern

**Decision**: Use Better Auth client SDK on the frontend with
session-based JWT. Configure an auth client that provides `signIn`,
`signUp`, `signOut`, and `getSession` methods. Use middleware for
route protection.

**Rationale**: Better Auth is the specified auth provider. It
handles JWT issuance and session management. The frontend only needs
the client SDK to interact with auth endpoints. Middleware intercepts
protected routes before rendering.

**Alternatives considered**:
- NextAuth.js: Mature but not specified in the constitution. Rejected
  per spec constraint.
- Custom JWT handling: Unnecessary complexity when Better Auth
  provides a client SDK. Rejected.

### 3. JWT Attachment for API Requests

**Decision**: Create a centralized API client utility that reads the
JWT from the Better Auth session and attaches it as an
`Authorization: Bearer <token>` header on every request to the
backend API.

**Rationale**: Constitution requires `Authorization: Bearer <JWT>`
on all API calls. A single API client function ensures consistent
header attachment and avoids duplication across pages.

**Alternatives considered**:
- Per-request manual header attachment: Error-prone, violates DRY.
  Rejected.
- Axios interceptors: Adds a dependency when native fetch + a thin
  wrapper suffices. Rejected.

### 4. State Management Approach

**Decision**: No global state management library. Use React Server
Components for data fetching, client-side `useState` for form state,
and URL-based state (route params) for navigation.

**Rationale**: The app is CRUD-only with no shared cross-page state
beyond auth. Server Components fetch data on navigation. Forms use
local state. No real-time updates needed. Adding Zustand or Redux
would be premature complexity.

**Alternatives considered**:
- Zustand: Lightweight but unnecessary for this scope. Rejected.
- React Context for tasks: Creates unnecessary client-side cache
  that conflicts with server-fetched data. Rejected.

### 5. Toast Notification Implementation

**Decision**: Use a lightweight toast context/provider with a client
component that manages toast state. Toasts are triggered by calling
a `showToast` function after mutations.

**Rationale**: The spec requires non-intrusive success/error toasts.
A context-based approach keeps the toast state isolated and avoids
prop drilling. No external library needed for the simple toast
behavior specified.

**Alternatives considered**:
- react-hot-toast / sonner: External dependencies for a simple
  feature. Acceptable but not required. The team may choose to use
  sonner for its animation quality if desired.
- Browser Notification API: Not appropriate for in-app feedback.
  Rejected.

### 6. Form Validation Strategy

**Decision**: Client-side validation using a lightweight approach:
validate on blur and on submit. Use Zod schemas for validation rules
shared between client validation and API request validation.

**Rationale**: Spec requires inline validation before network
requests (SC-004). Zod provides type-safe schema validation that can
be reused. No heavy form library needed for two simple forms.

**Alternatives considered**:
- React Hook Form + Zod: Adds a dependency; acceptable for larger
  forms but overkill for title + description. Rejected for Phase II.
- Manual validation: Acceptable for two fields but less maintainable.
  Zod keeps it structured.

### 7. Tailwind CSS Configuration

**Decision**: Use Tailwind CSS with default configuration plus a
minimal custom theme extension for brand colors and consistent
spacing.

**Rationale**: Spec requires professional SaaS-quality UI. Tailwind
provides utility-first styling with responsive breakpoints (sm, md,
lg) that map to the spec's viewport requirements (320px, 768px,
1024px).

**Alternatives considered**:
- CSS Modules: More isolated but slower to develop. Rejected for
  this timeline.
- shadcn/ui components: Provides pre-built accessible components on
  top of Tailwind. Acceptable and recommended for buttons, inputs,
  and modals to achieve professional polish faster.

### 8. Icon Library

**Decision**: Use Lucide React for icons (pencil, trash, checkmark,
warning, info, X, clipboard).

**Rationale**: Lucide is lightweight, tree-shakeable, and provides
all icons referenced in the component spec. It is the default icon
library for shadcn/ui if that is adopted.

**Alternatives considered**:
- Heroicons: Also lightweight but fewer icons. Acceptable.
- Font Awesome: Heavier bundle. Rejected.

## Summary of Decisions

| Topic                   | Decision                                    |
|-------------------------|---------------------------------------------|
| Routing                 | Next.js App Router, file-based              |
| Auth                    | Better Auth client SDK + middleware          |
| JWT attachment          | Centralized API client with Bearer header   |
| State management        | None (Server Components + local useState)   |
| Toasts                  | Context-based provider (or sonner)          |
| Validation              | Zod schemas, validate on blur + submit      |
| Styling                 | Tailwind CSS (consider shadcn/ui)           |
| Icons                   | Lucide React                                |

All NEEDS CLARIFICATION items from Technical Context: **resolved**.
