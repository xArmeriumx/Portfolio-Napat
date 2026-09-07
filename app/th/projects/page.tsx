import type { Metadata } from "next";
import { metadataProjectsPage, renderProjectsPage } from "../../(site)/projects/page";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  return metadataProjectsPage("th");
}

export default async function ThaiProjectsPage() {
  return renderProjectsPage("th");
}
