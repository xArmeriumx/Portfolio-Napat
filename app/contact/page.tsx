import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/utils/JsonLd";
import { profile } from "@/data/profile.js";
import { PERSON_ID, SITE_URL, WEBSITE_ID, absoluteUrl, getContactSeoMeta, getCoreSiteSchemas } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";

const contactSeo = getContactSeoMeta();

export const metadata: Metadata = buildPageMetadata({
  title: contactSeo.title,
  description: contactSeo.description,
  ogTitle: contactSeo.title,
  ogDescription: contactSeo.description,
  ogImage: contactSeo.ogImage,
  ogImageAlt: contactSeo.ogImageAlt,
  ogImageWidth: 512,
  ogImageHeight: 512,
  path: contactSeo.path,
  keywords: contactSeo.keywords,
});

export default function ContactPage() {
  const contactUrl = absoluteUrl("/contact");
  const emailHref = `mailto:${profile.links.email}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            ...getCoreSiteSchemas(),
            {
              "@type": "ContactPage",
              "@id": `${contactUrl}#contactpage`,
              url: contactUrl,
              name: `Contact / ติดต่อ — ${profile.name}`,
              alternateName: ["Contact", "ติดต่อ", `ติดต่อ ${profile.name}`],
              description: contactSeo.description,
              inLanguage: ["en", "th"],
              isPartOf: { "@id": WEBSITE_ID },
              about: { "@id": PERSON_ID },
              mainEntity: {
                "@type": "ContactPoint",
                contactType: "professional inquiries",
                email: profile.links.email,
                areaServed: "TH",
                availableLanguage: ["English", "Thai"],
              },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${contactUrl}#breadcrumb`,
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home / หน้าแรก", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Contact / ติดต่อ", item: contactUrl },
              ],
            },
          ],
        }}
      />
      <section className="relative min-h-screen overflow-hidden bg-[#f9fafb] px-4 pb-24 pt-28 md:px-6 md:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.14,
              maskImage: "radial-gradient(circle at top center, black 25%, transparent 75%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c43c3c]">
            Contact
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
            Contact {profile.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
            For web development, QA, automation testing, and software project inquiries.
            ติดต่อสำหรับงานพัฒนาเว็บ QA งานทดสอบอัตโนมัติ และโปรเจคซอฟต์แวร์
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <a
              href={emailHref}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#c43c3c]/30 hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)]"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Email</span>
              <span className="mt-3 block break-words text-lg font-black text-gray-900">
                {profile.links.email}
              </span>
            </a>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Location</span>
              <span className="mt-3 block text-lg font-black text-gray-900">
                {profile.contact.location}
              </span>
            </div>

            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#c43c3c]/30 hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)]"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">GitHub</span>
              <span className="mt-3 block break-words text-lg font-black text-gray-900">
                xArmeriumx
              </span>
            </a>

            <Link
              href="/projects"
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#c43c3c]/30 hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)]"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Portfolio</span>
              <span className="mt-3 block text-lg font-black text-gray-900">
                View Projects
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
