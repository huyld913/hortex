"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateHabitAction, deleteHabitAction } from "@/lib/actions/habits";
import type { Habit, HabitStats } from "@/lib/data/habits";

interface HabitDetailClientProps {
  habit: Habit;
  stats: HabitStats;
}

export function HabitDetailClient({ habit, stats }: HabitDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(habit.name);

  function save(patch: Record<string, unknown>) {
    startTransition(async () => {
      await updateHabitAction(habit.id, patch);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteHabitAction(habit.id);
      router.push("/habits");
    });
  }

  // Build a simple 30-day grid from stats
  const logDates = new Set(stats.logs.map((l) => l.log_date));
  const days: { date: string; done: boolean }[] = [];
  for (let i = stats.range - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, done: logDates.has(dateStr) });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== habit.name && save({ name })}
            className="h-auto border-none bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
            disabled={isPending}
          />
        </div>
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Current streak" value={`${stats.current_streak}d`} />
        <StatCard label="Longest streak" value={`${stats.longest_streak}d`} />
        <StatCard label="Completion" value={`${stats.completion_rate}%`} />
        <StatCard label="Done / 30d" value={`${stats.completed_days}`} />
      </div>

      {/* 30-day grid */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Last 30 days</p>
        <div className="flex flex-wrap gap-1">
          {days.map(({ date, done }) => (
            <div
              key={date}
              title={date}
              className="size-4 rounded-sm"
              style={{
                backgroundColor: done ? habit.color : undefined,
                opacity: done ? 1 : undefined,
              }}
              data-done={done}
              // Use inline CSS class for non-done state
              {...(!done && { className: "size-4 rounded-sm bg-muted" })}
            />
          ))}
        </div>
      </div>

      {/* Archive / active toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => save({ active: !habit.active })}
          disabled={isPending}
        >
          {habit.active ? "Archive habit" : "Restore habit"}
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
