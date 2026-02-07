# Pages Specification: Frontend UI

**Feature Branch**: `001-frontend-ui-spec`
**Created**: 2026-02-05
**Status**: Draft

## Overview

This document defines every page in the application, its purpose,
route, authentication requirements, layout, user interactions, and
visual states (loading, empty, error). Pages are listed in priority
order matching the feature spec.

---

## 1. Sign In Page

**Purpose**: Allow returning users to authenticate with email and
password.

**Route**: `/sign-in`

**Authentication**: Public (unauthenticated only). Authenticated
users visiting this route MUST be redirected to `/dashboard`.

**Layout**:
- Centered card on a neutral background.
- Application logo or name at the top of the card.
- Email field, password field, submit button.
- Link to sign-up page below the form: "Don't have an account?
  Sign up".
- No header, sidebar, or footer — standalone auth layout.

**User Interactions**:
- User enters email and password and clicks "Sign In".
- Inline validation: email field requires a valid email format;
  password field requires a non-empty value.
- On success: redirect to `/dashboard`.
- On failure (invalid credentials): display an inline error banner
  above the form. Email field retains its value; password field is
  cleared.
- Submit button shows a loading indicator while the request is in
  flight and is disabled to prevent double-click.

**States**:
- **Default**: Form with empty fields and enabled submit button.
- **Validating**: Inline error text below invalid fields on blur or
  submit.
- **Loading**: Submit button label changes to a spinner + "Signing
  in..." and is disabled.
- **Error**: Inline error banner above the form with a user-readable
  message (e.g., "Invalid email or password").

---

## 2. Sign Up Page

**Purpose**: Allow new users to create an account.

**Route**: `/sign-up`

**Authentication**: Public (unauthenticated only). Authenticated
users visiting this route MUST be redirected to `/dashboard`.

**Layout**:
- Same centered-card layout as Sign In for visual consistency.
- Email field, password field, confirm-password field, submit button.
- Link to sign-in page: "Already have an account? Sign in".

**User Interactions**:
- User fills all fields and clicks "Sign Up".
- Inline validation:
  - Email: valid format.
  - Password: minimum 8 characters.
  - Confirm password: must match password field.
- On success: account is created, user is signed in automatically,
  and redirected to `/dashboard`.
- On failure (e.g., email already registered): inline error banner
  above the form.

**States**:
- **Default**: Empty form with enabled submit button.
- **Validating**: Inline error text below invalid fields.
- **Loading**: Submit button shows spinner + "Creating account..."
  and is disabled.
