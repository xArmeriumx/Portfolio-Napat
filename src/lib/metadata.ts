import type { Metadata } from "next";
import {
  SEO_DEFAULTS,
  SITE_NAME,
  absoluteUrl,
  normalizeMetaDescription,
  toAbsoluteImageUrl,
} from "@/config/seo.js";

type SeoInput = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  path?: string;
  noindex?: boolean;
  locale?: string;
  alternateLocale?: string;
};

export function buildPageMetadata({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  path = "",
  noindex,
  locale = SEO_DEFAULTS.locale,
  alternateLocale = SEO_DEFAULTS.alternateLocale,
}: SeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const pageDescription = normalizeMetaDescription(description, 160);
  const effectiveTitle = ogTitle || title;
  const effectiveDescription = normalizeMetaDescription(
    ogDescription || description,
    ogType === "article" ? 200 : 160,
  );
  const imageUrl = toAbsoluteImageUrl(ogImage || SEO_DEFAULTS.ogImage);
  const isProjectImage = Boolean(ogImage && ogImage !== SEO_DEFAULTS.ogImage);
  const imageWidth = ogImageWidth || (isProjectImage ? 1200 : 512);
  const imageHeight = ogImageHeight || (isProjectImage ? 630 : 512);

  const openGraph: Record<string, unknown> = {
    type: ogType,
    url: canonical,
    siteName: SITE_NAME,
    title: effectiveTitle,
    description: effectiveDescription,
    locale,
    alternateLocale: [alternateLocale],
    images: [
      {
        url: imageUrl,
        width: imageWidth,
        height: imageHeight,
        alt: ogImageAlt || `${effectiveTitle} - Napat Pamornsut Portfolio`,
      },
    ],
  };

  if (ogType === "article") {
    openGraph.authors = ["Napat Pamornsut"];
    openGraph.section = "Portfolio Projects";
  }

  return {
    title,
    description: pageDescription,
    authors: [{ name: "Napat Pamornsut", url: absoluteUrl("/") }],
    creator: "Napat Pamornsut",
    publisher: SITE_NAME,
    category: "Portfolio",
    alternates: {
      canonical,
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
          },
        },
    openGraph: openGraph as Metadata["openGraph"],
    twitter: {
      card: "summary_large_image",
      title: effectiveTitle,
      description: effectiveDescription,
      images: [imageUrl],
    },
    other: {
      "geo.region": "TH-10",
      "geo.placename": "Bangkok",
    },
  };
}
