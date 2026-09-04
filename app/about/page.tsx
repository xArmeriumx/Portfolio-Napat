import type { Metadata } from "next";
import About from "@/views/About.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getAboutPageSchema, getAboutSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile } from "@/content/presentation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const aboutSeo = getAboutSeoMeta(profile);

  return buildPageMetadata({
    title: aboutSeo.title,
    description: aboutSeo.description,
    ogTitle: aboutSeo.title,
    ogDescription: aboutSeo.description,
    ogImage: aboutSeo.ogImage,
    ogImageAlt: aboutSeo.ogImageAlt,
    path: aboutSeo.path,
    keywords: aboutSeo.keywords,
  });
}

export default async function AboutPage() {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());

  return (
    <>
      <JsonLd data={getAboutPageSchema(profile)} />
      <About profile={profile} />
    </>
  );
}
