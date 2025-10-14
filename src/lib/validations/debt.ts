import { z } from "zod";

export const DebtSchema = z.object({
  type: z.enum(["DEBT", "RECEIVABLE"]),
  personName: z.string().min(1, "Person name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().optional(),
});
