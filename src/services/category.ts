import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export type CategoryInput = {
  name: string;
  type: "INCOME" | "EXPENSE";
  iconName?: string;
};

export async function createCategory(userId: number, input: CategoryInput) {
  const [category] = await db
    .insert(categories)
    .values({
      userId,
      name: input.name,
      type: input.type,
      iconName: input.iconName || "Circle",
    })
    .returning();
  return category;
}

export async function getCategories(userId: number) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
  });
}

export async function updateCategory(
  userId: number,
  categoryId: number,
  input: Partial<CategoryInput>,
) {
  const updateData: Partial<typeof categories.$inferInsert> = {};
  if (input.name) updateData.name = input.name;
  if (input.type) updateData.type = input.type;
  if (input.iconName) updateData.iconName = input.iconName;

  const [category] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, categoryId) && eq(categories.userId, userId))
    .returning();
  return category;
}

export async function deleteCategory(userId: number, categoryId: number) {
  await db
    .delete(categories)
    .where(eq(categories.id, categoryId) && eq(categories.userId, userId));
}
