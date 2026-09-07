import type { Metadata } from "next";
import { metadataSearchPage, renderSearchPage } from "../../(site)/search/page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return metadataSearchPage("th", searchParams);
}

export default async function ThaiSearchPage({ searchParams }: Props) {
  return renderSearchPage("th", searchParams);
}
