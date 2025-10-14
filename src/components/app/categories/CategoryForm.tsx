"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/actions/category";
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
import { CategorySchema } from "@/lib/validations/category";

const iconOptions = ["Circle", "Home", "Car", "Food", "Shopping", "DollarSign"];

interface CategoryFormProps {
  category?: {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    iconName?: string;
  };
  onSuccess?: () => void;
}

export default function CategoryForm({
  category,
  onSuccess,
}: CategoryFormProps) {
  const form = useForm({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "EXPENSE",
      iconName: category?.iconName || "Circle",
    },
  });

  const onSubmit = async (data: z.infer<typeof CategorySchema>) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    if (data.iconName) formData.append("iconName", data.iconName);

    const result = category
      ? await updateCategoryAction(category.id, formData)
      : await createCategoryAction(formData);

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
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Food, Transport, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="iconName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {category ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
