import type { Metadata } from "next";
import Link from "next/link";
import { listAdminContent } from "@/content/admin-service";
import { prisma } from "@/server/db";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage Notes", robots: { index: false, follow: false } };

export default async function AdminNotesPage() {
  await requireAdminPage();
  const notes = await listAdminContent(prisma, "NOTE");
  return <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32 md:px-6"><div className="mx-auto max-w-5xl"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Notes / Content</p><h1 className="mt-3 text-4xl font-black text-gray-900">Developer Notes</h1></div><Link href="/admin/notes/new" className="rounded-full bg-[#c43c3c] px-5 py-3 text-sm font-black text-white">New note</Link></div><div className="mt-8 space-y-3">{notes.map((note) => <Link key={note.id} href={`/admin/notes/${note.id}`} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#c43c3c]/40 md:flex-row md:items-center md:justify-between"><div><h2 className="font-black text-gray-900">{note.slug || note.id}</h2><p className="mt-1 text-xs text-gray-500">{note.status} · order {note.displayOrder} · {note.draftRevisionId ? "Draft ready" : "No draft"}</p></div><span className="text-sm font-bold text-[#c43c3c]">Edit →</span></Link>)}{notes.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">ยังไม่มี Note</p>}</div></div></section>;
}
