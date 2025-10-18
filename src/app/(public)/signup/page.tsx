"use client";

import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUpAction } from "@/app/actions/auth";
import { InstallPrompt } from "@/components/InstallPrompt";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => signUpAction(formData),
    onSuccess: (data) => {
      if (data.success) {
        router.push("/dashboard");
      } else if (data.errors) {
        setMessage("Mohon perbaiki kesalahan di bawah ini.");
      } else {
        setMessage(data.error || "Terjadi kesalahan saat mendaftar.");
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
    formData.append("confirmPassword", confirmPassword);
    formData.append("name", name);
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Daftar Akun Monii</CardTitle>
          <CardDescription>
            Buat akun baru untuk mulai mengelola keuangan Anda.
          </CardDescription>
          <div className="mt-4">
            <InstallPrompt />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {mutation.data?.errors?.name && (
                <p className="text-sm text-red-600">
                  {mutation.data.errors.name[0]}
                </p>
              )}
            </div>

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
                <p className="text-sm text-red-600">
                  {mutation.data.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {mutation.data?.errors?.password && (
                <p className="text-sm text-red-600">
                  {mutation.data.errors.password[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {mutation.data?.errors?.confirmPassword && (
                <p className="text-sm text-red-600">
                  {mutation.data.errors.confirmPassword[0]}
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
              {mutation.isPending ? "Mendaftarkan..." : "Daftar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary/80 hover:text-primary">
                Masuk di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
