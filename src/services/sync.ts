/**
 * Background Sync Service
 * Handles synchronization of offline data when back online
 */

import { indexedDBService } from "./indexedDB";

interface PendingTransaction {
  id: string;
  type: "create_transaction" | "update_transaction" | "delete_transaction";
  data: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

class SyncService {
  private readonly MAX_RETRY_COUNT = 3;
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Register background sync if supported
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      this.registerBackgroundSync();
    }
  }

  private handleOnline() {
    console.log("Back online - starting sync");
    this.isOnline = true;
    this.syncPendingData();
  }

  private handleOffline() {
    console.log("Gone offline");
    this.isOnline = false;
  }

  private async registerBackgroundSync() {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (
        registration as ServiceWorkerRegistration & {
          sync: { register: (tag: string) => Promise<void> };
        }
      ).sync.register("background-sync");
      console.log("Background sync registered");
    } catch (error) {
      console.warn(
        "Background sync not supported or failed to register:",
        error,
      );
    }
  }

  // Sync pending data
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) {
      console.log("Skipping sync - offline");
      return;
    }

    const pending = await indexedDBService.getPendingOperations();
    if (pending.length === 0) {
      console.log("No pending transactions to sync");
      return;
    }

    console.log(`Syncing ${pending.length} pending transactions`);

    for (const transaction of pending) {
      try {
        await this.processPendingOperation(transaction);
        await indexedDBService.removePendingOperation(transaction.id);
        console.log("Successfully synced transaction:", transaction.id);
      } catch (error) {
        console.warn("Failed to sync transaction:", transaction.id, error);

        // Increment retry count
        const newRetryCount = transaction.retryCount + 1;
        await indexedDBService.updatePendingOperationRetryCount(
          transaction.id,
          newRetryCount,
        );

        // Remove if max retries exceeded
        if (newRetryCount >= this.MAX_RETRY_COUNT) {
          console.warn(
            "Max retries exceeded, removing transaction:",
            transaction.id,
          );
          await indexedDBService.removePendingOperation(transaction.id);
        }
      }
    }
  }

  // Process individual pending operation
  async processPendingOperation(operation: PendingTransaction): Promise<void> {
    switch (operation.type) {
      case "create_transaction": {
        // Call transaction creation API
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operation.data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create transaction: ${response.status}`);
        }
        break;
      }

      case "update_transaction": {
        // Call transaction update API
        const updateResponse = await fetch(
          `/api/transactions/${operation.data.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(operation.data),
          },
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Failed to update transaction: ${updateResponse.status}`,
          );
        }
        break;
      }

      case "delete_transaction": {
        // Call transaction delete API
        const deleteResponse = await fetch(
          `/api/transactions/${operation.data.id}`,
          {
            method: "DELETE",
          },
        );

        if (!deleteResponse.ok) {
          throw new Error(
            `Failed to delete transaction: ${deleteResponse.status}`,
          );
        }
        break;
      }

      default:
        throw new Error(`Unknown transaction type: ${operation.type}`);
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    pendingCount: number;
    lastSyncTime: string | null;
    hasConflicts: boolean;
  }> {
    const pending = await indexedDBService.getPendingOperations();
    const lastTransaction = pending.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];

    // Check for potential conflicts (transactions older than 24 hours)
    const hasConflicts = pending.some((transaction) => {
      const transactionTime = new Date(transaction.timestamp).getTime();
      const now = Date.now();
      const hoursDiff = (now - transactionTime) / (1000 * 60 * 60);
      return hoursDiff > 24;
    });

    return {
      isOnline: this.isOnline,
      pendingCount: pending.length,
      lastSyncTime: lastTransaction?.timestamp || null,
      hasConflicts,
    };
  }

  // Clear all pending transactions (for testing/debugging)
  async clearPendingTransactions(): Promise<void> {
    const pending = await indexedDBService.getPendingOperations();
    for (const operation of pending) {
      await indexedDBService.removePendingOperation(operation.id);
    }
    console.log("Cleared all pending transactions");
  }

  // Add pending transaction (for backward compatibility)
  async addPendingTransaction(
    type: PendingTransaction["type"],
    data: Record<string, unknown>,
  ): Promise<string> {
    const transaction: PendingTransaction = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    await indexedDBService.addPendingOperation(transaction);
    console.log("Added pending transaction:", transaction.id);
    return transaction.id;
  }

  // Get pending transactions (for backward compatibility)
  async getPendingTransactions(): Promise<PendingTransaction[]> {
    return await indexedDBService.getPendingOperations();
  }

  // Remove pending transaction (for backward compatibility)
  async removePendingTransaction(id: string): Promise<void> {
    await indexedDBService.removePendingOperation(id);
  }
}

// Export singleton instance
export const syncService = new SyncService();
