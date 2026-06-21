import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type RecurringRule = "daily" | "weekdays" | "weekly" | "monthly";

export const RECURRING_RULE_LABELS: Record<RecurringRule, string> = {
  daily: "Daily",
  weekdays: "Weekdays (Mon–Fri)",
  weekly: "Weekly",
  monthly: "Monthly",
};

/** Advance a due_date string (YYYY-MM-DD) to the next occurrence. */
export function nextDueDate(currentDue: string, rule: RecurringRule): string {
  // Parse as noon UTC to avoid any DST edge cases when converting back to date string
  const d = new Date(`${currentDue}T12:00:00Z`);

  switch (rule) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case "weekdays": {
      // Skip Saturday (6) and Sunday (0)
      do {
        d.setUTCDate(d.getUTCDate() + 1);
      } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
      break;
    }
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "monthly":
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
  }

  return d.toISOString().split("T")[0];
}

interface RecurringTemplate {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: string;
  project_id: string | null;
  due_date: string;
  recurring_rule: string;
  tags: string[];
}

export interface GenerateResult {
  generated: number;
  skipped: number;
  errors: string[];
}

/**
 * Generate task instances from all overdue/due recurring templates.
 * Runs across all users (uses admin client — server-only).
 * Safe to call multiple times in a day: skips if an instance already exists.
 */
export async function generateRecurringInstances(
  today: string,
): Promise<GenerateResult> {
  const admin = createAdminClient();
  const result: GenerateResult = { generated: 0, skipped: 0, errors: [] };

  // Find all active recurring templates where due_date <= today
  const { data: templates, error: fetchError } = await admin
    .from("tasks")
    .select(
      "id, user_id, title, description, priority, project_id, due_date, recurring_rule, tags",
    )
    .not("recurring_rule", "is", null)
    .not("status", "eq", "cancelled")
    .lte("due_date", today);

  if (fetchError) {
    result.errors.push(`Failed to fetch templates: ${fetchError.message}`);
    return result;
  }

  if (!templates?.length) return result;

  for (const template of templates as RecurringTemplate[]) {
    try {
      // Check if an instance for this template + due_date already exists
      const { count } = await admin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("recurring_instance_of", template.id)
        .eq("due_date", template.due_date);

      if ((count ?? 0) > 0) {
        result.skipped++;
      } else {
        // Create the instance
        const { error: insertError } = await admin.from("tasks").insert({
          user_id: template.user_id,
          title: template.title,
          description: template.description,
          priority: template.priority,
          project_id: template.project_id,
          due_date: template.due_date,
          tags: template.tags,
          status: "todo",
          // No recurring_rule — instances are one-off
          recurring_instance_of: template.id,
        });

        if (insertError) {
          result.errors.push(
            `Template ${template.id}: ${insertError.message}`,
          );
          continue;
        }
        result.generated++;
      }

      // Advance the template's due_date to next occurrence
      const next = nextDueDate(
        template.due_date,
        template.recurring_rule as RecurringRule,
      );
      await admin
        .from("tasks")
        .update({ due_date: next })
        .eq("id", template.id);
    } catch (e) {
      result.errors.push(
        `Template ${template.id}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  return result;
}
