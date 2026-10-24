import { NextResponse } from "next/server";
import { getUserNotifications } from "@/server/queries/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getUserNotifications(20);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
