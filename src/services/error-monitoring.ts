import { AuditService } from "./audit";

export interface ErrorContext {
  userId?: number;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  stack?: string;
  additionalData?: Record<string, any>;
}

export class ErrorMonitoringService {
  private static isProduction = process.env.NODE_ENV === "production";

  static async logError(
    error: Error,
    context: Partial<ErrorContext> = {},
  ): Promise<void> {
    const errorContext: ErrorContext = {
      timestamp: new Date(),
      stack: error.stack,
      ...context,
    };

    // Log to console in development
    if (!ErrorMonitoringService.isProduction) {
      console.error("Error logged:", {
        message: error.message,
        context: errorContext,
      });
    }

    // Log security-related errors to audit system
    if (ErrorMonitoringService.isSecurityError(error)) {
      await AuditService.logSecurityEvent(
        "suspicious_activity",
        {
          error: error.message,
          stack: error.stack,
          context: errorContext,
        },
        errorContext.ipAddress,
        errorContext.userAgent,
      );
    }

    // In production, you would send to external monitoring service
    if (ErrorMonitoringService.isProduction) {
      await ErrorMonitoringService.sendToExternalMonitoring(
        error,
        errorContext,
      );
    }
  }

  static async logApiError(
    error: Error,
    request: Request,
    userId?: number,
  ): Promise<void> {
    const url = new URL(request.url);
    const context: Partial<ErrorContext> = {
      userId,
      url: request.url,
      userAgent: request.headers.get("user-agent") || undefined,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
      additionalData: {
        method: request.method,
        pathname: url.pathname,
        searchParams: Object.fromEntries(url.searchParams),
      },
    };

    await ErrorMonitoringService.logError(error, context);
  }

  private static isSecurityError(error: Error): boolean {
    const securityKeywords = [
      "unauthorized",
      "forbidden",
      "authentication",
      "authorization",
      "token",
      "session",
      "security",
      "attack",
      "injection",
      "xss",
      "csrf",
    ];

    const message = error.message.toLowerCase();
    return securityKeywords.some((keyword) => message.includes(keyword));
  }

  private static async sendToExternalMonitoring(
    error: Error,
    context: ErrorContext,
  ): Promise<void> {
    // In a real application, you would integrate with services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - New Relic
    // - Rollbar

    // For now, we'll just log to console in production
    console.error("Production Error:", {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  static createErrorBoundaryHandler(componentName: string) {
    return async (error: Error, errorInfo: { componentStack: string }) => {
      await ErrorMonitoringService.logError(error, {
        additionalData: {
          component: componentName,
          componentStack: errorInfo.componentStack,
        },
      });
    };
  }
}

// Global error handler for unhandled errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    ErrorMonitoringService.logError(event.error || new Error(event.message), {
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    ErrorMonitoringService.logError(error, {
      additionalData: {
        type: "unhandledrejection",
      },
    });
  });
}
