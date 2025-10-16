/**
 * Local Storage Service for Offline Data Caching
 * Provides offline-first data storage using localStorage and IndexedDB
 */

interface CachedUserData {
  id: number;
  name?: string;
  email: string;
  lastSync: string;
}

interface CachedDashboardData {
  totalBalance: number;
  monthlySummary: { income: number; expense: number };
  lastSync: string;
}

interface CachedCategoriesData {
  categories: Array<{ id: number; name: string; type: string }>;
  lastSync: string;
}

interface CachedAccountsData {
  accounts: Array<{ id: number; name: string; balance: number }>;
  lastSync: string;
}

class LocalStorageService {
  private readonly USER_DATA_KEY = "monii_user_data";
  private readonly DASHBOARD_DATA_KEY = "monii_dashboard_data";
  private readonly CATEGORIES_DATA_KEY = "monii_categories_data";
  private readonly ACCOUNTS_DATA_KEY = "monii_accounts_data";
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // User Data
  saveUserData(data: Omit<CachedUserData, "lastSync">): void {
    try {
      const cachedData: CachedUserData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.warn("Failed to save user data to localStorage:", error);
    }
  }

  getUserData(): CachedUserData | null {
    try {
      const data = localStorage.getItem(this.USER_DATA_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as CachedUserData;
      const isExpired =
        Date.now() - new Date(parsed.lastSync).getTime() > this.CACHE_EXPIRY;

      return isExpired ? null : parsed;
    } catch (error) {
      console.warn("Failed to get user data from localStorage:", error);
      return null;
    }
  }

  // Dashboard Data
  saveDashboardData(data: Omit<CachedDashboardData, "lastSync">): void {
    try {
      const cachedData: CachedDashboardData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(this.DASHBOARD_DATA_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.warn("Failed to save dashboard data to localStorage:", error);
    }
  }

  getDashboardData(): CachedDashboardData | null {
    try {
      const data = localStorage.getItem(this.DASHBOARD_DATA_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as CachedDashboardData;
      const isExpired =
        Date.now() - new Date(parsed.lastSync).getTime() > this.CACHE_EXPIRY;

      return isExpired ? null : parsed;
    } catch (error) {
      console.warn("Failed to get dashboard data from localStorage:", error);
      return null;
    }
  }

  // Categories Data
  saveCategoriesData(data: Omit<CachedCategoriesData, "lastSync">): void {
    try {
      const cachedData: CachedCategoriesData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(
        this.CATEGORIES_DATA_KEY,
        JSON.stringify(cachedData),
      );
    } catch (error) {
      console.warn("Failed to save categories data to localStorage:", error);
    }
  }

  getCategoriesData(): CachedCategoriesData | null {
    try {
      const data = localStorage.getItem(this.CATEGORIES_DATA_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as CachedCategoriesData;
      const isExpired =
        Date.now() - new Date(parsed.lastSync).getTime() > this.CACHE_EXPIRY;

      return isExpired ? null : parsed;
    } catch (error) {
      console.warn("Failed to get categories data from localStorage:", error);
      return null;
    }
  }

  // Accounts Data
  saveAccountsData(data: Omit<CachedAccountsData, "lastSync">): void {
    try {
      const cachedData: CachedAccountsData = {
        ...data,
        lastSync: new Date().toISOString(),
      };
      localStorage.setItem(this.ACCOUNTS_DATA_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.warn("Failed to save accounts data to localStorage:", error);
    }
  }

  getAccountsData(): CachedAccountsData | null {
    try {
      const data = localStorage.getItem(this.ACCOUNTS_DATA_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as CachedAccountsData;
      const isExpired =
        Date.now() - new Date(parsed.lastSync).getTime() > this.CACHE_EXPIRY;

      return isExpired ? null : parsed;
    } catch (error) {
      console.warn("Failed to get accounts data from localStorage:", error);
      return null;
    }
  }

  // Utility methods
  clearAllData(): void {
    try {
      localStorage.removeItem(this.USER_DATA_KEY);
      localStorage.removeItem(this.DASHBOARD_DATA_KEY);
      localStorage.removeItem(this.CATEGORIES_DATA_KEY);
      localStorage.removeItem(this.ACCOUNTS_DATA_KEY);
    } catch (error) {
      console.warn("Failed to clear localStorage data:", error);
    }
  }

  isDataExpired(lastSync: string): boolean {
    return Date.now() - new Date(lastSync).getTime() > this.CACHE_EXPIRY;
  }

  // Check if we're online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get cache status
  getCacheStatus(): {
    userData: boolean;
    dashboardData: boolean;
    categoriesData: boolean;
    accountsData: boolean;
    isOnline: boolean;
  } {
    return {
      userData: !!this.getUserData(),
      dashboardData: !!this.getDashboardData(),
      categoriesData: !!this.getCategoriesData(),
      accountsData: !!this.getAccountsData(),
      isOnline: this.isOnline(),
    };
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
