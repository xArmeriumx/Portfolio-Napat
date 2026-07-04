import type { Metadata } from "next";
import ProjectList from "@/views/ProjectList.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { projects } from "@/data/projects.js";
import { getProjectsCollectionSchema, getProjectsListSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";

const listSeo = getProjectsListSeoMeta();

export const metadata: Metadata = buildPageMetadata({
  title: listSeo.title,
  description: listSeo.description,
  ogTitle: listSeo.title,
  ogDescription: listSeo.description,
  ogImage: listSeo.ogImage,
  ogImageAlt: listSeo.ogImageAlt,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  path: listSeo.path,
});

export default function ProjectsPage() {
  return (
    <>
      <JsonLd
        data={getProjectsCollectionSchema(
          projects.map((project) => ({ slug: project.slug, name: project.title, name_th: project.title_th })),
        )}
      />
      <ProjectList />
    </>
  );
}
