import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  prefix: string;
  last_used: string | null;
  expires_at: string | null;
  created_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "display_name" | "timezone">>,
): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function listApiKeys(userId: string): Promise<ApiKey[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, user_id, name, prefix, last_used, expires_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ApiKey[];
}

export interface CreatedApiKey {
  key: ApiKey;
  rawKey: string; // shown once, never stored
}

export async function createApiKey(
  userId: string,
  name: string,
): Promise<CreatedApiKey> {
  // Generate a random key: "hrtx_<32 hex chars>"
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const rawKey = `hrtx_${hex}`;
  const prefix = rawKey.slice(0, 12); // "hrtx_" + first 7 hex chars

  // SHA-256 hash
  const data = new TextEncoder().encode(rawKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const keyHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Use admin client to bypass RLS for insert (user may not have an active session in this flow)
  const admin = createAdminClient();
  const { data: inserted, error } = await admin
    .from("api_keys")
    .insert({ user_id: userId, name, key_hash: keyHash, prefix })
    .select("id, user_id, name, prefix, last_used, expires_at, created_at")
    .single();

  if (error) throw new Error(error.message);
  return { key: inserted as ApiKey, rawKey };
}

export async function deleteApiKey(userId: string, keyId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
