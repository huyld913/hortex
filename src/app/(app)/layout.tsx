import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this, but we redirect here too as defense in depth.
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r bg-sidebar p-4">
        <div className="flex items-center justify-between px-1 pb-6">
          <span className="text-lg font-semibold tracking-tight">Hortex</span>
          <ThemeToggle />
        </div>

        <SidebarNav />

        <div className="mt-auto border-t pt-4">
          <p className="truncate px-1 pb-2 text-xs text-muted-foreground">
            {user.email}
          </p>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-8">{children}</div>
      </main>
    </div>
  );
}
