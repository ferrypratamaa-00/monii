import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  iconName: z.string().optional(),
});
