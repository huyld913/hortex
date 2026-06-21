"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Returns the authenticated user's ID and ensures their profile row exists.
 *
 * Profiles are normally created by a DB trigger on signup, but users who
 * signed up before the schema was applied won't have one.
 *
 * We use the admin client for the upsert because the `profiles` table only
 * has SELECT + UPDATE RLS policies — there is no INSERT policy, so the
 * session client would be silently blocked and the profile would never be
 * created, causing FK constraint failures on tasks/habits/projects.
 */
export async function getAuthUser(): Promise<{ userId: string; email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // Admin client bypasses RLS — safe here because we're in a server action
  // and we only ever upsert the calling user's own profile row.
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .upsert(
      { id: user.id, display_name: user.email ?? "" },
      { onConflict: "id", ignoreDuplicates: true },
    );

  return { userId: user.id, email: user.email ?? "" };
}
