"use client";

import { useRef, useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTaskAction } from "@/lib/actions/tasks";
import type { ActionResult, Task } from "@/lib/types";

interface QuickAddTaskProps {
  defaultProjectId?: string;
  defaultParentTaskId?: string;
}

export function QuickAddTask({ defaultProjectId, defaultParentTaskId }: QuickAddTaskProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(
    async (prev: ActionResult<Task> | null, formData: FormData) => {
      if (defaultProjectId) formData.set("project_id", defaultProjectId);
      if (defaultParentTaskId) formData.set("parent_task_id", defaultParentTaskId);
      const result = await createTaskAction(prev, formData);
      if (result.ok) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <Plus className="size-4 shrink-0 text-muted-foreground" />
      <Input
        name="title"
        placeholder="Add a task…"
        className="h-8 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        disabled={isPending}
        required
      />
      <Button type="submit" size="sm" className="h-7 px-3" disabled={isPending}>
        Add
      </Button>
      {state && !state.ok && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </form>
  );
}
