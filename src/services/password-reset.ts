import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";

export async function createPasswordResetToken(email: string) {
  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    // Don't reveal if email exists or not for security
    return {
      success: true,
      message: "If the email exists, a reset link has been sent.",
    };
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Save token to database
  await db.insert(passwordResets).values({
    userId: user.id,
    token,
    expiresAt,
  });

  // TODO: Send email with reset link
  // For now, just return the token (in production, send via email)
  console.log(`Password reset token for ${email}: ${token}`);

  return {
    success: true,
    message: "If the email exists, a reset link has been sent.",
    token, // Remove this in production
  };
}

export async function verifyPasswordResetToken(token: string) {
  const [resetRecord] = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.token, token))
    .limit(1);

  if (!resetRecord) {
    return { valid: false, message: "Invalid reset token." };
  }

  if (resetRecord.usedAt) {
    return { valid: false, message: "Token has already been used." };
  }

  if (new Date() > resetRecord.expiresAt) {
    return { valid: false, message: "Token has expired." };
  }

  return {
    valid: true,
    userId: resetRecord.userId,
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenVerification = await verifyPasswordResetToken(token);

  if (!tokenVerification.valid) {
    return tokenVerification;
  }

  // At this point, tokenVerification is valid and has userId
  const userId = (tokenVerification as { valid: true; userId: number }).userId;

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update user password
  await db
    .update(users)
    .set({ passwordHash: hashedPassword })
    .where(eq(users.id, userId));

  // Mark token as used
  await db
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(eq(passwordResets.token, token));

  return { success: true, message: "Password has been reset successfully." };
}

export async function cleanupExpiredTokens() {
  // Clean up expired unused tokens (older than 24 hours)
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await db
    .delete(passwordResets)
    .where(
      sql`${passwordResets.expiresAt} < ${cutoffDate} AND ${passwordResets.usedAt} IS NULL`,
    );
}
