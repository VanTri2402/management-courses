"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NavigationItemWithChildren } from "@/types";
import { Menu, X, ChevronRight, ExternalLink } from "lucide-react";

interface MobileDrawerProps {
  items: NavigationItemWithChildren[];
  logo?: string;
  siteName?: string;
}

export function MobileDrawer({
  items,
  logo,
  siteName = "Enterprise Core",
}: MobileDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-50 w-full max-w-xs bg-background h-full shadow-2xl p-6 flex flex-col justify-between border-r border-border animate-in slide-in-from-left duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  {logo && (
                    <img
                      src={logo}
                      alt={siteName}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  )}
                  <span className="font-extrabold text-base tracking-tight">
                    {siteName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="py-6 space-y-2 overflow-y-auto max-h-[70vh]">
                {items.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <Link
                      href={item.slugOrUrl}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <span>{item.title}</span>
                      {item.badgeText && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {item.badgeText}
                        </span>
                      )}
                      {item.isExternal && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                    </Link>

                    {/* Children Items */}
                    {item.children && item.children.length > 0 && (
                      <div className="pl-4 space-y-1 border-l border-border/60 ml-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.slugOrUrl}
                            target={child.isExternal ? "_blank" : undefined}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                          >
                            <span>{child.title}</span>
                            {child.badgeText && (
                              <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                                {child.badgeText}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-border text-xs text-muted-foreground">
              <p>© 2026 {siteName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
