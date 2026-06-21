"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Circle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTaskCompleteAction } from "@/lib/actions/tasks";
import type { TaskStatus } from "@/lib/types";

interface DashboardTask {
  id: string;
  title: string;
  priority?: string;
  status: TaskStatus;
  due_date?: string | null;
}

interface DashboardTaskSectionProps {
  title: string;
  tasks: DashboardTask[];
  accent?: string;
  href?: string;
}

const PRIORITY_DOT: Record<string, string> = {
  p1: "bg-red-500",
  p2: "bg-orange-500",
  p3: "bg-blue-500",
  p4: "bg-muted-foreground",
};

export function DashboardTaskSection({
  title,
  tasks: initial,
  accent,
  href,
}: DashboardTaskSectionProps) {
  const [tasks, dispatch] = useOptimistic(
    initial,
    (state: DashboardTask[], action: { id: string; status: TaskStatus }) =>
      state.map((t) => (t.id === action.id ? { ...t, status: action.status } : t)),
  );

  const visible = tasks.filter((t) => t.status !== "done");
  const doneCount = tasks.length - visible.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className={cn("text-sm font-semibold", accent)}>{title}</h2>
          <span className="text-xs text-muted-foreground">
            {visible.length}{doneCount > 0 && ` · ${doneCount} done`}
          </span>
        </div>
        {href && (
          <Link href={href} className="text-xs text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        )}
      </div>
      <div className="rounded-lg border bg-card divide-y divide-border/50">
        {visible.map((task) => (
          <TaskToggleRow key={task.id} task={task} dispatch={dispatch} />
        ))}
        {visible.length === 0 && (
          <p className="px-3 py-3 text-sm text-muted-foreground">All done ✓</p>
        )}
      </div>
    </div>
  );
}

function TaskToggleRow({
  task,
  dispatch,
}: {
  task: DashboardTask;
  dispatch: (a: { id: string; status: TaskStatus }) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isDone = task.status === "done";

  function handleToggle() {
    const next: TaskStatus = isDone ? "todo" : "done";
    startTransition(async () => {
      dispatch({ id: task.id, status: next });
      await toggleTaskCompleteAction(task.id, task.status);
    });
  }

  return (
    <div className={cn("group flex items-center gap-2.5 px-3 py-2.5", isPending && "opacity-60")}>
      {/* Toggle */}
      <button
        onClick={handleToggle}
        className={cn(
          "shrink-0 transition-colors p-0.5",
          isDone ? "text-green-500" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {isDone
          ? <CheckCircle2 className="size-5" />
          : <Circle className="size-5" />
        }
      </button>

      {/* Priority dot */}
      {task.priority && (
        <span className={cn("shrink-0 size-2 rounded-full", PRIORITY_DOT[task.priority] ?? "bg-muted-foreground")} />
      )}

      {/* Title */}
      <span className={cn("flex-1 truncate text-sm", isDone && "line-through text-muted-foreground")}>
        {task.title}
      </span>

      {/* Due date */}
      {task.due_date && (
        <span className="shrink-0 text-xs text-muted-foreground">{task.due_date}</span>
      )}

      {/* Open detail link — hover only */}
      <Link
        href={`/tasks/${task.id}`}
        className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        title="Open task"
      >
        <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}
