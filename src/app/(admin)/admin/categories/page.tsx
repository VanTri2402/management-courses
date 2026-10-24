import React from "react";
import { db } from "@/lib/db";
import { CategoryManagerClient } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { courses: true },
      },
    },
  });

  return <CategoryManagerClient initialCategories={categories} />;
}
