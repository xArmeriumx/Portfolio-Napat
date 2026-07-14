import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/views/ProjectDetail.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { projects } from "@/data/projects.js";
import { getProjectSchema, getProjectSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

function getEnglishContent(project: Record<string, unknown>, field: string) {
  return project[field] || "";
}

function getProject(slug: string) {
  return projects.find((project) => project.slug === slug) || null;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return buildPageMetadata({
      title: "Project Not Found",
      description: "Project details",
      path: `/projects/${slug}`,
      noindex: true,
    });
  }

  const projectSeo = getProjectSeoMeta(project, getEnglishContent);

  return buildPageMetadata({
    title: projectSeo.title,
    description: projectSeo.description,
    ogTitle: projectSeo.ogTitle,
    ogDescription: projectSeo.ogDescription,
    ogImage: projectSeo.ogImage,
    ogImageAlt: projectSeo.ogImageAlt,
    ogImageWidth: projectSeo.ogImageWidth,
    ogImageHeight: projectSeo.ogImageHeight,
    ogType: "article",
    path: projectSeo.path,
    keywords: projectSeo.keywords,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const title = project.title;
  const description = `${project.description} ${project.description_th || ""}`;
  const projectImages = project.images || [project.image];

  return (
    <>
      <JsonLd
        data={getProjectSchema({
          slug,
          title,
          titleTh: project.title_th,
          description,
          image: projectImages?.[0],
          technologies: project.technologies || [],
          keyFeatures: project.keyFeatures || [],
          role: project.role || [],
          stack: project.stack,
          links: project.links || {},
        })}
      />
      <ProjectDetail slug={slug} />
    </>
  );
}
