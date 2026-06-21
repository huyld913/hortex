"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/tasks";
import {
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/data/tasks";
import type { ActionResult, Task } from "@/lib/types";

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  return user.id;
}

export async function createTaskAction(
  _prev: ActionResult<Task> | null,
  formData: FormData,
): Promise<ActionResult<Task>> {
  const raw = {
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    status: formData.get("status") ?? undefined,
    priority: formData.get("priority") ?? undefined,
    due_date: formData.get("due_date") ?? undefined,
    project_id: formData.get("project_id") ?? undefined,
    parent_task_id: formData.get("parent_task_id") ?? undefined,
    tags: formData.getAll("tags"),
  };

  const parsed = createTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const userId = await getUserId();
    const task = await createTask(userId, parsed.data);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { ok: true, data: task };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to create task." };
  }
}

export async function updateTaskAction(
  taskId: string,
  patch: Record<string, unknown>,
): Promise<ActionResult<Task>> {
  const parsed = updateTaskSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const userId = await getUserId();
    const task = await updateTask(userId, taskId, parsed.data);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { ok: true, data: task };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update task." };
  }
}

export async function toggleTaskCompleteAction(
  taskId: string,
  currentStatus: Task["status"],
): Promise<ActionResult<Task>> {
  const newStatus = currentStatus === "done" ? "todo" : "done";
  return updateTaskAction(taskId, { status: newStatus });
}

export async function deleteTaskAction(
  taskId: string,
): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await deleteTask(userId, taskId);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete task." };
  }
}
