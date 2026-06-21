import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard · Hortex" };

export default function DashboardPage() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Today-focused overview lands here next (P1).
      </p>
    </div>
  );
}
