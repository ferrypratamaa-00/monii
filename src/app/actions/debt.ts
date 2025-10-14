"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createDebt,
  deleteDebt,
  getDebts,
  markAsPaid,
  updateDebt,
} from "@/services/debt";

const DebtSchema = z.object({
  type: z.enum(["DEBT", "RECEIVABLE"]),
  personName: z.string().min(1, "Person name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  dueDate: z.string().optional(),
});

export async function createDebtAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = {
      type: formData.get("type") as "DEBT" | "RECEIVABLE",
      personName: formData.get("personName") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: (formData.get("dueDate") as string) || undefined,
    };

    const result = DebtSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const processedData = {
      ...result.data,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
    };

    await createDebt(parseInt(session.user.id, 10), processedData);
    revalidatePath("/debts");
    return { success: true };
  } catch (error) {
    console.error("Error creating debt:", error);
    return { error: "Failed to create debt" };
  }
}

export async function updateDebtAction(debtId: number, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = {
      type: formData.get("type") as "DEBT" | "RECEIVABLE",
      personName: formData.get("personName") as string,
      amount: parseFloat(formData.get("amount") as string),
      dueDate: (formData.get("dueDate") as string) || undefined,
    };

    const result = DebtSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    const processedData = {
      ...result.data,
      dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
    };

    await updateDebt(parseInt(session.user.id, 10), debtId, processedData);
    revalidatePath("/debts");
    return { success: true };
  } catch (error) {
    console.error("Error updating debt:", error);
    return { error: "Failed to update debt" };
  }
}

export async function deleteDebtAction(debtId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await deleteDebt(parseInt(session.user.id, 10), debtId);
    revalidatePath("/debts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting debt:", error);
    return { error: "Failed to delete debt" };
  }
}

export async function markAsPaidAction(debtId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await markAsPaid(parseInt(session.user.id, 10), debtId);
    revalidatePath("/debts");
    return { success: true };
  } catch (error) {
    console.error("Error marking debt as paid:", error);
    return { error: "Failed to mark debt as paid" };
  }
}

export async function getDebtsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const debts = await getDebts(parseInt(session.user.id, 10));
    return { debts };
  } catch (error) {
    console.error("Error fetching debts:", error);
    return { error: "Failed to fetch debts" };
  }
}
