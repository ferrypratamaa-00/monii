import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth-server";

// Define proper types for SSE clients
interface SSEClient {
  write: (chunk: string) => void;
  close: () => void;
}

// Simple in-memory store for SSE connections
// In production, you'd want to use Redis or similar
const clients = new Map<number, SSEClient>();

// Define notification type
interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: Date;
}

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);

  // Set up SSE headers
  const responseStream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: connected\n\n"));

      // Store the controller for this user
      clients.set(userId, {
        write: (chunk: string) => {
          try {
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          } catch (_error) {
            // Client disconnected, remove from clients
            clients.delete(userId);
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (_error) {
            // Already closed
          }
          clients.delete(userId);
        },
      });
    },
    cancel() {
      // Clean up when connection is closed
      clients.delete(userId);
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

// Function to send notification to specific user
export function sendNotificationToUser(
  userId: number,
  notification: NotificationData,
) {
  const client = clients.get(userId);
  if (client) {
    client.write(
      JSON.stringify({
        type: "notification",
        data: notification,
      }),
    );
  }
}

// Function to broadcast to all connected users (for system announcements)
export function broadcastNotification(notification: NotificationData) {
  clients.forEach((client, userId) => {
    try {
      client.write(
        JSON.stringify({
          type: "notification",
          data: notification,
        }),
      );
    } catch (_error) {
      clients.delete(userId);
    }
  });
}
