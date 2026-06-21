"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHabitSchema, updateHabitSchema } from "@/lib/validations/habits";
import { createHabit, updateHabit, deleteHabit, logHabit, deleteHabitLog } from "@/lib/data/habits";
import { getAuthUser } from "./get-user";
import { getProfile } from "@/lib/data/settings";
import type { ActionResult } from "@/lib/types";
import type { Habit, HabitLog } from "@/lib/data/habits";

/** Returns today's date (YYYY-MM-DD) in the user's stored timezone. */
async function getUserToday(userId: string): Promise<string> {
  const profile = await getProfile(userId);
  const tz = profile?.timezone ?? "Asia/Ho_Chi_Minh";
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

export async function createHabitAction(
  _prev: ActionResult<Habit> | null,
  formData: FormData,
): Promise<ActionResult<Habit>> {
  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    frequency: formData.get("frequency") ?? undefined,
    color: formData.get("color") ?? undefined,
    challenge_days: formData.get("challenge_days")
      ? Number(formData.get("challenge_days"))
      : undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    const { userId } = await getAuthUser();
    const habit = await createHabit(userId, parsed.data);
    revalidatePath("/habits");
    return { ok: true, data: habit };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create habit." };
  }
}

export async function updateHabitAction(
  habitId: string,
  patch: Record<string, unknown>,
): Promise<ActionResult<Habit>> {
  const parsed = updateHabitSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    const { userId } = await getAuthUser();
    const habit = await updateHabit(userId, habitId, parsed.data);
    revalidatePath("/habits");
    revalidatePath(`/habits/${habitId}`);
    return { ok: true, data: habit };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update habit." };
  }
}

export async function deleteHabitAction(habitId: string): Promise<void> {
  const { userId } = await getAuthUser();
  await deleteHabit(userId, habitId);
  revalidatePath("/habits");
  redirect("/habits");
}

export async function logHabitAction(habitId: string, value = 1): Promise<ActionResult<HabitLog>> {
  try {
    const { userId } = await getAuthUser();
    const logDate = await getUserToday(userId);
    const log = await logHabit(userId, habitId, { value, log_date: logDate });
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { ok: true, data: log };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to log habit." };
  }
}

export async function unlogHabitAction(habitId: string): Promise<ActionResult> {
  try {
    const { userId } = await getAuthUser();
    const logDate = await getUserToday(userId);
    await deleteHabitLog(userId, habitId, logDate);
    revalidatePath("/habits");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to remove log." };
  }
}
