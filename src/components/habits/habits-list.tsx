"use client";

import { useOptimistic } from "react";
import { HabitRow } from "./habit-row";
import type { Habit } from "@/lib/data/habits";

interface HabitsListProps {
  habits: Habit[];
  streaks?: Record<string, number>; // habitId → current streak (for challenge habits)
}

export function HabitsList({ habits, streaks = {} }: HabitsListProps) {
  const [optimistic, dispatch] = useOptimistic(
    habits,
    (state: Habit[], action: { habitId: string; done: boolean }) =>
      state.map((h) =>
        h.id === action.habitId ? { ...h, today_done: action.done } : h,
      ),
  );

  if (optimistic.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No habits yet. Create one below.
      </p>
    );
  }

  const done = optimistic.filter((h) => h.today_done);
  const todo = optimistic.filter((h) => !h.today_done);

  return (
    <div className="space-y-4">
      {todo.length > 0 && (
        <div className="rounded-lg border bg-card px-2 py-1">
          {todo.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              currentStreak={streaks[h.id] ?? 0}
              onOptimisticToggle={(id, d) => dispatch({ habitId: id, done: d })}
            />
          ))}
        </div>
      )}
      {done.length > 0 && (
        <div>
          <p className="mb-1 px-2 text-xs text-muted-foreground">Done today</p>
          <div className="rounded-lg border bg-card px-2 py-1 opacity-70">
            {done.map((h) => (
              <HabitRow
                key={h.id}
                habit={h}
                currentStreak={streaks[h.id] ?? 0}
                onOptimisticToggle={(id, d) => dispatch({ habitId: id, done: d })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
