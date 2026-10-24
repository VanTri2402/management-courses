import React from "react";
import { getAllSettingsGrouped } from "@/server/queries/settings";
import { SettingsFormClient } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const grouped = await getAllSettingsGrouped();

  return <SettingsFormClient groupedSettings={grouped} />;
}
