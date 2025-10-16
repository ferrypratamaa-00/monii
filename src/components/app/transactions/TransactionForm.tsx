"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  associateFilesWithTransactionAction,
  createTransactionAction,
} from "@/app/actions/transaction";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          You need to create an account first before adding transactions.
        </p>
        <Button asChild>
          <Link href="/accounts">Go to Accounts</Link>
        </Button>
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
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString() || ""}
                disabled={accountsLoading}
              >
                <FormControl>
                  <SelectTrigger>
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
              <Select
                onValueChange={(value) =>
                  field.onChange(value ? parseInt(value, 10) : undefined)
                }
                value={field.value?.toString() || ""}
                disabled={categoriesLoading}
              >
                <FormControl>
                  <SelectTrigger>
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
          disabled={
            mutation.isPending ||
            accountsLoading ||
            categoriesLoading ||
            accounts.length === 0
          }
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
