"use client";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-2xl z-50 max-w-sm mx-auto">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">{t("offline.message")}</p>
          <p className="text-xs opacity-90">{t("offline.description")}</p>
        </div>
      </div>
    </div>
  );
}
