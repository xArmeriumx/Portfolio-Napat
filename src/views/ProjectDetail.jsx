"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslation } from "../context/LanguageContext.jsx";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import AnimatedText from "../components/ui/AnimatedText.jsx";

import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

// Lightbox is only needed after user interaction — split it out of the
// initial gallery bundle.
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  ssr: false,
});

/* ========================================
   ImageGallery Component
======================================== */
function ImageGallery({ images, title, locale }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const th = locale === "th";
  if (!images.length) return null;
  const slides = images.map((src, i) => ({ src, alt: `${title} — ${i + 1}` }));
  return (
    <figure aria-label={th ? "ภาพผลงาน" : "Project gallery"}>
      <button type="button" onClick={() => setOpen(true)} aria-label={th ? "ขยายภาพผลงาน" : "Expand project image"} className="relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-surface-muted">
        <Image src={images[index]} alt={`${title} — ${index + 1}`} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 1024px" className="object-contain p-3 md:p-6" />
      </button>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span aria-live="polite">{th ? "ภาพ" : "Image"} {index + 1} / {images.length}</span>
        <button type="button" onClick={() => setOpen(true)} className="min-h-11 px-2 font-semibold text-accent underline">{th ? "เปิดภาพขนาดใหญ่" : "View full size"}</button>
      </figcaption>
      {images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-3" aria-label={th ? "เลือกภาพ" : "Choose an image"}>
        {images.map((src, i) => <button type="button" key={`${src}-${i}`} aria-label={`${th ? "ดูภาพ" : "View image"} ${i + 1}`} aria-pressed={index === i} onClick={() => setIndex(i)} className={`relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-surface-muted border-2 ${index === i ? "border-accent" : "border-transparent hover:border-gray-300"}`}>
          <Image src={src} alt="" fill sizes="112px" className="object-contain p-1" />
        </button>)}
      </div>}
      {open && <Lightbox open close={() => setOpen(false)} index={index} slides={slides} plugins={[Zoom]} zoom={{ maxZoomPixelRatio: 3 }} on={{ view: ({ index: nextIndex }) => setIndex(nextIndex) }} controller={{ closeOnBackdropClick: true }} />}
    </figure>
  );
}

function SectionTitle({ title }) {
  return <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>;
}

