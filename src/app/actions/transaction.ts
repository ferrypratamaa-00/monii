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

  // Handle form data with potential prefixes (e.g., "1_accountId")
  const getFormValue = (key: string) => {
    // Try direct key first
    const value = formData.get(key);
    if (value !== null) return value;

    // Try with numeric prefixes (common with React Hook Form arrays)
    for (const [formKey, formValue] of formData.entries()) {
      if (formKey.endsWith(`_${key}`)) {
        return formValue;
      }
    }
    return null;
  };

  const data = {
    accountId: parseInt(getFormValue("accountId") as string, 10),
    categoryId: getFormValue("categoryId")
      ? parseInt(getFormValue("categoryId") as string, 10)
      : undefined,
    type: getFormValue("type") as "INCOME" | "EXPENSE",
    amount: parseFloat(getFormValue("amount") as string),
    description: (getFormValue("description") as string) || undefined,
    date: new Date(getFormValue("date") as string),
    isRecurring: getFormValue("isRecurring") === "true",
    userId,
  };

  const result = TransactionSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    console.log("Creating transaction with data:", result.data);
    const transaction = await createTransaction(result.data);
    console.log("Transaction created successfully:", transaction);
    return { success: true, id: transaction.id };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Create transaction error:", err.message);
    console.error("Error stack:", err.stack);
    return {
      success: false,
      error: "Gagal membuat transaksi. Silakan coba lagi.",
    };
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
    console.error("Associate files error:", err.message);
    return {
      success: false,
      error: "Gagal mengasosiasikan file. Silakan coba lagi.",
    };
  }
}
