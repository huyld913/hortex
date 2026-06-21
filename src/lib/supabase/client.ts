import { createBrowserClient } from "@supabase/ssr";

// Browser client — used in Client Components. Uses the publishable key and
// reads the session from cookies set by the server. RLS applies to every query.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
