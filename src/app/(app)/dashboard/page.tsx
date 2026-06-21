import type { Metadata } from "next";
import { AlertCircle, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { getProfile } from "@/lib/data/settings";
import { listHabits } from "@/lib/data/habits";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { DashboardHabits } from "@/components/dashboard/dashboard-habits";
import { DashboardTaskSection } from "@/components/dashboard/dashboard-task-section";

export const metadata: Metadata = { title: "Dashboard · Hortex" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile(user.id);
  const tz = profile?.timezone ?? "Asia/Ho_Chi_Minh";

  const [{ overdue, dueToday, inProgress, recentlyDone, stats }, habits] =
    await Promise.all([
      getDashboardSummary(user.id, tz),
      listHabits(user.id, true, tz),
    ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    timeZone: tz,
  });

  const hasTasks = overdue.length > 0 || dueToday.length > 0 || inProgress.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<AlertCircle className="size-4 text-red-500" />} label="Overdue" value={stats.overdue_count} highlight={stats.overdue_count > 0} />
        <StatCard icon={<Clock className="size-4 text-orange-500" />} label="Due today" value={stats.due_today_count} />
        <StatCard icon={<Loader2 className="size-4 text-blue-500" />} label="In progress" value={stats.in_progress_count} />
        <StatCard icon={<CheckCircle2 className="size-4 text-green-500" />} label="Done today" value={stats.completed_today_count} />
      </div>

      {/* Quick-add */}
      <div className="rounded-lg border bg-card px-3 py-2">
        <QuickAddTask />
      </div>

      {/* Two-column grid: tasks left, habits right */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {overdue.length > 0 && (
            <DashboardTaskSection title="Overdue" tasks={overdue} accent="text-red-500" href="/tasks" />
          )}
          {dueToday.length > 0 && (
            <DashboardTaskSection title="Due today" tasks={dueToday} href="/tasks" />
          )}
          {inProgress.length > 0 && (
            <DashboardTaskSection title="In progress" tasks={inProgress} href="/tasks" />
          )}
          {recentlyDone.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">Done today</h2>
              <div className="rounded-lg border bg-card divide-y divide-border/50">
                {recentlyDone.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5 px-3 py-2.5">
                    <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    <span className="flex-1 truncate text-sm line-through text-muted-foreground">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!hasTasks && recentlyDone.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">No tasks due today.</p>
          )}
        </div>

        {habits.length > 0 && <DashboardHabits habits={habits} />}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: number; highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg border bg-card p-4 ${highlight ? "border-red-200 dark:border-red-900" : ""}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
