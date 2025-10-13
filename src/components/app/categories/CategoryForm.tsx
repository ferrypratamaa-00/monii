"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory, updateCategory } from "@/services/category";

const CategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib"),
  type: z.enum(["INCOME", "EXPENSE"]),
  iconName: z.string().optional(),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

const iconOptions = ["Circle", "Home", "Car", "Food", "Shopping", "DollarSign"];

interface CategoryFormProps {
  categoryId?: number;
  defaultValues?: Partial<CategoryFormData>;
  onSuccess?: () => void;
}

export function CategoryForm({
  categoryId,
  defaultValues,
  onSuccess,
}: CategoryFormProps) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => createCategory(1, data), // TODO: get userId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      updateCategory(1, categoryId!, data), // TODO: get userId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    if (categoryId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <FormWrapper
      schema={CategorySchema}
      defaultValues={{
        name: defaultValues?.name || "",
        type: defaultValues?.type || "EXPENSE",
        iconName: defaultValues?.iconName || "Circle",
      }}
      onSubmit={handleSubmit}
    >
      {(methods) => (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Kategori</Label>
            <Input
              id="name"
              {...methods.register("name")}
              placeholder="e.g. Makanan"
            />
            {methods.formState.errors.name && (
              <p className="text-sm text-red-500">
                {methods.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="type">Tipe</Label>
            <Select
              value={methods.watch("type")}
              onValueChange={(value) =>
                methods.setValue("type", value as "INCOME" | "EXPENSE")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="iconName">Ikon</Label>
            <Select
              value={methods.watch("iconName")}
              onValueChange={(value) => methods.setValue("iconName", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {categoryId ? "Update" : "Tambah"} Kategori
          </Button>
        </div>
      )}
    </FormWrapper>
  );
}
