"use client";

import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { getCategoriesAction } from "@/app/actions/category";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { categories } from "@/db/schema";
import CategoryForm from "./CategoryForm";

type Category = typeof categories.$inferSelect;

const SafeDot = () => (
  <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">
    •
  </span>
);

const renderIcon = (iconName?: string | null) => {
  if (!iconName) return <SafeDot />;
  const IconComponent = (LucideIcons as Record<string, any>)[iconName];
  return IconComponent ? <IconComponent className="h-4 w-4" /> : <SafeDot />;
};

export function CategoryManager() {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    data: categories,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategoriesAction();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.categories as Category[];
    },
    // staleTime: 0, // boleh 0
    // gcTime: 0,    // ❌ jangan 0; biarkan default agar cache tidak langsung dibuang
    refetchOnWindowFocus: false,
  });

  const openAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModalHard = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) return <div>{t("categories.loading")}</div>;
  if (error) return <div className="text-red-500">{t("categories.loadError")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("categories.pageTitle")}</h2>
        <div className="flex items-center gap-2">
          {isFetching ? (
            <span className="text-sm text-muted-foreground">{t("categories.syncIndicator")}</span>
          ) : null}
          <Button onClick={openAdd}>{t("categories.addButton")}</Button>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingCategory(null);
        }}
      >
        {/* Render content HANYA saat open agar child benar2 unmount saat close */}
        {isModalOpen && (
          <DialogContent
          // Kalau masih ada masalah fokus, bisa aktifkan ini:
          // onOpenAutoFocus={(e) => e.preventDefault()}
          // onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? t("categories.editTitle") : t("categories.addTitle")}
              </DialogTitle>
            </DialogHeader>

            <CategoryForm
              key={editingCategory?.id ?? "new"} // force remount tiap buka
              category={
                editingCategory
                  ? {
                      id: editingCategory.id,
                      name: editingCategory.name,
                      type: editingCategory.type,
                      iconName: editingCategory.iconName || undefined,
                    }
                  : undefined
              }
              onCloseModal={closeModalHard}
            />
          </DialogContent>
        )}
      </Dialog>

      <div className="grid gap-4">
        {categories?.map((category: Category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <div className="flex items-center gap-2">
                  {renderIcon(category.iconName)}
                  {category.name}
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      category.type === "INCOME" ? "default" : "secondary"
                    }
                  >
                    {category.type === "INCOME" ? t("categories.income") : t("categories.expense")}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(category)}
                  >
                    {t("categories.editButton")}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
