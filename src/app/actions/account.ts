"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "@/services/account";

const AccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  initialBalance: z.number().min(0, "Initial balance must be positive"),
});

export async function createAccountAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = {
      name: formData.get("name") as string,
      initialBalance: parseFloat(formData.get("initialBalance") as string),
    };

    const result = AccountSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await createAccount(parseInt(session.user.id, 10), result.data);
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error creating account:", error);
    return { error: "Failed to create account" };
  }
}

export async function updateAccountAction(
  accountId: number,
  formData: FormData,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = {
      name: formData.get("name") as string,
      initialBalance: parseFloat(formData.get("initialBalance") as string),
    };

    const result = AccountSchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await updateAccount(parseInt(session.user.id, 10), accountId, result.data);
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error updating account:", error);
    return { error: "Failed to update account" };
  }
}

export async function deleteAccountAction(accountId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await deleteAccount(parseInt(session.user.id, 10), accountId);
    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { error: "Failed to delete account" };
  }
}

export async function getAccountsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const accounts = await getAccounts(parseInt(session.user.id, 10));
    return { accounts };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return { error: "Failed to fetch accounts" };
  }
}
