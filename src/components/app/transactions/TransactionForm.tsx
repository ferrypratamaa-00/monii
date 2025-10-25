"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Plus, Receipt, X } from "lucide-react";
import { useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import type { z } from "zod";

import { createAccountAction } from "@/app/actions/account";
import { createCategoryAction } from "@/app/actions/category";
import {
  associateFilesWithTransactionAction,
  createTransactionAction,
} from "@/app/actions/transaction";

import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { TransactionFormSchema } from "@/lib/validations/transaction";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { t } = useLanguage();
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

  const form = useForm<
    z.infer<typeof TransactionFormSchema>,
    any,
    z.infer<typeof TransactionFormSchema>
  >({
    resolver: zodResolver(TransactionFormSchema),
    defaultValues: {
      accountId: 0,
      categoryId: undefined,
      type: "EXPENSE" as const,
      amount: 0,
      description: "",
      date: new Date(),
      isRecurring: false,
    },
  });

  const transactionType = form.watch("type");
  const filteredCategories = categories.filter(
    (cat: { type: string }) => cat.type === transactionType,
  );

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

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "transactions" &&
          (!query.queryKey[1] ||
            Object.keys(query.queryKey[1] || {}).length === 0),
      });
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

  if (accountsLoading || categoriesLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("transaction.loadingForm")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Income/Expense Tabs */}
      <Tabs
        defaultValue="expense"
        onValueChange={(value) => {
          const type = value === "income" ? "INCOME" : "EXPENSE";
          form.setValue("type", type);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <span className="text-red-500">📤</span>
            {t("transaction.expense")}
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <span className="text-green-500">📥</span>
            {t("transaction.income")}
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TabsContent value="expense" className="space-y-4 mt-6">
              <TransactionFormFields
                form={form}
                type="EXPENSE"
                accounts={accounts}
                accountsLoading={accountsLoading}
                categories={filteredCategories}
                categoriesLoading={categoriesLoading}
                showAddAccount={showAddAccount}
                setShowAddAccount={setShowAddAccount}
                showAddCategory={showAddCategory}
                setShowAddCategory={setShowAddCategory}
                addAccountMutation={addAccountMutation}
                addCategoryMutation={addCategoryMutation}
                mutation={mutation}
                onSuccess={onSuccess}
                uploadedFiles={uploadedFiles}
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
              />
            </TabsContent>

            <TabsContent value="income" className="space-y-4 mt-6">
              <TransactionFormFields
                form={form}
                type="INCOME"
                accounts={accounts}
                accountsLoading={accountsLoading}
                categories={filteredCategories}
                categoriesLoading={categoriesLoading}
                showAddAccount={showAddAccount}
                setShowAddAccount={setShowAddAccount}
                showAddCategory={showAddCategory}
                setShowAddCategory={setShowAddCategory}
                addAccountMutation={addAccountMutation}
                addCategoryMutation={addCategoryMutation}
                mutation={mutation}
                onSuccess={onSuccess}
                uploadedFiles={uploadedFiles}
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
              />
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}

interface TransactionFormFieldsProps {
  form: UseFormReturn<
    z.infer<typeof TransactionFormSchema>,
    any,
    z.infer<typeof TransactionFormSchema>
  >;
  type: "INCOME" | "EXPENSE";
  accounts: Array<{ id: number; name: string; balance: number }>;
  accountsLoading: boolean;
  categories: Array<{ id: number; name: string; type: "INCOME" | "EXPENSE" }>;
  categoriesLoading: boolean;
  showAddAccount: boolean;
  setShowAddAccount: (value: boolean) => void;
  showAddCategory: boolean;
  setShowAddCategory: (value: boolean) => void;
  addAccountMutation: UseMutationResult<
    any,
    Error,
    { name: string; initialBalance: number },
    unknown
  >;
  addCategoryMutation: UseMutationResult<
    any,
    Error,
    { name: string; type: "INCOME" | "EXPENSE" },
    unknown
  >;
  mutation: UseMutationResult<any, Error, globalThis.FormData, unknown>;
  onSuccess?: () => void;
  uploadedFiles: UploadedFile[];
  handleFileUpload: (file: UploadedFile) => void;
  removeFile: (fileId: number) => void;
}

function TransactionFormFields({
  form,
  type,
  accounts,
  accountsLoading,
  categories,
  categoriesLoading,
  showAddAccount,
  setShowAddAccount,
  showAddCategory,
  setShowAddCategory,
  addAccountMutation,
  addCategoryMutation,
  mutation,
  onSuccess,
  uploadedFiles,
  handleFileUpload,
  removeFile,
}: TransactionFormFieldsProps) {
  const { t } = useLanguage();
  // Quick amount presets based on transaction type
  const quickAmounts =
    type === "EXPENSE"
      ? [10000, 25000, 50000, 100000, 250000, 500000]
      : [1000000, 2500000, 5000000, 10000000, 25000000, 50000000];

  return (
    <>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("transaction.amount")}</FormLabel>
            <FormControl>
              <Input
                placeholder="0"
                type="number"
                step="0.01"
                {...field}
                value={field.value || ""}
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quick Amount Buttons */}
      <div className="space-y-2">
        <FormLabel className="text-sm text-muted-foreground">
          {t("transaction.quickAmount")}
        </FormLabel>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.setValue("amount", amount)}
              className="text-xs"
            >
              Rp{(amount / 1000).toFixed(0)}k
            </Button>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="accountId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("transaction.account")}</FormLabel>
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
                        accountsLoading ? t("transaction.loadingAccounts") : t("transaction.selectAccount")
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map(
                    (acc: { id: number; name: string; balance: number }) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.name} (Rp{acc.balance.toLocaleString("id-ID")})
                      </SelectItem>
                    ),
                  )}
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
                    <DialogTitle>{t("transaction.addNewAccount")}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const name = formData.get("name") as string;
                      const initialBalance =
                        parseFloat(formData.get("initialBalance") as string) ||
                        0;
                      addAccountMutation.mutate({ name, initialBalance });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="account-name"
                        className="text-sm font-medium"
                      >
                        {t("transaction.accountName")}
                      </label>
                      <Input
                        id="account-name"
                        name="name"
                        placeholder={t("transaction.accountNamePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="account-balance"
                        className="text-sm font-medium"
                      >
                        {t("transaction.initialBalance")}
                      </label>
                      <Input
                        id="account-balance"
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
                          ? t("transaction.creating")
                          : t("transaction.createAccount")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddAccount(false)}
                      >
                        {t("transaction.cancel")}
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
            <FormLabel>{t("transaction.categoryOptional")}</FormLabel>
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
                          ? t("transaction.loadingCategories")
                          : categories.length === 0
                            ? type === "INCOME" ? t("transaction.noCategoriesIncome") : t("transaction.noCategoriesExpense")
                            : t("transaction.selectCategory")
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat: { id: number; name: string }) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
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
                    <DialogTitle>{t("transaction.addNewCategory")}</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const name = formData.get("name") as string;
                      addCategoryMutation.mutate({ name, type });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="category-name"
                        className="text-sm font-medium"
                      >
                        {t("transaction.categoryName")}
                      </label>
                      <Input
                        id="category-name"
                        name="name"
                        placeholder={type === "INCOME" ? t("transaction.categoryIncomePlaceholder") : t("transaction.categoryExpensePlaceholder")}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="category-type"
                        className="text-sm font-medium"
                      >
                        {t("transaction.type")}
                      </label>
                      <Select defaultValue={type}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INCOME">{t("transaction.income")}</SelectItem>
                          <SelectItem value="EXPENSE">{t("transaction.expense")}</SelectItem>
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
                          ? t("transaction.creating")
                          : t("transaction.createCategory")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddCategory(false)}
                      >
                        {t("transaction.cancel")}
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
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("transaction.date")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: id })
                    ) : (
                      <span>{t("transaction.selectDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("transaction.descriptionOptional")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("transaction.descriptionPlaceholder")}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={mutation.isPending || accountsLoading || categoriesLoading}
          className="flex-1"
        >
          {mutation.isPending ? t("transaction.saving") : t("transaction.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
          className="flex-1"
        >
          {t("transaction.cancel")}
        </Button>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t("transaction.uploadReceiptOptional")}
        </h3>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("transaction.uploadedFiles")}</h4>
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
          maxSizeText={t("transaction.maxFileSize")}
        />
      </div>
    </>
  );
}
