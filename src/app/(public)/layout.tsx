import React from "react";
import { getLayoutData } from "@/server/queries/layout";
import { DynamicHeader } from "@/components/layout/DynamicHeader";
import { DynamicFooter } from "@/components/layout/DynamicFooter";
import { SmoothScrollProvider } from "@/components/scrollytelling/SmoothScrollProvider";
import { EduCoreChatbot } from "@/components/shared/EduCoreChatbot";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutData = await getLayoutData();

  return (
    <SmoothScrollProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <DynamicHeader
          settings={layoutData.settings}
          navItems={layoutData.headerMain}
          user={layoutData.currentUser}
          unreadCount={layoutData.unreadNotificationsCount}
        />
        <main className="flex-1">{children}</main>
        <DynamicFooter
          settings={layoutData.settings}
          footerCol1={layoutData.footerCol1}
          footerCol2={layoutData.footerCol2}
          footerCol3={layoutData.footerCol3}
          footerBottom={layoutData.footerBottom}
        />
        <EduCoreChatbot />
      </div>
    </SmoothScrollProvider>
  );
}
