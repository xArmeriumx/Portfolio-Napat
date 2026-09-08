// Read the published CMS snapshot at runtime, never deploy build-time fixture content.
export const dynamic = "force-dynamic";

import type { Metadata, Viewport } from "next";
import AppShell from "@/components/layout/AppShell.jsx";
import { getSiteSeoDefaults, getRealContentImage, normalizeMetaDescription, SITE_NAME, SITE_URL } from "@/config/seo.js";
import { buildOgImageUrl } from "@/lib/metadata";
import { fontVariables } from "@/lib/fonts";
import { getContentRepository } from "@/content/repository";
import { getNoteLocales, getProjectLocales, toPresentationProfile } from "@/content/presentation";
import "@/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const seo = getSiteSeoDefaults(profile, "th");
  const ogImage = getRealContentImage(seo.ogImage)
    || buildOgImageUrl("site", seo.title, profile.headline_th);

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
      url: `${SITE_URL}/th`,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      locale: "th_TH",
      alternateLocale: ["en_US"],
      images: [{ url: ogImage, ...(getRealContentImage(seo.ogImage) ? {} : { width: 1200, height: 630 }), alt: `${profile.name} พอร์ตโฟลิโอ` }],
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

export default async function ThaiLocaleLayout({ children }: { children: React.ReactNode }) {
  const repository = await getContentRepository();
  const [notes, projects] = await Promise.all([repository.listPublishedNotes(), repository.listPublishedProjects()]);
  const pageLocales = Object.fromEntries([
    ...notes.map(note => [`/notes/${note.slug}`, getNoteLocales(note)]),
    ...projects.map(project => [`/projects/${project.slug}`, getProjectLocales(project)]),
  ]);
  return (
    <html lang="th" className={fontVariables}>
      <body>
        <AppShell locale="th" pageLocales={pageLocales}>{children}</AppShell>
      </body>
    </html>
  );
}
