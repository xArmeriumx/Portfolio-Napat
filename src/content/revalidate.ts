import { revalidatePath, revalidateTag } from "next/cache";

// Shared identity, navigation and related content appear throughout both trees.
// Layout invalidation includes old slugs and topic hubs, including cached 404s.
export function revalidatePublishedContent() {
  revalidateTag("portfolio-published-content", { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/th", "layout");
  revalidatePath("/sitemap.xml");
}
