"use server";

import { TransactionSchema } from "@/lib/validations/transaction";
import { updateFileTransactionId } from "@/services/file";
import { createTransaction } from "@/services/transaction";
import { getCurrentUser } from "./auth";

export async function createTransactionAction(formData: FormData) {
  const userId = await getCurrentUser();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const data = {
    accountId: parseInt(formData.get("accountId") as string, 10),
    categoryId: formData.get("categoryId")
      ? parseInt(formData.get("categoryId") as string, 10)
      : undefined,
    type: formData.get("type") as "INCOME" | "EXPENSE",
    amount: parseFloat(formData.get("amount") as string),
    description: (formData.get("description") as string) || undefined,
    date: new Date(formData.get("date") as string),
    isRecurring: formData.get("isRecurring") === "true",
    userId,
  };

  const result = TransactionSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const transaction = await createTransaction(result.data);
    return { success: true, id: transaction.id };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function associateFilesWithTransactionAction(
  transactionId: number,
  fileIds: number[],
) {
  const userId = await getCurrentUser();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    for (const fileId of fileIds) {
      await updateFileTransactionId(fileId, transactionId, userId);
    }
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}
