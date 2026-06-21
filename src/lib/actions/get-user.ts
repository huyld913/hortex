"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated user's ID and ensures their profile row exists.
 * Profiles are normally created by a DB trigger on signup, but users who
 * signed up before the schema was applied won't have one — this upsert
 * acts as a safety net so FK constraints on tasks/habits/projects never fire.
 */
export async function getAuthUser(): Promise<{ userId: string; email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  await supabase
    .from("profiles")
    .upsert(
      { id: user.id, display_name: user.email ?? "" },
      { onConflict: "id", ignoreDuplicates: true },
    );

  return { userId: user.id, email: user.email ?? "" };
}
