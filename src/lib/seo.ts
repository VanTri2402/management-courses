import { Metadata } from "next";
import { env } from "@/lib/env";

export interface ConstructMetadataParams {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  pathname?: string;
}

/**
 * Enterprise SEO Engine: constructs Next.js Metadata with OpenGraph & Twitter Cards
 */
export function constructMetadata({
  title,
  description = "EduCore Academy — Nền tảng học tập trực tuyến và đào tạo kỹ sư công nghệ chuẩn doanh nghiệp.",
  image = "/assets/og-image.png",
  icons = "/favicon.ico",
  noIndex = false,
  pathname = "",
}: ConstructMetadataParams = {}): Metadata {
  const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullTitle = title ? `${title} | EduCore Academy` : "EduCore Academy — Nền Tảng Đào Tạo Kỹ Sư Công Nghệ Chuyên Nghiệp";
  const canonicalUrl = `${appUrl}${pathname}`;
  const imageUrl = image.startsWith("http") ? image : `${appUrl}${image}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: "EduCore Academy",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "vi_VN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@EnterpriseCore",
    },
    icons,
    metadataBase: new URL(appUrl),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
