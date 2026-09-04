import type { Metadata } from "next";
import {
  SEO_DEFAULTS,
  SITE_NAME,
  absoluteUrl,
  normalizeMetaDescription,
  toAbsoluteImageUrl,
} from "@/config/seo.js";

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

type SeoInput = {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  ogSection?: string;
  ogKind?: string;
  ogSubtitle?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  path?: string;
  noindex?: boolean;
  locale?: string;
  alternateLocale?: string;
  keywords?: string[];
};

export function buildOgImageUrl(kind = "site", title = "", subtitle = "") {
  const params = new URLSearchParams();
  params.set("kind", kind);
  if (title) params.set("title", title);
  if (subtitle) params.set("subtitle", subtitle);
  return `/api/og?${params.toString()}`;
}

function isRealContentImage(image?: string) {
  if (!image) return false;
  return image !== SEO_DEFAULTS.ogImage && image !== "/favicon.png";
}

type ResolvedOgImage = {
  url: string;
  width: number;
  height: number;
};

function resolveOgImage({
  ogImage,
  kind,
  title,
  subtitle,
  width,
  height,
}: {
  ogImage?: string;
  kind: string;
  title: string;
  subtitle?: string;
  width?: number;
  height?: number;
}): ResolvedOgImage {
  if (isRealContentImage(ogImage)) {
    return {
      url: toAbsoluteImageUrl(ogImage),
      width: width || OG_IMAGE_WIDTH,
      height: height || OG_IMAGE_HEIGHT,
    };
  }
  return {
    url: buildOgImageUrl(kind, title, subtitle),
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
  };
}

export function buildPageMetadata({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  ogSection,
  ogKind,
  ogSubtitle,
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  path = "",
  noindex,
  locale = SEO_DEFAULTS.locale,
  alternateLocale = SEO_DEFAULTS.alternateLocale,
  keywords = SEO_DEFAULTS.keywords,
}: SeoInput): Metadata {
  const canonical = absoluteUrl(path);
  const pageDescription = normalizeMetaDescription(description, 160);
  const effectiveTitle = ogTitle || title;
  const effectiveDescription = normalizeMetaDescription(
    ogDescription || description,
    ogType === "article" ? 200 : 160,
  );
  const kind = ogKind || path.split("/").filter(Boolean)[0] || "site";
  const image = resolveOgImage({
    ogImage,
    kind,
    title: effectiveTitle,
    subtitle: ogSubtitle,
    width: ogImageWidth,
    height: ogImageHeight,
  });

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
        url: image.url,
        width: image.width,
        height: image.height,
        alt: ogImageAlt || `${effectiveTitle} - Napat Pamornsut Portfolio`,
      },
    ],
  };

  if (ogType === "article") {
    openGraph.authors = ["Napat Pamornsut"];
    openGraph.section = ogSection || "Portfolio";
  }

  return {
    title,
    description: pageDescription,
    authors: [{ name: "Napat Pamornsut", url: absoluteUrl("/") }],
    creator: "Napat Pamornsut",
    publisher: SITE_NAME,
    category: "Portfolio",
    keywords,
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
      images: [image.url],
    },
    other: {
      "geo.region": "TH-10",
      "geo.placename": "Bangkok",
    },
  };
}
