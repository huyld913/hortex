import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Supabase redirects here from the confirmation / password-reset email.
// We verify the token, which sets the session cookie, then forward the user on.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error && data.user) {
      // Ensure the profile row exists — the DB trigger only fires for NEW signups.
      // Users who signed up before the schema was applied won't have a profile yet.
      await supabase.from("profiles").upsert(
        { id: data.user.id, display_name: data.user.email ?? "" },
        { onConflict: "id", ignoreDuplicates: true },
      );
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
}
