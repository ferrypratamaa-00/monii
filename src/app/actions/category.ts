// app/actions/category.ts
"use server";

import { auth } from "@/lib/auth-server";
import { CategorySchema } from "@/lib/validations/category";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category";

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE",
      iconName: (formData.get("iconName") as string) || undefined,
    };

    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const created = await createCategory(
      parseInt(session.user.id, 10),
      parsed.data,
    );

    return { success: true, category: created };
  } catch (e) {
    console.error("Error creating category:", e);
    return { error: "Failed to create category" };
  }
}

export async function updateCategoryAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const categoryIdStr = formData.get("categoryId") as string;
    if (!categoryIdStr) return { error: "Category ID is required" };

    const categoryId = parseInt(categoryIdStr, 10);

    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE",
      iconName: (formData.get("iconName") as string) || undefined,
    };

    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const updated = await updateCategory(
      parseInt(session.user.id, 10),
      categoryId,
      parsed.data,
    );

    return { success: true, category: updated };
  } catch (e) {
    console.error("Error updating category:", e);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(categoryId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    await deleteCategory(parseInt(session.user.id, 10), categoryId);
    return { success: true };
  } catch (e) {
    console.error("Error deleting category:", e);
    return { error: "Failed to delete category" };
  }
}

export async function getCategoriesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const categories = await getCategories(parseInt(session.user.id, 10));
    return { categories };
  } catch (e) {
    console.error("Error fetching categories:", e);
    return { error: "Failed to fetch categories" };
  }
}
