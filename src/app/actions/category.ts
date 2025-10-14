"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE",
      iconName: formData.get("iconName") as string,
    };

    const result = CategorySchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await createCategory(parseInt(session.user.id, 10), result.data);
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Failed to create category" };
  }
}

export async function updateCategoryAction(
  categoryId: number,
  formData: FormData,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE",
      iconName: formData.get("iconName") as string,
    };

    const result = CategorySchema.safeParse(data);
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    await updateCategory(
      parseInt(session.user.id, 10),
      categoryId,
      result.data,
    );
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(categoryId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await deleteCategory(parseInt(session.user.id, 10), categoryId);
    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Failed to delete category" };
  }
}

export async function getCategoriesAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const categories = await getCategories(parseInt(session.user.id, 10));
    return { categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { error: "Failed to fetch categories" };
  }
}
