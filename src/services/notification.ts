import { and, eq } from "drizzle-orm";
import { sendNotificationToUser } from "@/app/api/notifications/stream/route";
import { db } from "@/db";
import type { NotificationType } from "@/db/schema";
import { notifications, users } from "@/db/schema";
import { playNotificationSound } from "@/lib/notification-utils";
import { generateBudgetAlertEmail, sendEmailNotification } from "./email";
import { NotificationPreferencesService } from "./notification-preferences";

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
) {
  // Create notification in database
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      message,
    })
    .returning();

  // Send real-time notification via SSE
  sendNotificationToUser(userId, {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt,
  });

  // Get user preferences for this notification type
  const preferences = await NotificationPreferencesService.getUserPreference(
    userId,
    type,
  );

  // Send email if enabled (default true)
  if (preferences?.emailEnabled !== false) {
    if (type === "BUDGET_ALERT") {
      await sendBudgetAlertEmail(userId, title, message);
    } else {
      // For other notification types, send basic email
      await sendBasicNotificationEmail(userId, title, message);
    }
  }

  // Play sound if enabled (default true)
  if (preferences?.soundEnabled !== false) {
    try {
      playNotificationSound(type);
    } catch (error) {
      console.error("Failed to play notification sound:", error);
    }
  }

  return notification;
}

async function sendBudgetAlertEmail(
  userId: number,
  title: string,
  message: string,
) {
  try {
    // Get user email
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.email) {
      console.warn(`No email found for user ${userId}`);
      return;
    }

    // Extract budget details from message
    // Message format: "You've exceeded your budget for Transport by Rp 10.000. Current spending: Rp 260.000 of Rp 250.000."
    const categoryMatch = message.match(/for (\w+) by/);
    const overAmountMatch = message.match(/by Rp ([\d.,]+)/);
    const currentSpendingMatch = message.match(
      /Current spending: Rp ([\d.,]+)/,
    );
    const limitAmountMatch = message.match(/of Rp ([\d.,]+)/);

    if (
      categoryMatch &&
      overAmountMatch &&
      currentSpendingMatch &&
      limitAmountMatch
    ) {
      const categoryName = categoryMatch[1];
      const overAmount = parseFloat(overAmountMatch[1].replace(/[.,]/g, ""));
      const currentSpending = parseFloat(
        currentSpendingMatch[1].replace(/[.,]/g, ""),
      );
      const limitAmount = parseFloat(limitAmountMatch[1].replace(/[.,]/g, ""));

      const emailContent = generateBudgetAlertEmail({
        userName: user.name || "User",
        categoryName,
        currentSpending,
        limitAmount,
        overAmount,
      });

      await sendEmailNotification({
        to: user.email,
        ...emailContent,
      });
    }
  } catch (error) {
    console.error("Failed to send budget alert email:", error);
    // Don't throw - email failure shouldn't break the notification creation
  }
}

async function sendBasicNotificationEmail(
  userId: number,
  title: string,
  message: string,
) {
  try {
    // Get user email
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.email) {
      console.warn(`No email found for user ${userId}`);
      return;
    }

    await sendEmailNotification({
      to: user.email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p style="color: #666; line-height: 1.6;">${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            You received this notification from Monii. You can manage your notification preferences in your account settings.
          </p>
        </div>
      `,
      text: `${title}\n\n${message}`,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
    // Don't throw - email failure shouldn't break the notification creation
  }
}

export async function getUnreadNotifications(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    )
    .orderBy(notifications.createdAt);
}

export async function getAllNotifications(userId: number) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt);
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: number,
) {
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    );
}

export async function markAllNotificationsAsRead(userId: number) {
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );
}
