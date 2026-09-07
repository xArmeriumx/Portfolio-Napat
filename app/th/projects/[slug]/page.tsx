import type { Metadata } from "next";
import { metadataProjectPage, renderProjectPage } from "../../../(site)/projects/[slug]/page";
import { getContentRepository } from "@/content/repository";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataProjectPage(slug, "th");
}

export default async function ThaiProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  return renderProjectPage(slug, "th");
}
