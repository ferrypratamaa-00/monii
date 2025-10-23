"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as LucideIcons from "lucide-react";
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

const renderIcon = (iconName?: string | null) => {
  if (!iconName) {
    return <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">•</span>;
  }
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? <IconComponent className="h-4 w-4" /> : <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">•</span>;
};

type Category = typeof categories.$inferSelect;

export function CategoryManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kategori</h2>
        <Button onClick={handleAdd}>Tambah Kategori</Button>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
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
            onSuccess={() => {
              handleModalClose();
            }}
            onInvalidateCache={() => {
              queryClient.invalidateQueries({ queryKey: ["categories"] });
            }}
          />
        </DialogContent>
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
                    {category.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
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
