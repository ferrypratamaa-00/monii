"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, X } from "lucide-react";
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
import { TransactionSchema } from "@/lib/validations/transaction";

interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  fileType: string;
}

// Placeholder data - in real app, fetch from API
const accounts = [{ id: 1, name: "Bank" }];
const categories = [{ id: 1, name: "Food", type: "EXPENSE" }];

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({
  onSuccess,
}: TransactionFormProps = {}) {
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const form = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      accountId: 0,
      categoryId: undefined,
      type: "EXPENSE" as "INCOME" | "EXPENSE",
      amount: 0,
      description: "",
      date: new Date(),
      isRecurring: false,
    },
  });

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

  const onSubmit = (data: z.infer<typeof TransactionSchema>) => {
    const formData = new FormData();
    formData.append("accountId", data.accountId.toString());
    if (data.categoryId)
      formData.append("categoryId", data.categoryId.toString());
    formData.append("type", data.type);
    formData.append("amount", data.amount.toString());
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((acc) => (
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
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
        <Button type="submit" disabled={mutation.isPending}>
          Add Transaction
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
