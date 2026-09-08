import { unstable_cache } from "next/cache";
import type { ContentRepository } from "./repository";

export const PUBLISHED_CONTENT_TAG = "portfolio-published-content";
export function cachePublishedRepository(repository: ContentRepository): ContentRepository {
  const options = { revalidate: 3600, tags: [PUBLISHED_CONTENT_TAG] };
  return {
    getPublishedProfile: unstable_cache(() => repository.getPublishedProfile(), [PUBLISHED_CONTENT_TAG, "profile"], options),
    listPublishedProjects: unstable_cache(() => repository.listPublishedProjects(), [PUBLISHED_CONTENT_TAG, "projects"], options),
    getPublishedProjectBySlug: unstable_cache((slug: string) => repository.getPublishedProjectBySlug(slug), [PUBLISHED_CONTENT_TAG, "project"], options),
    listPublishedNotes: unstable_cache(() => repository.listPublishedNotes(), [PUBLISHED_CONTENT_TAG, "notes"], options),
    getPublishedNoteBySlug: unstable_cache((slug: string) => repository.getPublishedNoteBySlug(slug), [PUBLISHED_CONTENT_TAG, "note"], options),
    getPublishedSlugRedirect: unstable_cache((type: "NOTE" | "PROJECT", slug: string) => repository.getPublishedSlugRedirect(type, slug), [PUBLISHED_CONTENT_TAG, "redirect"], options),
  };
}
