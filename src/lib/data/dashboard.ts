import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types";

type DashboardTask = Pick<Task, "id" | "title" | "priority" | "status" | "due_date" | "project_id">;

export interface DashboardSummary {
  overdue: DashboardTask[];
  dueToday: DashboardTask[];
  inProgress: DashboardTask[];
  recentlyDone: Pick<Task, "id" | "title" | "status" | "completed_at" | "project_id">[];
  stats: {
    overdue_count: number;
    due_today_count: number;
    in_progress_count: number;
    completed_today_count: number;
  };
}

const TASK_FIELDS = "id, title, priority, status, due_date, project_id";

/**
 * Returns "today" as YYYY-MM-DD in the given IANA timezone.
 * Uses `en-CA` locale which always formats as YYYY-MM-DD — no parsing needed.
 */
export function todayInTimezone(timezone: string): string {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  } catch {
    // Fall back to UTC if the timezone string is invalid
    return new Date().toISOString().split("T")[0];
  }
}

export async function getDashboardSummary(
  userId: string,
  timezone = "Asia/Ho_Chi_Minh",
): Promise<DashboardSummary> {
  const supabase = await createClient();

  const today = todayInTimezone(timezone);
  const todayStart = `${today}T00:00:00`;

  const [overdueRes, dueTodayRes, inProgressRes, recentDoneRes] = await Promise.all([
    supabase
      .from("tasks")
      .select(TASK_FIELDS)
      .eq("user_id", userId)
      .in("status", ["todo", "in_progress"])
      .lt("due_date", today)
      .not("due_date", "is", null)
      .order("due_date", { ascending: true }),

    supabase
      .from("tasks")
      .select(TASK_FIELDS)
      .eq("user_id", userId)
      .eq("due_date", today)
      .in("status", ["todo", "in_progress"]),

    supabase
      .from("tasks")
      .select(TASK_FIELDS)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("priority", { ascending: true })
      .limit(10),

    supabase
      .from("tasks")
      .select("id, title, status, completed_at, project_id")
      .eq("user_id", userId)
      .eq("status", "done")
      .gte("completed_at", todayStart)
      .order("completed_at", { ascending: false })
      .limit(10),
  ]);

  const overdue = (overdueRes.data ?? []) as DashboardTask[];
  const dueToday = (dueTodayRes.data ?? []) as DashboardTask[];
  const inProgress = (inProgressRes.data ?? []) as DashboardTask[];
  const recentlyDone = (recentDoneRes.data ?? []) as DashboardSummary["recentlyDone"];

  return {
    overdue,
    dueToday,
    inProgress,
    recentlyDone,
    stats: {
      overdue_count: overdue.length,
      due_today_count: dueToday.length,
      in_progress_count: inProgress.length,
      completed_today_count: recentlyDone.length,
    },
  };
}
