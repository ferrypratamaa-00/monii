"use client";

import { ArrowLeft, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { t } = useLanguage();

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      // Clear service worker cache to prevent stale data
      if ("serviceWorker" in navigator && "caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
          console.log("Cache cleared after logout");
        } catch (error) {
          console.error("Failed to clear cache:", error);
        }
      }

      // Clear client-side auth state
      logout();

      router.push("/login");
    } else {
      console.error("Logout failed:", result.error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">Account</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">user@example.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member since</p>
                <p className="text-sm">January 2024</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account status</p>
                <p className="text-sm text-green-600">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}