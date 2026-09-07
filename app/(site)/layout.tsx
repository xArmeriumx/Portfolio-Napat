import type { Metadata, Viewport } from "next";
import AppShell from "@/components/layout/AppShell.jsx";
import { getSiteSeoDefaults, getRealContentImage, normalizeMetaDescription, SITE_NAME, SITE_URL } from "@/config/seo.js";
import { buildOgImageUrl } from "@/lib/metadata";
import { fontVariables } from "@/lib/fonts";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile } from "@/content/presentation";
import "@/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const seo = getSiteSeoDefaults(profile, "en");
  const ogImage = getRealContentImage(seo.ogImage)
    || buildOgImageUrl("site", seo.title, profile.headline);

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: seo.title, template: `%s | ${SITE_NAME}` },
    description: normalizeMetaDescription(seo.description, 160),
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    publisher: SITE_NAME,
    manifest: "/manifest.json",
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      locale: seo.locale,
      alternateLocale: [seo.alternateLocale],
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${profile.name} Portfolio` }],
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description, images: [ogImage] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    other: { "geo.region": "TH-10", "geo.placename": "Bangkok" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
};

export default function SiteLocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <AppShell locale="en">{children}</AppShell>
      </body>
    </html>
  );
}
