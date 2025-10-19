"use client";

// biome-ignore assist/source/organizeImports: <>
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { createTransactionAction } from "@/app/actions/transaction";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  date: z.date(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  trigger?: React.ReactNode;
  defaultType?: "INCOME" | "EXPENSE";
  isOpen?: boolean;
  onClose?: () => void;
}

export function TransactionModal({
  trigger,
  defaultType = "EXPENSE",
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: TransactionModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use external control if provided, otherwise use internal state
  const isControlled = externalIsOpen !== undefined;
  const open = isControlled ? externalIsOpen : internalOpen;
  const setOpen = isControlled ? (value: boolean) => {
    if (value === false && externalOnClose) {
      externalOnClose();
    }
  } : setInternalOpen;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      amount: "",
      description: "",
      categoryId: "",
      accountId: "",
      date: new Date(),
    },
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => createTransactionAction(formData),
    onMutate: async (formData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot previous value for rollback
      const previousDashboard = queryClient.getQueryData(["dashboard"]);

      // Optimistically update dashboard data
      const amount = parseFloat(formData.get("amount") as string);
      const type = formData.get("type") as string;

      queryClient.setQueryData(["dashboard"], (old: any) => {
        if (!old) return old;

        const balanceChange = type === "INCOME" ? amount : -amount;

        return {
          ...old,
          totalBalance: (old.totalBalance || 0) + balanceChange,
          monthlySummary: {
            ...old.monthlySummary,
            income: type === "INCOME"
              ? (old.monthlySummary?.income || 0) + amount
              : old.monthlySummary?.income || 0,
            expense: type === "EXPENSE"
              ? (old.monthlySummary?.expense || 0) + amount
              : old.monthlySummary?.expense || 0,
          },
        };
      });

      return { previousDashboard };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Transaksi berhasil ditambahkan");
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        setOpen(false);
        form.reset();
      } else {
        toast.error(data.error || "Terjadi kesalahan");
      }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousDashboard) {
        queryClient.setQueryData(["dashboard"], context.previousDashboard);
      }
      toast.error("Terjadi kesalahan saat menyimpan");
    },
  });

  const onSubmit = (data: TransactionFormData) => {
    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("amount", data.amount);
    formData.append("description", data.description || "");
    formData.append("categoryId", data.categoryId);
    formData.append("accountId", data.accountId);
    formData.append("date", data.date.toISOString());

    mutation.mutate(formData);
  };

  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    form.setValue("type", type);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Ctrl+Enter to submit
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
      }

      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  }, [open, form, onSubmit, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <button type="button" className="fixed bottom-20 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 transition-all">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              defaultValue={defaultType.toLowerCase()}
              onValueChange={(value) =>
                handleTypeChange(value.toUpperCase() as "INCOME" | "EXPENSE")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense" className="flex items-center gap-2">
                  <span className="text-red-500">📤</span>
                  Pengeluaran
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <span className="text-green-500">📥</span>
                  Pemasukan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expense" className="space-y-4 mt-4">
                <TransactionForm form={form} type="EXPENSE" />
              </TabsContent>

              <TabsContent value="income" className="space-y-4 mt-4">
                <TransactionForm form={form} type="INCOME" />
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              💡 <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> untuk simpan • <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> untuk tutup
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface TransactionFormProps {
  form: any;
  type: "INCOME" | "EXPENSE";
}

function TransactionForm({ form, type }: TransactionFormProps) {
  // In a real app, these would come from API
  const categories = [
    { id: "1", name: "Makan", type: "EXPENSE" },
    { id: "2", name: "Transport", type: "EXPENSE" },
    { id: "3", name: "Belanja", type: "EXPENSE" },
    { id: "4", name: "Tagihan", type: "EXPENSE" },
    { id: "5", name: "Gaji", type: "INCOME" },
    { id: "6", name: "Bonus", type: "INCOME" },
  ];

  const accounts = [
    { id: "1", name: "BCA", balance: 5000000 },
    { id: "2", name: "Cash", balance: 100000 },
  ];

  const filteredCategories = categories.filter((cat) => cat.type === type);

  // Quick amount presets based on transaction type
  const quickAmounts = type === "EXPENSE"
    ? [10000, 25000, 50000, 100000, 250000, 500000]
    : [1000000, 2500000, 5000000, 10000000, 25000000, 50000000];

  return (
    <>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Jumlah</FormLabel>
            <FormControl>
              <Input
                placeholder="0"
                type="number"
                step="0.01"
                {...field}
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quick Amount Buttons */}
      <div className="space-y-2">
        <FormLabel className="text-sm text-muted-foreground">Jumlah Cepat</FormLabel>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map(amount => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.setValue("amount", amount.toString())}
              className="text-xs"
            >
              Rp{(amount / 1000).toFixed(0)}k
            </Button>
          ))}
        </div>
      </div>

      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kategori</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
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
        name="accountId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Akun</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (Rp{account.balance.toLocaleString("id-ID")})
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
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Tanggal</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
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
            <FormLabel>Keterangan (Opsional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tambahkan catatan..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}