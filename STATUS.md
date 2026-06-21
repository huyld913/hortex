# Cortex — Project Status

> Living snapshot of project state. Update this at the end of each work session so any agent/human can resume with full context.

_Last updated: 2026-06-21_

> Agent operating rules: see `CLAUDE.md` (+ `docs/conventions.md`, `docs/architecture.md`). Read `CLAUDE.md` at the start of every session.

## What Cortex is
Personal productivity platform (tasks, projects, habits) **with an AI-agent API gateway** as a first-class feature. Starting as a personal app; intended to grow into a **multi-tenant SaaS** (others sign up, pay).

## Architecture (locked after design grill, 2026-06-21)
- **Frontend/Backend:** Next.js (App Router) **fullstack**, written fresh, native (no Hono).
- **Deploy:** Vercel.
- **DB / Auth:** Supabase (Postgres + Auth + RLS). Reusing the existing project & schema.
- **API layer:** native Next — Server Actions for the web app; route handlers under `/api/v1/*` for the AI gateway (API-key auth, versioned). Both doors share a single `src/lib/data/*` business-logic layer.
- **Auth:** email + password via `@supabase/ssr` (cookie sessions), email confirmation ON.
- **Multi-tenancy:** RLS by `user_id` (already correct). Billing/Stripe deferred.
- **Data/mutation:** Server Actions + `useOptimistic` + `revalidatePath`.
- **Styling:** Tailwind + shadcn/ui. Theme: system + toggle, accent indigo `#6366f1`.
- **Design language:** minimal dense, Linear-like.

## v1 scope
- Auth (login / signup / forgot password)
- Tasks: List + Board (toggle, dnd-kit). Fields: subtasks, tags, due_date, priority, project. **No** recurring.
- Dashboard: today-focused (overdue / due today / in progress / recently done + stat cards + quick-add).
- Deferred to v2: Projects screen, Habits, Settings/API-keys UI, Cmd-K palette, recurring tasks, billing.

## Repo layout
- `d:/projects/hlhub/cortex-app/` — the new Next.js app (this repo). **Active.**
- `d:/projects/hlhub/cortex/` — old Hono Worker. **Reference only** (port streak/summary logic from here, then retire).

## Supabase
- Project URL: `https://ohozymqhgcuhubcstfja.supabase.co`
- Schema source of truth: `cortex/supabase/migrations/001_initial_schema.sql`
- ⚠️ Confirm the migration has actually been run in the Supabase SQL Editor before wiring data.
- Web app uses the **publishable** key (`sb_publishable_...`) client + server-with-session; the **secret** key is server-only/admin.

## Current phase
**Pre-scaffold.** Design decisions locked. Next step: scaffold Next app, wire Supabase auth.

## Open questions / risks
- Stripe billing model (plans, limits) — not yet designed.
- Email deliverability for confirmation (Supabase default SMTP vs Resend).
- Board drag-drop persistence (sort_order updates) — needs a clean Server Action.
