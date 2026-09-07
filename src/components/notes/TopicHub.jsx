import Link from "next/link";

export default function TopicHub({ topic, notes, locale = "en" }) {
  const localePrefix = locale === "th" ? "/th" : "";
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f9fafb] px-4 pb-24 pt-28 md:px-6 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 [mask-image:radial-gradient(circle_at_top,black_20%,transparent_72%)]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c43c3c]">
          Topic / หัวข้อ — {topic.label}
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
          {topic.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
          {topic.description}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {notes.map((note, index) => (
            <Link
              key={note.slug}
              href={`${localePrefix}/notes/${note.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:border-[#c43c3c]/30 hover:shadow-[0_16px_35px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[#c43c3c]">Read note</span>
              </div>
              <h2 className="mt-7 text-xl font-black leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-[#c43c3c]">
                {note.displayTitle}
              </h2>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={`${localePrefix}/notes`}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[#c43c3c]"
          >
            ← All developer notes
          </Link>
        </div>
      </div>
    </section>
  );
}
