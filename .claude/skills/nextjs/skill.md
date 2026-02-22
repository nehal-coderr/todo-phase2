# Next.js Development Skill

You are an expert Next.js developer. Follow these guidelines when building Next.js applications.

## Framework Version

- Use **Next.js 15+ (App Router)** by default unless the project specifies otherwise.
- Use **React 19** features where applicable.

## Project Structure

```
src/
├── app/                  # App Router pages and layouts
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── loading.tsx       # Loading UI
│   ├── error.tsx         # Error boundary
│   ├── not-found.tsx     # 404 page
│   └── (routes)/         # Route groups and nested routes
├── components/           # Reusable UI components
│   ├── ui/               # Primitive/design-system components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions, configs, helpers
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── styles/               # Global styles
└── public/               # Static assets
```

## Routing

- Use the **App Router** (`app/` directory) for all routing.
- Use **file-based routing** conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Use **route groups** `(groupName)` for organizational purposes without affecting the URL.
- Use **dynamic routes** with `[param]` and **catch-all routes** with `[...slug]`.
- Use `generateStaticParams` for static generation of dynamic routes.

## Server vs Client Components

- **Default to Server Components.** Only add `'use client'` when the component needs:
  - Event handlers (`onClick`, `onChange`, etc.)
  - State (`useState`, `useReducer`)
  - Effects (`useEffect`, `useLayoutEffect`)
  - Browser-only APIs (`window`, `document`, `localStorage`)
  - Custom hooks that depend on state or effects
- Keep client components as **leaf nodes** in the component tree.
- Pass server-fetched data as props to client components rather than fetching on the client.

## Data Fetching

- Use **async Server Components** for data fetching — fetch directly in the component.
- Use `fetch()` with Next.js extended options for caching and revalidation:
  - `{ cache: 'force-cache' }` — static data (default).
  - `{ cache: 'no-store' }` — dynamic data fetched on every request.
  - `{ next: { revalidate: 60 } }` — ISR with revalidation interval.
- Use **Server Actions** (`'use server'`) for mutations and form submissions.
- Use `useActionState` for form state management with Server Actions.
- Avoid `getServerSideProps` / `getStaticProps` (Pages Router patterns).

## Rendering Strategies

- **Static Rendering** (default): pages rendered at build time.
- **Dynamic Rendering**: triggered by `cookies()`, `headers()`, `searchParams`, or `{ cache: 'no-store' }`.
- **Streaming**: use `loading.tsx` or `<Suspense>` for progressive rendering.
- Use `generateMetadata` for dynamic page metadata and SEO.

## Styling

- Prefer **Tailwind CSS** for utility-first styling.
- Use **CSS Modules** (`.module.css`) when component-scoped styles are needed.
- Use `cn()` or `clsx()` utility for conditional class merging.
- Follow a consistent design token system for colors, spacing, and typography.

## State Management

- Use **React Server Components** to minimize client-side state.
- For client-side state: prefer `useState` / `useReducer` for local state.
- For shared client state: use **React Context** or lightweight libraries like Zustand.
- Avoid heavy state management libraries unless the project complexity demands it.

## API Routes

- Use **Route Handlers** in `app/api/` with `route.ts` files.
- Export named functions matching HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Use `NextRequest` and `NextResponse` for typed request/response handling.
- Validate request bodies and params at the boundary.
- Return proper HTTP status codes and consistent error response shapes.

## Authentication

- Use **NextAuth.js (Auth.js)** or **Better Auth** depending on project requirements.
- Protect routes using **middleware** (`middleware.ts` at project root).
- Use `getServerSession()` in Server Components for session access.
- Never expose secrets or tokens to the client.

## Performance

- Use `next/image` for all images — automatic optimization, lazy loading, and responsive sizing.
- Use `next/font` for font loading — automatic optimization and no layout shift.
- Use `next/link` for client-side navigation with prefetching.
- Use dynamic imports (`next/dynamic`) for code splitting heavy components.
- Implement `loading.tsx` and `<Suspense>` boundaries for streaming.
- Minimize `'use client'` surface area to reduce JavaScript bundle size.

## Error Handling

- Use `error.tsx` for route-level error boundaries.
- Use `global-error.tsx` for root layout errors.
- Use `not-found.tsx` for 404 handling.
- Implement proper try/catch in Server Actions and API routes.
- Return user-friendly error messages; log detailed errors server-side.

## TypeScript

- Use **strict TypeScript** throughout the project.
- Define explicit types for component props, API responses, and database models.
- Use `interface` for object shapes and `type` for unions/intersections.
- Avoid `any`; use `unknown` when the type is truly uncertain.
- Use Zod or similar for runtime validation at API boundaries.

## Testing

- Use **Vitest** or **Jest** for unit and integration tests.
- Use **React Testing Library** for component tests.
- Use **Playwright** or **Cypress** for end-to-end tests.
- Test Server Components by testing their rendered output.
- Test Server Actions by invoking them directly.
- Test API routes using direct function calls or HTTP testing utilities.

## Deployment

- Optimize for **Vercel** deployment (default platform for Next.js).
- Use environment variables via `.env.local` (never commit secrets).
- Configure `next.config.ts` for redirects, rewrites, headers, and image domains.
- Use `output: 'standalone'` for Docker deployments.

## Common Patterns

### Form with Server Action
```tsx
// app/actions.ts
'use server'

export async function createItem(formData: FormData) {
  const name = formData.get('name') as string
  // validate, save to DB, revalidate
  revalidatePath('/items')
}

// app/items/page.tsx
import { createItem } from '../actions'

export default function ItemsPage() {
  return (
    <form action={createItem}>
      <input name="name" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

### Protected API Route
```ts
// app/api/protected/route.ts
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ data: 'protected content' })
}
```

### Dynamic Metadata
```tsx
// app/posts/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id)
  return { title: post.title, description: post.excerpt }
}
```
