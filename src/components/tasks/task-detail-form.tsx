"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTaskAction, deleteTaskAction } from "@/lib/actions/tasks";
import { QuickAddTask } from "./quick-add-task";
import { TaskRow } from "./task-row";
import type { Task, RecurringRule } from "@/lib/types";
import { RECURRING_RULE_LABELS } from "@/lib/data/recurring";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "p1", label: "Urgent" },
  { value: "p2", label: "High" },
  { value: "p3", label: "Medium" },
  { value: "p4", label: "Low" },
] as const;

interface TaskDetailFormProps {
  task: Task;
  projects: Array<{ id: string; name: string; color: string }>;
}

export function TaskDetailForm({ task, projects }: TaskDetailFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save(patch: Record<string, unknown>) {
    setError(null);
    startTransition(async () => {
      const result = await updateTaskAction(task.id, patch);
      if (!result.ok) setError(result.error);
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      await deleteTaskAction(task.id);
      router.push("/tasks");
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== task.title && save({ title })}
          className="h-auto border-none bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
          disabled={isPending}
        />
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Recurring instance notice */}
      {task.recurring_instance_of && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Repeat className="size-3.5" />
          Generated from a recurring task template.
        </p>
      )}

      {/* Meta fields */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Status */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                {STATUS_OPTIONS.find((o) => o.value === task.status)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => save({ status: opt.value })}
                  className="text-xs"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                {PRIORITY_OPTIONS.find((o) => o.value === task.priority)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => save({ priority: opt.value })}
                  className="text-xs"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Due date */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Due date</Label>
          <Input
            type="date"
            defaultValue={task.due_date ?? ""}
            onBlur={(e) => save({ due_date: e.target.value || null })}
            className="h-8 text-xs"
          />
        </div>

        {/* Recurrence */}
        {!task.recurring_instance_of && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Repeats</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start gap-1.5 text-xs">
                  {task.recurring_rule ? (
                    <>
                      <Repeat className="size-3" />
                      {RECURRING_RULE_LABELS[task.recurring_rule as RecurringRule]}
                    </>
                  ) : (
                    "Never"
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => save({ recurring_rule: null })}
                  className="text-xs"
                >
                  Never
                </DropdownMenuItem>
                {(Object.entries(RECURRING_RULE_LABELS) as [RecurringRule, string][]).map(
                  ([value, label]) => (
                    <DropdownMenuItem
                      key={value}
                      onSelect={() => save({ recurring_rule: value })}
                      className="text-xs"
                    >
                      {label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Project */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Project</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                {projects.find((p) => p.id === task.project_id)?.name ?? "None"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => save({ project_id: null })} className="text-xs">
                None
              </DropdownMenuItem>
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onSelect={() => save({ project_id: p.id })}
                  className="text-xs"
                >
                  <span
                    className="mr-2 inline-block size-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description !== (task.description ?? "") && save({ description })}
          placeholder="Add a description…"
          rows={4}
          disabled={isPending}
          className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Subtasks */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Subtasks</Label>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="rounded-lg border bg-card px-2 py-1">
            {task.subtasks.map((sub) => (
              <TaskRow key={sub.id} task={sub} />
            ))}
          </div>
        )}
        <div className="rounded-lg border bg-card px-3 py-2">
          <QuickAddTask defaultParentTaskId={task.id} />
        </div>
      </div>
    </div>
  );
}
