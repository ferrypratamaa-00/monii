"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/lib/toast";

const EditBudgetSchema = z.object({
  limitAmount: z.number().positive("Budget limit must be greater than 0"),
  period: z.enum(["MONTHLY", "YEARLY"]),
});

type EditBudgetFormData = z.infer<typeof EditBudgetSchema>;

interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  period: "MONTHLY" | "YEARLY";
  limitAmount: number;
  currentSpending: number;
  createdAt: Date;
}

interface EditBudgetDialogProps {
  budget: Budget;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditBudgetDialog({ budget, trigger, onSuccess }: EditBudgetDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<EditBudgetFormData>({
    resolver: zodResolver(EditBudgetSchema),
    defaultValues: {
      limitAmount: budget.limitAmount,
      period: budget.period,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditBudgetFormData) => {
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update budget");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-stats"] });
      form.reset();
      toast.updated("Budget");
      setIsOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to update budget", { description: error.message });
    },
  });

  const onSubmit = (data: EditBudgetFormData) => {
    updateMutation.mutate(data);
  };

  // Reset form when budget changes
  useEffect(() => {
    form.reset({
      limitAmount: budget.limitAmount,
      period: budget.period,
    });
  }, [budget, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">{budget.categoryName}</p>
          <p className="text-xs text-muted-foreground">
            Current spending: Rp{" "}
            {budget.currentSpending.toLocaleString("id-ID")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="limitAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Limit (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Updating..." : "Update Budget"}
              </Button>
            </div>
          </form>
        </Form>

        {updateMutation.isError && (
          <div className="text-sm text-red-600 mt-2">
            Error: {updateMutation.error?.message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
