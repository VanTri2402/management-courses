import React from "react";
import Link from "next/link";
import { NavigationItemWithChildren } from "@/types";
import { ExternalLink, Github, Twitter, Disc as DiscordIcon, Sparkles } from "lucide-react";

interface DynamicFooterProps {
  settings: Record<string, any>;
  footerCol1: NavigationItemWithChildren[];
  footerCol2: NavigationItemWithChildren[];
  footerCol3: NavigationItemWithChildren[];
  footerBottom: NavigationItemWithChildren[];
}

export function DynamicFooter({
  settings,
  footerCol1,
  footerCol2,
  footerCol3,
  footerBottom,
}: DynamicFooterProps) {
  const siteName = settings.site_name || "Enterprise Core";
  const siteLogo = settings.site_logo;
  const footerAbout =
    settings.footer_about ||
    "Nền tảng kiến trúc Enterprise Next.js với Awwwards Scroll Storytelling, Multi-layer RBAC và Dynamic CMS.";
  const copyright = settings.footer_copyright || "© 2026 Enterprise Core Boilerplate. All rights reserved.";
  const socialLinks: any[] = Array.isArray(settings.social_links) ? settings.social_links : [];

  return (
    <footer className="w-full border-t border-border/40 bg-card/30 backdrop-blur-md pt-16 pb-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/40">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {siteLogo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/60">
                  <img
                    src={siteLogo}
                    alt={siteName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <span className="font-extrabold text-lg tracking-tight">
                {siteName}
              </span>
            </Link>

            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-sm">
              {footerAbout}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                    title={s.label || s.platform}
                  >
                    {s.platform === "github" ? (
                      <Github className="w-4 h-4" />
                    ) : s.platform === "twitter" ? (
                      <Twitter className="w-4 h-4" />
                    ) : (
                      <DiscordIcon className="w-4 h-4" />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Nền Tảng
            </h4>
            <ul className="space-y-2 text-xs">
              {footerCol1.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.slugOrUrl}
                    target={item.isExternal ? "_blank" : undefined}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{item.title}</span>
                    {item.isExternal && <ExternalLink className="w-2.5 h-2.5" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Hệ Sinh Thái
            </h4>
            <ul className="space-y-2 text-xs">
              {footerCol2.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.slugOrUrl}
                    target={item.isExternal ? "_blank" : undefined}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{item.title}</span>
                    {item.isExternal && <ExternalLink className="w-2.5 h-2.5" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Pháp Lý & Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-xs">
              {footerCol3.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.slugOrUrl}
                    target={item.isExternal ? "_blank" : undefined}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{item.title}</span>
                    {item.badgeText && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-primary/15 text-primary font-bold">
                        {item.badgeText}
                      </span>
                    )}
                    {item.isExternal && <ExternalLink className="w-2.5 h-2.5" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{copyright}</p>

          {footerBottom.length > 0 && (
            <div className="flex items-center gap-4">
              {footerBottom.map((item) => (
                <Link
                  key={item.id}
                  href={item.slugOrUrl}
                  className="hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
