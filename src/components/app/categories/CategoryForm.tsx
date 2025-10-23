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
import { Circle,
  Home,
  Car,
  Utensils,
  ShoppingBag,
  DollarSign,
  Heart,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Plane,
  Bus,
  Wifi,
  Phone,
  Zap,
  Droplets,
  Shirt,
  Pill,
  Stethoscope,
  Dumbbell,
  Book,
  Music,
  Film,
  Camera,
  Coffee,
  Gift,
  Banknote,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus
} from "lucide-react";

const renderIcon = (iconName?: string | null) => {
  if (!iconName) {
    return <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">•</span>;
  }
  const selectedIcon = iconOptions.find((opt) => opt.name === iconName);
  const IconComponent = selectedIcon?.icon;
  return IconComponent ? <IconComponent className="h-4 w-4" /> : <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">•</span>;
};

const iconOptions = [
  { name: "Circle", icon: Circle, label: "Default" },
  { name: "Home", icon: Home, label: "Home" },
  { name: "Car", icon: Car, label: "Transport" },
  { name: "Utensils", icon: Utensils, label: "Food" },
  { name: "ShoppingBag", icon: ShoppingBag, label: "Shopping" },
  { name: "DollarSign", icon: DollarSign, label: "Money" },
  { name: "Heart", icon: Heart, label: "Health" },
  { name: "Briefcase", icon: Briefcase, label: "Work" },
  { name: "GraduationCap", icon: GraduationCap, label: "Education" },
  { name: "Gamepad2", icon: Gamepad2, label: "Entertainment" },
  { name: "Plane", icon: Plane, label: "Travel" },
  { name: "Bus", icon: Bus, label: "Public Transport" },
  { name: "Wifi", icon: Wifi, label: "Internet" },
  { name: "Phone", icon: Phone, label: "Communication" },
  { name: "Zap", icon: Zap, label: "Electricity" },
  { name: "Droplets", icon: Droplets, label: "Water" },
  { name: "Shirt", icon: Shirt, label: "Clothing" },
  { name: "Pill", icon: Pill, label: "Medicine" },
  { name: "Stethoscope", icon: Stethoscope, label: "Medical" },
  { name: "Dumbbell", icon: Dumbbell, label: "Fitness" },
  { name: "Book", icon: Book, label: "Books" },
  { name: "Music", icon: Music, label: "Music" },
  { name: "Film", icon: Film, label: "Movies" },
  { name: "Camera", icon: Camera, label: "Photography" },
  { name: "Coffee", icon: Coffee, label: "Beverages" },
  { name: "Gift", icon: Gift, label: "Gifts" },
  { name: "Banknote", icon: Banknote, label: "Cash" },
  { name: "CreditCard", icon: CreditCard, label: "Cards" },
  { name: "PiggyBank", icon: PiggyBank, label: "Savings" },
  { name: "TrendingUp", icon: TrendingUp, label: "Income" },
  { name: "TrendingDown", icon: TrendingDown, label: "Expense" },
  { name: "Plus", icon: Plus, label: "Add" },
  { name: "Minus", icon: Minus, label: "Subtract" },
];

interface CategoryFormProps {
  category?: {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    iconName?: string;
  };
  onSuccess?: () => void;
  onInvalidateCache?: () => void;
}

export default function CategoryForm({
  category,
  onSuccess,
  onInvalidateCache,
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
      onInvalidateCache?.();
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
                    <SelectValue placeholder="Select icon">
                      {field.value && (
                        <div className="flex items-center gap-2">
                          {renderIcon(field.value)}
                          <span>
                            {iconOptions.find((opt) => opt.name === field.value)?.label || field.value}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((iconOption) => (
                    <SelectItem key={iconOption.name} value={iconOption.name}>
                      <div className="flex items-center gap-2">
                        {renderIcon(iconOption.name)}
                        <span>{iconOption.label}</span>
                      </div>
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
