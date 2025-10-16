"use server";

import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { LoginSchema, SignupSchema } from "@/lib/validations/auth";
import { AuditService } from "@/services/audit";
import { registerUser, verifyCredentials } from "@/services/auth";

const JWT_SECRET = process.env.JWT_SECRET || "secret"; // in production, use strong secret

export async function signUpAction(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = SignupSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const user = await registerUser(result.data);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const c = await cookies();
    c.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Audit logging
    const h = await headers();
    await AuditService.logAuthEvent(
      user.id,
      "signup",
      { email: result.data.email },
      h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown",
      h.get("user-agent") || undefined,
    );

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Signup error:", err.message);
    return { success: false, error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

export async function loginAction(formData: FormData) {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = LoginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    const user = await verifyCredentials(
      result.data.email,
      result.data.password,
    );
    if (!user) {
      // Audit logging for failed login
      const h = await headers();
      await AuditService.logAuthEvent(
        undefined,
        "failed_login",
        { email: result.data.email },
        h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown",
        h.get("user-agent") || undefined,
      );

      return { success: false, error: "Email atau password salah" };
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    const c = await cookies();
    c.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Audit logging for successful login
    const h = await headers();
    await AuditService.logAuthEvent(
      user.id,
      "login",
      { email: result.data.email },
      h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown",
      h.get("user-agent") || undefined,
    );

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Login error:", err.message);
    return { success: false, error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

export async function logoutAction() {
  try {
    const c = await cookies();
    const token = c.get("session")?.value;

    // Get user ID before clearing cookie for audit logging
    let userId: number | undefined;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
        userId = payload.userId;
      } catch {
        // Token invalid, continue with logout
      }
    }

    // Clear the session cookie
    c.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    // Audit logging for logout
    if (userId) {
      const h = await headers();
      await AuditService.logAuthEvent(
        userId,
        "logout",
        {},
        h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown",
        h.get("user-agent") || undefined,
      );
    }

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Logout error:", err.message);
    return { success: false, error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get("session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    return payload.userId;
  } catch {
    return null;
  }
}
