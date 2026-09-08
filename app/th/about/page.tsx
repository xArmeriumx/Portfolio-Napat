import type { Metadata } from "next";
import { metadataAboutPage, renderAboutPage } from "../../(site)/about/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return metadataAboutPage("th");
}

export default async function ThaiAboutPage() {
  return renderAboutPage("th");
}
