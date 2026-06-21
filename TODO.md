# Cortex App — TODO

Priority: **P0** = blocks v1 ship · **P1** = needed for a good v1 · **P2** = v2/later.

## P0 — Foundation
- [ ] Scaffold Next.js (App Router, TS) in `cortex-app/` with Tailwind + shadcn/ui.
- [ ] Add `@supabase/ssr` + `@supabase/supabase-js`; create browser + server Supabase clients.
- [ ] `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable), `SUPABASE_SECRET_KEY` (server-only).
- [ ] Confirm Supabase schema is applied (run `001_initial_schema.sql` if not).
- [ ] Auth: login, signup, forgot-password pages + middleware protecting `/app/*`.
- [ ] App shell: sidebar nav, theme toggle (system default), Linear-like layout.

## P1 — Tasks (core)
- [ ] Task data access (server): list with filters, get+subtasks, create, update, delete.
- [ ] Server Actions for create/update/delete/toggle-complete with `useOptimistic`.
- [ ] Tasks **List** view: group/sort, inline complete toggle, filters (status/project/priority/search).
- [ ] Tasks **Board** view (kanban by status) with `dnd-kit`; persist status + sort_order.
- [ ] View toggle (List <-> Board) with remembered preference.
- [ ] Task detail/edit: subtasks, tags, due_date, priority, project picker.
- [ ] Quick-add task (inline + from dashboard).

## P1 — Dashboard
- [ ] Port summary logic (overdue, due today, in progress, recently done, stat counts) minus habits into `src/lib/data/`.
- [ ] Stat cards + section lists + quick-add. Today-focused.

## P1 — AI gateway (keep the product feature alive)
- [ ] `/api/v1/*` route handlers with API-key auth (port `aiAuthMiddleware` + SHA-256 hashing).
- [ ] Endpoints: `POST /api/v1/tasks`, `POST /api/v1/tasks/bulk`, `GET /api/v1/summary`, `POST /api/v1/log-habit`. Each is a thin wrapper over `src/lib/data/*`.

## P2 — Later
- [ ] Projects screen (CRUD + tasks-by-project).
- [ ] Habits (CRUD, check-in, streak/stats charts) — port streak/longest-streak algo from `cortex/src/modules/habits/routes.ts`.
- [ ] Settings: API-key management UI + profile/timezone.
- [ ] Cmd-K command palette + keyboard shortcuts.
- [ ] Recurring tasks + scheduler.
- [ ] Billing: Stripe plans, limits, customer portal.
- [ ] OAuth (Google/GitHub) login.
- [ ] Lock CORS / production hardening.
