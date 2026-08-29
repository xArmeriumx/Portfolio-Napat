import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/utils/JsonLd";
import { getNotesCollectionSchema, getNoteDescription } from "@/lib/notes";
import { buildPageMetadata } from "@/lib/metadata";
import { getContentRepository } from "@/content/repository";
import { toPresentationNote, toPresentationProfile } from "@/content/presentation";

const notesKeywords = [
  "Napatdev developer notes",
  "Napat Pamornsut notes",
  "ณภัทร ภมรสูตร โน้ตความรู้",
  "Next.js cheatsheet",
  "TypeScript reference",
  "SQL examples",
];

export const metadata: Metadata = buildPageMetadata({
  title: "Developer Notes by Napat Pamornsut | Napatdev",
  description:
    "Developer notes and technical cheatsheets by Napat Pamornsut (ณภัทร ภมรสูตร), covering Next.js, TypeScript, SQL, software development, and practical web engineering.",
  ogTitle: "Developer Notes | Napatdev",
  ogDescription: "Technical notes and practical cheatsheets by Napat Pamornsut / ณภัทร ภมรสูตร.",
  path: "/notes",
  keywords: notesKeywords,
});

export default async function NotesIndexPage() {
  const repository = await getContentRepository();
  const [rawProfile, rawNotes] = await Promise.all([
    repository.getPublishedProfile(),
    repository.listPublishedNotes(),
  ]);
  const profile = toPresentationProfile(rawProfile);
  const notes = rawNotes.map(toPresentationNote);

  return (
    <>
      <JsonLd data={getNotesCollectionSchema(notes, profile)} />
      <section className="relative min-h-screen overflow-hidden bg-[#f9fafb] px-4 pb-24 pt-28 md:px-6 md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(circle_at_top,black_20%,transparent_72%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">Knowledge / ความรู้</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">Developer Notes</h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
            Practical references and lessons from Napat Pamornsut, also known as ณภัทร ภมรสูตร / Napatdev.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {notes.map((note, index) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:border-[#c43c3c]/30 hover:shadow-[0_16px_35px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[#c43c3c]">Read note</span>
                </div>
                <h2 className="mt-7 text-xl font-black leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-[#c43c3c]">{note.name}</h2>
                <p className="mt-3 line-clamp-3 text-sm font-medium leading-relaxed text-gray-500">{getNoteDescription(note)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
