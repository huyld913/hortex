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

  const admin = createAdminClient();
  const userId = auth.userId;
  const today = new Date().toISOString().split("T")[0];

  let habitId = typeof body.habit_id === "string" ? body.habit_id : null;

  // Resolve by name if id not provided
  if (!habitId && typeof body.habit_name === "string") {
    const { data } = await admin
      .from("habits")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", body.habit_name)
      .single();

    if (!data) {
      return NextResponse.json({ error: `Habit "${body.habit_name}" not found` }, { status: 404 });
    }
    habitId = data.id as string;
  }

  if (!habitId) {
    return NextResponse.json(
      { error: "habit_id or habit_name is required" },
      { status: 422 },
    );
  }

  const { data, error } = await admin
    .from("habit_logs")
    .upsert(
      {
        habit_id: habitId,
        user_id: userId,
        log_date: typeof body.log_date === "string" ? body.log_date : today,
        value: typeof body.value === "number" ? body.value : 1,
        note: typeof body.note === "string" ? body.note : "",
      },
      { onConflict: "habit_id,log_date" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
