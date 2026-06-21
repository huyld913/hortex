import "server-only";
import { createClient } from "@supabase/supabase-js";

// Admin client — uses the SECRET key and BYPASSES RLS. Server-only; never import
// this into a Client Component. Use only for trusted server work that genuinely
// needs to act across users (e.g. resolving an API key to its owning user_id in
// the /api/v1 gateway). Normal web flows must use the session client in server.ts.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
