// Standard return shape for Server Actions (see docs/conventions.md).
// Use this for business errors (validation, "not found") so the UI can render
// them smoothly. Only `throw` for real system failures.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ─── Domain types (mirror the DB schema) ────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "p1" | "p2" | "p3" | "p4";
export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type RecurringRule = "daily" | "weekdays" | "weekly" | "monthly";

export const RECURRING_RULE_LABELS: Record<RecurringRule, string> = {
  daily: "Daily",
  weekdays: "Weekdays (Mon–Fri)",
  weekly: "Weekly",
  monthly: "Monthly",
};

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tags: string[];
  sort_order: number;
  recurring_rule: RecurringRule | null;
  recurring_instance_of: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // joined
  project?: Pick<Project, "id" | "name" | "color"> | null;
  subtasks?: Task[];
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  project_id?: string;
  search?: string;
  due_before?: string; // ISO date
  parent_task_id?: string | null; // null = top-level only
}
