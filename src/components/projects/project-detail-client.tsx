"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateProjectAction, deleteProjectAction } from "@/lib/actions/projects";
import type { Project } from "@/lib/types";

const STATUS_OPTIONS: { value: Project["status"]; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
];

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(project.name);

  function save(patch: Record<string, unknown>) {
    startTransition(async () => {
      await updateProjectAction(project.id, patch);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProjectAction(project.id);
      router.push("/projects");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== project.name && save({ name })}
            className="h-auto border-none bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
            disabled={isPending}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {STATUS_OPTIONS.find((o) => o.value === project.status)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onSelect={() => save({ status: opt.value })}
                  className="text-xs"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Color picker */}
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => save({ color: c })}
            className="size-5 rounded-full ring-offset-2 transition-all hover:scale-110"
            style={{
              backgroundColor: c,
              boxShadow: project.color === c ? `0 0 0 2px var(--color-background), 0 0 0 4px ${c}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
