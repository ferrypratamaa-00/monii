"use server";

import { z } from "zod";
import {
  createPasswordResetToken,
  resetPassword,
} from "@/services/password-reset";

const RequestResetSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token diperlukan"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi password diperlukan"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi tidak cocok",
    path: ["confirmPassword"],
  });

export async function requestPasswordResetAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
  };

  const result = RequestResetSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const response = await createPasswordResetToken(result.data.email);
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Password reset request error:", err.message);
    return { success: false, error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const data = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = ResetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const response = await resetPassword(
      result.data.token,
      result.data.password,
    );
    return response;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Password reset error:", err.message);
    return { success: false, error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
