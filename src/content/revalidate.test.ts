import { expect, it, vi } from "vitest";
const { revalidatePath, revalidateTag } = vi.hoisted(() => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));
import { revalidatePublishedContent } from "./revalidate";
it("invalidates both locale trees including related pages and sitemap", () => {
  revalidatePublishedContent();
  expect(revalidateTag).toHaveBeenCalledWith("portfolio-published-content", { expire: 0 });
  expect(revalidatePath.mock.calls).toEqual([["/", "layout"], ["/th", "layout"], ["/sitemap.xml"]]);
});
