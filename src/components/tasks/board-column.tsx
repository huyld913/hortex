"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { BoardCard } from "./board-card";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMN_STYLES: Record<TaskStatus, string> = {
  todo: "border-t-border",
  in_progress: "border-t-blue-500",
  done: "border-t-green-500",
  cancelled: "border-t-muted-foreground",
};

interface BoardColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export function BoardColumn({ status, label, tasks }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-h-0 flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 rounded-lg border border-t-2 bg-muted/30 p-2 transition-colors",
          COLUMN_STYLES[status],
          isOver && "bg-muted/60",
        )}
        style={{ minHeight: "4rem" }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <BoardCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
