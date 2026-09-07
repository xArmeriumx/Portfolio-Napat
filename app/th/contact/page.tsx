import type { Metadata } from "next";
import { metadataContactPage, renderContactPage } from "../../(site)/contact/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return metadataContactPage("th");
}

export default async function ThaiContactPage() {
  return renderContactPage("th");
}
