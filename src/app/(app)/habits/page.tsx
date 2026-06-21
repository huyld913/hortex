import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listHabits, getHabitStats } from "@/lib/data/habits";
import { HabitsList } from "@/components/habits/habits-list";
import { HabitForm } from "@/components/habits/habit-form";

export const metadata: Metadata = { title: "Habits · Hortex" };

export default async function HabitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const habits = await listHabits(user.id);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const doneCount = habits.filter((h) => h.today_done).length;
  const total = habits.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && doneCount === total;

  // Fetch streaks for challenge habits
  const challengeHabits = habits.filter((h) => h.frequency === "challenge" && h.challenge_days);
  const streakResults = await Promise.all(
    challengeHabits.map((h) => getHabitStats(user.id, h.id, h.challenge_days ?? 30)),
  );
  const streaks: Record<string, number> = {};
  challengeHabits.forEach((h, i) => {
    streaks[h.id] = streakResults[i]?.current_streak ?? 0;
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          {allDone && total > 0 && <span className="text-2xl">🎉</span>}
        </div>

        {total > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {allDone ? "All done today! 🔥" : `${doneCount} of ${total} done`}
              </span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: allDone ? "#f97316" : "#6366f1",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <HabitsList habits={habits} streaks={streaks} />

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-sm font-semibold">New habit</h2>
        <HabitForm />
      </div>
    </div>
  );
}