- **Error**: Inline error banner above the form (e.g., "An account
  with this email already exists").

---

## 3. Dashboard (Task List)

**Purpose**: Display all tasks owned by the authenticated user. This
is the primary landing page after sign-in.

**Route**: `/dashboard`

**Authentication**: Protected. Unauthenticated users MUST be
redirected to `/sign-in`.

**Layout**:
- App Layout wrapper (header + main content area).
- Header contains: application name/logo (left), user email or
  avatar (right), sign-out button (right).
- Main content area:
  - Page heading: "My Tasks".
  - "New Task" primary action button (top-right of content area).
  - Task list below the heading.
- No sidebar for Phase II (single-column layout).

**User Interactions**:
- User sees all their tasks as Task Card components in a vertical
  list, ordered by creation date (newest first).
- Clicking a task card navigates to the task detail page.
- Each task card has inline action icons: edit (pencil) and delete
  (trash).
- Clicking edit navigates to `/tasks/{id}/edit`.
- Clicking delete opens the confirmation modal.
- Clicking "New Task" navigates to `/tasks/new`.
- Clicking sign-out terminates the session and redirects to
  `/sign-in`.

**States**:
- **Loading**: 3-5 skeleton task-card placeholders with pulsing
  animation. No spinner.
- **Empty**: Centered illustration or icon, heading "No tasks yet",
  subtext "Create your first task to get started", and a primary
  "Create Task" button.
- **Error**: Centered error message with a "Try Again" button.
- **Populated**: Scrollable list of task cards.

---

## 4. Create Task Page

**Purpose**: Allow the user to create a new task.

**Route**: `/tasks/new`

**Authentication**: Protected.

**Layout**:
- App Layout wrapper.
- Page heading: "Create Task".
- Task Form component.
- Two buttons at the bottom: "Create Task" (primary), "Cancel"
  (secondary).

**User Interactions**:
- User enters a title (required, max 200 characters) and an
  optional description (max 2000 characters).
- Inline validation triggers on blur and on submit.
- Clicking "Create Task" submits the form.
- On success: redirect to `/dashboard` with a success toast
  ("Task created").
- On failure: inline error banner above the form.
- Clicking "Cancel" navigates back to `/dashboard` without saving.

**States**:
- **Default**: Empty form, submit button enabled.
- **Validating**: Inline error below title field if empty or
  exceeds max length.
- **Submitting**: Submit button shows spinner + "Creating..." and
  is disabled. Cancel button is also disabled.
- **Error**: Inline error banner above the form.

---

## 5. Edit Task Page

**Purpose**: Allow the user to modify an existing task's title,
description, and status.

**Route**: `/tasks/{id}/edit`

**Authentication**: Protected. The task MUST belong to the
authenticated user; otherwise display a "Not Found" state.

**Layout**:
- App Layout wrapper.
- Page heading: "Edit Task".
- Task Form component pre-populated with the task's current values.
- Status toggle: a checkbox or switch labeled "Mark as completed".
- Two buttons: "Save Changes" (primary), "Cancel" (secondary).

**User Interactions**:
- On page load, the form fields are filled with the task's current
  title, description, and status.
- User modifies any fields and clicks "Save Changes".
- Inline validation: same rules as Create Task.
- On success: redirect to `/dashboard` with a success toast
  ("Task updated").
- On failure: inline error banner.
- Clicking "Cancel" returns to `/dashboard` without saving.

**States**:
- **Loading**: Skeleton form placeholder while task data is fetched.
- **Default**: Pre-populated form, submit button enabled.
- **Validating**: Inline errors on invalid fields.
- **Submitting**: Submit button shows spinner + "Saving..." and is
  disabled.
- **Not Found**: If the task does not exist or is not owned by the
  user, display a centered "Task not found" message with a "Back to
  Dashboard" link.
- **Error**: Inline error banner for API failures.

---

## 6. Task Detail Page

**Purpose**: Display the full details of a single task in a
read-only view.

**Route**: `/tasks/{id}`

**Authentication**: Protected. The task MUST belong to the
authenticated user; otherwise display a "Not Found" state.

**Layout**:
- App Layout wrapper.
- Breadcrumb: Dashboard > Task Detail.
- Task title as the page heading.
- Status badge next to the title.
- Description displayed as a text block below the title.
- Metadata row: "Created: [date]" and "Last modified: [date]".
- Action buttons: "Edit" (secondary), "Delete" (danger), "Back to
  Dashboard" (text link or ghost button).

**User Interactions**:
- Clicking "Edit" navigates to `/tasks/{id}/edit`.
- Clicking "Delete" opens the confirmation modal.
- Clicking "Back to Dashboard" navigates to `/dashboard`.

**States**:
- **Loading**: Skeleton placeholders for title, badge, description,
  and metadata.
- **Default**: All task fields rendered.
- **Not Found**: Centered "Task not found" message with a link back
  to the dashboard.
- **Error**: Error message with a "Try Again" button.

---

## 7. 404 Not Found Page

**Purpose**: Display a user-friendly message when the user navigates
to a route that does not exist.

**Route**: Any unmatched route.

**Authentication**: None required (displays for both authenticated
and unauthenticated users).

**Layout**:
- Centered content on a neutral background.
- Large "404" heading or illustration.
- Subtext: "The page you're looking for doesn't exist."
- Primary button: "Go to Dashboard" (if authenticated) or "Go to
  Sign In" (if unauthenticated).

**User Interactions**:
- User clicks the action button and is navigated to the appropriate
  page.

**States**:
- Single static state. No loading or error variants.

---

## 8. Unauthorized / Session Expired Page

**Purpose**: Inform the user that their session has expired or they
are not authorized to access the requested resource.

**Route**: Displayed inline when a 401 response is received from any
API call, or when middleware detects an expired/invalid JWT.

**Authentication**: N/A (this is an error state, not a standalone
route).

**Layout**:
- If mid-session (e.g., API returns 401 during a fetch): a modal or
  full-page overlay with a message and a "Sign In Again" button.
- Message: "Your session has expired. Please sign in again."

**User Interactions**:
- User clicks "Sign In Again" and is redirected to `/sign-in`.
- Any unsaved form data is lost (documented as expected behavior).

**States**:
- Single state. Displayed as an overlay or redirect.

---

## Route Summary Table

| Route              | Auth Required | Purpose                |
|--------------------|---------------|------------------------|
| `/sign-in`         | No            | User sign-in           |
| `/sign-up`         | No            | User registration      |
| `/dashboard`       | Yes           | Task list (home)       |
| `/tasks/new`       | Yes           | Create new task        |
| `/tasks/{id}`      | Yes           | Task detail view       |
| `/tasks/{id}/edit` | Yes           | Edit existing task     |
| `*` (unmatched)    | No            | 404 page               |
