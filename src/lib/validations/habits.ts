import { z } from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional(),
  frequency: z.enum(["daily", "weekly", "weekdays", "custom", "challenge"]).optional(),
  target_value: z.number().positive().nullable().optional(),
  unit: z.string().max(30).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  custom_days: z.array(z.number().int().min(0).max(6)).optional(),
  challenge_days: z.number().int().min(1).max(365).nullable().optional(),
});

export const updateHabitSchema = createHabitSchema
  .extend({ active: z.boolean().optional() })
  .partial();

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
