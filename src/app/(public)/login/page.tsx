"use client";

import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useId, useState } from "react";
import { getCurrentUser, loginAction } from "@/app/actions/auth";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useAuthStore } from "@/lib/stores/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();
  const { setUser, updateTokenRefresh, isAuthenticated } = useAuthStore();
  const userId = await getCurrentUser();
  if (userId && isAuthenticated) {
    router.push("/dashboard");
  }

  const mutation = useMutation({
    mutationFn: (formData: FormData) => loginAction(formData),
    onSuccess: async (data) => {
      if (data.success) {
        // Clear service worker cache to prevent stale data
        if ("serviceWorker" in navigator && "caches" in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log("Cache cleared after login");
          } catch (error) {
            console.error("Failed to clear cache:", error);
          }
        }

        // Fetch user data and update auth store
        try {
          const response = await fetch("/api/auth/me");
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
            updateTokenRefresh();
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }

        router.push("/dashboard");
      } else if (data.errors) {
        setMessage("Mohon perbaiki kesalahan, kemudian coba kembali.");
      } else {
        setMessage(data.error || "Email atau password salah.");
      }
    },
    onError: () => {
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-end">
            <InstallPrompt />
          </div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Masuk ke Monii</CardTitle>
          <CardDescription>
            Masukkan email dan password Anda untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {mutation.data?.errors?.email && (
                <p className="text-sm text-red-500/80">
                  {mutation.data.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {mutation.data?.errors?.password && (
                <p className="text-sm text-red-500/80">
                  {mutation.data.errors.password[0]}
                </p>
              )}
            </div>

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Masuk..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80"
            >
              Lupa password?
            </Link>
            <div className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-primary/80"
              >
                Daftar di sini
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
