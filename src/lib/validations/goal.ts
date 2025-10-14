import { z } from "zod";

export const CreatePersonalGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Goal name is required")
    .max(120, "Goal name too long"),
  targetAmount: z.number().positive("Target amount must be positive"),
  deadline: z.coerce.date().optional(),
});

export const CreateJointGoalSchema = CreatePersonalGoalSchema.extend({
  memberUserIds: z
    .array(z.number().int().positive())
    .min(1, "At least one member required"),
});

export const ContributeToGoalSchema = z.object({
  goalId: z.number().int().positive("Invalid goal ID"),
  amount: z.number().positive("Contribution amount must be positive"),
  accountId: z.number().int().positive("Invalid account ID"),
});

export const DeleteGoalSchema = z.object({
  goalId: z.number().int().positive("Invalid goal ID"),
});

export type CreatePersonalGoalInput = z.infer<typeof CreatePersonalGoalSchema>;
export type CreateJointGoalInput = z.infer<typeof CreateJointGoalSchema>;
export type ContributeToGoalInput = z.infer<typeof ContributeToGoalSchema>;
export type DeleteGoalInput = z.infer<typeof DeleteGoalSchema>;
