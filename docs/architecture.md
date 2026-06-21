# Cortex — Architecture

The *why* behind the structure. For day-to-day code rules see `conventions.md`. Locked decisions live in `STATUS.md` → "Architecture".

## Two doors, one brain

Cortex is both a web app **and** a programmatic API for external AI agents/automations. Both need the same business logic (create a task, build the summary). We avoid duplicating that logic by putting it in one place — the **`data/` layer** — and giving each caller a thin wrapper.

```
                 ┌─────────────────────────┐
  Web browser ──▶│ Server Action (web)      │──┐
  (cookie         │  resolves userId          │  │
   session)       │  from Supabase session    │  │
                 └─────────────────────────┘  │
                                               ├─▶  src/lib/data/*   ──▶  Supabase (RLS by user_id)
                 ┌─────────────────────────┐  │     createTaskForUser(userId, input)
  AI agent /  ──▶│ app/api/v1/*/route.ts    │──┘     getSummaryForUser(userId) ...
  automation      │  resolves userId          │
  (API key)       │  from API key (SHA-256)   │
                 └─────────────────────────┘
```

- `src/lib/data/*` — pure business logic. Takes a `userId` + already-validated input. Knows nothing about HTTP, cookies, or sessions. **Single source of truth.**
- `src/lib/actions/*` — Server Actions for the web. Resolve `userId` from the Supabase session, validate input, call `data/`, then `revalidatePath`. Used with `useOptimistic` for snappy UI.
- `app/api/v1/*/route.ts` — HTTP handlers for external callers. Resolve `userId` from an API key (hash the key with SHA-256, look it up), validate body, call the **same** `data/` function, return JSON + standard status code.

The only real difference between the two doors is **how `userId` is resolved**. Everything downstream is shared.

## Why Server Actions for the web (not the HTTP API)

The web app uses Server Actions rather than calling `/api/v1/*` itself, because Server Actions give us — for free — `useOptimistic`, `revalidatePath` cache refresh, no CORS, no manual fetch/loading state, and end-to-end type safety. Routing web mutations through the public HTTP API would throw all of that away to save one thin wrapper file. So: **web → Server Actions; external → `/api/v1`.** Internal web code never calls the HTTP API.

## Why `/api/v1` (not `/ai`)

It's a general programmatic API authenticated by key — AI agents are just one kind of client (also n8n, scripts, future mobile, MCP). `/ai` would wrongly imply AI-only. It's also a public contract for future paying customers, so it's **versioned** from day one (`/api/v1/*`) to avoid breaking clients later. The `/api` namespace is free because the web app uses Server Actions, not HTTP.

## Auth model

- **Web:** email + password via `@supabase/ssr`, cookie sessions, email confirmation ON. Middleware protects `(app)/*`.
- **API:** `Authorization: Bearer <api-key>` → SHA-256 hash → look up the owning `user_id`. (Port `aiAuthMiddleware` + hashing from the old `cortex/` Hono repo — reference only, don't edit it.)
- **Multi-tenancy:** Postgres RLS scoped by `user_id` on every table. The web/session client respects RLS. The secret key (admin) bypasses RLS and is server-only — never used for normal web flows.

## Supabase

- Project URL: `https://ohozymqhgcuhubcstfja.supabase.co`
- Schema source of truth: `cortex/supabase/migrations/001_initial_schema.sql` (in the old repo).
- ⚠️ Confirm the migration is actually applied in the Supabase SQL Editor before wiring data.
- Keys: publishable (`sb_publishable_...`) for browser + server-with-session; secret key server-only/admin.

## Deferred

Stripe/billing, recurring tasks, OAuth, CORS hardening — see `TODO.md` P2.
