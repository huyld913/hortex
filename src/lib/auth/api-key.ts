import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

async function sha256Hex(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface ApiKeyAuth {
  userId: string;
  keyId: string;
}

/**
 * Verifies an API key from a request.
 * Accepts `X-API-Key` header or `?api_key=` query param.
 * Returns null if missing, invalid, or expired.
 */
export async function verifyApiKey(req: Request): Promise<ApiKeyAuth | null> {
  const url = new URL(req.url);
  const raw =
    req.headers.get("x-api-key") ??
    req.headers.get("X-API-Key") ??
    url.searchParams.get("api_key");

  if (!raw) return null;

  const keyHash = await sha256Hex(raw);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("api_keys")
    .select("id, user_id, expires_at")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) return null;

  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  // Update last_used (fire-and-forget — don't block the response)
  admin
    .from("api_keys")
    .update({ last_used: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => undefined);

  return { userId: data.user_id as string, keyId: data.id as string };
}
