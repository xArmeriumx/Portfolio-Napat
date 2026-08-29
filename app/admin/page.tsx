import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/server/auth-guard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const admin = await requireAdminPage();
  return (
    <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32 md:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Portfolio CMS</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900">Backoffice</h1>
        <p className="mt-3 text-gray-500">Signed in as {admin.user.email}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Link href="/admin/profile" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c43c3c]/40">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">01</span>
            <h2 className="mt-4 text-xl font-black text-gray-900">Profile</h2>
            <p className="mt-2 text-sm text-gray-500">Identity, biography, links, education and skills</p>
          </Link>
          <Link href="/admin/projects" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c43c3c]/40">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">02</span>
            <h2 className="mt-4 text-xl font-black text-gray-900">Projects</h2>
            <p className="mt-2 text-sm text-gray-500">Draft, Preview, Publish, order และ archive</p>
          </Link>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">03</span>
            <h2 className="mt-4 text-xl font-black text-gray-500">Notes & Media</h2>
            <p className="mt-2 text-sm text-gray-400">กำลังเชื่อมต่อ lifecycle ใน ticket #8–#9</p>
          </div>
        </div>
        <form action="/api/auth/sign-out" method="post" className="mt-8">
          <button type="submit" className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 hover:border-gray-900">Sign out</button>
        </form>
      </div>
    </section>
  );
}
