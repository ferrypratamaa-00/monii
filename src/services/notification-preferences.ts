import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import type { NotificationType } from "@/db/schema";
import { notificationTypeEnum, userNotificationPreferences } from "@/db/schema";

export interface NotificationPreferences {
  notificationType: NotificationType;
  emailEnabled: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

export class NotificationPreferencesService {
  static async getUserPreferences(
    userId: number,
  ): Promise<NotificationPreferences[]> {
    const preferences = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));

    // If no preferences exist, return defaults for all notification types
    if (preferences.length === 0) {
      return notificationTypeEnum.enumValues.map((type) => ({
        notificationType: type,
        emailEnabled: true,
        soundEnabled: true,
        pushEnabled: false,
      }));
    }

    return preferences.map((pref) => ({
      notificationType: pref.notificationType,
      emailEnabled: pref.emailEnabled,
      soundEnabled: pref.soundEnabled,
      pushEnabled: pref.pushEnabled,
    }));
  }

  static async getUserPreference(
    userId: number,
    notificationType: NotificationType,
  ): Promise<NotificationPreferences | null> {
    const preference = await db
      .select()
      .from(userNotificationPreferences)
      .where(
        and(
          eq(userNotificationPreferences.userId, userId),
          eq(userNotificationPreferences.notificationType, notificationType),
        ),
      )
      .limit(1);

    if (preference.length === 0) {
      return null;
    }

    const pref = preference[0];
    return {
      notificationType: pref.notificationType,
      emailEnabled: pref.emailEnabled,
      soundEnabled: pref.soundEnabled,
      pushEnabled: pref.pushEnabled,
    };
  }

  static async updateUserPreference(
    userId: number,
    notificationType: NotificationType,
    updates: Partial<Omit<NotificationPreferences, "notificationType">>,
  ): Promise<void> {
    const existing = await NotificationPreferencesService.getUserPreference(
      userId,
      notificationType,
    );

    if (existing) {
      await db
        .update(userNotificationPreferences)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userNotificationPreferences.userId, userId),
            eq(userNotificationPreferences.notificationType, notificationType),
          ),
        );
    } else {
      await db.insert(userNotificationPreferences).values({
        userId,
        notificationType,
        emailEnabled: updates.emailEnabled ?? true,
        soundEnabled: updates.soundEnabled ?? true,
        pushEnabled: updates.pushEnabled ?? false,
      });
    }
  }

  static async updateMultiplePreferences(
    userId: number,
    preferences: NotificationPreferences[],
  ): Promise<void> {
    for (const pref of preferences) {
      await NotificationPreferencesService.updateUserPreference(
        userId,
        pref.notificationType,
        {
          emailEnabled: pref.emailEnabled,
          soundEnabled: pref.soundEnabled,
          pushEnabled: pref.pushEnabled,
        },
      );
    }
  }

  static async resetToDefaults(userId: number): Promise<void> {
    // Delete existing preferences
    await db
      .delete(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, userId));

    // Insert defaults for all notification types
    const defaults = notificationTypeEnum.enumValues.map((type) => ({
      userId,
      notificationType: type,
      emailEnabled: true,
      soundEnabled: true,
      pushEnabled: false,
    }));

    await db.insert(userNotificationPreferences).values(defaults);
  }
}
