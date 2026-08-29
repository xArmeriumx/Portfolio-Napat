import type { Metadata } from "next";
import Link from "next/link";
import { listAdminContent } from "@/content/admin-service";
import { prisma } from "@/server/db";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage Projects", robots: { index: false, follow: false } };

export default async function AdminProjectsPage() {
  await requireAdminPage();
  const projects = await listAdminContent(prisma, "PROJECT");
  return <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32 md:px-6"><div className="mx-auto max-w-5xl"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Projects / Content</p><h1 className="mt-3 text-4xl font-black text-gray-900">Projects</h1></div><Link href="/admin/projects/new" className="rounded-full bg-[#c43c3c] px-5 py-3 text-sm font-black text-white">New project</Link></div><div className="mt-8 space-y-3">{projects.map((project) => <Link key={project.id} href={`/admin/projects/${project.id}`} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#c43c3c]/40 md:flex-row md:items-center md:justify-between"><div><h2 className="font-black text-gray-900">{project.slug || project.id}</h2><p className="mt-1 text-xs text-gray-500">{project.status} · order {project.displayOrder} · {project.draftRevisionId ? "Draft ready" : "No draft"}</p></div><span className="text-sm font-bold text-[#c43c3c]">Edit →</span></Link>)}{projects.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">ยังไม่มี Project</p>}</div></div></section>;
}
