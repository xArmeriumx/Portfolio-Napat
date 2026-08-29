import type { Metadata } from "next";
import ProjectList from "@/views/ProjectList.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getProjectsCollectionSchema, getProjectsListSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile, toPresentationProject } from "@/content/presentation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const repository = await getContentRepository();
  const profile = toPresentationProfile(await repository.getPublishedProfile());
  const listSeo = getProjectsListSeoMeta(profile);

  return buildPageMetadata({
    title: listSeo.title,
    description: listSeo.description,
    ogTitle: listSeo.title,
    ogDescription: listSeo.description,
    ogImage: listSeo.ogImage,
    ogImageAlt: listSeo.ogImageAlt,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    path: listSeo.path,
    keywords: listSeo.keywords,
  });
}

export default async function ProjectsPage() {
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
        )}
      />
      <ProjectList projects={projects} />
    </>
  );
}