function ListSection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-8">
      <SectionTitle title={title} />
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-gray-600 text-[15px] leading-relaxed font-medium"
          >
            <span className="mt-2 w-1.5 h-1.5 bg-gray-400 rounded-sm flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProjectDetail({ slug, project, relatedNotes = [], locale = "en" }) {
  const localePrefix = locale === "th" ? "/th" : "";
  const { getContent } = useTranslation();

  if (!project) {
    return (
      <>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          {/* 404 Number (Ghost) */}
          <h1
            className="font-sans text-[clamp(80px,12vw,160px)] font-bold text-gray-900 leading-none tracking-tighter opacity-10 select-none"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            NULL
          </h1>

          {/* Message Container */}
          <div className="-mt-6 md:-mt-10 relative z-10">
            <h2
              className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight font-sans"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Project Not Found
            </h2>

            <div className="font-mono text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
              <p>&gt; The requested project ID ({slug}) is invalid.</p>
              <p>&gt; Status: TERMINATED_OR_MISSING</p>
            </div>

            <Link
              href="/projects"
              className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-gray-200"
            >
              Return to Projects
            </Link>
          </div>
        </div>
      </>
    );
  }

  const title = getContent(project, "title");
  const description = getContent(project, "description");
  const role = project.role || [];
  const stack = project.stack;
  const technologies = project.technologies || [];
  const projectImages = (project.images?.length ? project.images : [project.image]).filter(Boolean);
  const links = project.links;

  const keyFeatures = getContent(project, "keyFeatures") || [];
  const highlights = getContent(project, "highlights") || [];
  const responsibilities = getContent(project, "responsibilities") || [];

  // Labels - Always English
  const labels = locale === "th" ? { overview: "ภาพรวม", role: "บทบาท", tech: "เทคโนโลยี", keyFeatures: "ความสามารถหลัก", highlights: "จุดเด่น", responsibilities: "หน้าที่รับผิดชอบ", links: "ลิงก์", repo: "ซอร์สโค้ด", demo: "ดูตัวอย่าง", back: "กลับ" } : {
    overview: "Overview",
    role: "Role",
    tech: "Technologies",
    keyFeatures: "Key Features",
    highlights: "Highlights",
    responsibilities: "Responsibilities",
    links: "Links",
    repo: "Repository",
    demo: "Demo",
    back: "← Back",
  };

  return (
    <>
      <PageTransition>
        <div className="relative min-h-screen bg-canvas overflow-hidden pt-28 md:pt-36 pb-32">
          {/* Dimensional Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.1,
                maskImage:
                  "radial-gradient(circle at top center, black 30%, transparent 100%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
            <ScrollReveal width="100%">
              {/* HEADER SECTION: Human/Editorial Vibe */}
              <div className="mb-12 md:mb-16">
                <Link
                  href={`${localePrefix}/projects`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-colors mb-8 group"
                >
                  <svg
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  {locale === "th" ? "กลับไปหน้าผลงาน" : "Back to Projects"}
                </Link>

                <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-8">
                  <AnimatedText>{title}</AnimatedText>
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  {role.map((r) => (
                    <span
                      key={r}
                      className="px-4 py-1.5 text-sm font-bold text-gray-900 bg-gray-100 rounded-full"
                    >
                      {r}
                    </span>
                  ))}
                  <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></div>
                  {stack && (
                    <span className="text-gray-500 font-medium text-lg">
                      {stack}
                    </span>
                  )}
                </div>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium max-w-3xl">
                  <AnimatedText>{description?.trim()}</AnimatedText>
                </p>
              </div>

              {/* HERO IMAGE GALLERY - Immersive & Clean */}
              <div className="mb-16 md:mb-24">
                <ImageGallery images={projectImages} title={title} locale={locale} />
              </div>

              {/* CONTENT NARRATIVE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Main Content (Left/Center) */}
                <div className="md:col-span-8 space-y-16">
                  {/* Key Features */}
                  {keyFeatures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-red-500"></span>
                        {labels.keyFeatures}
                      </h3>
                      <ul className="space-y-4">
                        {keyFeatures.map((item, index) => (
                          <ScrollReveal
                            key={index}
                            width="100%"
                            delay={index * 0.1}
                          >
                            <li className="flex items-start gap-4">
                              <span className="text-gray-300 font-serif text-2xl leading-none italic">
                                0{index + 1}
                              </span>
                              <span className="text-gray-700 font-medium text-lg leading-relaxed pt-1">
                                <AnimatedText>{item}</AnimatedText>
                              </span>
                            </li>
                          </ScrollReveal>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Highlights */}
                  {highlights.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-gray-900"></span>
                        {labels.highlights}
                      </h3>
                      <div className="bg-gray-50 rounded-2xl p-8">
                        <ul className="grid gap-4">
                          {highlights.map((item, index) => (
                            <ScrollReveal
                              key={index}
                              width="100%"
                              delay={index * 0.1}
                            >
                              <li className="flex items-start gap-3 text-gray-700 font-medium">
                                <svg
                                  className="w-5 h-5 text-gray-900 flex-shrink-0 mt-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>
                                  <AnimatedText>{item}</AnimatedText>
                                </span>
                              </li>
                            </ScrollReveal>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                {/* Sidebar Details (Right) */}
                <div className="md:col-span-4 space-y-10">
                  {/* Tech Stack */}
                  {technologies?.length > 0 && (
                    <ScrollReveal width="100%" delay={0.2}>
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                          {labels.tech}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {technologies.map((t) => (
                            <span
                              key={t}
                              className="px-3 py-1.5 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors cursor-default"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Responsibilities */}
                  {responsibilities.length > 0 && (
                    <ScrollReveal width="100%" delay={0.3}>
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                          {labels.responsibilities}
                        </h4>
                        <ul className="space-y-3">
                          {responsibilities.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-3 text-gray-600 text-sm font-medium leading-relaxed"
                            >
                              <span className="shrink-0 font-bold text-gray-900">
                                •
                              </span>
                              <AnimatedText>{item}</AnimatedText>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollReveal>
                  )}

                  {/* Links */}
                  <ScrollReveal width="100%" delay={0.4}>
                    <div className="pt-8 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                        Project Links
                      </h4>
                      <div className="flex flex-col gap-3">
                        {links.demo && (
                          <a
                            href={links.demo}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between w-full px-6 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                          >
                            <span>{labels.demo}</span>
                            <svg
                              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </a>
                        )}
                        {links.repo && (
                          <a
                            href={links.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between w-full px-6 py-4 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                          >
                            <span>Repository</span>
                            <svg
                              className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                  {/* Related notes — contextual internal links */}
                  {relatedNotes.length > 0 && (
                    <ScrollReveal width="100%" delay={0.5}>
                      <div className="pt-8 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                          Related Notes
                        </h4>
                        <div className="flex flex-col gap-3">
                          {relatedNotes.map((note) => (
                            <Link
                              key={note.slug}
                              href={`${localePrefix}/notes/${note.slug}`}
                              className="group flex items-center justify-between gap-3 w-full px-5 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 hover:border-accent/30"
                            >
                              <span>{note.displayTitle || note.name}</span>
                              <span className="text-sm text-gray-400 group-hover:text-accent transition-colors">
                                →
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  )}
                </div>{" "}
                {/* End Sidebar */}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
