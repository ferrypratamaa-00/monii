"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "@/lib/toast";
import { AccountSchema } from "@/lib/validations/account";
import { useLanguage } from "@/components/LanguageProvider";

interface AccountFormProps {
  account?: {
    id: number;
    name: string;
    initialBalance: string;
  };
  onSuccess?: () => void;
}

export default function AccountForm({ account, onSuccess }: AccountFormProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof AccountSchema>>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      name: account?.name ?? "",
      initialBalance: account ? parseFloat(account.initialBalance) : 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof AccountSchema>) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("initialBalance", data.initialBalance.toString());
      const result = await createAccountAction(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      try {
        form.reset();
        toast.created("Account");
        onSuccess?.();
      } catch (err) {
        console.warn("AccountForm: callback threw", err);
      }
    },
    onError: (error) => {
      toast.error("Failed to create account", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (
      data: z.infer<typeof AccountSchema> & { id: number },
    ) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("initialBalance", data.initialBalance.toString());
      const result = await updateAccountAction(data.id, formData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      try {
        form.reset();
        toast.updated("Account");
        onSuccess?.();
      } catch (err) {
        console.warn("AccountForm: callback threw", err);
      }
    },
    onError: (error) => {
      toast.error("Failed to update account", { description: error.message });
    },
  });

  const onSubmit = (data: z.infer<typeof AccountSchema>) => {
    if (account) {
      updateMutation.mutate({ ...data, id: account.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("transaction.accountName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("transaction.accountNamePlaceholder")} {...field} />
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
              <FormLabel>{t("transaction.initialBalance")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("account.balancePlaceholder")}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {account ? t("account.update") : t("account.create")}
        </Button>
      </form>
    </Form>
  );
}
