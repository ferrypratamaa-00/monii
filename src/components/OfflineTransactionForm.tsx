"use client";

import { format } from "date-fns";
import { CalendarIcon, Plus, Save, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { indexedDBService } from "@/services/indexedDB";

interface Category {
  id: number;
  name: string;
  type: string;
  iconName?: string;
}

interface Account {
  id: number;
  name: string;
  balance: number;
  type?: string;
}

interface OfflineTransactionFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function OfflineTransactionForm({
  trigger,
  onSuccess,
}: OfflineTransactionFormProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    description: "",
    categoryId: "",
    accountId: "",
    date: new Date(),
  });

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const [categoriesData, accountsData] = await Promise.all([
          indexedDBService.getCategoriesData(),
          indexedDBService.getAccountsData(),
        ]);

        if (categoriesData?.categories) {
          setCategories(categoriesData.categories);
        }

        if (accountsData?.accounts) {
          setAccounts(accountsData.accounts);
        }
      } catch (error) {
        console.warn("Failed to load cached data:", error);
      }
    };

    loadCachedData();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        toast.error("Error", {
          description: "Please enter a valid amount",
        });
        return;
      }

      if (!formData.accountId) {
        toast.error("Error", {
          description: "Please select an account",
        });
        return;
      }

      // Create transaction data
      const transactionData = {
        amount,
        description: formData.description || null,
        type: formData.type,
        date: formData.date.toISOString(),
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId, 10)
          : null,
        accountId: parseInt(formData.accountId, 10),
      };

      if (isOnline) {
        // Online: Submit directly to server
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
          throw new Error("Failed to create transaction");
        }

        toast.success("Success", {
          description: "Transaction created successfully",
        });

        // Refresh dashboard data
        router.refresh();
      } else {
        // Offline: Save to pending operations
        const operationId = `offline_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await indexedDBService.addPendingOperation({
          id: operationId,
          type: "create_transaction",
          data: transactionData,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        });

        // Update local account balance estimate (optimistic update)
        const selectedAccount = accounts.find(
          (acc) => acc.id.toString() === formData.accountId,
        );
        if (selectedAccount) {
          const balanceChange = formData.type === "INCOME" ? amount : -amount;
          selectedAccount.balance += balanceChange;

          // Save updated accounts data
          await indexedDBService.saveAccountsData({ accounts });
        }

        toast.success("Saved Offline", {
          description: "Transaction will be synced when you're back online",
        });
      }

      // Reset form
      setFormData({
        type: "EXPENSE",
        amount: "",
        description: "",
        categoryId: "",
        accountId: "",
        date: new Date(),
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("Error", {
        description: "Failed to create transaction. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button className="w-full bg-primary hover:bg-primary/90">
      <Plus className="w-4 h-4 mr-2" />
      {t("dashboard.addNote")}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Transaction
            {!isOnline && (
              <span className="flex items-center gap-1 text-sm text-orange-600">
                <WifiOff className="w-4 h-4" />
                Offline Mode
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {isOnline
              ? "Create a new transaction that will be saved immediately."
              : "Create a transaction that will be saved locally and synced when you're back online."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Type</div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "EXPENSE" ? "default" : "outline"}
                onClick={() =>
                  setFormData({ ...formData, type: "EXPENSE", categoryId: "" })
                }
                className="flex-1"
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={formData.type === "INCOME" ? "default" : "outline"}
                onClick={() =>
                  setFormData({ ...formData, type: "INCOME", categoryId: "" })
                }
                className="flex-1"
              >
                Income
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount-input" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount-input"
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description-textarea"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="description-textarea"
              placeholder="Transaction description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category-select" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <label htmlFor="account-select" className="text-sm font-medium">
              Account *
            </label>
            <Select
              value={formData.accountId}
              onValueChange={(value) =>
                setFormData({ ...formData, accountId: value })
              }
            >
              <SelectTrigger id="account-select">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name} - Rp
                    {account.balance?.toLocaleString("id-ID") || "0"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date-button" className="text-sm font-medium">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                  )}
                  aria-label="Select transaction date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) =>
                    date && setFormData({ ...formData, date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Offline Notice */}
          {!isOnline && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm font-medium">Offline Mode</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  This transaction will be saved locally and synced
                  automatically when you're back online.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                "Saving..."
              ) : isOnline ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Transaction
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Save Offline
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
