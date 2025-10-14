import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function createNotification(
  userId: number,
  type: "BUDGET_ALERT" | "GOAL_REMINDER" | "TRANSACTION_ALERT",
  title: string,
  message: string,
) {
  return db.insert(notifications).values({
    userId,
    type,
    title,
    message,
  });
}

export async function getUnreadNotifications(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(notifications.createdAt);
}

export async function getAllNotifications(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt);
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}