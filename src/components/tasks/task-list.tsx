"use client";

import { useOptimistic } from "react";
import { TaskRow } from "@/components/tasks/task-row";
import type { Task } from "@/lib/types";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [optimisticTasks, dispatch] = useOptimistic(
    tasks,
    (
      state: Task[],
      action:
        | { type: "toggle"; taskId: string; newStatus: Task["status"] }
        | { type: "delete"; taskId: string },
    ) => {
      if (action.type === "toggle") {
        return state.map((t) =>
          t.id === action.taskId ? { ...t, status: action.newStatus } : t,
        );
      }
      if (action.type === "delete") {
        return state.filter((t) => t.id !== action.taskId);
      }
      return state;
    },
  );

  if (optimisticTasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No tasks. Add one above.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {optimisticTasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onOptimisticToggle={(id, newStatus) =>
            dispatch({ type: "toggle", taskId: id, newStatus })
          }
          onOptimisticDelete={(id) => dispatch({ type: "delete", taskId: id })}
        />
      ))}
    </div>
  );
}
