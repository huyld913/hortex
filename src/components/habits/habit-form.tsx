"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHabitAction } from "@/lib/actions/habits";
import type { ActionResult } from "@/lib/types";
import type { Habit } from "@/lib/data/habits";

const COLORS = [
  "#10b981", "#6366f1", "#8b5cf6", "#ec4899",
  "#ef4444", "#f97316", "#eab308", "#14b8a6",
];

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "weekdays", label: "Weekdays" },
];

interface HabitFormProps {
  onSuccess?: () => void;
}

export function HabitForm({ onSuccess }: HabitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, isPending] = useActionState(
    async (prev: ActionResult<Habit> | null, formData: FormData) => {
      const result = await createHabitAction(prev, formData);
      if (result.ok) {
        formRef.current?.reset();
        onSuccess?.();
      }
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="habit-name" className="text-xs">Name</Label>
        <Input id="habit-name" name="name" placeholder="e.g. Read 20 pages" required disabled={isPending} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="frequency" className="text-xs">Frequency</Label>
        <select
          id="frequency"
          name="frequency"
          defaultValue="daily"
          disabled={isPending}
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-sm focus:ring-1 focus:ring-ring"
        >
          {FREQUENCY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} className="sr-only" defaultChecked={c === "#10b981"} />
              <span
                className="block size-6 rounded-full ring-offset-2 has-[:checked]:ring-2 has-[:checked]:ring-primary"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>

      {state && !state.ok && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={isPending}>Create habit</Button>
    </form>
  );
}
