"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { playNotificationSound, vibrate } from "@/lib/notification-utils";
import { useLanguage } from "@/components/LanguageProvider";

type Notification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const queryClient = useQueryClient();

  // Load sound preference
  useEffect(() => {
    const saved = localStorage.getItem("notification-sound");
    setSoundEnabled(saved !== "false");
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "unread", user?.id],
    queryFn: () => fetch("/api/notifications/unread").then((res) => res.json()),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.length;

  // Set up real-time notifications via SSE
  useEffect(() => {
    if (!user?.id) return;

    const eventSource = new EventSource(`/api/notifications/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "notification") {
          const notification = data.data;

          // Show toast notification
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
          });

          // Play sound and vibrate for important notifications
          if (notification.type === "BUDGET_ALERT") {
            if (soundEnabled) {
              playNotificationSound("warning");
            }
            vibrate([200, 100, 200]);
          } else {
            if (soundEnabled) {
              playNotificationSound("success");
            }
            vibrate(100);
          }

          // Refetch notifications to update the list
          queryClient.invalidateQueries({
            queryKey: ["notifications", "unread", user.id],
          });
        }
      } catch (error) {
        console.error("Error parsing SSE notification:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [user?.id, soundEnabled, queryClient]);

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread", user.id],
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread", user.id],
      });
      toast.success(t("notification.markedAsRead"));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error(t("notification.failedToMark"));
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("notification-sound", newValue.toString());

    toast.success(
      newValue ? t("notification.soundsEnabled") : t("notification.soundsDisabled"),
    );
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary rounded-md"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] h-5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 max-h-96 overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-sm">{t("notification.title")}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="h-8 w-8 p-0"
                title={soundEnabled ? t("notification.disableSounds") : t("notification.enableSounds")}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  {t("notification.markAllRead")}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t("notification.noNewNotifications")}</p>
                <p className="text-xs mt-1">{t("notification.allCaughtUp")}</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {notification.type === "BUDGET_ALERT" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              {t("notification.budget")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t("notification.markAsRead")}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full text-xs"
              >
                {t("notification.viewAll")}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
