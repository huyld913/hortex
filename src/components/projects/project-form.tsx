"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProjectAction } from "@/lib/actions/projects";
import type { ActionResult, Project } from "@/lib/types";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
];

interface ProjectFormProps {
  onSuccess?: (project: Project) => void;
}

export function ProjectForm({ onSuccess }: ProjectFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(
    async (prev: ActionResult<Project> | null, formData: FormData) => {
      const result = await createProjectAction(prev, formData);
      if (result.ok) {
        formRef.current?.reset();
        onSuccess?.(result.data);
      }
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="proj-name" className="text-xs">Name</Label>
        <Input id="proj-name" name="name" placeholder="Project name" required disabled={isPending} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} className="peer sr-only" defaultChecked={c === "#6366f1"} />
              <span
                className="block size-6 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-primary"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>
      {state && !state.ok && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={isPending}>Create project</Button>
    </form>
  );
}
