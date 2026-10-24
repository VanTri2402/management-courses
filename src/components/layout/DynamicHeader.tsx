import React from "react";
import Link from "next/link";
import { NavigationItemWithChildren, SafeUser } from "@/types";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandSearch } from "@/components/layout/CommandSearch";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ScrollProgressBar } from "@/components/scrollytelling/ScrollProgressBar";
import { RoadmapTriggerButton } from "@/components/roadmap/RoadmapTriggerButton";
import { ChevronDown, ExternalLink, Sparkles } from "lucide-react";

interface DynamicHeaderProps {
  settings: Record<string, any>;
  navItems: NavigationItemWithChildren[];
  user: SafeUser | null;
  unreadCount?: number;
}

export function DynamicHeader({
  settings,
  navItems,
  user,
  unreadCount = 0,
}: DynamicHeaderProps) {
  const siteName = settings.site_name || "Enterprise Core";
  const siteLogo = settings.site_logo;
  const ctaText = settings.header_cta_text || "Khám Phá";
  const ctaUrl = settings.header_cta_url || "/#showcase";

  return (
    <>
      {/* Visual Scroll Progress Bar at the absolute top */}
      <ScrollProgressBar />

      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          {/* Left: Mobile Drawer & Brand Logo */}
          <div className="flex items-center gap-3">
            <MobileDrawer items={navItems} logo={siteLogo} siteName={siteName} />

            <Link href="/" className="flex items-center gap-2.5 group">
              {siteLogo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/60 shadow-xs group-hover:scale-105 transition-transform">
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <span className="font-extrabold text-base md:text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Bar with Multi-level Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span>{item.title}</span>
                      {item.badgeText && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
                          {item.badgeText}
                        </span>
                      )}
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-1 w-52 rounded-xl border border-border/80 bg-background/95 backdrop-blur-xl p-1.5 shadow-xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
                      {item.children?.map((child) => (
                        <Link
                          key={child.id}
                          href={child.slugOrUrl}
                          target={child.isExternal ? "_blank" : undefined}
                          rel={child.isExternal ? "noopener noreferrer" : undefined}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                        >
                          <span>{child.title}</span>
                          {child.badgeText && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold">
                              {child.badgeText}
                            </span>
                          )}
                          {child.isExternal && (
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.slugOrUrl}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span>{item.title}</span>
                  {item.badgeText && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 font-bold">
                      {item.badgeText}
                    </span>
                  )}
                  {item.isExternal && (
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions, Search, Notifications, Theme, UserMenu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <RoadmapTriggerButton className="hidden md:inline-flex" />
            <CommandSearch />

            {user && <NotificationBell initialCount={unreadCount} />}

            <ThemeToggle />

            <UserMenu user={user} />

            {/* CTA Button */}
            {ctaText && (
              <Link
                href={ctaUrl}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all duration-200"
              >
                <span>{ctaText}</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
