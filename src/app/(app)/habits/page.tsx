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

  // Fetch streaks only for challenge habits (avoids N+1 for regular habits)
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
        <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
        {habits.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {doneCount} of {habits.length} done today
          </p>
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
