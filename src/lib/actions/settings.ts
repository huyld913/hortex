"use server";

import { revalidatePath } from "next/cache";
import { updateProfile, createApiKey, deleteApiKey } from "@/lib/data/settings";
import { getAuthUser } from "./get-user";
import type { ActionResult } from "@/lib/types";
import type { Profile, CreatedApiKey } from "@/lib/data/settings";

export async function updateProfileAction(
  _prev: ActionResult<Profile> | null,
  formData: FormData,
): Promise<ActionResult<Profile>> {
  const display_name = formData.get("display_name");
  const timezone = formData.get("timezone");
  if (typeof display_name !== "string" || !display_name.trim()) {
    return { ok: false, error: "Display name is required." };
  }
  try {
    const { userId } = await getAuthUser();
    const profile = await updateProfile(userId, {
      display_name: display_name.trim(),
      timezone: typeof timezone === "string" && timezone ? timezone : "Asia/Ho_Chi_Minh",
    });
    revalidatePath("/settings");
    return { ok: true, data: profile };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update profile." };
  }
}

export async function createApiKeyAction(
  _prev: ActionResult<CreatedApiKey> | null,
  formData: FormData,
): Promise<ActionResult<CreatedApiKey>> {
  const name = formData.get("name");
  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "Key name is required." };
  }
  try {
    const { userId } = await getAuthUser();
    const result = await createApiKey(userId, name.trim());
    revalidatePath("/settings");
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create API key." };
  }
}

export async function deleteApiKeyAction(keyId: string): Promise<ActionResult> {
  try {
    const { userId } = await getAuthUser();
    await deleteApiKey(userId, keyId);
    revalidatePath("/settings");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete API key." };
  }
}
