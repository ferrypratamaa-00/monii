"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createDebtAction, updateDebtAction } from "@/app/actions/debt";
import { Button } from "@/components/ui/button";
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
import { DebtSchema } from "@/lib/validations/debt";

interface DebtFormProps {
  debt?: {
    id: number;
    type: "DEBT" | "RECEIVABLE";
    personName: string;
    amount: string;
    dueDate?: Date;
  };
  onSuccess?: () => void;
}

export default function DebtForm({ debt, onSuccess }: DebtFormProps) {
  const form = useForm({
    resolver: zodResolver(DebtSchema),
    defaultValues: {
      type: debt?.type || "DEBT",
      personName: debt?.personName || "",
      amount: debt ? parseFloat(debt.amount) : 0,
      dueDate: debt?.dueDate ? debt.dueDate.toISOString().split("T")[0] : "",
    },
  });

  const onSubmit = async (data: z.infer<typeof DebtSchema>) => {
    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("personName", data.personName);
    formData.append("amount", data.amount.toString());
    if (data.dueDate) formData.append("dueDate", data.dueDate);

    const result = debt
      ? await updateDebtAction(debt.id, formData)
      : await createDebtAction(formData);

    if (result.success) {
      form.reset();
      onSuccess?.();
    } else {
      console.error(result.error);
    }
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
                  <SelectItem value="DEBT">I owe money (Debt)</SelectItem>
                  <SelectItem value="RECEIVABLE">
                    Owed money (Receivable)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Person Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe, Bank ABC" {...field} />
              </FormControl>
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
                  placeholder="0.00"
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
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {debt ? "Update Debt" : "Create Debt"}
        </Button>
      </form>
    </Form>
  );
}
