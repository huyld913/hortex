"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/actions/settings";
import type { Profile } from "@/lib/data/settings";

const TIMEZONES = [
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "UTC",
];

interface ProfileFormProps {
  profile: Profile | null;
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Email</Label>
        <p className="text-sm">{email}</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="display_name" className="text-xs">Display name</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={profile?.display_name ?? ""}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="timezone" className="text-xs">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={profile?.timezone ?? "Asia/Ho_Chi_Minh"}
          disabled={isPending}
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-sm focus:ring-1 focus:ring-ring"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      {state && !state.ok && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      {state?.ok && (
        <p className="text-xs text-green-600">Saved.</p>
      )}
      <Button type="submit" size="sm" disabled={isPending}>Save</Button>
    </form>
  );
}
