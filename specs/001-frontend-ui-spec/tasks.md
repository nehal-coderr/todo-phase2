# Tasks: Frontend UI for Phase II Todo Application

**Input**: Design documents from `/specs/001-frontend-ui-spec/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-tasks.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` for source, `frontend/` for config files
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Next.js project, install dependencies, and create shared configuration files. This phase BLOCKS all subsequent work.

- [ ] T001 Initialize Next.js project in `frontend/` with App Router, TypeScript, Tailwind CSS, and ESLint using `create-next-app`
- [ ] T002 Install runtime dependencies (better-auth, zod, lucide-react) in `frontend/`
- [ ] T003 [P] Configure Tailwind CSS custom theme (brand colors: primary blue, danger red, success green, warning amber) in `frontend/tailwind.config.ts`
- [ ] T004 [P] Create TypeScript type definitions (Task, CreateTaskPayload, UpdateTaskPayload) in `frontend/src/types/task.ts` per data-model.md
- [ ] T005 [P] Create Zod validation schemas (createTaskSchema, signUpSchema, signInSchema) in `frontend/src/lib/validation.ts` per data-model.md validation rules
- [ ] T006 [P] Create environment configuration file `frontend/.env.example` with NEXT_PUBLIC_API_URL and Better Auth variables per quickstart.md

