import React from "react";
import { db } from "@/lib/db";
import { MenuManagerClient } from "./menu-manager";

export const dynamic = "force-dynamic";

export default async function MenusAdminPage() {
  let items: any[] = [];
  let parentCandidates: any[] = [];

  try {
    const [fetchedItems, fetchedParents] = await Promise.all([
      db.navigationItem.findMany({
        orderBy: [{ location: "asc" }, { sortOrder: "asc" }],
        include: {
          parent: {
            select: { id: true, title: true },
          },
        },
      }),
      db.navigationItem.findMany({
        where: { parentId: null },
        select: { id: true, title: true, location: true },
        orderBy: { title: "asc" },
      }),
    ]);
    items = fetchedItems;
    parentCandidates = fetchedParents;
  } catch (e) {
    console.warn("[MenusAdminPage] DB offline fallback:", e);
  }

  return <MenuManagerClient initialItems={items} parentCandidates={parentCandidates} />;
}
