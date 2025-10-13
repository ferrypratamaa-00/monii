"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccount, updateAccount } from "@/services/account";

const AccountSchema = z.object({
  name: z.string().min(1, "Nama akun wajib"),
  initialBalance: z.number().finite(),
});

type AccountFormData = z.infer<typeof AccountSchema>;

interface AccountFormProps {
  accountId?: number;
  defaultValues?: Partial<AccountFormData>;
  onSuccess?: () => void;
}

export function AccountForm({
  accountId,
  defaultValues,
  onSuccess,
}: AccountFormProps) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: AccountFormData) => createAccount(1, data), // TODO: get userId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AccountFormData) => updateAccount(1, accountId!, data), // TODO: get userId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onSuccess?.();
    },
  });

  const handleSubmit = (data: AccountFormData) => {
    if (accountId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <FormWrapper
      schema={AccountSchema}
      defaultValues={{
        name: defaultValues?.name || "",
        initialBalance: defaultValues?.initialBalance || 0,
      }}
      onSubmit={handleSubmit}
    >
      {(methods) => (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Akun</Label>
            <Input
              id="name"
              {...methods.register("name")}
              placeholder="e.g. Bank BCA"
            />
            {methods.formState.errors.name && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="initialBalance">Saldo Awal</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              {...methods.register("initialBalance", { valueAsNumber: true })}
            />
            {methods.formState.errors.initialBalance && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.initialBalance.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {accountId ? "Update" : "Tambah"} Akun
          </Button>
        </div>
      )}
    </FormWrapper>
  );
}
