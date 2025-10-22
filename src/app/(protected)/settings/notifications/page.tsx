"use client";

import {
  Bell,
  Mail,
  Settings,
  Smartphone,
  TestTube,
  Volume2,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationType } from "@/db/schema";

interface NotificationPreference {
  notificationType: NotificationType;
  emailEnabled: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

interface GlobalSettings {
  masterEmailEnabled: boolean;
  masterSoundEnabled: boolean;
  masterPushEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
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

const notificationTypeIcons: Record<NotificationType, string> = {
  BUDGET_ALERT: "💰",
  GOAL_REMINDER: "🎯",
  TRANSACTION_ALERT: "💳",
};

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    masterEmailEnabled: true,
    masterSoundEnabled: true,
    masterPushEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/notification-preferences");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched preferences:", data);
        setPreferences(data);
      } else {
        const errorData = await response.json();
        setError(`Failed to load preferences: ${errorData.error}`);
        toast.error("Failed to load notification preferences");
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      setError("Network error while loading preferences");
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

  const updateGlobalSetting = (
    key: keyof GlobalSettings,
    value: string | boolean,
  ) => {
    setGlobalSettings((prev) => ({ ...prev, [key]: value }));
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save preferences");
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset preferences");
      }
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      toast.error("Failed to reset preferences");
    } finally {
      setSaving(false);
    }
  };

  const testNotification = (type: NotificationType) => {
    // This would trigger a test notification
    toast.success(`Test ${notificationTypeLabels[type]} sent!`, {
      description: "Check your notifications to see how it looks.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Bell className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Error Loading Settings</h2>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Button onClick={fetchPreferences}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage how you receive notifications for different types of
            activities in your Monii account.
          </p>
        </div>

        <Tabs defaultValue="types" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="types">Notification Types</TabsTrigger>
            <TabsTrigger value="global">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="space-y-6">
            <div className="grid gap-6">
              {preferences.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notification preferences found.</p>
                      <p className="text-sm mt-1">
                        Try refreshing the page or contact support if the
                        problem persists.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                preferences.map((pref) => (
                  <Card key={pref.notificationType} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {notificationTypeIcons[pref.notificationType]}
                          </span>
                          <div>
                            <CardTitle className="text-lg">
                              {notificationTypeLabels[pref.notificationType]}
                            </CardTitle>
                            <CardDescription>
                              {
                                notificationTypeDescriptions[
                                  pref.notificationType
                                ]
                              }
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            testNotification(pref.notificationType)
                          }
                          className="flex items-center gap-2"
                        >
                          <TestTube className="h-4 w-4" />
                          Test
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <Label
                              htmlFor={`${pref.notificationType}-email`}
                              className="text-sm font-medium"
                            >
                              Email
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

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-green-500" />
                            <Label
                              htmlFor={`${pref.notificationType}-sound`}
                              className="text-sm font-medium"
                            >
                              Sound
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

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-purple-500" />
                            <Label
                              htmlFor={`${pref.notificationType}-push`}
                              className="text-sm font-medium"
                            >
                              Push
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Notification Settings
                </CardTitle>
                <CardDescription>
                  Master controls that affect all notification types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <Label className="text-sm font-medium">All Emails</Label>
                    </div>
                    <Switch
                      checked={globalSettings.masterEmailEnabled}
                      onCheckedChange={(checked) =>
                        updateGlobalSetting("masterEmailEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-green-500" />
                      <Label className="text-sm font-medium">All Sounds</Label>
                    </div>
                    <Switch
                      checked={globalSettings.masterSoundEnabled}
                      onCheckedChange={(checked) =>
                        updateGlobalSetting("masterSoundEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      <Label className="text-sm font-medium">All Push</Label>
                    </div>
                    <Switch
                      checked={globalSettings.masterPushEnabled}
                      onCheckedChange={(checked) =>
                        updateGlobalSetting("masterPushEnabled", checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Quiet Hours</Label>
                      <p className="text-xs text-muted-foreground">
                        Disable notifications during specified hours
                      </p>
                    </div>
                    <Switch
                      checked={globalSettings.quietHoursEnabled}
                      onCheckedChange={(checked) =>
                        updateGlobalSetting("quietHoursEnabled", checked)
                      }
                    />
                  </div>

                  {globalSettings.quietHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4 ml-4">
                      <div>
                        <Label htmlFor="quiet-start" className="text-sm">
                          Start Time
                        </Label>
                        <input
                          id="quiet-start"
                          type="time"
                          value={globalSettings.quietHoursStart}
                          onChange={(e) =>
                            updateGlobalSetting(
                              "quietHoursStart",
                              e.target.value,
                            )
                          }
                          className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiet-end" className="text-sm">
                          End Time
                        </Label>
                        <input
                          id="quiet-end"
                          type="time"
                          value={globalSettings.quietHoursEnd}
                          onChange={(e) =>
                            updateGlobalSetting("quietHoursEnd", e.target.value)
                          }
                          className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-8 pt-6 border-t">
          <Button
            onClick={savePreferences}
            disabled={saving}
            className="flex-1"
          >
            {saving ? "Saving..." : "Save All Preferences"}
          </Button>
          <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
            Reset to Defaults
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Debug Information</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Preferences loaded: {preferences.length} types</p>
            <p>
              Types: {preferences.map((p) => p.notificationType).join(", ")}
            </p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
