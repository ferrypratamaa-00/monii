"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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

const CreateBudgetSchema = z.object({
  categoryId: z.number().int().positive("Please select a category"),
  period: z.enum(["MONTHLY", "YEARLY"]),
  limitAmount: z.number().positive("Budget limit must be greater than 0"),
});

type CreateBudgetFormData = z.infer<typeof CreateBudgetSchema>;

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
}

interface CreateBudgetDialogProps {
  categories: Category[];
}

export function CreateBudgetDialog({ categories }: CreateBudgetDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateBudgetFormData>({
    resolver: zodResolver(CreateBudgetSchema),
    defaultValues: {
      categoryId: 0,
      period: "MONTHLY",
      limitAmount: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateBudgetFormData) => {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create budget");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-stats"] });
      form.reset();
    },
  });

  const onSubmit = (data: CreateBudgetFormData) => {
    createMutation.mutate(data);
  };

  // Filter only expense categories for budgets
  const expenseCategories = categories.filter((cat) => cat.type === "EXPENSE");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(parseInt(value, 10))
                    }
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
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
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </form>
        </Form>

        {createMutation.isError && (
          <div className="text-sm text-red-600 mt-2">
            Error: {createMutation.error?.message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
