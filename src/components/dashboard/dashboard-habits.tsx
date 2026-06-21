"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { logHabitAction, unlogHabitAction } from "@/lib/actions/habits";
import { cn } from "@/lib/utils";
import type { Habit } from "@/lib/data/habits";
import { Circle } from "lucide-react";

interface DashboardHabitsProps {
  habits: Habit[];
}

export function DashboardHabits({ habits }: DashboardHabitsProps) {
  const [optimistic, dispatch] = useOptimistic(
    habits,
    (state: Habit[], action: { id: string; done: boolean }) =>
      state.map((h) => (h.id === action.id ? { ...h, today_done: action.done } : h)),
  );

  const done = optimistic.filter((h) => h.today_done).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Habits</h2>
          <span className="text-xs text-muted-foreground">{done}/{habits.length} done</span>
        </div>
        <Link href="/habits" className="text-xs text-muted-foreground hover:text-foreground">
          View all →
        </Link>
      </div>
      <div className="rounded-lg border bg-card divide-y divide-border/50">
        {optimistic.map((h) => (
          <HabitTick key={h.id} habit={h} dispatch={dispatch} />
        ))}
      </div>
    </div>
  );
}

function HabitTick({
  habit,
  dispatch,
}: {
  habit: Habit;
  dispatch: (action: { id: string; done: boolean }) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !habit.today_done;
    dispatch({ id: habit.id, done: next });
    startTransition(async () => {
      if (next) await logHabitAction(habit.id);
      else await unlogHabitAction(habit.id);
    });
  }

  const streak = (habit as Habit & { streak?: number }).streak ?? 0;

  return (
    <div className={cn("flex items-center gap-3 px-3 py-2.5", isPending && "opacity-60")}>
      <button
        onClick={toggle}
        className="shrink-0 text-xl leading-none transition-transform active:scale-90"
        title={habit.today_done ? "Undo" : "Mark done"}
      >
        {habit.today_done ? "🔥" : <Circle className="size-5" />}
      </button>

      <Link href={`/habits/${habit.id}`} className="flex-1 truncate hover:underline">
        {habit.name}
      </Link>

      {streak > 0 && (
        <span className="shrink-0 flex items-center gap-0.5 text-xs font-medium text-orange-500">
          🔥 {streak}
        </span>
      )}

      <span
        className="shrink-0 size-2 rounded-full"
        style={{ backgroundColor: habit.color }}
      />
    </div>
  );
}
