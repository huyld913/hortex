import { NextResponse } from "next/server";
import { generateRecurringInstances } from "@/lib/data/recurring";

// Vercel Cron Job — runs daily at 01:00 UTC (see vercel.json).
// Protected by CRON_SECRET; Vercel injects it automatically for cron invocations.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  // Allow unauthenticated calls only in local dev (no secret configured)
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const result = await generateRecurringInstances(today);

  return NextResponse.json({
    ok: true,
    date: today,
    ...result,
  });
}
