import type { Metadata, Viewport } from "next";
import { Prompt, Space_Grotesk, Space_Mono } from "next/font/google";
import AppShell from "@/components/layout/AppShell.jsx";
import { getSiteSeoDefaults, getRealContentImage, SITE_NAME, SITE_URL } from "@/config/seo.js";
import { buildOgImageUrl } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile } from "@/content/presentation";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const prompt = Prompt({
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const seo = getSiteSeoDefaults(profile);
  const ogImage = getRealContentImage(seo.ogImage)
    || buildOgImageUrl("site", seo.title, profile.headline);

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: seo.title, template: `%s | ${SITE_NAME}` },
    description: seo.description,
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    publisher: SITE_NAME,
    manifest: "/manifest.json",
    alternates: { canonical: "/" },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${prompt.variable} ${spaceMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
