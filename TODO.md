# Hortex — TODO

Priority: **P0** = blocks v1 ship · **P1** = needed for a good v1 · **P2** = v2/later.

## P0 — Foundation
- [x] Scaffold Next.js (App Router, TS) in `cortex-app/` with Tailwind + shadcn/ui. _(Next 16.2.9, React 19, Tailwind v4, pnpm via Corepack, shadcn Radix+Nova.)_
- [x] Add `@supabase/ssr` + `@supabase/supabase-js`; browser/server/admin clients in `src/lib/supabase/`.
- [x] `.env.local` + `.env.example` created. ⚠️ **Keys still empty — paste publishable + secret keys before auth works.**
- [x] Confirm Supabase schema is applied (run `001_initial_schema.sql` if not).
- [x] Auth: login, signup, forgot-password pages + `proxy.ts` (Next 16 convention) protecting all non-public routes. Email-confirm callback at `/auth/confirm`.
- [x] App shell: sidebar nav, theme toggle (system default), Linear-like layout.

## P1 — Tasks (core)
- [x] Task data access (server): list with filters, get+subtasks, create, update, delete.
- [x] Server Actions for create/update/delete/toggle-complete with `useOptimistic`.
- [x] Tasks **List** view: group/sort, inline complete toggle, filters (status/project/priority/search).
- [x] Tasks **Board** view (kanban by status) with `dnd-kit`; persist status + sort_order.
- [x] View toggle (List <-> Board) with remembered preference.
- [x] Task detail/edit: subtasks, tags, due_date, priority, project picker.
- [x] Quick-add task (inline + from dashboard).

## P1 — Dashboard
- [x] Port summary logic (overdue, due today, in progress, recently done, stat counts) minus habits into `src/lib/data/`.
- [x] Stat cards + section lists + quick-add. Today-focused.

## P1 — AI gateway (keep the product feature alive)
- [x] `/api/v1/*` route handlers with API-key auth (port `aiAuthMiddleware` + SHA-256 hashing).
- [x] Endpoints: `POST /api/v1/tasks`, `POST /api/v1/tasks/bulk`, `GET /api/v1/summary`, `POST /api/v1/log-habit`. Each is a thin wrapper over `src/lib/data/*`.

## P2 — Later
- [x] Projects screen (CRUD + tasks-by-project).
- [x] Habits (CRUD, check-in, streak/stats charts) — port streak/longest-streak algo from `cortex/src/modules/habits/routes.ts`.
- [x] Settings: API-key management UI + profile/timezone.
- [x] Cmd-K command palette + keyboard shortcuts.
- [ ] Recurring tasks + scheduler.
- [ ] Billing: Stripe plans, limits, customer portal.
- [ ] OAuth (Google/GitHub) login.
- [ ] Lock CORS / production hardening.
