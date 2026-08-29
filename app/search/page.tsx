import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/utils/JsonLd";
import { NAVIGATION_ITEMS, absoluteUrl, getCoreSiteSchemas, getSearchSeoMeta, SITE_URL, WEBSITE_ID } from "@/config/seo.js";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationNote, toPresentationProfile, toPresentationProject } from "@/content/presentation";

type Props = {
  searchParams?: Promise<{ q?: string }>;
};

const corePages = NAVIGATION_ITEMS.map((item) => ({
  title: `${item.name} / ${item.name_th}`,
  titleEn: item.name,
  titleTh: item.name_th,
  href: item.href,
  description: `${item.description} ${item.description_th}`,
  searchText: item.searchTerms.join(" "),
}));

const searchSeo = getSearchSeoMeta();

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const hasQuery = Boolean(params?.q?.trim());

  return buildPageMetadata({
    title: searchSeo.title,
    description: searchSeo.description,
    path: searchSeo.path,
    keywords: searchSeo.keywords,
    noindex: hasQuery,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() || "";
  const repository = await getContentRepository();
  const [rawProfile, rawProjects, rawNotes] = await Promise.all([
    repository.getPublishedProfile(),
    repository.listPublishedProjects(),
    repository.listPublishedNotes(),
  ]);
  const profile = toPresentationProfile(rawProfile);
  const notes = rawNotes.map(toPresentationNote);
  const projects = rawProjects.map(toPresentationProject);
  const noteLinks = notes.map((note) => ({
    title: note.name,
    titleEn: note.name,
    titleTh: `โน้ต ${note.name}`,
    href: `/notes/${note.id}`,
    description: `Developer note and cheatsheet: ${note.name}. โน้ตความรู้และชีทสรุปเรื่อง ${note.name}`,
    searchText: `${note.name} Developer Notes Cheatsheet โน้ต คู่มือ ชีทสรุป`,
  }));
  const projectLinks = projects.map((project) => ({
    title: project.title_th ? `${project.title} / ${project.title_th}` : project.title,
    titleEn: project.title,
    titleTh: project.title_th || project.title,
    href: `/projects/${project.slug}`,
    description: `${project.description?.replace(/\s+/g, " ").trim() || "Portfolio project."} ${project.description_th?.replace(/\s+/g, " ").trim() || ""}`,
    searchText: [project.title, project.title_th, ...(project.technologies || []), "โปรเจค", "ผลงาน"].filter(Boolean).join(" "),
  }));
  const items = [...corePages, ...projectLinks, ...noteLinks];
  const filteredItems = query
    ? items.filter((item) => `${item.title} ${item.description} ${item.searchText}`.toLowerCase().includes(query))
    : items;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            ...getCoreSiteSchemas(profile),
            {
              "@type": "SearchResultsPage",
              "@id": `${SITE_URL}/search#search`,
              url: absoluteUrl(query ? `/search?q=${encodeURIComponent(query)}` : "/search"),
              name: "Napatdev Search",
              alternateName: ["Search Napatdev", "ค้นหา Napatdev", "สารบัญเว็บไซต์ Napatdev"],
              description: searchSeo.description,
              inLanguage: ["en", "th"],
              isPartOf: { "@id": WEBSITE_ID },
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: filteredItems.length,
                itemListElement: filteredItems.map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: item.title,
                  alternateName: [item.titleEn, item.titleTh],
                  url: absoluteUrl(item.href),
                })),
              },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
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

        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c43c3c]">
            Search Index / สารบัญเว็บไซต์
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
            Search Napatdev / ค้นหา Napatdev
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
            A crawlable index for search engines and visitors covering About Me / เกี่ยวกับฉัน,
            Contact / ติดต่อ, Projects / โปรเจค, project case studies, and developer notes / โน้ตความรู้.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#c43c3c]/30 hover:shadow-[0_14px_32px_rgba(0,0,0,0.08)]"
              >
                <h2 className="text-lg font-black text-gray-900 transition-colors group-hover:text-[#c43c3c]">
                  {item.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
