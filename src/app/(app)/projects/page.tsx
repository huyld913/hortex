import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProjects } from "@/lib/data/projects";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = { title: "Projects · Hortex" };

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const projects = await listProjects(user.id);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>

      {/* Project grid */}
      {projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate font-medium">{p.name}</span>
              </div>
              {p.description && (
                <p className="mt-1.5 truncate text-xs text-muted-foreground">{p.description}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{STATUS_LABEL[p.status]}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      )}

      {/* Create form */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-sm font-semibold">New project</h2>
        <ProjectForm />
      </div>
    </div>
  );
}
