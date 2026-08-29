import type { Metadata } from "next";
import ProjectEditor from "@/components/admin/ProjectEditor";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New Project", robots: { index: false, follow: false } };

const emptyProject = {
  slug: "new-project",
  title: { en: "", th: "" },
  description: { en: "", th: "" },
  role: [],
  technologies: [],
  keyFeatures: { en: [], th: [] },
  highlights: { en: [], th: [] },
  responsibilities: { en: [], th: [] },
  metrics: [],
  links: { demo: null, repo: null },
  featured: false,
  order: 0,
  media: [],
  seo: { title: null, description: null, image: null },
};

export default async function NewProjectPage() {
  await requireAdminPage();
  return <ProjectEditor initialPayload={emptyProject} />;
}
