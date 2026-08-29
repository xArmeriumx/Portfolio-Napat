import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-32">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Portfolio CMS</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">Admin sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">เข้าสู่ระบบเพื่อจัดการ Draft, Preview และ Published Content</p>
        <AdminLoginForm />
      </div>
    </section>
  );
}
