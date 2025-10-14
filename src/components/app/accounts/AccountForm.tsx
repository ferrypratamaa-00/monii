"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  createAccountAction,
  updateAccountAction,
} from "@/app/actions/account";
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
import { AccountSchema } from "@/lib/validations/account";

interface AccountFormProps {
  account?: {
    id: number;
    name: string;
    initialBalance: string;
  };
  onSuccess?: () => void;
}

export default function AccountForm({ account, onSuccess }: AccountFormProps) {
  const form = useForm({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      name: account?.name || "",
      initialBalance: account ? parseFloat(account.initialBalance) : 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof AccountSchema>) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("initialBalance", data.initialBalance.toString());

    const result = account
      ? await updateAccountAction(account.id, formData)
      : await createAccountAction(formData);

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., BCA, Cash, GoPay" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Balance</FormLabel>
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {account ? "Update Account" : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
