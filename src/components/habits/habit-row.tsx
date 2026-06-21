"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logHabitAction, unlogHabitAction } from "@/lib/actions/habits";
import type { Habit } from "@/lib/data/habits";

interface HabitRowProps {
  habit: Habit;
  onOptimisticToggle?: (habitId: string, done: boolean) => void;
}

export function HabitRow({ habit, onOptimisticToggle }: HabitRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newDone = !habit.today_done;
    onOptimisticToggle?.(habit.id, newDone);
    startTransition(async () => {
      if (newDone) {
        await logHabitAction(habit.id);
      } else {
        await unlogHabitAction(habit.id);
      }
    });
  }

  return (
    <div className={cn("group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors", isPending && "opacity-60")}>
      <button
        onClick={handleToggle}
        className={cn(
          "shrink-0 transition-colors",
          habit.today_done ? "text-green-500" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {habit.today_done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <Link href={`/habits/${habit.id}`} className="truncate text-sm hover:underline">
          {habit.name}
        </Link>
        {habit.target_value && (
          <p className="text-xs text-muted-foreground">
            Target: {habit.target_value} {habit.unit}
          </p>
        )}
      </div>

      <span
        className="shrink-0 size-2 rounded-full"
        style={{ backgroundColor: habit.color }}
      />
    </div>
  );
}
