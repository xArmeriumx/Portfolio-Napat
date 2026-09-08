import type { Metadata } from "next";
import Home from "@/views/Home.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getHomeGraphSchema, getSiteSeoDefaults } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile } from "@/content/presentation";

export const revalidate = 3600;

export type SiteLocale = "en" | "th";

export async function metadataHomePage(locale: SiteLocale = "en"): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const seo = getSiteSeoDefaults(profile, locale);

  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    ogSubtitle: locale === "th" ? profile.headline_th : profile.headline,
    path: locale === "th" ? "/th" : "/",
    locale,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return metadataHomePage("en");
}

export async function renderHomePage(locale: SiteLocale = "en") {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());

  return (
    <>
      <JsonLd data={getHomeGraphSchema(profile, locale)} />
      <Home profile={profile} locale={locale} />
    </>
  );
}

export default async function HomePage() {
  return renderHomePage("en");
}
