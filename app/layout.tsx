import type { Metadata, Viewport } from "next";
import { Prompt, Space_Grotesk, Space_Mono } from "next/font/google";
import AppShell from "@/components/layout/AppShell.jsx";
import { SEO_DEFAULTS, SITE_NAME, SITE_URL } from "@/config/seo.js";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SEO_DEFAULTS.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO_DEFAULTS.description,
  authors: [{ name: "Napat Pamornsut", url: SITE_URL }],
  creator: "Napat Pamornsut",
  publisher: SITE_NAME,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    locale: SEO_DEFAULTS.locale,
    alternateLocale: [SEO_DEFAULTS.alternateLocale],
    images: [
      {
        url: SEO_DEFAULTS.ogImage,
        width: 512,
        height: 512,
        alt: "Napat Pamornsut Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    images: [SEO_DEFAULTS.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  other: {
    "geo.region": "TH-10",
    "geo.placename": "Bangkok",
  },
};

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
