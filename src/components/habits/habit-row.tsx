"use client";

import { useTransition } from "react";
import { Circle, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logHabitAction, unlogHabitAction } from "@/lib/actions/habits";
import type { Habit } from "@/lib/data/habits";

interface HabitRowProps {
  habit: Habit;
  currentStreak?: number;
  onOptimisticToggle?: (habitId: string, done: boolean) => void;
}

export function HabitRow({ habit, currentStreak = 0, onOptimisticToggle }: HabitRowProps) {
  const [isPending, startTransition] = useTransition();

  const isChallenge = habit.frequency === "challenge" && habit.challenge_days;
  const challengeComplete = isChallenge && currentStreak >= (habit.challenge_days ?? 0);
  const progressPct = isChallenge
    ? Math.min(100, Math.round((currentStreak / (habit.challenge_days ?? 1)) * 100))
    : 0;

  function handleToggle() {
    const newDone = !habit.today_done;
    onOptimisticToggle?.(habit.id, newDone);
    startTransition(async () => {
      if (newDone) await logHabitAction(habit.id);
      else await unlogHabitAction(habit.id);
    });
  }

  return (
    <div className={cn(
      "group flex items-center gap-3 rounded-md px-2 py-3 hover:bg-muted/50 transition-colors",
      isPending && "opacity-60",
    )}>
      {/* Big emoji toggle — easy to tap */}
      <button
        onClick={handleToggle}
        className="shrink-0 text-2xl leading-none transition-transform active:scale-90 select-none"
        title={habit.today_done ? "Undo" : "Mark done"}
      >
        {habit.today_done ? "🔥" : <Circle className="size-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/habits/${habit.id}`} className="truncate font-medium hover:underline">
            {habit.name}
          </Link>
          {currentStreak >= 3 && (
            <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-orange-50 dark:bg-orange-950 px-1.5 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
              🔥 {currentStreak}
            </span>
          )}
        </div>

        {isChallenge ? (
          <div className="mt-1.5 flex items-center gap-2">
            {challengeComplete ? (
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
                <Trophy className="size-3" /> Challenge complete!
              </span>
            ) : (
              <>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%`, backgroundColor: habit.color }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {currentStreak}/{habit.challenge_days}d
                </span>
              </>
            )}
          </div>
        ) : habit.target_value ? (
          <p className="text-xs text-muted-foreground">
            Goal: {habit.target_value} {habit.unit}
          </p>
        ) : null}
      </div>

      <span className="shrink-0 size-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
    </div>
  );
}
