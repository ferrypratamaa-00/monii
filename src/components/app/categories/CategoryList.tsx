"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteCategoryAction } from "@/app/actions/category";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/components/LanguageProvider";
import renderIcon from "../../renderIcon";
import CategoryForm from "./CategoryForm";

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  iconName?: string;
}

export default function CategoryList() {
  const { t } = useLanguage();
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
      title: t("categories.deleteCategory"),
      description: t("categories.deleteCategoryConfirm").replace("{name}", categoryName),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      variant: "destructive",
      onConfirm: async () => {
        const result = await deleteCategoryAction(categoryId);
        if (result.success) {
          toast.deleted(t("categories.pageTitle"));
          refetch();
        } else {
          toast.error(t("categories.deleteFailed"), {
            description: result.error,
          });
        }
      },
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("categories.loading")}</div>;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{t("categories.noCategories")}</p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("categories.createCategory")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("categories.createNewCategory")}</DialogTitle>
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
        <h2 className="text-2xl font-bold">{t("categories.pageTitle")}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("categories.addCategory")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("categories.createNewCategory")}</DialogTitle>
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
            {t("categories.incomeCategories")}
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
                        <DialogTitle>{t("categories.editCategory")}</DialogTitle>
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
            {t("categories.expenseCategories")}
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
                        <DialogTitle>{t("categories.editCategory")}</DialogTitle>
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
