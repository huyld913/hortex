import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHabit, getHabitStats } from "@/lib/data/habits";
import { HabitDetailClient } from "@/components/habits/habit-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Habit · Hortex" };
  const habit = await getHabit(user.id, id);
  return { title: habit ? `${habit.name} · Hortex` : "Habit not found · Hortex" };
}

export default async function HabitDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [habit, stats] = await Promise.all([
    getHabit(user.id, id),
    getHabitStats(user.id, id, 30),
  ]);

  if (!habit) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/habits"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Habits
      </Link>

      <HabitDetailClient habit={habit} stats={stats} />
    </div>
  );
}
