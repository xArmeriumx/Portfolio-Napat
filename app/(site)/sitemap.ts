// Read the published CMS snapshot at runtime, never deploy build-time fixture content.
export const dynamic = "force-dynamic";

import { getContentRepository } from "@/content/repository";
import { buildSitemap } from "@/lib/sitemap";

export const revalidate = 3600;
export default async function sitemap() {
  return buildSitemap(await getContentRepository());
}
