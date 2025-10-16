"use client";
import { Database, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { localStorageService } from "@/services/localStorage";
import { syncService } from "@/services/sync";
import { useLanguage } from "./LanguageProvider";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStatus, setCacheStatus] = useState(
    localStorageService.getCacheStatus(),
  );
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const { t } = useLanguage();

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Update cache and sync status
    const updateStatus = () => {
      setCacheStatus(localStorageService.getCacheStatus());
      setSyncStatus(syncService.getSyncStatus());
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateStatus();
      // Trigger sync when coming back online
      setTimeout(() => syncService.syncPendingData(), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline) return null;

  const hasAnyCache =
    cacheStatus.userData ||
    cacheStatus.dashboardData ||
    cacheStatus.categoriesData ||
    cacheStatus.accountsData;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-3 rounded-xl shadow-2xl z-50 max-w-sm mx-auto">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{t("offline.message")}</p>
          <p className="text-xs opacity-90">{t("offline.description")}</p>

          {hasAnyCache && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <Database className="w-3 h-3" />
              <span>Data tersimpan tersedia</span>
            </div>
          )}

          {syncStatus.pendingCount > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs">
              <RefreshCw className="w-3 h-3" />
              <span>{syncStatus.pendingCount} perubahan menunggu sync</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
