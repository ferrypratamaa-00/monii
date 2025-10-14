import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  accounts,
  budgets,
  categories,
  debts,
  transactions,
  users,
} from "@/db/schema";

export async function createFullDataBackup(userId: number) {
  // Fetch all user data
  const [userData] = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userData) {
    throw new Error("User not found");
  }

  const accountsData = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId));

  const categoriesData = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));

  const transactionsData = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  const debtsData = await db
    .select()
    .from(debts)
    .where(eq(debts.userId, userId));

  const budgetsData = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId));

  // Create backup object
  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    user: userData,
    accounts: accountsData,
    categories: categoriesData,
    transactions: transactionsData,
    debts: debtsData,
    budgets: budgetsData,
  };

  return backup;
}

export async function generateBackupJSON(userId: number) {
  const backup = await createFullDataBackup(userId);
  return JSON.stringify(backup, null, 2);
}
