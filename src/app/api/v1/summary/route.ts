import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const auth = await verifyApiKey(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "today";

  const today = new Date().toISOString().split("T")[0];
  let startDate: string;
  if (range === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString().split("T")[0];
  } else if (range === "month") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    startDate = d.toISOString().split("T")[0];
  } else {
    startDate = today;
  }

  const admin = createAdminClient();
  const userId = auth.userId;

  const [overdueRes, dueTodayRes, inProgressRes, completedRes, projectsRes] =
    await Promise.all([
      admin
        .from("tasks")
        .select("id, title, priority, due_date, project_id")
        .eq("user_id", userId)
        .in("status", ["todo", "in_progress"])
        .lt("due_date", today)
        .not("due_date", "is", null)
        .order("due_date"),

      admin
        .from("tasks")
        .select("id, title, priority, status, project_id")
        .eq("user_id", userId)
        .eq("due_date", today)
        .in("status", ["todo", "in_progress"]),

      admin
        .from("tasks")
        .select("id, title, priority, due_date, project_id")
        .eq("user_id", userId)
        .eq("status", "in_progress")
        .order("priority")
        .limit(20),

      admin
        .from("tasks")
        .select("id, title, completed_at, project_id")
        .eq("user_id", userId)
        .eq("status", "done")
        .gte("completed_at", `${startDate}T00:00:00`)
        .order("completed_at", { ascending: false })
        .limit(20),

      admin
        .from("projects")
        .select("id, name, status, color")
        .eq("user_id", userId)
        .eq("status", "active"),
    ]);

  return NextResponse.json({
    date: today,
    range,
    overdue: overdueRes.data ?? [],
    due_today: dueTodayRes.data ?? [],
    in_progress: inProgressRes.data ?? [],
    recently_completed: completedRes.data ?? [],
    active_projects: projectsRes.data ?? [],
    stats: {
      overdue_count: (overdueRes.data ?? []).length,
      due_today_count: (dueTodayRes.data ?? []).length,
      in_progress_count: (inProgressRes.data ?? []).length,
      completed_count: (completedRes.data ?? []).length,
    },
  });
}
