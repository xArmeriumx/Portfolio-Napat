import type { Metadata } from "next";
import { metadataHomePage, renderHomePage } from "../(site)/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return metadataHomePage("th");
}

export default async function ThaiHomePage() {
  return renderHomePage("th");
}
