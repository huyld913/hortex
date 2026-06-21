// Standard return shape for Server Actions (see docs/conventions.md).
// Use this for business errors (validation, "not found") so the UI can render
// them smoothly. Only `throw` for real system failures.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
