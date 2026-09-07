import type { Metadata } from "next";
import { metadataNotesPage, renderNotesPage } from "../../(site)/notes/page";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  return metadataNotesPage("th");
}

export default async function ThaiNotesIndexPage() {
  return renderNotesPage("th");
}
