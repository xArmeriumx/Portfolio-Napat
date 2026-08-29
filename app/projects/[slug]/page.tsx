import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProjectDetail from "@/views/ProjectDetail.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getProjectSchema, getProjectSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationProfile, toPresentationProject } from "@/content/presentation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

function getEnglishContent(project: Record<string, unknown>, field: string) {
  return project[field] || "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const repository = await getContentRepository();
  const rawProfile = await repository.getPublishedProfile();
  let rawProject = await repository.getPublishedProjectBySlug(slug);
  if (!rawProject) {
    const redirectedSlug = await repository.getPublishedSlugRedirect("PROJECT", slug);
    if (redirectedSlug) rawProject = await repository.getPublishedProjectBySlug(redirectedSlug);
  }
  const project = rawProject ? toPresentationProject(rawProject) : null;

  if (!project) {
    return buildPageMetadata({
      title: "Project Not Found",
      description: "Project details",
      path: `/projects/${slug}`,
      noindex: true,
    });
  }

  const projectSeo = getProjectSeoMeta(project, getEnglishContent, toPresentationProfile(rawProfile));

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
  const repository = await getContentRepository();
  const [rawProfile, rawProject] = await Promise.all([
    repository.getPublishedProfile(),
    repository.getPublishedProjectBySlug(slug),
  ]);

  if (!rawProject) {
    const redirectedSlug = await repository.getPublishedSlugRedirect("PROJECT", slug);
    if (redirectedSlug) redirect(`/projects/${encodeURIComponent(redirectedSlug)}`);
    notFound();
  }

  const profile = toPresentationProfile(rawProfile);
  const project = toPresentationProject(rawProject);

  const title = project.title;
  const description = `${project.description} ${project.description_th || ""}`;
  const projectImages = project.images;

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
          links: project.links || {},
          profile,
        })}
      />
      <ProjectDetail slug={slug} project={project} />
    </>
  );
}
