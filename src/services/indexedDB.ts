/**
 * IndexedDB Service for Advanced Offline Data Storage
 * Replaces localStorage with IndexedDB for better performance and capacity
 */

export interface CachedUserData {
  id: number;
  name?: string;
  email: string;
  lastSync: string;
}

export interface CachedDashboardData {
  totalBalance: number;
  monthlySummary: { income: number; expense: number };
  lastSync: string;
}

export interface CachedCategoriesData {
  categories: Array<{
    id: number;
    name: string;
    type: string;
    iconName?: string;
  }>;
  lastSync: string;
}

export interface CachedAccountsData {
  accounts: Array<{ id: number; name: string; balance: number; type?: string }>;
  lastSync: string;
}

export interface CachedTransactionData {
  transactions: Array<{
    id: number;
    amount: number;
    description: string | null;
    type: string;
    date: string;
    categoryId: number | null;
    accountId: number;
    category?: { id: number; name: string; type: string };
    account?: { id: number; name: string };
  }>;
  lastSync: string;
}

class IndexedDBService {
  private readonly DB_NAME = "MoniiDB";
  private readonly DB_VERSION = 1;
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // User data store
    if (!db.objectStoreNames.contains("userData")) {
      db.createObjectStore("userData", { keyPath: "id" });
    }

    // Dashboard data store
    if (!db.objectStoreNames.contains("dashboardData")) {
      db.createObjectStore("dashboardData", { keyPath: "id" });
    }

    // Categories data store
    if (!db.objectStoreNames.contains("categoriesData")) {
      db.createObjectStore("categoriesData", { keyPath: "id" });
    }

    // Accounts data store
    if (!db.objectStoreNames.contains("accountsData")) {
      db.createObjectStore("accountsData", { keyPath: "id" });
    }

    // Transactions data store
    if (!db.objectStoreNames.contains("transactionsData")) {
      db.createObjectStore("transactionsData", { keyPath: "id" });
    }

