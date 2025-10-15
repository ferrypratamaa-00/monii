import { z } from "zod";

export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  categoryId: z.number().optional(),
  accountId: z.number().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
});
