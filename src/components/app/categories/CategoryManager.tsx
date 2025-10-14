"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { categories } from "@/db/schema";
import { getCategories } from "@/services/category";
import CategoryForm from "./CategoryForm";

type Category = typeof categories.$inferSelect;

export function CategoryManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(1), // TODO: get userId
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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>Tambah Kategori</Button>
          </DialogTrigger>
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
              onSuccess={handleModalClose}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span>{category.iconName}</span>
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
