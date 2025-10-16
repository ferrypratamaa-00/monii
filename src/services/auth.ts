import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { SignupSchema } from "@/lib/validations/auth";

export async function registerUser(data: z.infer<typeof SignupSchema>) {
  const email = data.email.toLowerCase().trim();
  const hash = await bcrypt.hash(data.password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email,
        passwordHash: hash,
      })
      .returning();
    return user;
  } catch (error: unknown) {
    const err = error as { code: string };
    if (err.code === "23505") {
      // unique violation
      throw new Error("Email sudah terdaftar");
    }
    throw error;
  }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase().trim()),
  });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
