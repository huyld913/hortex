import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProfile, listApiKeys } from "@/lib/data/settings";
import { ProfileForm } from "@/components/settings/profile-form";
import { ApiKeysPanel } from "@/components/settings/api-keys-panel";

export const metadata: Metadata = { title: "Settings · Hortex" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, apiKeys] = await Promise.all([
    getProfile(user.id),
    listApiKeys(user.id),
  ]);

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div className="rounded-lg border bg-card p-4">
          <ProfileForm profile={profile} email={user.email ?? ""} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">API Keys</h2>
          <p className="text-xs text-muted-foreground">Used by the AI gateway (/api/v1/*)</p>
        </div>
        <ApiKeysPanel apiKeys={apiKeys} />
      </section>
    </div>
  );
}
