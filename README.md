# Cortex

A personal productivity platform — tasks, projects, and habits — **with an AI-agent API gateway as a first-class feature**. It starts as a personal app and is built to grow into a multi-tenant SaaS.

Cortex has two doors into the same logic:

- **Web app** — what you use in the browser, built on Next.js Server Actions.
- **API gateway** (`/api/v1/*`) — a versioned, key-authenticated REST API that external AI agents and automations call to work with your data.

## Tech stack

- **Framework:** Next.js (App Router), fullstack, TypeScript (strict).
- **Database & Auth:** Supabase (Postgres + Auth + Row Level Security).
- **Styling:** Tailwind CSS + shadcn/ui. Minimal, dense, Linear-like. Accent indigo `#6366f1`.
- **Deploy:** Vercel.
- **Package manager:** pnpm.

## Getting started

```bash
pnpm install
pnpm dev
```

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # publishable key
SUPABASE_SECRET_KEY=...             # server-only / admin — never expose to the client
```

> `.env.local` and the secret key must never be committed.

## Project layout

```
src/
  app/          # routes — (auth), (app), api/v1
  components/   # ui/ (shadcn) + feature components
  lib/
    supabase/   # browser / server-with-session / admin clients
    data/       # business logic — shared by web and API
    actions/    # Server Actions (web)
    validations/# zod schemas
```

See [docs/architecture.md](docs/architecture.md) for how it fits together and [docs/conventions.md](docs/conventions.md) for code conventions.

## Project status & scope

The current phase, locked architecture decisions, and known risks live in [STATUS.md](STATUS.md). The prioritized backlog is in [TODO.md](TODO.md).

v1 covers auth, tasks (list + board), and a today-focused dashboard. Projects, habits, settings, billing, and recurring tasks are deferred to v2.

## Working with an agent

Agent operating rules live in [CLAUDE.md](CLAUDE.md) — read it at the start of every session.
