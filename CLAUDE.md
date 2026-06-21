# Cortex — Agent Operating Rules

> Read this first, every session. It keeps every agent session consistent.
> Details live in `@docs/conventions.md` (how to write code) and `@docs/architecture.md` (why it's shaped this way).
> Live project state: `STATUS.md` · Backlog: `TODO.md`.

## Session ritual (mandatory)

**At start of every session:**
1. Read `STATUS.md` — current phase + open risks.
2. Read `TODO.md` — what's prioritized (P0 → P1 → P2).
3. State briefly to the user: "On phase X, planning to do task Y" before writing code.

**At end of session — only if the session made substantive changes (code edited / a decision changed):**
1. Update `TODO.md` — tick `[x]` done items, add anything new that surfaced.
2. Update `STATUS.md` — adjust "Current phase", "Open questions / risks", and `_Last updated_`.

A pure Q&A / read-only session needs no end-update. No separate changelog — `git log` + STATUS.md are the record.

## Guardrails (hard rules)

1. **Secrets:** Never commit `.env.local` or `SUPABASE_SECRET_KEY`. Secret key is server-only — never reaches a client component.
2. **DB schema / migrations:** Do **not** run a migration or change the Supabase schema without confirming with the user first.
3. **RLS:** Every table is RLS-scoped by `user_id`. Never bypass RLS with the secret key for a web-app flow.
4. **Old repo `d:/projects/hlhub/cortex/`:** Read for reference only — never edit it.
5. **Destructive ops:** No bulk delete of files / tables / data without confirmation.
6. **Scope:** Don't pull P2/v2 work forward while v1 is unfinished, unless the user asks.
7. **Dependencies:** Don't add a new dependency without stating why and asking.
8. **Architecture:** Don't change a decision in `STATUS.md` → "Architecture" without confirming with the user (re-grill it).

## Working agreements

- **Package manager:** `pnpm` (always — never `npm`/`yarn`/`bun`).
- **Definition of Done** before reporting a code task complete: `pnpm tsc --noEmit` and `pnpm lint` pass. Run `pnpm build` at end of a phase or when touching routing/config — not every task.
- **TypeScript:** `strict: true`.
- **Git:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`). Small commits per TODO task, straight to `main`. **Only commit when the user asks** — don't auto-commit.
- **Teaching:** The user is new to React/Next. When using a non-obvious Next.js/React idiom, give a **short, on-point** reason — one or two lines, not a lecture. They'll dig deeper themselves if needed.

## The two doors into the same logic (read `@docs/architecture.md` for full detail)

- **Web app** → Server Actions (cookie session) → call `src/lib/data/*`.
- **AI gateway** → `app/api/v1/*` route handlers (API-key auth) → call the **same** `src/lib/data/*`.

Business logic lives once in `data/`. The two doors are thin wrappers that differ only in how they resolve `userId`.
