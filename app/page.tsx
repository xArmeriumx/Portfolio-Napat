import type { Metadata } from "next";
import Home from "@/views/Home.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getHomeGraphSchema, getSiteSeoDefaults } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile } from "@/content/presentation";

export async function generateMetadata(): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const seo = getSiteSeoDefaults(profile);

  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    path: "/",
  });
}

export default async function HomePage() {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());

  return (
    <>
      <JsonLd data={getHomeGraphSchema(profile)} />
      <Home profile={profile} />
    </>
  );
}
