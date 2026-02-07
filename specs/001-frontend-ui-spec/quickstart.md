# Quickstart: Frontend UI

**Branch**: `001-frontend-ui-spec` | **Date**: 2026-02-05

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Backend API running (for full integration)
- Better Auth server configured (for authentication)

## Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create environment configuration:
   - Copy `.env.example` to `.env.local`
   - Set `NEXT_PUBLIC_API_URL` to the backend API base URL
   - Set Better Auth configuration variables

4. Start the development server:
   ```
   npm run dev
   ```

5. Open `http://localhost:3000` in a browser.

## Verification Steps

### Authentication Flow
1. Navigate to `/sign-up`.
2. Create an account with email and password.
3. Verify redirect to `/dashboard`.
4. Sign out via the header button.
5. Verify redirect to `/sign-in`.
6. Sign in with the created credentials.
7. Verify redirect to `/dashboard`.

### Task CRUD Flow
1. On the dashboard, verify the empty state is displayed.
2. Click "Create Task" and create a task with a title.
3. Verify redirect to dashboard with the new task visible.
4. Click the task card to view details.
5. Click "Edit" and modify the title. Save.
6. Verify the updated title on the dashboard.
7. Click the delete icon on the task card.
8. Confirm deletion in the modal.
9. Verify the task is removed from the dashboard.

### Error & Edge Case Checks
1. Try submitting a form with an empty title — verify inline error.
2. Navigate to `/tasks/nonexistent` — verify "Not Found" state.
3. Navigate to `/nonexistent-route` — verify 404 page.
4. Resize browser to 320px width — verify responsive layout.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── not-found.tsx           # Global 404 page
│   │   ├── sign-in/
│   │   │   └── page.tsx            # Sign in page
│   │   ├── sign-up/
│   │   │   └── page.tsx            # Sign up page
│   │   └── (authenticated)/
│   │       ├── layout.tsx          # AppLayout wrapper
│   │       ├── dashboard/
│   │       │   ├── page.tsx        # Task list dashboard
│   │       │   └── loading.tsx     # Dashboard skeleton
│   │       └── tasks/
│   │           ├── new/
│   │           │   └── page.tsx    # Create task page
│   │           └── [id]/
│   │               ├── page.tsx    # Task detail page
│   │               ├── loading.tsx # Detail skeleton
│   │               └── edit/
│   │                   ├── page.tsx    # Edit task page
│   │                   └── loading.tsx # Edit skeleton
│   ├── components/
│   │   ├── layout/
│   │   │   ├── app-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   └── header.tsx
│   │   ├── tasks/
│   │   │   ├── task-card.tsx
│   │   │   ├── task-list.tsx
│   │   │   ├── task-form.tsx
│   │   │   └── task-detail.tsx
│   │   ├── feedback/
│   │   │   ├── status-badge.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toast-provider.tsx
│   │   │   ├── confirmation-modal.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── error-state.tsx
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
│   │   ├── api-client.ts           # Centralized fetch + JWT
│   │   ├── auth-client.ts          # Better Auth client config
│   │   └── validation.ts           # Zod schemas
│   ├── hooks/
│   │   └── use-toast.ts            # Toast hook
│   └── types/
│       └── task.ts                 # Task type definitions
├── middleware.ts                    # Route protection
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```
