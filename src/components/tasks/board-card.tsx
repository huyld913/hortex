"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const PRIORITY_DOT: Record<Task["priority"], string> = {
  p1: "bg-red-500",
  p2: "bg-orange-500",
  p3: "bg-blue-500",
  p4: "bg-muted-foreground",
};

interface BoardCardProps {
  task: Task;
  isDragging?: boolean;
}

export function BoardCard({ task, isDragging }: BoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 rounded-md border bg-card p-3 text-sm shadow-sm",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg ring-2 ring-primary/20",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <a href={`/tasks/${task.id}`} className="block truncate font-medium leading-snug hover:underline">
          {task.title}
        </a>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cn("size-1.5 shrink-0 rounded-full", PRIORITY_DOT[task.priority])} />
          {task.due_date && <span>{task.due_date}</span>}
          {task.project && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              <span className="truncate max-w-[80px]">{task.project.name}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
