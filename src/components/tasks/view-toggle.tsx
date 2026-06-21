"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutList, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "list";

  function setView(v: "list" | "board") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", v);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center rounded-md border p-0.5">
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-7 gap-1.5 px-2 text-xs", view === "list" && "bg-muted")}
        onClick={() => setView("list")}
      >
        <LayoutList className="size-3.5" />
        List
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-7 gap-1.5 px-2 text-xs", view === "board" && "bg-muted")}
        onClick={() => setView("board")}
      >
        <Columns3 className="size-3.5" />
        Board
      </Button>
    </div>
  );
}
