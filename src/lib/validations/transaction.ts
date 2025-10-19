import { z } from "zod";

export const TransactionSchema = z
  .object({
    accountId: z.number().int().positive(),
    categoryId: z.number().int().optional(),
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .number()
      .finite()
      .refine((v) => v !== 0, "Amount tidak boleh 0"),
    description: z.string().max(500).optional(),
    date: z.coerce.date(),
    isRecurring: z.boolean().default(false),
    userId: z.number().int().positive(),
  })
  .refine((d) => (d.type === "INCOME" ? d.amount > 0 : d.amount < 0), {
    message: "INCOME harus positif, EXPENSE harus negatif",
    path: ["amount"],
  });

export const TransactionFormSchema = z.object({
  accountId: z.number().int().positive(),
  categoryId: z.number().int().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .number()
    .finite()
    .refine((v) => v > 0, "Amount harus lebih dari 0"),
  description: z.string().max(500).optional(),
  date: z.date(),
  isRecurring: z.boolean(),
});
