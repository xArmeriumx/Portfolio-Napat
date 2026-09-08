import type { Metadata } from "next";
import About from "@/views/About.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getAboutPageSchema, getAboutSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import type { SiteLocale } from "../page";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile } from "@/content/presentation";

export const revalidate = 3600;

export async function metadataAboutPage(locale: SiteLocale = "en"): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const aboutSeo = getAboutSeoMeta(profile, locale);

  return buildPageMetadata({
    title: aboutSeo.title,
    description: aboutSeo.description,
    ogTitle: aboutSeo.title,
    ogDescription: aboutSeo.description,
    ogImage: aboutSeo.ogImage,
    ogImageAlt: aboutSeo.ogImageAlt,
    path: aboutSeo.path,
    keywords: aboutSeo.keywords,
    locale,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return metadataAboutPage("en");
}

export async function renderAboutPage(locale: SiteLocale = "en") {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());

  return (
    <>
      <JsonLd data={getAboutPageSchema(profile, locale)} />
      <About profile={profile} />
    </>
  );
}

export default async function AboutPage() {
  return renderAboutPage();
}
