import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tasks · Hortex" };

export default function TasksPage() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
      <p className="text-sm text-muted-foreground">
        List and Board views land here next (P1).
      </p>
    </div>
  );
}
