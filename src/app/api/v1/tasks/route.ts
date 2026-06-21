import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth/api-key";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const auth = await verifyApiKey(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tasks")
    .insert({
      user_id: auth.userId,
      title,
      description: typeof body.description === "string" ? body.description : "",
      status: body.status ?? "todo",
      priority: body.priority ?? "p3",
      due_date: body.due_date ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      project_id: body.project_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
