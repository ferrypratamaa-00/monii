import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import type { auditEventTypeEnum } from "@/db/schema";
import { auditLogs } from "@/db/schema";

export type AuditEventType = "auth" | "transaction" | "security" | "system";

export interface AuditLogData {
  userId?: number;
  eventType: AuditEventType;
  resource: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async logEvent(data: AuditLogData): Promise<void> {
    // Only log on server side
    if (typeof window !== "undefined") return;

    try {
      await db.insert(auditLogs).values({
        userId: data.userId,
        eventType: data.eventType,
        resource: data.resource,
        action: data.action,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
      // In production, you might want to use a more robust logging system
    }
  }

  static async logAuthEvent(
    userId: number | undefined,
    action: "login" | "logout" | "signup" | "password_reset" | "failed_login",
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await AuditService.logEvent({
      userId,
      eventType: "auth",
      resource: "user",
      action,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logTransactionEvent(
    userId: number,
    transactionId: number,
    action: "create" | "update" | "delete",
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await AuditService.logEvent({
      userId,
      eventType: "transaction",
      resource: "transaction",
      action: `${action}_transaction_${transactionId}`,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async logSecurityEvent(
    action:
      | "suspicious_activity"
      | "rate_limit_exceeded"
      | "invalid_token"
      | "unauthorized_access",
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await AuditService.logEvent({
      eventType: "security",
      resource: "system",
      action,
      details,
      ipAddress,
      userAgent,
    });
  }

  static async getAuditLogs(
    userId?: number,
    eventType?: AuditEventType,
    limit: number = 100,
    offset: number = 0,
  ): Promise<any[]> {
    if (typeof window !== "undefined") return [];

    const conditions = [];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (eventType) {
      conditions.push(eq(auditLogs.eventType, eventType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(auditLogs.timestamp)
      .limit(limit)
      .offset(offset);
  }

  static async getRecentSecurityEvents(hours: number = 24): Promise<any[]> {
    if (typeof window !== "undefined") return [];

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.eventType, "security"),
          gte(auditLogs.timestamp, since),
        ),
      )
      .orderBy(auditLogs.timestamp);
  }
}
