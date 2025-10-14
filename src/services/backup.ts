import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { db } from "@/db";
import {
  accounts,
  badges,
  budgets,
  categories,
  debts,
  goalMembers,
  goals,
  transactions,
  users,
} from "@/db/schema";
import { AuditService } from "./audit";

export interface BackupData {
  timestamp: Date;
  version: string;
  users: any[];
  accounts: any[];
  transactions: any[];
  categories: any[];
  debts: any[];
  budgets: any[];
  goals: any[];
  goalMembers: any[];
  badges: any[];
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  checksum: string;
  userId?: number;
}

export class BackupService {
  private static readonly BACKUP_DIR = path.join(process.cwd(), "backups");
  private static readonly MAX_BACKUPS = 10;

  static async createFullDataBackup(userId: number) {
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

    const goalsData = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));

    const goalMembersData = await db
      .select()
      .from(goalMembers)
      .where(eq(goalMembers.userId, userId));

    const badgesData = await db
      .select()
      .from(badges)
      .where(eq(badges.userId, userId));

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
      goals: goalsData,
      goalMembers: goalMembersData,
      badges: badgesData,
    };

    return backup;
  }

  static async createBackup(userId: number): Promise<string> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(BackupService.BACKUP_DIR, { recursive: true });

      const timestamp = new Date();
      const backupId = `backup_${timestamp.getTime()}_${userId}`;

      const data = await BackupService.createFullDataBackup(userId);

      // Save backup to file
      const backupPath = path.join(
        BackupService.BACKUP_DIR,
        `${backupId}.json`,
      );
      const backupContent = JSON.stringify(data, null, 2);
      await fs.writeFile(backupPath, backupContent, "utf-8");

      // Calculate checksum
      const crypto = await import("crypto");
      const checksum = crypto.default
        .createHash("sha256")
        .update(backupContent)
        .digest("hex");

      // Clean up old backups
      await BackupService.cleanupOldBackups(userId);

      // Audit logging
      await AuditService.logEvent({
        userId,
        eventType: "system",
        resource: "backup",
        action: "create_backup",
        details: {
          backupId,
          size: backupContent.length,
          checksum,
        },
      });

      return backupId;
    } catch (error) {
      console.error("Backup creation failed:", error);
      throw new Error("Failed to create backup");
    }
  }

  static async restoreBackup(backupId: string, userId: number): Promise<void> {
    try {
      const backupPath = path.join(
        BackupService.BACKUP_DIR,
        `${backupId}.json`,
      );

      // Check if backup exists and belongs to user
      try {
        await fs.access(backupPath);
      } catch {
        throw new Error("Backup file not found");
      }

      // Verify backup belongs to user
      if (!backupId.includes(`_${userId}`)) {
        throw new Error("Unauthorized access to backup");
      }

      const backupContent = await fs.readFile(backupPath, "utf-8");
      const backupData = JSON.parse(backupContent);

      // Validate backup data
      if (!backupData.exportedAt || !backupData.version) {
        throw new Error("Invalid backup file format");
      }

      // Begin transaction for restore
      await db.transaction(async (tx) => {
        // Delete existing user data
        await tx.delete(badges).where(eq(badges.userId, userId));
        await tx.delete(goalMembers).where(eq(goalMembers.userId, userId));
        await tx.delete(goals).where(eq(goals.userId, userId));
        await tx.delete(budgets).where(eq(budgets.userId, userId));
        await tx.delete(debts).where(eq(debts.userId, userId));
        await tx.delete(categories).where(eq(categories.userId, userId));
        await tx.delete(transactions).where(eq(transactions.userId, userId));
        await tx.delete(accounts).where(eq(accounts.userId, userId));

        // Restore user data
        for (const account of backupData.accounts) {
          await tx.insert(accounts).values(account);
        }
        for (const category of backupData.categories) {
          await tx.insert(categories).values(category);
        }
        for (const transaction of backupData.transactions) {
          await tx.insert(transactions).values(transaction);
        }
        for (const debt of backupData.debts) {
          await tx.insert(debts).values(debt);
        }
        for (const budget of backupData.budgets) {
          await tx.insert(budgets).values(budget);
        }
        for (const goal of backupData.goals) {
          await tx.insert(goals).values(goal);
        }
        for (const member of backupData.goalMembers) {
          await tx.insert(goalMembers).values(member);
        }
        for (const badge of backupData.badges) {
          await tx.insert(badges).values(badge);
        }
      });

      // Audit logging
      await AuditService.logEvent({
        userId,
        eventType: "system",
        resource: "backup",
        action: "restore_backup",
        details: { backupId },
      });
    } catch (error) {
      console.error("Backup restoration failed:", error);
      throw new Error("Failed to restore backup");
    }
  }

  static async listBackups(userId: number): Promise<BackupMetadata[]> {
    try {
      const files = await fs.readdir(BackupService.BACKUP_DIR);
      const userBackupFiles = files.filter(
        (file) =>
          file.startsWith("backup_") &&
          file.endsWith(".json") &&
          file.includes(`_${userId}`),
      );

      const backups: BackupMetadata[] = [];

      for (const file of userBackupFiles) {
        const filePath = path.join(BackupService.BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, "utf-8");

        const crypto = await import("crypto");
        const checksum = crypto.default
          .createHash("sha256")
          .update(content)
          .digest("hex");

        const backupId = file.replace(".json", "");

        backups.push({
          id: backupId,
          timestamp: stats.mtime,
          size: stats.size,
          checksum,
          userId,
        });
      }

      // Sort by timestamp descending
      return backups.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
    } catch (error) {
      console.error("Failed to list backups:", error);
      return [];
    }
  }

  private static async cleanupOldBackups(userId: number): Promise<void> {
    try {
      const backups = await BackupService.listBackups(userId);

      if (backups.length > BackupService.MAX_BACKUPS) {
        const toDelete = backups.slice(BackupService.MAX_BACKUPS);

        for (const backup of toDelete) {
          const filePath = path.join(
            BackupService.BACKUP_DIR,
            `${backup.id}.json`,
          );
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error("Failed to cleanup old backups:", error);
    }
  }

  static async exportData(
    userId: number,
    format: "json" | "csv" = "json",
  ): Promise<string> {
    try {
      const data = await BackupService.createFullDataBackup(userId);

      if (format === "csv") {
        return BackupService.convertToCSV(data);
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      console.error("Data export failed:", error);
      throw new Error("Failed to export data");
    }
  }

  private static convertToCSV(data: any): string {
    const lines: string[] = [];

    // Transactions CSV
    lines.push("Transactions");
    lines.push(
      "ID,Account ID,Category ID,Type,Amount,Description,Date,Is Recurring",
    );
    for (const transaction of data.transactions) {
      lines.push(
        [
          transaction.id,
          transaction.accountId,
          transaction.categoryId || "",
          transaction.type,
          transaction.amount,
          `"${transaction.description || ""}"`,
          transaction.date,
          transaction.isRecurring,
        ].join(","),
      );
    }

    lines.push("");
    lines.push("Accounts");
    lines.push("ID,Name,Initial Balance,Current Balance,Created At");
    for (const account of data.accounts) {
      lines.push(
        [
          account.id,
          `"${account.name}"`,
          account.initialBalance,
          account.balance,
          account.createdAt,
        ].join(","),
      );
    }

    return lines.join("\n");
  }
}

export async function generateBackupJSON(userId: number) {
  const backup = await BackupService.createFullDataBackup(userId);
  return JSON.stringify(backup, null, 2);
}
