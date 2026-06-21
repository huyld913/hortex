import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Tasks
      </Link>

      <TaskDetailForm task={task} projects={projects} />
    </div>
  );
}
