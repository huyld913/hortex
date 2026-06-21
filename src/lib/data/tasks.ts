import { createClient } from "@/lib/supabase/server";
import type { Task, TaskFilters } from "@/lib/types";

export async function listTasks(
  userId: string,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(
      `*, project:projects(id, name, color)`,
    )
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  // Top-level only by default (parent_task_id = null means top-level)
  if (filters.parent_task_id === undefined) {
    query = query.is("parent_task_id", null);
  } else if (filters.parent_task_id !== null) {
    query = query.eq("parent_task_id", filters.parent_task_id);
  }

  if (filters.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters.priority?.length) {
    query = query.in("priority", filters.priority);
  }
  if (filters.project_id) {
    query = query.eq("project_id", filters.project_id);
  }
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }
  if (filters.due_before) {
    query = query.lte("due_date", filters.due_before);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function getTask(
  userId: string,
  taskId: string,
): Promise<Task | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`*, project:projects(id, name, color), subtasks:tasks(*)`)
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data as Task;
}

export async function createTask(
  userId: string,
  input: {
    title: string;
    description?: string;
    status?: Task["status"];
    priority?: Task["priority"];
    due_date?: string | null;
    tags?: string[];
    project_id?: string | null;
    parent_task_id?: string | null;
    sort_order?: number;
  },
): Promise<Task> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({ user_id: userId, ...input })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  patch: Partial<
    Pick<
      Task,
      | "title"
      | "description"
      | "status"
      | "priority"
      | "due_date"
      | "tags"
      | "project_id"
      | "parent_task_id"
      | "sort_order"
    >
  >,
): Promise<Task> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function deleteTask(
  userId: string,
  taskId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function listProjects(
  userId: string,
): Promise<Array<{ id: string; name: string; color: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, color")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
