import { z } from "zod";

export const AccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  initialBalance: z.number().min(0, "Initial balance must be positive"),
});