**Checkpoint**: Project builds (`npm run build`), lints (`npm run lint`), and serves an empty page (`npm run dev`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Includes auth client, API client, middleware, layouts, all atomic UI components, feedback components, and skeleton components.

**CRITICAL**: No user story work can begin until this phase is complete.

### Authentication & API Infrastructure

- [ ] T007 Configure Better Auth client SDK in `frontend/src/lib/auth-client.ts` exposing signIn, signUp, signOut, getSession methods per research.md decision #2
- [ ] T008 Create centralized API client in `frontend/src/lib/api-client.ts` that wraps fetch, attaches Authorization: Bearer JWT header from Better Auth session, and handles 401 responses per contracts/api-tasks.md and research.md decision #3
- [ ] T009 Create route protection middleware in `frontend/middleware.ts` that redirects unauthenticated users to /sign-in on protected routes and redirects authenticated users away from /sign-in and /sign-up to /dashboard per pages.md auth requirements

### Layout Components

- [ ] T010 [P] Build AuthLayout component in `frontend/src/components/layout/auth-layout.tsx` with centered card (max-width 420px), app name above card, neutral background, responsive mobile layout per components.md AuthLayout
- [ ] T011 [P] Build Header component in `frontend/src/components/layout/header.tsx` with app name linking to /dashboard (left), user email + sign-out button (right), mobile-responsive (hide email on mobile) per components.md Header
- [ ] T012 Build AppLayout component in `frontend/src/components/layout/app-layout.tsx` composing Header + centered content area (max-width 960px) per components.md AppLayout (depends on T011)

### Atomic UI Components

- [ ] T013 [P] Build PrimaryButton component in `frontend/src/components/ui/primary-button.tsx` with blue background, white text, loading spinner, disabled state, fullWidth option, all interaction states per components.md PrimaryButton
- [ ] T014 [P] Build SecondaryButton component in `frontend/src/components/ui/secondary-button.tsx` with light background, border, same interface as PrimaryButton per components.md SecondaryButton
- [ ] T015 [P] Build DangerButton component in `frontend/src/components/ui/danger-button.tsx` with red background, white text, same interface as PrimaryButton per components.md DangerButton
- [ ] T016 [P] Build IconButton component in `frontend/src/components/ui/icon-button.tsx` with 32x32 icon-only button, variant colors on hover (primary blue, danger red), aria-label per components.md IconButton
- [ ] T017 [P] Build TextInput component in `frontend/src/components/ui/text-input.tsx` with label, placeholder, error display, required asterisk indicator, character counter, focus/error/disabled states per components.md TextInput
- [ ] T018 [P] Build TextArea component in `frontend/src/components/ui/text-area.tsx` with multi-line input, resizable, rows prop, same validation display as TextInput per components.md TextArea
- [ ] T019 [P] Build StatusBadge component in `frontend/src/components/feedback/status-badge.tsx` with pill shape, amber/yellow for pending, green for completed, fixed width per components.md StatusBadge

### Feedback Components

- [ ] T020 Build Toast component, ToastProvider context, and useToast hook in `frontend/src/components/feedback/toast.tsx`, `frontend/src/components/feedback/toast-provider.tsx`, and `frontend/src/hooks/use-toast.ts` with slide-in animation, auto-dismiss (4s success, persistent error), hover pause, close button, variant styling (success/error/info) per components.md Toast
- [ ] T021 [P] Build ConfirmationModal component in `frontend/src/components/feedback/confirmation-modal.tsx` with dimmed backdrop, centered card (max-width 480px), title + message + confirm/cancel buttons, Escape key dismiss, backdrop click dismiss, processing state per components.md ConfirmationModal
- [ ] T022 [P] Build EmptyState component in `frontend/src/components/feedback/empty-state.tsx` with centered icon, heading, subtext, action button per components.md EmptyState
- [ ] T023 [P] Build ErrorState component in `frontend/src/components/feedback/error-state.tsx` with centered icon, error message, "Try Again" button per components.md ErrorState

### Skeleton Components

- [ ] T024 [P] Build TaskCardSkeleton component in `frontend/src/components/skeletons/task-card-skeleton.tsx` with pulsing gray bars matching TaskCard dimensions, 1.5s opacity animation per components.md TaskCardSkeleton
- [ ] T025 [P] Build TaskFormSkeleton component in `frontend/src/components/skeletons/task-form-skeleton.tsx` with pulsing bars matching TaskForm layout per components.md TaskFormSkeleton
- [ ] T026 [P] Build TaskDetailSkeleton component in `frontend/src/components/skeletons/task-detail-skeleton.tsx` with pulsing bars matching TaskDetail layout per components.md TaskDetailSkeleton

### Task-Specific Components

- [ ] T027 Build TaskCard component in `frontend/src/components/tasks/task-card.tsx` with title (truncated ellipsis), creation date, StatusBadge, edit/delete IconButtons, hover state, completed strikethrough, click handler per components.md TaskCard (depends on T016, T019)
- [ ] T028 Build TaskList component in `frontend/src/components/tasks/task-list.tsx` rendering vertical stack of TaskCards ordered by creation date (newest first) per components.md TaskList (depends on T027)
- [ ] T029 Build TaskForm component in `frontend/src/components/tasks/task-form.tsx` with title TextInput + description TextArea + status toggle (edit mode only) + submit/cancel buttons, inline Zod validation on blur and submit, submitting state disables all fields per components.md TaskForm (depends on T005, T013, T014, T017, T018)
- [ ] T030 Build TaskDetail component in `frontend/src/components/tasks/task-detail.tsx` with title heading + StatusBadge + description block + metadata row (created/modified dates) + Edit/Delete/Back buttons per components.md TaskDetail (depends on T014, T015, T019)

### Root Layout

- [ ] T031 Build root layout in `frontend/src/app/layout.tsx` with HTML structure, font loading (next/font), global Tailwind styles, and ToastProvider wrapping children per plan.md Phase 6 and quickstart.md (depends on T020)

**Checkpoint**: All components render correctly. Auth client configured. API client attaches JWT. Middleware redirects work. Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Sign Up and Sign In (Priority: P1)

**Goal**: Users can create accounts, sign in, sign out, and are redirected appropriately based on auth state.

**Independent Test**: Create an account on /sign-up, verify redirect to /dashboard, sign out, sign in on /sign-in, verify redirect to /dashboard. Try accessing /dashboard while unauthenticated, verify redirect to /sign-in.

### Implementation for User Story 1

- [ ] T032 [P] [US1] Build Sign In page in `frontend/src/app/sign-in/page.tsx` with AuthLayout wrapper, email + password TextInputs, "Sign In" PrimaryButton, link to /sign-up, inline validation (email format, password non-empty), loading state on submit, error banner for invalid credentials, redirect to /dashboard on success, call Better Auth signIn per pages.md Sign In Page
- [ ] T033 [P] [US1] Build Sign Up page in `frontend/src/app/sign-up/page.tsx` with AuthLayout wrapper, email + password + confirm-password TextInputs, "Sign Up" PrimaryButton, link to /sign-in, inline Zod validation (email format, password min 8, confirm match), loading state, error banner, auto sign-in + redirect to /dashboard on success per pages.md Sign Up Page

**Checkpoint**: Users can sign up, sign in, sign out. Auth redirects work for protected and public routes. US1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - View Task Dashboard (Priority: P1)

**Goal**: Authenticated users see all their tasks on the dashboard with loading skeletons, empty state, and error handling.

**Independent Test**: Sign in, view dashboard with no tasks (verify empty state with "Create Task" CTA), create a task via API/other means, refresh dashboard (verify task card with title, status badge, creation date). Simulate API error (verify error state with "Try Again" button).

### Implementation for User Story 2

- [ ] T034 [US2] Build authenticated layout in `frontend/src/app/(authenticated)/layout.tsx` wrapping children with AppLayout (Header + centered content area) per plan.md Phase 7 (depends on T012)
- [ ] T035 [US2] Build Dashboard page in `frontend/src/app/(authenticated)/dashboard/page.tsx` fetching tasks via API client (GET /api/tasks), rendering TaskList when populated, EmptyState when empty (heading "No tasks yet", subtext "Create your first task to get started", "Create Task" button navigating to /tasks/new), ErrorState on API failure with retry, "New Task" PrimaryButton at top-right navigating to /tasks/new per pages.md Dashboard (depends on T008, T022, T023, T028)
- [ ] T036 [P] [US2] Build Dashboard loading state in `frontend/src/app/(authenticated)/dashboard/loading.tsx` rendering 4 TaskCardSkeletons per pages.md Dashboard Loading state (depends on T024)

**Checkpoint**: Dashboard shows task list, empty state, loading skeletons, and error state correctly. US2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Create a New Task (Priority: P1) MVP

**Goal**: Authenticated users can create a new task with a title and optional description, with inline validation and success feedback.

**Independent Test**: Navigate to /tasks/new, submit without title (verify inline error), enter a title and submit (verify redirect to /dashboard with success toast "Task created" and new task visible in list). Click Cancel (verify return to dashboard without creating task).

### Implementation for User Story 3

- [ ] T037 [US3] Build Create Task page in `frontend/src/app/(authenticated)/tasks/new/page.tsx` with page heading "Create Task", TaskForm in create mode, submit calls POST /api/tasks via API client, on success redirect to /dashboard + success toast "Task created", on failure show inline error banner, Cancel navigates to /dashboard per pages.md Create Task Page (depends on T008, T020, T029)

**Checkpoint**: Users can create tasks with validation, loading state, and success feedback. US1 + US2 + US3 = complete MVP. Stop and validate.

---

## Phase 6: User Story 4 - Edit an Existing Task (Priority: P2)

**Goal**: Authenticated users can edit a task's title, description, and status with pre-populated form.

**Independent Test**: Navigate to /tasks/{id}/edit for an existing task, verify form is pre-populated. Change the title and submit (verify redirect to /dashboard with toast "Task updated" and updated title visible). Toggle status to "completed" and submit (verify status badge change). Navigate to /tasks/nonexistent/edit (verify "Task not found" message).

### Implementation for User Story 4

- [ ] T038 [US4] Build Edit Task page in `frontend/src/app/(authenticated)/tasks/[id]/edit/page.tsx` fetching task by ID via API client (GET /api/tasks/{id}), pre-populating TaskForm in edit mode (title, description, status toggle), submit calls PUT /api/tasks/{id}, on success redirect to /dashboard + toast "Task updated", on 404 render "Task not found" with "Back to Dashboard" link, on error show inline error banner per pages.md Edit Task Page (depends on T008, T020, T029)
- [ ] T039 [P] [US4] Build Edit Task loading state in `frontend/src/app/(authenticated)/tasks/[id]/edit/loading.tsx` rendering TaskFormSkeleton per pages.md Edit Task Loading state (depends on T025)

**Checkpoint**: Users can edit tasks and toggle status. US4 is fully functional and testable independently.

---

## Phase 7: User Story 5 - Delete a Task (Priority: P2)

**Goal**: Authenticated users can delete a task with confirmation dialog, and the task is removed from the dashboard.

**Independent Test**: On the dashboard, click the delete icon on a task card. Verify confirmation modal shows task title and irreversible warning. Click Cancel (verify task remains). Click Delete again, confirm (verify task is removed from list and success toast "Task deleted" appears).

### Implementation for User Story 5

- [ ] T040 [US5] Add delete functionality to Dashboard page in `frontend/src/app/(authenticated)/dashboard/page.tsx` wiring delete IconButton on each TaskCard to open ConfirmationModal (title "Delete Task", message "Are you sure you want to delete '{taskTitle}'? This action cannot be undone."), on confirm call DELETE /api/tasks/{id} via API client, on success remove task from list + show success toast "Task deleted", on error show error toast per pages.md Dashboard and spec.md US5 (depends on T021, T035)

**Checkpoint**: Users can delete tasks with confirmation. US5 is fully functional and testable independently.

---

## Phase 8: User Story 6 - View Task Details (Priority: P3)

**Goal**: Authenticated users can view full task details on a dedicated read-only page.

**Independent Test**: On the dashboard, click a task card. Verify detail page shows title, status badge, description (or "No description provided"), created date, modified date. Click "Edit" (verify navigation to edit page). Click "Back to Dashboard" (verify return to dashboard). Navigate to /tasks/nonexistent (verify "Task not found" message).

### Implementation for User Story 6

- [ ] T041 [US6] Build Task Detail page in `frontend/src/app/(authenticated)/tasks/[id]/page.tsx` fetching task by ID via API client (GET /api/tasks/{id}), rendering TaskDetail component with breadcrumb (Dashboard > Task Detail), "Edit" SecondaryButton navigating to /tasks/{id}/edit, "Delete" DangerButton opening ConfirmationModal, "Back to Dashboard" link, on 404 render "Task not found", on error render ErrorState per pages.md Task Detail Page (depends on T008, T020, T021, T023, T030)
- [ ] T042 [P] [US6] Build Task Detail loading state in `frontend/src/app/(authenticated)/tasks/[id]/loading.tsx` rendering TaskDetailSkeleton per pages.md Task Detail Loading state (depends on T026)

**Checkpoint**: Users can view full task details. All 6 user stories are now complete.

---

## Phase 9: Error Pages & Global Handling

**Purpose**: Global error handling that spans all user stories.

- [ ] T043 Build global 404 page in `frontend/src/app/not-found.tsx` with centered "404" heading, subtext "The page you're looking for doesn't exist.", action button "Go to Dashboard" (if authenticated) or "Go to Sign In" (if not) per pages.md 404 Not Found Page and FR-016
- [ ] T044 Add 401/session-expired handling to API client in `frontend/src/lib/api-client.ts` so when any API call returns 401, display session-expired message "Your session has expired. Please sign in again." and redirect to /sign-in per pages.md Unauthorized page and spec.md edge case (JWT expiry)

**Checkpoint**: All error states (404, 401/session-expired) are handled globally. FR-016 and FR-017 complete.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final quality improvements affecting all user stories.

- [ ] T045 Responsive audit: verify all pages render correctly at 320px, 768px, 1024px, and 2560px viewports with no horizontal scrolling, fix any layout issues in affected component files per FR-015 and SC-005
- [ ] T046 Keyboard navigation audit: verify all interactive elements are focusable, focus rings are visible (2px offset per components.md), modals trap focus, Escape key closes modals, Tab order is logical per components.md interaction states
- [ ] T047 Accessibility audit: verify all IconButtons have aria-labels, form fields have associated labels, color contrast meets WCAG AA, images have alt text per components.md IconButton ariaLabel and SC-008
- [ ] T048 Run quickstart.md verification: execute all verification steps from quickstart.md (auth flow, task CRUD flow, error checks) and confirm all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (auth client, layouts, atomic components)
- **US2 (Phase 4)**: Depends on Phase 2 (API client, task components, feedback)
- **US3 (Phase 5)**: Depends on Phase 4 (dashboard must exist for redirect target)
- **US4 (Phase 6)**: Depends on Phase 4 (dashboard must exist for redirect target)
- **US5 (Phase 7)**: Depends on Phase 4 (dashboard page with delete wiring)
- **US6 (Phase 8)**: Depends on Phase 4 (dashboard must exist for navigation)
- **Error Pages (Phase 9)**: Depends on Phase 2 (API client)
- **Polish (Phase 10)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US3 (P1)**: Depends on US2 (redirects to dashboard after create)
- **US4 (P2)**: Depends on US2 (redirects to dashboard after edit)
- **US5 (P2)**: Depends on US2 (delete is triggered from dashboard)
- **US6 (P3)**: Depends on US2 (navigates from dashboard)

### Within Each User Story

- Components before pages
- Pages wire components with data and navigation
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T006 can all run in parallel (after T001+T002)
- **Phase 2**: T010, T011, T013-T019, T021-T026 can all run in parallel (different files). T020 is standalone. T012 depends on T011. T027 depends on T016+T019. T028 depends on T027. T029 depends on T005+T013+T014+T017+T018. T030 depends on T014+T015+T019. T031 depends on T020.
- **Phase 3**: T032 and T033 can run in parallel (different pages)
- **Phase 4**: T036 can run in parallel with T035
- **Phase 6**: T039 can run in parallel with T038
- **Phase 8**: T042 can run in parallel with T041
- **Phase 9**: T043 and T044 can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Wave 1 — All independent atomic + layout components:
T010: AuthLayout in frontend/src/components/layout/auth-layout.tsx
T011: Header in frontend/src/components/layout/header.tsx
T013: PrimaryButton in frontend/src/components/ui/primary-button.tsx
T014: SecondaryButton in frontend/src/components/ui/secondary-button.tsx
T015: DangerButton in frontend/src/components/ui/danger-button.tsx
T016: IconButton in frontend/src/components/ui/icon-button.tsx
T017: TextInput in frontend/src/components/ui/text-input.tsx
T018: TextArea in frontend/src/components/ui/text-area.tsx
T019: StatusBadge in frontend/src/components/feedback/status-badge.tsx
T021: ConfirmationModal in frontend/src/components/feedback/confirmation-modal.tsx
T022: EmptyState in frontend/src/components/feedback/empty-state.tsx
T023: ErrorState in frontend/src/components/feedback/error-state.tsx
T024: TaskCardSkeleton in frontend/src/components/skeletons/task-card-skeleton.tsx
T025: TaskFormSkeleton in frontend/src/components/skeletons/task-form-skeleton.tsx
T026: TaskDetailSkeleton in frontend/src/components/skeletons/task-detail-skeleton.tsx

# Wave 2 — Components with dependencies:
T012: AppLayout (depends on T011)
T020: Toast + ToastProvider + useToast (standalone but multi-file)
T027: TaskCard (depends on T016, T019)
T029: TaskForm (depends on T005, T013, T014, T017, T018)
T030: TaskDetail (depends on T014, T015, T019)

# Wave 3 — Components depending on Wave 2:
T028: TaskList (depends on T027)
T031: Root Layout (depends on T020)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Sign Up / Sign In)
4. Complete Phase 4: User Story 2 (Dashboard)
5. Complete Phase 5: User Story 3 (Create Task)
6. **STOP and VALIDATE**: Test MVP end-to-end (sign up, view empty dashboard, create task, see task on dashboard)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Auth) + US2 (Dashboard) + US3 (Create) → MVP!
3. US4 (Edit) → CRUD read/write complete
4. US5 (Delete) → Full CRUD
5. US6 (Detail) → Professional polish
6. Error Pages + Polish → Production ready

---

## Task Summary

| Phase     | Description                        | Task Count | Parallel Tasks |
|-----------|------------------------------------|------------|----------------|
| Phase 1   | Setup                              | 6          | 4              |
| Phase 2   | Foundational                       | 25         | 15             |
| Phase 3   | US1 - Sign Up / Sign In (P1)      | 2          | 2              |
| Phase 4   | US2 - View Dashboard (P1)         | 3          | 1              |
| Phase 5   | US3 - Create Task (P1) MVP        | 1          | 0              |
| Phase 6   | US4 - Edit Task (P2)              | 2          | 1              |
| Phase 7   | US5 - Delete Task (P2)            | 1          | 0              |
| Phase 8   | US6 - View Task Details (P3)      | 2          | 1              |
| Phase 9   | Error Pages                        | 2          | 2              |
| Phase 10  | Polish & Cross-Cutting             | 4          | 0              |
| **Total** |                                    | **48**     | **26**         |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps each task to its specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- No test tasks included (not requested in spec)
- All file paths are relative to repository root
