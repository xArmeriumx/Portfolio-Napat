import { unstable_cache } from "next/cache";
import type { ContentRepository } from "./repository";

export const PUBLISHED_CONTENT_TAG = "portfolio-published-content";

export function getPublishedContentCacheVersion() {
  return (
    process.env.PORTFOLIO_CACHE_VERSION ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_URL ||
    process.env.GITHUB_SHA ||
    "local"
  );
}

export function cachePublishedRepository(repository: ContentRepository): ContentRepository {
  const version = getPublishedContentCacheVersion();
  const options = { revalidate: 300, tags: [PUBLISHED_CONTENT_TAG] };
  const key = (scope: string) => [PUBLISHED_CONTENT_TAG, version, scope];
  return {
    getPublishedProfile: unstable_cache(() => repository.getPublishedProfile(), key("profile"), options),
    listPublishedProjects: unstable_cache(() => repository.listPublishedProjects(), key("projects"), options),
    getPublishedProjectBySlug: unstable_cache((slug: string) => repository.getPublishedProjectBySlug(slug), key("project"), options),
    listPublishedNotes: unstable_cache(() => repository.listPublishedNotes(), key("notes"), options),
    getPublishedNoteBySlug: unstable_cache((slug: string) => repository.getPublishedNoteBySlug(slug), key("note"), options),
    getPublishedSlugRedirect: unstable_cache((type: "NOTE" | "PROJECT", slug: string) => repository.getPublishedSlugRedirect(type, slug), key("redirect"), options),
  };
}
