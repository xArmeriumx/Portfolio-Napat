import type { Metadata } from "next";
import ProjectList from "@/views/ProjectList.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getProjectsCollectionSchema, getProjectsListSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import type { SiteLocale } from "../page";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile, toPresentationProject } from "@/content/presentation";

export const revalidate = 1800;

export async function metadataProjectsPage(locale: SiteLocale = "en"): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const listSeo = getProjectsListSeoMeta(profile, locale);

  return buildPageMetadata({
    title: listSeo.title,
    description: listSeo.description,
    ogTitle: listSeo.title,
    ogDescription: listSeo.description,
    ogImage: listSeo.ogImage,
    ogImageAlt: listSeo.ogImageAlt,
    path: listSeo.path,
    keywords: listSeo.keywords,
    locale,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return metadataProjectsPage("en");
}

export async function renderProjectsPage(locale: SiteLocale = "en") {
  const repository = await getContentRepository();
  const [rawProfile, rawProjects] = await Promise.all([
    repository.getPublishedProfile(),
    repository.listPublishedProjects(),
  ]);
  const profile = toPresentationProfile(rawProfile);
  const projects = rawProjects.map(toPresentationProject);

  return (
    <>
      <JsonLd
        data={getProjectsCollectionSchema(
          projects.map((project) => ({ slug: project.slug, name: project.title, name_th: project.title_th })),
          profile,
          locale,
        )}
      />
      <ProjectList projects={projects} locale={locale} />
    </>
  );
}

export default async function ProjectsPage() {
  return renderProjectsPage("en");
}