    // Pending operations store
    if (!db.objectStoreNames.contains("pendingOperations")) {
      const store = db.createObjectStore("pendingOperations", {
        keyPath: "id",
      });
      store.createIndex("type", "type", { unique: false });
      store.createIndex("timestamp", "timestamp", { unique: false });
    }
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  // Generic database operations
  private async getFromStore<T>(
    storeName: string,
    key: string,
  ): Promise<T | null> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"));

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const data = request.result;
        if (data && this.isDataExpired(data.lastSync)) {
          // Data expired, remove it
          this.deleteFromStore(storeName, key);
          resolve(null);
        } else {
          resolve(data || null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async putInStore(storeName: string, data: any): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"));

      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"));

      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    await this.ensureDB();
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"));

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result || [];
        // Filter out expired data
        const validData = data.filter(
          (item) => !this.isDataExpired(item.lastSync),
        );
        resolve(validData);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // User Data
  async saveUserData(data: Omit<CachedUserData, "lastSync">): Promise<void> {
    try {
      const cachedData: CachedUserData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      await this.putInStore("userData", cachedData);
    } catch (error) {
      console.warn("Failed to save user data to IndexedDB:", error);
      // Fallback to localStorage
      this.fallbackToLocalStorage("userData", data);
    }
  }

  async getUserData(): Promise<CachedUserData | null> {
    try {
      return await this.getFromStore<CachedUserData>("userData", "current");
    } catch (error) {
      console.warn("Failed to get user data from IndexedDB:", error);
      return this.fallbackFromLocalStorage("userData");
    }
  }

  // Dashboard Data
  async saveDashboardData(
    data: Omit<CachedDashboardData, "lastSync">,
  ): Promise<void> {
    try {
      const cachedData: CachedDashboardData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      await this.putInStore("dashboardData", { ...cachedData, id: "current" });
    } catch (error) {
      console.warn("Failed to save dashboard data to IndexedDB:", error);
      this.fallbackToLocalStorage("dashboardData", data);
    }
  }

  async getDashboardData(): Promise<CachedDashboardData | null> {
    try {
      return await this.getFromStore<CachedDashboardData>(
        "dashboardData",
        "current",
      );
    } catch (error) {
      console.warn("Failed to get dashboard data from IndexedDB:", error);
      return this.fallbackFromLocalStorage("dashboardData");
    }
  }

  // Categories Data
  async saveCategoriesData(
    data: Omit<CachedCategoriesData, "lastSync">,
  ): Promise<void> {
    try {
      const cachedData: CachedCategoriesData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      await this.putInStore("categoriesData", { ...cachedData, id: "current" });
    } catch (error) {
      console.warn("Failed to save categories data to IndexedDB:", error);
      this.fallbackToLocalStorage("categoriesData", data);
    }
  }

  async getCategoriesData(): Promise<CachedCategoriesData | null> {
    try {
      return await this.getFromStore<CachedCategoriesData>(
        "categoriesData",
        "current",
      );
    } catch (error) {
      console.warn("Failed to get categories data from IndexedDB:", error);
      return this.fallbackFromLocalStorage("categoriesData");
    }
  }

  // Accounts Data
  async saveAccountsData(
    data: Omit<CachedAccountsData, "lastSync">,
  ): Promise<void> {
    try {
      const cachedData: CachedAccountsData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      await this.putInStore("accountsData", { ...cachedData, id: "current" });
    } catch (error) {
      console.warn("Failed to save accounts data to IndexedDB:", error);
      this.fallbackToLocalStorage("accountsData", data);
    }
  }

  async getAccountsData(): Promise<CachedAccountsData | null> {
    try {
      return await this.getFromStore<CachedAccountsData>(
        "accountsData",
        "current",
      );
    } catch (error) {
      console.warn("Failed to get accounts data from IndexedDB:", error);
      return this.fallbackFromLocalStorage("accountsData");
    }
  }

  // Transactions Data (for offline viewing)
  async saveTransactionsData(
    data: Omit<CachedTransactionData, "lastSync">,
  ): Promise<void> {
    try {
      const cachedData: CachedTransactionData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      await this.putInStore("transactionsData", {
        ...cachedData,
        id: "current",
      });
    } catch (error) {
      console.warn("Failed to save transactions data to IndexedDB:", error);
    }
  }

  async getTransactionsData(): Promise<CachedTransactionData | null> {
    try {
      return await this.getFromStore<CachedTransactionData>(
        "transactionsData",
        "current",
      );
    } catch (error) {
      console.warn("Failed to get transactions data from IndexedDB:", error);
      return null;
    }
  }

  // Pending Operations (for offline transaction creation)
  async addPendingOperation(operation: {
    id: string;
    type: "create_transaction" | "update_transaction" | "delete_transaction";
    data: Record<string, unknown>;
    timestamp: string;
    retryCount: number;
  }): Promise<void> {
    try {
      await this.putInStore("pendingOperations", operation);
    } catch (error) {
      console.warn("Failed to add pending operation to IndexedDB:", error);
    }
  }

  async getPendingOperations(): Promise<
    Array<{
      id: string;
      type: "create_transaction" | "update_transaction" | "delete_transaction";
      data: Record<string, unknown>;
      timestamp: string;
      retryCount: number;
    }>
  > {
    try {
      return await this.getAllFromStore("pendingOperations");
    } catch (error) {
      console.warn("Failed to get pending operations from IndexedDB:", error);
      return [];
    }
  }

  async removePendingOperation(id: string): Promise<void> {
    try {
      await this.deleteFromStore("pendingOperations", id);
    } catch (error) {
      console.warn("Failed to remove pending operation from IndexedDB:", error);
    }
  }

  async updatePendingOperationRetryCount(
    id: string,
    retryCount: number,
  ): Promise<void> {
    try {
      const operations = await this.getPendingOperations();
      const operation = operations.find((op) => op.id === id);
      if (operation) {
        operation.retryCount = retryCount;
        await this.putInStore("pendingOperations", operation);
      }
    } catch (error) {
      console.warn("Failed to update pending operation retry count:", error);
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await this.ensureDB();
      if (!this.db) return;

      const storeNames = Array.from(this.db.objectStoreNames);
      const transaction = this.db.transaction(storeNames, "readwrite");

      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });

      console.log("Cleared all IndexedDB data");
    } catch (error) {
      console.warn("Failed to clear IndexedDB data:", error);
    }
  }

  isDataExpired(lastSync: string): boolean {
    return Date.now() - new Date(lastSync).getTime() > this.CACHE_EXPIRY;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async getCacheStatus(): Promise<{
    userData: boolean;
    dashboardData: boolean;
    categoriesData: boolean;
    accountsData: boolean;
    transactionsData: boolean;
    isOnline: boolean;
  }> {
    try {
      const [
        userData,
        dashboardData,
        categoriesData,
        accountsData,
        transactionsData,
      ] = await Promise.all([
        this.getUserData(),
        this.getDashboardData(),
        this.getCategoriesData(),
        this.getAccountsData(),
        this.getTransactionsData(),
      ]);

      return {
        userData: !!userData,
        dashboardData: !!dashboardData,
        categoriesData: !!categoriesData,
        accountsData: !!accountsData,
        transactionsData: !!transactionsData,
        isOnline: this.isOnline(),
      };
    } catch (error) {
      console.warn("Failed to get cache status:", error);
      return {
        userData: false,
        dashboardData: false,
        categoriesData: false,
        accountsData: false,
        transactionsData: false,
        isOnline: this.isOnline(),
      };
    }
  }

  // Fallback methods for localStorage compatibility
  private fallbackToLocalStorage(key: string, data: any): void {
    try {
      const cachedData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(`monii_${key}`, JSON.stringify(cachedData));
    } catch (error) {
      console.warn("Fallback to localStorage also failed:", error);
    }
  }

  private fallbackFromLocalStorage(key: string): any {
    try {
      const data = localStorage.getItem(`monii_${key}`);
      if (!data) return null;

      const parsed = JSON.parse(data);
      if (this.isDataExpired(parsed.lastSync)) {
        localStorage.removeItem(`monii_${key}`);
        return null;
      }
      return parsed;
    } catch (error) {
      console.warn("Fallback from localStorage failed:", error);
      return null;
    }
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();
