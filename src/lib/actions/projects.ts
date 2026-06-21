"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/projects";
import { createProject, updateProject, deleteProject } from "@/lib/data/projects";
import { getAuthUser } from "./get-user";
import type { ActionResult, Project } from "@/lib/types";

export async function createProjectAction(
  _prev: ActionResult<Project> | null,
  formData: FormData,
): Promise<ActionResult<Project>> {
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    color: formData.get("color") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    const { userId } = await getAuthUser();
    const project = await createProject(userId, parsed.data);
    revalidatePath("/projects");
    return { ok: true, data: project };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create project." };
  }
}

export async function updateProjectAction(
  projectId: string,
  patch: Record<string, unknown>,
): Promise<ActionResult<Project>> {
  const parsed = updateProjectSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    const { userId } = await getAuthUser();
    const project = await updateProject(userId, projectId, parsed.data);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { ok: true, data: project };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update project." };
  }
}

export async function deleteProjectAction(projectId: string): Promise<void> {
  const { userId } = await getAuthUser();
  await deleteProject(userId, projectId);
  revalidatePath("/projects");
  redirect("/projects");
}
