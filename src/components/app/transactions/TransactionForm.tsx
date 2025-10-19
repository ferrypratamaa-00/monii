"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createAccountAction } from "@/app/actions/account";
import { createCategoryAction } from "@/app/actions/category";
import {
  associateFilesWithTransactionAction,
  createTransactionAction,
} from "@/app/actions/transaction";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFormSchema } from "@/lib/validations/transaction";

interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  fileType: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({
  onSuccess,
}: TransactionFormProps = {}) {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Fetch accounts and categories
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      return response.json();
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      accountId: undefined as number | undefined,
      categoryId: undefined,
      type: "EXPENSE" as "INCOME" | "EXPENSE",
      amount: undefined as number | undefined,
      description: "",
      date: new Date(),
      isRecurring: false,
    },
  });

  if (accountsLoading || categoriesLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading form data...</p>
      </div>
    );
  }

  const transactionType = form.watch("type");
  const filteredCategories = categories.filter(
    (cat: { type: string }) => cat.type === transactionType,
  ); // biome-ignore lint/correctness/useHookAtTopLevel: <>
  const mutation = useMutation({
    mutationFn: createTransactionAction,
    onSuccess: async (data) => {
      // Associate uploaded files with the new transaction
      if (uploadedFiles.length > 0 && data?.id) {
        try {
          await associateFilesWithTransactionAction(
            data.id,
            uploadedFiles.map((f) => f.id),
          );
        } catch (error) {
          console.error("Failed to associate files:", error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      form.reset();
      setUploadedFiles([]);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Transaction error", error);
    },
  });

  // Quick add account mutation
  // biome-ignore lint/correctness/useHookAtTopLevel: <>
    const addAccountMutation = useMutation({
    mutationFn: async (data: { name: string; initialBalance: number }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("initialBalance", data.initialBalance.toString());
      return createAccountAction(formData);
    },
    onSuccess: async (result) => {
      if (result.success) {
        // Refresh accounts and auto-select the new one
        await queryClient.invalidateQueries({ queryKey: ["accounts"] });
        // Get the updated accounts list
        const response = await fetch("/api/accounts");
        const updatedAccounts = await response.json();
        // Find and select the newly created account (assuming it's the last one)
        if (updatedAccounts.length > 0) {
          const newAccount = updatedAccounts[updatedAccounts.length - 1];
          form.setValue("accountId", newAccount.id);
        }
        setShowAddAccount(false);
      } else {
        console.error("Failed to create account:", result.error);
      }
    },
  });

  // Quick add category mutation
  // biome-ignore lint/correctness/useHookAtTopLevel: <>
    const addCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; type: "INCOME" | "EXPENSE" }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("type", data.type);
      formData.append("iconName", "default"); // Default icon
      return createCategoryAction(formData);
    },
    onSuccess: async (result) => {
      if (result.success) {
        // Refresh categories and auto-select the new one
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        // Get the updated categories list
        const response = await fetch("/api/categories");
        const updatedCategories = await response.json();
        // Find and select the newly created category (assuming it's the last one of the correct type)
        const transactionType = form.watch("type");
        const filteredCategories = updatedCategories.filter(
          (cat: { type: string }) => cat.type === transactionType,
        );
        if (filteredCategories.length > 0) {
          const newCategory = filteredCategories[filteredCategories.length - 1];
          form.setValue("categoryId", newCategory.id);
        }
        setShowAddCategory(false);
      } else {
        console.error("Failed to create category:", result.error);
      }
    },
  });

  const onSubmit = (data: z.infer<typeof TransactionFormSchema>) => {
    // Convert amount based on transaction type
    const adjustedAmount =
      data.type === "EXPENSE" ? -Math.abs(data.amount) : Math.abs(data.amount);
    const formData = new FormData();
    formData.append("accountId", data.accountId.toString());
    if (data.categoryId)
      formData.append("categoryId", data.categoryId.toString());
    formData.append("type", data.type);
    formData.append("amount", adjustedAmount.toString());
    if (data.description) formData.append("description", data.description);
    formData.append("date", data.date.toISOString());
    formData.append("isRecurring", data.isRecurring.toString());
    mutation.mutate(formData);
  };

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles((prev) => [...prev, file]);
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  value={field.value?.toString() || ""}
                  disabled={accountsLoading}
                >
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={
                          accountsLoading
                            ? "Loading accounts..."
                            : "Select account"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((acc: { id: number; name: string }) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Account</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get("name") as string;
                        const initialBalance =
                          parseFloat(
                            formData.get("initialBalance") as string,
                          ) || 0;
                        addAccountMutation.mutate({ name, initialBalance });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="" className="text-sm font-medium">
                          Account Name
                        </label>
                        <Input
                          name="name"
                          placeholder="e.g., Bank BCA, Cash"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="" className="text-sm font-medium">
                          Initial Balance
                        </label>
                        <Input
                          name="initialBalance"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          defaultValue="0"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={addAccountMutation.isPending}
                          className="flex-1"
                        >
                          {addAccountMutation.isPending
                            ? "Creating..."
                            : "Create Account"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddAccount(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) =>
                    field.onChange(value ? parseInt(value, 10) : undefined)
                  }
                  value={field.value?.toString() || ""}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? "Loading categories..."
                            : filteredCategories.length === 0
                              ? `No categories available for ${transactionType.toLowerCase()}`
                              : "Select category"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map(
                      (cat: { id: number; name: string }) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <Dialog
                  open={showAddCategory}
                  onOpenChange={setShowAddCategory}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const name = formData.get("name") as string;
                        addCategoryMutation.mutate({
                          name,
                          type: transactionType,
                        });
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="" className="text-sm font-medium">
                          Category Name
                        </label>
                        <Input
                          name="name"
                          placeholder={`e.g., Food, Transportation`}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="" className="text-sm font-medium">Type</label>
                        <Select defaultValue={transactionType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={addCategoryMutation.isPending}
                          className="flex-1"
                        >
                          {addCategoryMutation.isPending
                            ? "Creating..."
                            : "Create Category"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddCategory(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter positive amount"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(
                      value === "" ? undefined : parseFloat(value) || 0,
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={(field.value as Date).toISOString().split("T")[0]}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={mutation.isPending || accountsLoading || categoriesLoading}
        >
          {mutation.isPending ? "Creating..." : "Add Transaction"}
        </Button>

        {/* File Upload Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Upload (Optional)
          </h3>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              {uploadedFiles.map((file) => (
                <Card key={file.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Receipt className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {file.fileType}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <FileUpload
            onUploadSuccess={handleFileUpload}
            accept="image/*,.pdf"
            maxSizeText="Max 5MB (JPEG, PNG, WebP, PDF)"
          />
        </div>
      </form>
    </Form>
  );
}
