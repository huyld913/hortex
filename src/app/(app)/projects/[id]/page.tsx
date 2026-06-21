import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/lib/data/projects";
import { listTasks } from "@/lib/data/tasks";
import { TaskList } from "@/components/tasks/task-list";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { ProjectDetailClient } from "@/components/projects/project-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Project · Hortex" };
  const project = await getProject(user.id, id);
  return { title: project ? `${project.name} · Hortex` : "Project not found · Hortex" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [project, tasks] = await Promise.all([
    getProject(user.id, id),
    listTasks(user.id, { project_id: id }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Projects
      </Link>

      <ProjectDetailClient project={project} />

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Tasks</h2>
        <div className="rounded-lg border bg-card px-3 py-2">
          <QuickAddTask defaultProjectId={project.id} />
        </div>
        <div className="rounded-lg border bg-card px-2 py-1">
          <TaskList tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
