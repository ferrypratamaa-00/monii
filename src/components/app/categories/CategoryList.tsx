"use client";

import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCategoryAction } from "@/app/actions/category";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import CategoryForm from "./CategoryForm";

const renderIcon = (iconName?: string | null) => {
  if (!iconName) {
    return (
      <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">
        •
      </span>
    );
  }
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? (
    <IconComponent className="h-4 w-4" />
  ) : (
    <span className="h-4 w-4 flex items-center justify-center text-muted-foreground" />
  );
};

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  iconName?: string;
}

export default function CategoryList() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const {
    data: categories,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const handleDelete = async (categoryId: number, categoryName: string) => {
    confirm({
      title: "Delete Category",
      description: `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        const result = await deleteCategoryAction(categoryId);
        if (result.success) {
          toast.deleted("Category");
          refetch();
        } else {
          toast.error("Failed to delete category", {
            description: result.error,
          });
        }
      },
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No categories yet</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
              onInvalidateCache={refetch}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const incomeCategories = categories.filter(
    (cat: Category) => cat.type === "INCOME",
  );
  const expenseCategories = categories.filter(
    (cat: Category) => cat.type === "EXPENSE",
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSuccess={() => {
                setIsCreateOpen(false);
                refetch();
              }}
              onInvalidateCache={refetch}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">
            Income Categories
          </h3>
          <div className="space-y-2">
            {incomeCategories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    {renderIcon(category.iconName)}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <CategoryForm
                        category={editingCategory || undefined}
                        onSuccess={() => {
                          setEditingCategory(null);
                          setIsEditOpen(false);
                          refetch();
                        }}
                        onInvalidateCache={refetch}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Expense Categories
          </h3>
          <div className="space-y-2">
            {expenseCategories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    {renderIcon(category.iconName)}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                      </DialogHeader>
                      <CategoryForm
                        category={editingCategory || undefined}
                        onSuccess={() => {
                          setEditingCategory(null);
                          setIsEditOpen(false);
                          refetch();
                        }}
                        onInvalidateCache={refetch}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {dialog}
    </div>
  );
}
