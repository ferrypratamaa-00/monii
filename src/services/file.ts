import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { files } from "@/db/schema";

export async function getUserFiles(userId: number, fileType?: string) {
  const conditions = [eq(files.userId, userId)];

  if (fileType) {
    conditions.push(eq(files.fileType, fileType));
  }

  return db
    .select()
    .from(files)
    .where(and(...conditions))
    .orderBy(files.uploadedAt);
}

export async function getTransactionFiles(transactionId: number) {
  return db
    .select()
    .from(files)
    .where(eq(files.transactionId, transactionId))
    .orderBy(files.uploadedAt);
}

export async function deleteFile(fileId: number, userId: number) {
  // First get the file to check ownership and get file path
  const [file] = await db
    .select()
    .from(files)
    .where(eq(files.id, fileId))
    .limit(1);

  if (!file || file.userId !== userId) {
    throw new Error("File not found or access denied");
  }

  // Delete from database
  await db.delete(files).where(eq(files.id, fileId));

  // TODO: Delete physical file from disk
  // For now, we'll keep the file on disk for safety

  return { success: true };
}

export async function updateFileTransactionId(
  fileId: number,
  transactionId: number,
  userId: number,
) {
  return db
    .update(files)
    .set({ transactionId })
    .where(and(eq(files.id, fileId), eq(files.userId, userId)));
}
