"use client";

import { Bell, Mail, Smartphone, Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { NotificationType } from "@/db/schema";

interface NotificationPreference {
  notificationType: NotificationType;
  emailEnabled: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  BUDGET_ALERT: "Budget Alerts",
  GOAL_REMINDER: "Goal Reminders",
  TRANSACTION_ALERT: "Transaction Alerts",
};

const notificationTypeDescriptions: Record<NotificationType, string> = {
  BUDGET_ALERT: "Get notified when you exceed your budget limits",
  GOAL_REMINDER: "Receive reminders about your savings goals",
  TRANSACTION_ALERT: "Notifications for large or unusual transactions",
};

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch("/api/notification-preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = (
    notificationType: NotificationType,
    key: keyof Omit<NotificationPreference, "notificationType">,
    value: boolean,
  ) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.notificationType === notificationType
          ? { ...pref, [key]: value }
          : pref,
      ),
    );
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        toast.success("Notification preferences saved successfully");
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save notification preferences");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/notification-preferences/reset", {
        method: "POST",
      });

      if (response.ok) {
        await fetchPreferences();
        toast.success("Preferences reset to defaults");
      } else {
        throw new Error("Failed to reset preferences");
      }
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      toast.error("Failed to reset preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage how you receive notifications for different types of
            activities.
          </p>
        </div>

        <div className="space-y-6">
          {preferences.map((pref) => (
            <Card key={pref.notificationType}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {notificationTypeLabels[pref.notificationType]}
                </CardTitle>
                <CardDescription>
                  {notificationTypeDescriptions[pref.notificationType]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor={`${pref.notificationType}-email`}>
                      Email notifications
                    </Label>
                  </div>
                  <Switch
                    id={`${pref.notificationType}-email`}
                    checked={pref.emailEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference(
                        pref.notificationType,
                        "emailEnabled",
                        checked,
                      )
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label htmlFor={`${pref.notificationType}-sound`}>
                      Sound notifications
                    </Label>
                  </div>
                  <Switch
                    id={`${pref.notificationType}-sound`}
                    checked={pref.soundEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference(
                        pref.notificationType,
                        "soundEnabled",
                        checked,
                      )
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label htmlFor={`${pref.notificationType}-push`}>
                      Push notifications
                    </Label>
                  </div>
                  <Switch
                    id={`${pref.notificationType}-push`}
                    checked={pref.pushEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference(
                        pref.notificationType,
                        "pushEnabled",
                        checked,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
          <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
