# Cortex — Code Conventions

How to write code so every session looks like one author wrote it. For the *why* behind the layering, see `architecture.md`.

## Directory layout

```
src/
  app/
    (auth)/                # login, signup, forgot-password — no app shell
      login/
      signup/
      forgot-password/
    (app)/                 # protected, has the app shell (sidebar, theme toggle)
      dashboard/
      tasks/
    api/
      v1/                  # public REST API (key-auth) — the "AI gateway"
        tasks/route.ts
        summary/route.ts
  components/
    ui/                    # shadcn-generated — don't hand-edit much
    <feature>/             # feature components: tasks/, dashboard/
  lib/
    supabase/
      client.ts            # browser client (publishable key)
      server.ts            # server client with session (publishable key)
      admin.ts             # secret key — server-only / admin
    data/                  # data-access layer: pure business logic, takes userId + validated input
    actions/               # Server Actions (web): tasks.ts, auth.ts — "use server"
    validations/           # zod schemas (shared by actions + api)
    utils.ts
  middleware.ts            # protects (app)/*
```

## Naming

- Components: `PascalCase` files — `TaskCard.tsx`.
- lib / utils / actions / data: `kebab` or `camel` — `tasks.ts`, `utils.ts`.
- Server Actions: verb-prefixed — `createTask`, `updateTask`, `toggleTaskComplete`.
- Data-access functions: verb + `ForUser` when they take an explicit userId — `createTaskForUser(userId, input)`.

## React / Next

- **Server Components by default.** Add `"use client"` only when you need state/effects/events (interactive forms, the dnd-kit board). Push `"use client"` to the leaves — don't wrap a whole page.
- **Reads:** Server Components call the `data/` layer directly to render. Never fetch the internal HTTP API from the web app.
- **Mutations:** always go through a Server Action (web) or an `app/api/v1/*` route handler (external). Never mutate from a client component directly.

## Error handling / return shape

- **Server Actions** return a typed result for business errors:
  ```ts
  type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }
  ```
  Use this for validation failures, "not found", etc. — so the UI (and `useOptimistic`) can show them smoothly. Only `throw` for real system failures (DB unreachable).
- **`app/api/v1/*`** maps to standard HTTP status: `400` bad input, `401` bad/missing key, `404` not found, `500` system error.
- Validate **every** input — Server Actions and API route bodies — with a zod schema from `validations/`.

## Styling

- Tailwind utility-first. Theme: system default + toggle.
- Prefer a shadcn/ui component over hand-building one. Don't reinvent what shadcn already gives.
- Accent indigo `#6366f1` via theme/CSS variable — don't hardcode the hex across files.
- Design language: minimal, dense, Linear-like.

## Tooling

- `pnpm` only.
- `pnpm tsc --noEmit` + `pnpm lint` must pass before a code task is "done". `pnpm build` at end of phase / on routing-config changes.
- TypeScript `strict: true`.
