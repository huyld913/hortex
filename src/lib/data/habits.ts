import { createClient } from "@/lib/supabase/server";

export type HabitFrequency = "daily" | "weekly" | "weekdays" | "custom" | "challenge";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  target_value: number | null;
  unit: string | null;
  color: string;
  active: boolean;
  sort_order: number;
  custom_days: number[];
  challenge_days: number | null;
  created_at: string;
  updated_at: string;
  // joined (list view)
  today_value?: number | null;
  today_done?: boolean;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  value: number;
  note: string;
  created_at: string;
}

export interface HabitStats {
  habit_id: string;
  range: number;
  total_days: number;
  completed_days: number;
  completion_rate: number;
  current_streak: number;
  longest_streak: number;
  avg_value: number | null;
  logs: HabitLog[];
}

export async function listHabits(userId: string, activeOnly = true, timezone = "Asia/Ho_Chi_Minh"): Promise<Habit[]> {
  const supabase = await createClient();

  let q = supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (activeOnly) q = q.eq("active", true);

  const { data: habits, error } = await q;
  if (error) throw new Error(error.message);
  if (!habits?.length) return [];

  // Load today's logs in bulk — use user timezone so "today" is correct
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, value")
    .eq("user_id", userId)
    .eq("log_date", today);

  const todayMap = new Map((logs ?? []).map((l) => [l.habit_id, l.value]));

  return habits.map((h) => {
    const val = todayMap.get(h.id) ?? null;
    return {
      ...(h as Habit),
      today_value: val,
      today_done: val !== null,
    };
  });
}

export async function getHabit(userId: string, habitId: string): Promise<Habit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as Habit;
}

export async function createHabit(
  userId: string,
  input: Pick<Habit, "name"> & Partial<Pick<Habit, "description" | "frequency" | "target_value" | "unit" | "color" | "custom_days" | "challenge_days">>,
): Promise<Habit> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Habit;
}

export async function updateHabit(
  userId: string,
  habitId: string,
  patch: Partial<Pick<Habit, "name" | "description" | "frequency" | "target_value" | "unit" | "color" | "active" | "sort_order" | "custom_days" | "challenge_days">>,
): Promise<Habit> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .update(patch)
    .eq("id", habitId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Habit;
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function logHabit(
  userId: string,
  habitId: string,
  input: { log_date?: string; value?: number; note?: string },
): Promise<HabitLog> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id: habitId,
        user_id: userId,
        log_date: input.log_date ?? today,
        value: input.value ?? 1,
        note: input.note ?? "",
      },
      { onConflict: "habit_id,log_date" },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as HabitLog;
}

export async function deleteHabitLog(
  userId: string,
  habitId: string,
  logDate?: string,
): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .eq("log_date", logDate ?? today);
  if (error) throw new Error(error.message);
}

export async function getHabitStats(
  userId: string,
  habitId: string,
  rangeDays = 30,
): Promise<HabitStats> {
  const supabase = await createClient();

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - rangeDays + 1);
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .gte("log_date", startStr)
    .lte("log_date", endStr)
    .order("log_date", { ascending: true });

  if (error) throw new Error(error.message);

  const logDates = new Set((logs ?? []).map((l) => l.log_date));
  const completedDays = logDates.size;
  const completionRate = Math.round((completedDays / rangeDays) * 100);

  // Current streak — count back from today
  let currentStreak = 0;
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (logDates.has(dateStr)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Longest streak — scan forward from start
  let longestStreak = 0;
  let streak = 0;
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    if (logDates.has(dateStr)) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  const values = (logs ?? []).map((l) => l.value as number);
  const avgValue =
    values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
      : null;

  return {
    habit_id: habitId,
    range: rangeDays,
    total_days: rangeDays,
    completed_days: completedDays,
    completion_rate: completionRate,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    avg_value: avgValue,
    logs: (logs ?? []) as HabitLog[],
  };
}
