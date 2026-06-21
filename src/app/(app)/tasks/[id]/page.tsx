import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTask, listProjects } from "@/lib/data/tasks";
import { TaskDetailForm } from "@/components/tasks/task-detail-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Task · Hortex" };
  const task = await getTask(user.id, id);
  return { title: task ? `${task.title} · Hortex` : "Task not found · Hortex" };
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [task, projects] = await Promise.all([
    getTask(user.id, id),
    listProjects(user.id),
  ]);

  if (!task) notFound();

  // Fetch parent task if this is a subtask
  const parentTask = task.parent_task_id
    ? await getTask(user.id, task.parent_task_id)
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/tasks" className="hover:text-foreground transition-colors">
          Tasks
        </Link>
        {parentTask && (
          <>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              href={`/tasks/${parentTask.id}`}
              className="hover:text-foreground transition-colors truncate max-w-45"
            >
              {parentTask.title}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-45">
          {task.title}
        </span>
      </nav>

      <TaskDetailForm task={task} projects={projects} parentTask={parentTask} />
    </div>
  );
}
