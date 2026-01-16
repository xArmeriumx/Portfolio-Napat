import { Link, useNavigate } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useTranslation } from "../context/LanguageContext.jsx";
import Section from "../components/ui/Section.jsx";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx"; // Ensure this is imported
import { projects } from "../data/projects.js";

/* ========================================
   ProjectCard Component
   - แสดงข้อมูลโปรเจคแต่ละรายการ
======================================== */
function ProjectCard({ project }) {
  const { getContent, language } = useTranslation();
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on a button or link
    if (e.target.closest("a") || e.target.closest("button")) return;
    navigate(`/projects/${project.slug}`);
  };

  const { slug, stack, role, links, images, image } = project;

  // Get translated content
  const title = getContent(project, "title");
  const highlights = getContent(project, "highlights");

  // ใช้รูปแรกเป็นปก
  const coverImage = images?.[0] || image;

  // Button text
  const viewDetailText = "View Detail";

  return (
    <article
      onClick={handleCardClick}
      className="group flex flex-col h-full bg-white rounded-[32px] p-4 border border-gray-200 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer"
    >
      {/* รูปปก */}
      <Link
        to={`/projects/${slug}`}
        aria-label={`View ${title} details`}
        className="block"
      >
        <div className="relative aspect-video overflow-hidden rounded-[24px] bg-white border border-gray-200 p-2 cursor-pointer">
          <img
            className="w-full h-full object-contain transition-transform duration-700"
            src={coverImage}
            alt={title}
          />
        </div>
      </Link>

      {/* เนื้อหา */}
      <div className="flex flex-col flex-grow px-2 pt-6 pb-2">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-red-600 transition-colors mb-4">
          {title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {stack && (
            <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-200">
              {stack}
            </span>
          )}
          {role.map((r) => (
            <span
              key={r}
              className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full"
            >
              {r}
            </span>
          ))}
        </div>

        {/* Highlights */}
        <ul className="mb-8 space-y-2 text-[15px] text-gray-600 leading-relaxed font-medium pl-1">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-3 mt-2 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        {/* Action Buttons */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          {/* Internal Link - View Detail */}
          <Link
            className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors flex items-center gap-1"
            to={`/projects/${slug}`}
            aria-label={`View ${title} details`}
          >
            {viewDetailText}
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          {/* External Actions */}
          <div className="flex items-center gap-3">
            {links.repo && (
              <a
                className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
                href={links.repo}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${title} repository`}
                title="View Source Code"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            )}

            {links.demo && (
              <a
                className="px-5 py-2 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-red-600 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                href={links.demo}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${title} demo`}
              >
                <span>Live Demo</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ========================================
   ProjectList Page
   - แสดงรายการโปรเจคทั้งหมด
======================================== */
export default function ProjectList() {
  const { language } = useTranslation();

  const pageTitle = "Projects";

  // SEO Meta Tags
  usePageMeta({
    title: `${pageTitle} | Napat Pamornsut (ณภัทร ภมรสูตร)`,
    description:
      "Explore my projects including web development, frontend, system analysis, and software testing work.",
    path: "/projects",
    keywords:
      "Napat Pamornsut, ณภัทร ภมรสูตร, Projects, Portfolio, Web Development, React, Software Testing",
  });

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-[#f9fafb] overflow-hidden pt-24 md:pt-28 pb-24">
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
          {/* Header with Line */}
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{pageTitle}</h2>
            <div className="h-px bg-gray-200 flex-grow mt-2"></div>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {projects.map((project, idx) => (
              <ScrollReveal key={project.slug} width="100%" delay={idx * 0.1}>
                <ProjectCard project={project} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
