import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const auth = await verifyApiKey(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tasks?: unknown[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.tasks) || body.tasks.length === 0) {
    return NextResponse.json({ error: "tasks array is required" }, { status: 422 });
  }

  if (body.tasks.length > 100) {
    return NextResponse.json({ error: "Maximum 100 tasks per bulk insert" }, { status: 422 });
  }

  const rows = (body.tasks as Record<string, unknown>[]).map((t) => ({
    user_id: auth.userId,
    title: typeof t.title === "string" ? t.title.trim() : "",
    description: typeof t.description === "string" ? t.description : "",
    status: t.status ?? "todo",
    priority: t.priority ?? "p3",
    due_date: t.due_date ?? null,
    tags: Array.isArray(t.tags) ? t.tags : [],
    project_id: t.project_id ?? null,
  }));

  const invalid = rows.findIndex((r) => !r.title);
  if (invalid !== -1) {
    return NextResponse.json(
      { error: `tasks[${invalid}].title is required` },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("tasks").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ created: data?.length ?? 0, tasks: data }, { status: 201 });
}
