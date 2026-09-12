import type { Metadata } from "next";
import {
  SEO_DEFAULTS,
  SITE_NAME,
  absoluteUrl,
  getBrandedTitle,
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
  publishedTime?: string | null;
  modifiedTime?: string | null;
  locale?: "en" | "th";
  path?: string;
  noindex?: boolean;
  availableLocales?: Array<"en" | "th">;
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
  width?: number;
  height?: number;
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
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
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
  publishedTime,
  modifiedTime,
  path = "",
  noindex,
  availableLocales = ["en", "th"],
  locale = "en",
  keywords = SEO_DEFAULTS.keywords,
}: SeoInput): Metadata {
  noindex = noindex || !availableLocales.includes(locale);
  const isThai = locale === "th";
  // `path` may already carry the /th prefix (th helpers return prefixed
  // paths); normalize so en/th alternates are always a reciprocal pair.
  const basePath = path.replace(/^\/th(?=\/|$)/, "") || "/";
  const enUrl = absoluteUrl(basePath);
  const thUrl = absoluteUrl(`/th${basePath === "/" ? "" : basePath}`);
  const canonical = isThai ? thUrl : enUrl;
  const ogLocale = isThai ? "th_TH" : SEO_DEFAULTS.locale;
  const ogAlternateLocale = isThai ? SEO_DEFAULTS.locale : SEO_DEFAULTS.alternateLocale;
  const pageDescription = normalizeMetaDescription(description, 160);
  const brandedTitle = getBrandedTitle(title, locale);
  const effectiveTitle = getBrandedTitle(ogTitle || title, locale);
  const effectiveDescription = normalizeMetaDescription(
    ogDescription || description,
    ogType === "article" ? 200 : 160,
  );
  const kind = ogKind || basePath.split("/").filter(Boolean)[0] || "site";
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
    locale: ogLocale,
    alternateLocale: [ogAlternateLocale],
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
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
  }

  return {
    title: brandedTitle,
    description: pageDescription,
    authors: [{ name: "Napat Pamornsut", url: absoluteUrl("/") }],
    creator: "Napat Pamornsut",
    publisher: SITE_NAME,
    category: "Portfolio",
    keywords,
    alternates: noindex ? undefined : {
      canonical,
      languages: {
        ...(availableLocales.includes("en") ? { en: enUrl } : {}),
        ...(availableLocales.includes("th") ? { th: thUrl } : {}),
        "x-default": availableLocales.includes("en") ? enUrl : thUrl,
      },
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
            "max-snippet": -1,
            "max-video-preview": -1,
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
