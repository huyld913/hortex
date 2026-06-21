"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { updateTaskAction } from "@/lib/actions/tasks";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
  { status: "cancelled", label: "Cancelled" },
];

const STATUSES = new Set<string>(COLUMNS.map((c) => c.status));

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks: initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Determine target status from `over` — could be a column id or another card's id
    const overStatus: TaskStatus | undefined = STATUSES.has(over.id as string)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;

    if (!overStatus || overStatus === activeTask.status) return;

    // Optimistically move card to new column
    setTasks((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, status: overStatus } : t)),
    );
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const movedTask = tasks.find((t) => t.id === active.id);
    if (!movedTask) return;

    const overStatus: TaskStatus | undefined = STATUSES.has(over.id as string)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;

    const targetStatus = overStatus ?? movedTask.status;

    // Reorder within column when dropping onto another card
    if (!STATUSES.has(over.id as string) && over.id !== active.id) {
      const colTasks = tasks.filter((t) => t.status === targetStatus).map((t) => t.id);
      const oldIdx = colTasks.indexOf(active.id as string);
      const newIdx = colTasks.indexOf(over.id as string);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(colTasks, oldIdx, newIdx);
        const sortPatch: Record<string, number> = {};
        reordered.forEach((id, idx) => { sortPatch[id] = idx; });

        setTasks((prev) =>
          prev.map((t) => (sortPatch[t.id] !== undefined ? { ...t, sort_order: sortPatch[t.id] } : t)),
        );

        // Persist new sort_orders
        startTransition(async () => {
          await Promise.all(
            reordered.map((id, idx) => updateTaskAction(id, { sort_order: idx })),
          );
        });
        return;
      }
    }

    // Persist status change if it differs from original
    const originalTask = initialTasks.find((t) => t.id === active.id);
    if (originalTask && targetStatus !== originalTask.status) {
      startTransition(async () => {
        await updateTaskAction(active.id as string, { status: targetStatus });
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasks.filter((t) => t.status === col.status)}
          />
        ))}
      </div>

      {/* Ghost card while dragging */}
      <DragOverlay>
        {activeTask && <BoardCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
