import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProjectDetail from "@/views/ProjectDetail.jsx";
import JsonLd from "@/components/utils/JsonLd";
import { getProjectSchema, getProjectSeoMeta } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getRelatedNotes } from "@/lib/related";
import type { SiteLocale } from "../../page";
import { getContentRepository } from "@/content/repository";
import { getProjectLocales, toPresentationNote, toPresentationProfile, toPresentationProject } from "@/content/presentation";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const repository = await getContentRepository();
  const projects = await repository.listPublishedProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

function getLocalizedContent(locale: SiteLocale) {
  return (project: Record<string, unknown>, field: string) => {
    if (locale === "th") return project[`${field}_th`] || project[field] || "";
    return project[field] || "";
  };
}

export async function metadataProjectPage(slug: string, locale: SiteLocale = "en"): Promise<Metadata> {
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
      path: `${locale === "th" ? "/th" : ""}/projects/${slug}`,
      noindex: true,
      locale,
    });
  }

  const profile = toPresentationProfile(rawProfile);
  const projectSeo = getProjectSeoMeta(project, getLocalizedContent(locale), profile, locale);

  return buildPageMetadata({
    availableLocales: getProjectLocales(rawProject),
    title: projectSeo.title,
    description: projectSeo.description,
    ogTitle: projectSeo.ogTitle,
    ogDescription: projectSeo.ogDescription,
    ogImage: projectSeo.ogImage,
    ogImageAlt: projectSeo.ogImageAlt,
    ogType: "article",
    ogSection: "Portfolio Projects",
    ogKind: "project",
    ogSubtitle: locale === "th" ? profile.headline_th : profile.headline,
    publishedTime: project.publishedAt,
    modifiedTime: project.updatedAt || project.publishedAt,
    path: projectSeo.path,
    keywords: projectSeo.keywords,
    locale,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataProjectPage(slug, "en");
}

export async function renderProjectPage(slug: string, locale: SiteLocale = "en") {
  const repository = await getContentRepository();
  const [rawProfile, rawProject, rawNotes] = await Promise.all([
    repository.getPublishedProfile(),
    repository.getPublishedProjectBySlug(slug),
    repository.listPublishedNotes(),
  ]);

  if (!rawProject) {
    const redirectedSlug = await repository.getPublishedSlugRedirect("PROJECT", slug);
    if (redirectedSlug) {
      const base = locale === "th" ? "/th/projects" : "/projects";
      permanentRedirect(`${base}/${encodeURIComponent(redirectedSlug)}`);
    }
    notFound();
  }

  const profile = toPresentationProfile(rawProfile);
  const project = toPresentationProject(rawProject);
  const relatedNotes = getRelatedNotes(project, rawNotes.map((note) => toPresentationNote(note, locale)));

  const title = getLocalizedContent(locale)(project, "title");
  const description = getLocalizedContent(locale)(project, "description");
  const projectImages = project.images;

  return (
    <>
      {getProjectLocales(rawProject).includes(locale) && <JsonLd
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
          seo: project.seo,
          profile,
          locale,
        })}
      />}
      <ProjectDetail slug={slug} project={project} relatedNotes={relatedNotes} locale={locale} />
    </>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  return renderProjectPage(slug, "en");
}
