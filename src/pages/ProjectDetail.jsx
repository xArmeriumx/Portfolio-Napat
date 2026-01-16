import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useTranslation } from "../context/LanguageContext.jsx";
import Section from "../components/ui/Section.jsx";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import { projects } from "../data/projects.js";

/* ========================================
   ImageGallery Component
======================================== */
function ImageGallery({ images, title, selectedIndex, onSelect }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const currentImage = images[selectedIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  // Handle Keyboard Navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft" && hasMultipleImages) {
        onSelect((selectedIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight" && hasMultipleImages) {
        onSelect((selectedIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLightboxOpen,
    hasMultipleImages,
    selectedIndex,
    images.length,
    onSelect,
  ]);

  return (
    <>
      <div className="space-y-6 mb-12">
        {/* Main Image View */}
        <div
          className="overflow-hidden bg-gray-50 rounded-2xl cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="aspect-video relative">
            <img
              className="w-full h-full object-contain transition-transform duration-500"
              src={currentImage}
              alt={`${title} - View ${selectedIndex + 1}`}
              fetchPriority="high"
            />
            {/* Zoom Hint */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
              Click to Zoom
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => onSelect(index)}
                className={`relative flex-shrink-0 w-20 h-20 border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                  selectedIndex === index
                    ? "border-red-500 ring-2 ring-red-500/20 opacity-100 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`View image ${index + 1}`}
                aria-selected={selectedIndex === index}
              >
                <img
                  src={img}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Buttons */}
          {hasMultipleImages && (
            <>
              <button
                className="absolute left-6 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect((selectedIndex - 1 + images.length) % images.length);
                }}
              >
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="absolute right-6 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect((selectedIndex + 1) % images.length);
                }}
              >
                <svg
                  className="w-12 h-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-7xl w-full max-h-screen flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={`${title} full screen`}
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-[-3rem] text-white/50 text-sm font-medium tracking-widest uppercase">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
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

export default function ProjectDetail() {
  const { slug } = useParams();
  const { getContent, language } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Find project
  const project = projects.find((p) => p.slug === slug);

  // SEO Meta Tags
  usePageMeta({
    title: project
      ? `${getContent(project, "title")} | Projects`
      : "Project Not Found",
    description: project
      ? getContent(project, "description")
      : "Project details",
    path: `/projects/${slug}`,
  });

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 pt-20">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
          Project Not Found
        </h2>
        <Link
          to="/projects"
          className="px-8 py-3 font-bold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const title = getContent(project, "title");
  const description = getContent(project, "description");
  const role = project.role || [];
  const stack = project.stack;
  const technologies = project.technologies || [];
  const projectImages = project.images || [project.image];
  const links = project.links;

  const keyFeatures = getContent(project, "keyFeatures") || [];
  const highlights = getContent(project, "highlights") || [];
  const responsibilities = getContent(project, "responsibilities") || [];

  // Labels - Always English
  const labels = {
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
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 pb-32 pt-28 md:pt-36">
        <ScrollReveal width="100%">
          {/* HEADER SECTION: Human/Editorial Vibe */}
          <div className="mb-12 md:mb-16">
            <Link
              to="/projects"
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
              Back to Projects
            </Link>

            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-8">
              {title}
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
              {description?.trim()}
            </p>
          </div>

          {/* HERO IMAGE GALLERY - Immersive & Clean */}
          <div className="mb-16 md:mb-24">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50">
              <ImageGallery
                images={projectImages}
                title={title}
                selectedIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
              />
            </div>
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
                            {item}
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
                            <span>{item}</span>
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
                          className="text-gray-600 text-sm font-medium leading-relaxed"
                        >
                          • {item}
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
            </div>{" "}
            {/* End Sidebar */}
          </div>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
