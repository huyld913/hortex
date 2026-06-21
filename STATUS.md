# Hortex — Project Status

> Living snapshot of project state. Update this at the end of each work session so any agent/human can resume with full context.

_Last updated: 2026-06-21_

> Agent operating rules: see `CLAUDE.md` (+ `docs/conventions.md`, `docs/architecture.md`). Read `CLAUDE.md` at the start of every session.

## What Hortex is
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
- Schema source of truth: `supabase/migrations/001_initial_schema.sql` ✓ applied.
- Web app uses the **publishable** key (`sb_publishable_...`) client + server-with-session; the **secret** key is server-only/admin.

## Current phase
**P1 complete (2026-06-21).** All v1 features implemented. Typecheck + lint pass.

Done in this phase:
- `supabase/migrations/001_initial_schema.sql` created and applied.
- Domain types (`Task`, `Project`, `TaskFilters`) in `src/lib/types.ts`.
- Data layer: `src/lib/data/tasks.ts` (list/get/create/update/delete + listProjects), `src/lib/data/dashboard.ts` (summary queries).
- Zod validations: `src/lib/validations/tasks.ts`.
- Server Actions: `src/lib/actions/tasks.ts` (create/update/delete/toggleComplete).
- Tasks page: List view (inline complete toggle, optimistic updates, filters via URL params, quick-add) + Board view (kanban, dnd-kit drag across columns + within-column reorder) + view toggle.
- Task detail/edit page (`/tasks/[id]`): inline title/description edit, status/priority/due_date/project dropdowns, subtask list + add.
- Dashboard: stat cards (overdue/due today/in progress/done today) + section lists + quick-add.
- AI gateway: `POST /api/v1/tasks`, `POST /api/v1/tasks/bulk`, `GET /api/v1/summary`, `POST /api/v1/log-habit`. SHA-256 API-key auth via `X-API-Key` header.
- New dep: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (kanban board).

**P2 complete (2026-06-21).** Typecheck + lint pass.

Done in this phase:
- Projects: data layer (`lib/data/projects.ts`), CRUD page (`/projects`), project detail with tasks-by-project (`/projects/[id]`).
- Settings: profile edit (display name + timezone) + API key management UI with one-time key reveal (`/settings`).
- Habits: data layer with streak algo ported from old cortex (`lib/data/habits.ts`), list with today's check-in + optimistic toggle, habit detail with 30-day grid + stat cards (`/habits`, `/habits/[id]`).
- Cmd-K command palette (Ctrl+K / ⌘K) — navigate + quick actions. Mounted app-wide in `(app)/layout.tsx`.
- Sidebar nav updated: Dashboard, Tasks, Projects, Habits, Settings.
- New deps: `cmdk` (via shadcn command component).

Next: deploy to Vercel, or continue with remaining P2 items (Recurring tasks, OAuth, Billing, CORS hardening).

Note: nothing committed yet (commit only when you ask). Nothing committed yet (commit only when you ask).

## Open questions / risks
- Stripe billing model (plans, limits) — not yet designed.
- Email deliverability for confirmation (Supabase default SMTP vs Resend).
- Board drag-drop persistence (sort_order updates) — needs a clean Server Action.
