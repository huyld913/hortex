import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  frequency: z.enum(["daily", "weekly", "weekdays", "custom"]).optional(),
  target_value: z.number().positive().nullable().optional(),
  unit: z.string().max(30).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  custom_days: z.array(z.number().int().min(0).max(6)).optional(),
});

export const updateHabitSchema = createHabitSchema
  .extend({ active: z.boolean().optional() })
  .partial();

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
