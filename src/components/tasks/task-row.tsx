"use client";

import { useTransition } from "react";
import { Circle, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTaskCompleteAction, deleteTaskAction } from "@/lib/actions/tasks";
import type { Task } from "@/lib/types";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  p1: "Urgent",
  p2: "High",
  p3: "Medium",
  p4: "Low",
};

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  p1: "text-red-500",
  p2: "text-orange-500",
  p3: "text-blue-500",
  p4: "text-muted-foreground",
};

interface TaskRowProps {
  task: Task;
  onOptimisticToggle?: (taskId: string, newStatus: Task["status"]) => void;
  onOptimisticDelete?: (taskId: string) => void;
}

export function TaskRow({ task, onOptimisticToggle, onOptimisticDelete }: TaskRowProps) {
  const [isPending, startTransition] = useTransition();
  const isDone = task.status === "done";

  function handleToggle() {
    onOptimisticToggle?.(task.id, isDone ? "todo" : "done");
    startTransition(async () => {
      await toggleTaskCompleteAction(task.id, task.status);
    });
  }

  function handleDelete() {
    onOptimisticDelete?.(task.id);
    startTransition(async () => {
      await deleteTaskAction(task.id);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors",
        isPending && "opacity-60",
      )}
    >
      {/* Complete toggle */}
      <button
        onClick={handleToggle}
        className={cn(
          "shrink-0 rounded-full transition-colors",
          isDone ? "text-green-500" : "text-muted-foreground hover:text-foreground",
        )}
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      >
        {isDone ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <Circle className="size-4" />
        )}
      </button>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <a
          href={`/tasks/${task.id}`}
          className={cn(
            "block truncate text-sm leading-5",
            isDone && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </a>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {task.due_date && (
            <span>{task.due_date}</span>
          )}
          {task.project && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              {task.project.name}
            </span>
          )}
        </div>
      </div>

      {/* Priority */}
      <span className={cn("shrink-0 text-xs font-medium", PRIORITY_COLOR[task.priority])}>
        {PRIORITY_LABEL[task.priority]}
      </span>

      {/* Delete (hover only) */}
      <button
        onClick={handleDelete}
        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
