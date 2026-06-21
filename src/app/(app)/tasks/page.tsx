import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listTasks } from "@/lib/data/tasks";
import { TaskList } from "@/components/tasks/task-list";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskFilters } from "@/components/tasks/task-filters";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { ViewToggle } from "@/components/tasks/view-toggle";
import type { TaskStatus, TaskPriority } from "@/lib/types";

export const metadata: Metadata = { title: "Tasks · Hortex" };

interface Props {
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function TasksPage({ searchParams }: Props) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const view = params.view === "board" ? "board" : "list";
  const status = toArray(params.status) as TaskStatus[];
  const priority = toArray(params.priority) as TaskPriority[];
  const search = typeof params.search === "string" ? params.search : undefined;

  const tasks = await listTasks(user.id, {
    status: status.length ? status : undefined,
    priority: priority.length ? priority : undefined,
    search,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <Suspense>
          <ViewToggle />
        </Suspense>
      </div>

      <Suspense>
        <TaskFilters />
      </Suspense>

      {view === "list" ? (
        <>
          <div className="rounded-lg border bg-card px-3 py-2">
            <QuickAddTask />
          </div>
          <div className="rounded-lg border bg-card px-2 py-1">
            <TaskList tasks={tasks} />
          </div>
        </>
      ) : (
        <TaskBoard tasks={tasks} />
      )}
    </div>
  );
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}
