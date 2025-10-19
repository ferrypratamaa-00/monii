/**
 * Background Sync Service
 * Handles synchronization of offline data when back online
 */

interface PendingTransaction {
  id: string;
  type: "create_transaction" | "update_transaction" | "delete_transaction";
  data: any;
  timestamp: string;
  retryCount: number;
}

class SyncService {
  private readonly PENDING_TRANSACTIONS_KEY = "monii_pending_transactions";
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
      await (registration as any).sync.register("background-sync");
      console.log("Background sync registered");
    } catch (error) {
      console.warn(
        "Background sync not supported or failed to register:",
        error,
      );
    }
  }

  // Add pending transaction to queue
  addPendingTransaction(type: PendingTransaction["type"], data: any): string {
    const transaction: PendingTransaction = {
      id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const pending = this.getPendingTransactions();
    pending.push(transaction);
    localStorage.setItem(
      this.PENDING_TRANSACTIONS_KEY,
      JSON.stringify(pending),
    );

    console.log("Added pending transaction:", transaction.id);
    return transaction.id;
  }

  // Get all pending transactions
  private getPendingTransactions(): PendingTransaction[] {
    try {
      const data = localStorage.getItem(this.PENDING_TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn("Failed to get pending transactions:", error);
      return [];
    }
  }

  // Remove completed transaction
  private removePendingTransaction(id: string) {
    const pending = this.getPendingTransactions();
    const filtered = pending.filter((t) => t.id !== id);
    localStorage.setItem(
      this.PENDING_TRANSACTIONS_KEY,
      JSON.stringify(filtered),
    );
  }

  // Update retry count
  private updateRetryCount(id: string) {
    const pending = this.getPendingTransactions();
    const transaction = pending.find((t) => t.id === id);
    if (transaction) {
      transaction.retryCount++;
      localStorage.setItem(
        this.PENDING_TRANSACTIONS_KEY,
        JSON.stringify(pending),
      );
    }
  }

  // Sync pending data
  async syncPendingData(): Promise<void> {
    if (!this.isOnline) {
      console.log("Skipping sync - offline");
      return;
    }

    const pending = this.getPendingTransactions();
    if (pending.length === 0) {
      console.log("No pending transactions to sync");
      return;
    }

    console.log(`Syncing ${pending.length} pending transactions`);

    for (const transaction of pending) {
      try {
        await this.processTransaction(transaction);
        this.removePendingTransaction(transaction.id);
        console.log("Successfully synced transaction:", transaction.id);
      } catch (error) {
        console.warn("Failed to sync transaction:", transaction.id, error);

        // Increment retry count
        this.updateRetryCount(transaction.id);

        // Remove if max retries exceeded
        if (transaction.retryCount >= this.MAX_RETRY_COUNT) {
          console.warn(
            "Max retries exceeded, removing transaction:",
            transaction.id,
          );
          this.removePendingTransaction(transaction.id);
        }
      }
    }
  }

  // Process individual transaction
  private async processTransaction(
    transaction: PendingTransaction,
  ): Promise<void> {
    switch (transaction.type) {
      case "create_transaction": {
        // Call transaction creation API
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction.data),
        });

        if (!response.ok) {
          throw new Error(`Failed to create transaction: ${response.status}`);
        }
        break;
      }

      case "update_transaction": {
        // Call transaction update API
        const updateResponse = await fetch(
          `/api/transactions/${transaction.data.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction.data),
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
          `/api/transactions/${transaction.data.id}`,
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
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean;
    pendingCount: number;
    lastSyncTime: string | null;
    hasConflicts: boolean;
  } {
    const pending = this.getPendingTransactions();
    const lastTransaction = pending.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];

    // Check for potential conflicts (transactions older than 24 hours)
    const hasConflicts = pending.some(transaction => {
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
  clearPendingTransactions(): void {
    localStorage.removeItem(this.PENDING_TRANSACTIONS_KEY);
    console.log("Cleared all pending transactions");
  }
}

// Export singleton instance
export const syncService = new SyncService();
