import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { QuickAddTask } from "@/components/tasks/quick-add-task";

export const metadata: Metadata = { title: "Dashboard · Hortex" };

const PRIORITY_DOT: Record<string, string> = {
  p1: "bg-red-500",
  p2: "bg-orange-500",
  p3: "bg-blue-500",
  p4: "bg-muted-foreground",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { overdue, dueToday, inProgress, recentlyDone, stats } =
    await getDashboardSummary(user.id);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<AlertCircle className="size-4 text-red-500" />}
          label="Overdue"
          value={stats.overdue_count}
          highlight={stats.overdue_count > 0}
        />
        <StatCard
          icon={<Clock className="size-4 text-orange-500" />}
          label="Due today"
          value={stats.due_today_count}
        />
        <StatCard
          icon={<Loader2 className="size-4 text-blue-500" />}
          label="In progress"
          value={stats.in_progress_count}
        />
        <StatCard
          icon={<CheckCircle2 className="size-4 text-green-500" />}
          label="Done today"
          value={stats.completed_today_count}
        />
      </div>

      {/* Quick-add */}
      <div className="rounded-lg border bg-card px-3 py-2">
        <QuickAddTask />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue */}
        {overdue.length > 0 && (
          <Section title="Overdue" count={overdue.length} accent="text-red-500">
            {overdue.map((t) => (
              <TaskLine key={t.id} id={t.id} title={t.title} priority={t.priority} meta={t.due_date ?? undefined} />
            ))}
          </Section>
        )}

        {/* Due today */}
        {dueToday.length > 0 && (
          <Section title="Due today" count={dueToday.length}>
            {dueToday.map((t) => (
              <TaskLine key={t.id} id={t.id} title={t.title} priority={t.priority} />
            ))}
          </Section>
        )}

        {/* In progress */}
        {inProgress.length > 0 && (
          <Section title="In progress" count={inProgress.length}>
            {inProgress.map((t) => (
              <TaskLine key={t.id} id={t.id} title={t.title} priority={t.priority} />
            ))}
          </Section>
        )}

        {/* Recently done */}
        {recentlyDone.length > 0 && (
          <Section title="Done today" count={recentlyDone.length}>
            {recentlyDone.map((t) => (
              <TaskLine key={t.id} id={t.id} title={t.title} done />
            ))}
          </Section>
        )}
      </div>

      {overdue.length === 0 && dueToday.length === 0 && inProgress.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          All clear. Add something to get started.
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
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

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className={`text-sm font-semibold ${accent ?? ""}`}>{title}</h2>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="rounded-lg border bg-card divide-y divide-border/50">
        {children}
      </div>
    </div>
  );
}

function TaskLine({
  id,
  title,
  priority,
  meta,
  done,
}: {
  id: string;
  title: string;
  priority?: string;
  meta?: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {priority && (
        <span className={`shrink-0 size-1.5 rounded-full ${PRIORITY_DOT[priority] ?? "bg-muted-foreground"}`} />
      )}
      <Link
        href={`/tasks/${id}`}
        className={`flex-1 truncate text-sm hover:underline ${done ? "line-through text-muted-foreground" : ""}`}
      >
        {title}
      </Link>
      {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
    </div>
  );
}
