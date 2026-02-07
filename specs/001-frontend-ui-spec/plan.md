# Implementation Plan: Frontend UI for Phase II Todo Application

**Branch**: `001-frontend-ui-spec` | **Date**: 2026-02-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-frontend-ui-spec/spec.md`

## Summary

Build the complete frontend for a Todo application using Next.js 16+
App Router with TypeScript, Tailwind CSS, and Better Auth. The
frontend provides authentication (sign-in, sign-up, sign-out),
full CRUD for tasks (create, read, update, delete), and professional
UX with skeleton loaders, empty states, error handling, confirmation
modals, and toast notifications. All API calls attach JWT via
`Authorization: Bearer <token>` header. The frontend is untrusted
per the security constitution; all data ownership is enforced by the
backend.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 18+
**Primary Dependencies**: Next.js 16+, React 19, Tailwind CSS, Better Auth (client SDK), Zod, Lucide React
**Storage**: N/A (frontend only; backend manages persistence)
**Testing**: Vitest + React Testing Library (unit/component), Playwright (e2e)
**Target Platform**: Web browsers (desktop + mobile), deployed to Vercel or standalone
**Project Type**: Web application (frontend portion)
**Performance Goals**: Dashboard renders within 2 seconds (SC-003); forms validate instantly (SC-004)
**Constraints**: Responsive 320px-2560px (SC-005); no dark mode; no WebSockets
**Scale/Scope**: Single-user CRUD app, 8 pages, ~18 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | All pages and components derived from approved specs (spec.md, pages.md, components.md). No invented features. |
| II. Separation of Responsibilities | PASS | This plan covers frontend only. Backend, database, and integration are separate agent responsibilities. |
| III. No Manual Coding | PASS | All implementation will be performed via Claude Code. |
| Security: Frontend untrusted | PASS | Frontend attaches JWT but never trusts client-side data for ownership. Backend enforces all access rules. |
| Security: JWT on every request | PASS | Centralized API client attaches `Authorization: Bearer <JWT>` on every API call (research.md decision #3). |
| API: RESTful + stateless | PASS | All API calls are stateless REST with Bearer auth (contracts/api-tasks.md). |
| Workflow: Specs before plan | PASS | spec.md, pages.md, components.md all completed before this plan. |

**Post-Phase-1 re-check**: PASS — no violations introduced during design.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-ui-spec/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api-tasks.md     # Phase 1 output
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (html, body, font, toast provider)
│   │   ├── not-found.tsx           # Global 404 page (FR-016)
│   │   ├── sign-in/
│   │   │   └── page.tsx            # Sign In page
│   │   ├── sign-up/
│   │   │   └── page.tsx            # Sign Up page
│   │   └── (authenticated)/
│   │       ├── layout.tsx          # AppLayout wrapper (Header + content)
│   │       ├── dashboard/
│   │       │   ├── page.tsx        # Dashboard / Task List page
│   │       │   └── loading.tsx     # TaskCardSkeleton x 4
│   │       └── tasks/
│   │           ├── new/
│   │           │   └── page.tsx    # Create Task page
│   │           └── [id]/
│   │               ├── page.tsx    # Task Detail page
│   │               ├── loading.tsx # TaskDetailSkeleton
│   │               └── edit/
│   │                   ├── page.tsx    # Edit Task page
│   │                   └── loading.tsx # TaskFormSkeleton
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-layout.tsx      # AppLayout component
│   │   │   ├── auth-layout.tsx     # AuthLayout component
│   │   │   └── header.tsx          # Header component
│   │   ├── tasks/
│   │   │   ├── task-card.tsx       # TaskCard component
│   │   │   ├── task-list.tsx       # TaskList component
│   │   │   ├── task-form.tsx       # TaskForm component (create + edit)
│   │   │   └── task-detail.tsx     # TaskDetail component
│   │   ├── feedback/
│   │   │   ├── status-badge.tsx    # StatusBadge component
│   │   │   ├── toast.tsx           # Toast component
│   │   │   ├── toast-provider.tsx  # Toast context provider
│   │   │   ├── confirmation-modal.tsx # ConfirmationModal component
│   │   │   ├── empty-state.tsx     # EmptyState component
│   │   │   └── error-state.tsx     # ErrorState component
│   │   ├── skeletons/
│   │   │   ├── task-card-skeleton.tsx
│   │   │   ├── task-form-skeleton.tsx
│   │   │   └── task-detail-skeleton.tsx
│   │   └── ui/
│   │       ├── primary-button.tsx
│   │       ├── secondary-button.tsx
│   │       ├── danger-button.tsx
│   │       ├── text-input.tsx
│   │       ├── text-area.tsx
│   │       └── icon-button.tsx
│   ├── lib/
│   │   ├── api-client.ts          # Centralized fetch with JWT
│   │   ├── auth-client.ts         # Better Auth client configuration
│   │   └── validation.ts          # Zod schemas for task forms
│   ├── hooks/
│   │   └── use-toast.ts           # Toast hook (consume context)
│   └── types/
│       └── task.ts                # Task, CreateTaskPayload, UpdateTaskPayload
├── middleware.ts                   # Route protection (redirect unauth to /sign-in)
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Structure Decision**: Web application structure. Frontend is a
standalone Next.js project under `frontend/`. Backend will live under
`backend/` (separate agent responsibility). This separation ensures
clean boundaries per the constitution's Separation of Responsibilities
principle.

## Implementation Phases

### Phase 1: Project Setup & Configuration

**Purpose**: Initialize the Next.js project, install dependencies,
and configure tooling. This phase BLOCKS all subsequent work.

**Tasks**:

1. **Initialize Next.js project** in `frontend/` with App Router,
   TypeScript, Tailwind CSS, and ESLint.
   - Dependencies: next, react, react-dom, typescript, tailwindcss,
     postcss, autoprefixer, eslint
   - Spec ref: Technical Context

2. **Install runtime dependencies**: better-auth, zod, lucide-react.
   - Spec ref: research.md decisions #2, #6, #8

3. **Configure Tailwind** with custom theme extensions for brand
   colors (primary blue, danger red, success green, warning amber),
   and responsive breakpoints matching spec (sm:640px, md:768px,
   lg:1024px).
   - Spec ref: components.md (PrimaryButton, DangerButton,
     StatusBadge color definitions)

4. **Create TypeScript type definitions** in `src/types/task.ts`:
   Task, CreateTaskPayload, UpdateTaskPayload types matching
   data-model.md.
   - Spec ref: data-model.md

5. **Create Zod validation schemas** in `src/lib/validation.ts`:
   createTaskSchema (title required max 200, description optional
   max 2000), signUpSchema (email, password min 8, confirmPassword
   match), signInSchema (email, password).
   - Spec ref: data-model.md validation rules

6. **Create environment configuration**: `.env.example` with
   `NEXT_PUBLIC_API_URL` and Better Auth config variables.
   - Spec ref: quickstart.md

**Checkpoint**: Project builds, lints, and serves an empty page.

---

### Phase 2: Authentication Infrastructure

**Purpose**: Set up Better Auth client, middleware for route
protection, and the centralized API client. This phase BLOCKS all
authenticated pages.

**Tasks**:

7. **Configure Better Auth client** in `src/lib/auth-client.ts`.
   Initialize the Better Auth client SDK with the server URL.
   Expose `signIn`, `signUp`, `signOut`, `getSession` methods.
   - Spec ref: research.md decision #2

8. **Create API client** in `src/lib/api-client.ts`. A function
   that wraps `fetch`, reads the JWT from the Better Auth session,
   attaches `Authorization: Bearer <token>` header, and handles
   401 responses (redirect to sign-in with session-expired message).
   - Spec ref: research.md decision #3, constitution Security rules,
     contracts/api-tasks.md

9. **Create route protection middleware** in `frontend/middleware.ts`.
   Check for valid auth session on all routes under `(authenticated)`.
   Redirect to `/sign-in` if no session. Redirect authenticated users
   away from `/sign-in` and `/sign-up` to `/dashboard`.
   - Spec ref: pages.md (auth requirements for each route), FR-003

**Checkpoint**: Middleware redirects work. API client attaches JWT.

---

### Phase 3: Layout & Atomic Components

**Purpose**: Build the layout shells and primitive UI components that
all pages depend on. This phase BLOCKS all page implementation.

**Tasks**:

10. **Build AuthLayout component** (`components/layout/auth-layout.tsx`).
    Centered card on neutral background, max-width 420px, app name
    above card, responsive.
    - Spec ref: components.md AuthLayout

11. **Build Header component** (`components/layout/header.tsx`).
    App name (left, links to /dashboard), user email + sign-out
    button (right). Mobile: hide email, show sign-out icon only.
    - Spec ref: components.md Header

12. **Build AppLayout component** (`components/layout/app-layout.tsx`).
    Header + centered content area (max-width 960px).
    - Spec ref: components.md AppLayout

13. **Build PrimaryButton** (`components/ui/primary-button.tsx`).
    Blue background, white text, loading spinner, disabled state,
    fullWidth option. All interaction states per spec.
    - Spec ref: components.md PrimaryButton

14. **Build SecondaryButton** (`components/ui/secondary-button.tsx`).
    Light background with border, same interface as PrimaryButton.
    - Spec ref: components.md SecondaryButton

15. **Build DangerButton** (`components/ui/danger-button.tsx`).
    Red background, white text, same interface as PrimaryButton.
    - Spec ref: components.md DangerButton

16. **Build IconButton** (`components/ui/icon-button.tsx`).
    Icon-only 32x32 button, variant colors on hover, aria-label.
    - Spec ref: components.md IconButton

17. **Build TextInput** (`components/ui/text-input.tsx`).
    Label, placeholder, error display, required indicator, character
    counter, focus/error/disabled states.
    - Spec ref: components.md TextInput

18. **Build TextArea** (`components/ui/text-area.tsx`).
    Same as TextInput but multi-line, resizable, rows prop.
    - Spec ref: components.md TextArea

19. **Build StatusBadge** (`components/feedback/status-badge.tsx`).
    Pill badge: amber for pending, green for completed. Fixed width.
    - Spec ref: components.md StatusBadge

**Checkpoint**: All atomic components render correctly in isolation.

---

### Phase 4: Feedback & Skeleton Components

**Purpose**: Build the toast system, modals, state components, and
skeletons. These are required by multiple pages.

**Tasks**:

20. **Build Toast component + ToastProvider**
    (`components/feedback/toast.tsx`, `toast-provider.tsx`,
    `hooks/use-toast.ts`). Toast context, slide-in animation,
    auto-dismiss (4s success, persistent error), hover pause,
    close button, variant styling.
    - Spec ref: components.md Toast

21. **Build ConfirmationModal** (`components/feedback/confirmation-modal.tsx`).
    Dimmed backdrop, centered card, title + message + confirm/cancel
    buttons. Escape key and backdrop click dismiss. Processing state
    disables buttons.
    - Spec ref: components.md ConfirmationModal

22. **Build EmptyState** (`components/feedback/empty-state.tsx`).
    Centered icon, heading, subtext, action button.
    - Spec ref: components.md EmptyState

23. **Build ErrorState** (`components/feedback/error-state.tsx`).
    Centered icon, error message, "Try Again" button.
    - Spec ref: components.md ErrorState

24. **Build TaskCardSkeleton** (`components/skeletons/task-card-skeleton.tsx`).
    Pulsing bars matching TaskCard dimensions. 1.5s opacity animation.
    - Spec ref: components.md TaskCardSkeleton

25. **Build TaskFormSkeleton** (`components/skeletons/task-form-skeleton.tsx`).
    Pulsing bars matching TaskForm dimensions.
    - Spec ref: components.md TaskFormSkeleton

26. **Build TaskDetailSkeleton** (`components/skeletons/task-detail-skeleton.tsx`).
    Pulsing bars matching TaskDetail dimensions.
    - Spec ref: components.md TaskDetailSkeleton

27. **Wire ToastProvider into root layout** (`app/layout.tsx`).
    Wrap children with ToastProvider so all pages can use `useToast`.
    - Spec ref: components.md Toast (global availability)

**Checkpoint**: All feedback components render. Toast system works.

---

### Phase 5: Task Components

**Purpose**: Build the task-specific components that compose the
CRUD pages.

**Tasks**:

28. **Build TaskCard** (`components/tasks/task-card.tsx`).
    Title (truncated), creation date, StatusBadge, edit/delete
    IconButtons. Hover state, completed strikethrough, click handler.
    - Spec ref: components.md TaskCard
    - Depends on: StatusBadge (#19), IconButton (#16)

29. **Build TaskList** (`components/tasks/task-list.tsx`).
    Vertical stack of TaskCards. Orders by creation date (newest
    first).
    - Spec ref: components.md TaskList
    - Depends on: TaskCard (#28)

30. **Build TaskForm** (`components/tasks/task-form.tsx`).
    Title TextInput + Description TextArea + status toggle (edit
    mode only) + submit/cancel buttons. Inline validation using Zod
    schemas. Submitting state disables all fields.
    - Spec ref: components.md TaskForm
    - Depends on: TextInput (#17), TextArea (#18), PrimaryButton (#13),
      SecondaryButton (#14), validation.ts (#5)

31. **Build TaskDetail** (`components/tasks/task-detail.tsx`).
    Title heading + StatusBadge + description block + metadata row +
    Edit/Delete/Back buttons.
    - Spec ref: components.md TaskDetail
    - Depends on: StatusBadge (#19), SecondaryButton (#14),
      DangerButton (#15)

**Checkpoint**: All task components render with mock data.

---

### Phase 6: Authentication Pages (User Story 1 — P1)

**Purpose**: Implement sign-in and sign-up pages. This is the first
user-facing functionality.

**Tasks**:

32. **Build Sign In page** (`app/sign-in/page.tsx`).
    AuthLayout wrapper. Email + password fields. "Sign In" button.
    Link to sign-up. Inline validation. Loading state on submit.
    Error banner for invalid credentials. Redirect to /dashboard on
    success. Call Better Auth `signIn`.
    - Spec ref: pages.md Sign In Page, US1
    - Depends on: AuthLayout (#10), TextInput (#17), PrimaryButton (#13)

33. **Build Sign Up page** (`app/sign-up/page.tsx`).
    AuthLayout wrapper. Email + password + confirm-password fields.
    "Sign Up" button. Link to sign-in. Inline validation (email
    format, password min 8, confirm match). Loading state. Error
    banner. Auto sign-in + redirect to /dashboard on success.
    - Spec ref: pages.md Sign Up Page, US1
    - Depends on: AuthLayout (#10), TextInput (#17), PrimaryButton (#13)

34. **Build root layout** (`app/layout.tsx`).
    HTML structure, font loading, global styles, ToastProvider.
    - Spec ref: quickstart.md project structure
    - Depends on: ToastProvider (#27)

**Checkpoint**: Users can sign up, sign in, sign out. Auth redirects
work. US1 complete.

---

### Phase 7: Dashboard Page (User Story 2 — P1)

**Purpose**: Implement the task dashboard with all states.

**Tasks**:

35. **Build Dashboard page** (`app/(authenticated)/dashboard/page.tsx`).
    Fetch tasks via API client. Render TaskList when populated,
    EmptyState when empty, ErrorState on failure. "New Task" button
    navigates to /tasks/new. Delete triggers ConfirmationModal then
    API call. Success/error toasts after delete.
    - Spec ref: pages.md Dashboard, US2, US5
    - Depends on: TaskList (#29), EmptyState (#22), ErrorState (#23),
      ConfirmationModal (#21), api-client (#8), use-toast (#20)

36. **Build Dashboard loading state**
    (`app/(authenticated)/dashboard/loading.tsx`).
    Render 4 TaskCardSkeletons.
    - Spec ref: pages.md Dashboard Loading state
    - Depends on: TaskCardSkeleton (#24)

37. **Build authenticated layout**
    (`app/(authenticated)/layout.tsx`).
    Wrap children with AppLayout (Header + content area).
    - Spec ref: components.md AppLayout
    - Depends on: AppLayout (#12)

**Checkpoint**: Dashboard shows tasks, empty state, loading skeletons,
and error state. US2 complete.

---

### Phase 8: Create Task Page (User Story 3 — P1)

**Purpose**: Implement the create-task form page.

**Tasks**:

38. **Build Create Task page** (`app/(authenticated)/tasks/new/page.tsx`).
    TaskForm in create mode. Submit calls POST /api/tasks via API
    client. On success: redirect to /dashboard + success toast.
    On failure: inline error banner. Cancel navigates back.
    - Spec ref: pages.md Create Task Page, US3
    - Depends on: TaskForm (#30), api-client (#8), use-toast (#20)

**Checkpoint**: Users can create tasks. US3 complete. MVP checkpoint
(US1 + US2 + US3 = core functional app).

---

### Phase 9: Edit Task Page (User Story 4 — P2)

**Purpose**: Implement the edit-task form page with pre-populated data.

**Tasks**:

39. **Build Edit Task page**
    (`app/(authenticated)/tasks/[id]/edit/page.tsx`).
    Fetch task by ID via API client. Pre-populate TaskForm in edit
    mode (title, description, status toggle). Submit calls
    PUT /api/tasks/{id}. On success: redirect to /dashboard + toast.
    On 404: render "Task not found" state. Loading: TaskFormSkeleton.
    - Spec ref: pages.md Edit Task Page, US4
    - Depends on: TaskForm (#30), api-client (#8), use-toast (#20)

40. **Build Edit Task loading state**
    (`app/(authenticated)/tasks/[id]/edit/loading.tsx`).
    Render TaskFormSkeleton.
    - Spec ref: pages.md Edit Task Loading state
    - Depends on: TaskFormSkeleton (#25)

**Checkpoint**: Users can edit tasks and toggle status. US4 complete.

---

### Phase 10: Task Detail Page (User Story 6 — P3)

**Purpose**: Implement the read-only task detail page.

**Tasks**:

41. **Build Task Detail page**
    (`app/(authenticated)/tasks/[id]/page.tsx`).
    Fetch task by ID via API client. Render TaskDetail component.
    Edit button navigates to /tasks/{id}/edit. Delete triggers
    ConfirmationModal. Back button navigates to /dashboard. On 404:
    "Task not found". On error: ErrorState.
    - Spec ref: pages.md Task Detail Page, US6
    - Depends on: TaskDetail (#31), ConfirmationModal (#21),
      ErrorState (#23), api-client (#8), use-toast (#20)

42. **Build Task Detail loading state**
    (`app/(authenticated)/tasks/[id]/loading.tsx`).
    Render TaskDetailSkeleton.
    - Spec ref: pages.md Task Detail Loading state
    - Depends on: TaskDetailSkeleton (#26)

**Checkpoint**: Users can view full task details. US6 complete.

---

### Phase 11: Error Pages & Global Handling

**Purpose**: Implement 404 and unauthorized handling.

**Tasks**:

43. **Build global 404 page** (`app/not-found.tsx`).
    Centered "404" heading, subtext, action button (dashboard if
    auth, sign-in if not).
    - Spec ref: pages.md 404 Not Found Page, FR-016

44. **Implement 401/session-expired handling** in API client.
    When any API call returns 401, show session-expired overlay and
    redirect to /sign-in.
    - Spec ref: pages.md Unauthorized page, edge case (JWT expiry)

**Checkpoint**: All error states handled. FR-016, FR-017 complete.

---

### Phase 12: Polish & Accessibility

**Purpose**: Final quality improvements and responsive verification.

**Tasks**:

45. **Responsive audit**: Test all pages at 320px, 768px, 1024px,
    2560px. Fix any layout issues, ensure no horizontal scroll.
    - Spec ref: FR-015, SC-005

46. **Keyboard navigation audit**: Verify all interactive elements
    are focusable, focus rings are visible, modals trap focus,
    Escape key closes modals.
    - Spec ref: components.md interaction states (Focus states)

47. **Accessibility check**: Verify all buttons have accessible
    labels (especially IconButtons), images have alt text, form
    fields have associated labels, color contrast meets WCAG AA.
    - Spec ref: components.md IconButton (ariaLabel)

**Checkpoint**: All quality and accessibility checks pass. SC-005,
SC-008 verified.

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)           → no dependencies
Phase 2 (Auth Infra)      → depends on Phase 1
Phase 3 (Layouts/Atoms)   → depends on Phase 1
Phase 4 (Feedback/Skels)  → depends on Phase 3
Phase 5 (Task Components) → depends on Phase 3, Phase 4
Phase 6 (Auth Pages)      → depends on Phase 2, Phase 3
Phase 7 (Dashboard)       → depends on Phase 2, Phase 4, Phase 5
Phase 8 (Create Task)     → depends on Phase 5, Phase 7
Phase 9 (Edit Task)       → depends on Phase 5, Phase 7
Phase 10 (Task Detail)    → depends on Phase 5, Phase 7
Phase 11 (Error Pages)    → depends on Phase 2
Phase 12 (Polish)         → depends on all previous phases
```

### Parallel Opportunities

- Phase 2 and Phase 3 can run in parallel (both depend only on Phase 1).
- Within Phase 3: all atomic components (#13-#19) can be built in
  parallel.
- Within Phase 4: all feedback and skeleton components can be built
  in parallel.
- Within Phase 5: TaskCard, TaskForm, TaskDetail can be built in
  parallel (TaskList depends on TaskCard).
- Phase 8, Phase 9, and Phase 10 can run in parallel after Phase 7.
- Phase 11 can run in parallel with Phases 8-10.

### MVP Milestone

After Phase 8 (Create Task), the application has a complete MVP:
- Users can sign up, sign in, sign out (US1)
- Users can view their tasks (US2)
- Users can create tasks (US3)
- All core feedback (skeletons, empty state, toasts) functional

### Full Feature Milestone

After Phase 10 (Task Detail), all 6 user stories are complete.
Phase 11-12 add robustness and polish.

## Complexity Tracking

No constitution violations to justify. The plan adheres to all
principles without exceptions.
