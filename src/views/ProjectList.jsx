"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "../context/LanguageContext.jsx";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import AnimatedText from "../components/ui/AnimatedText.jsx";
import { projects } from "../data/projects.js";
import { ExternalLink, ArrowRight } from "lucide-react";

function GitHubIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MetricChips({ metrics = [] }) {
  if (!metrics.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((metric) => (
        <span
          key={metric}
          className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-[#c43c3c]"
        >
          {metric}
        </span>
      ))}
    </div>
  );
}

function TechChips({ technologies = [], limit = 5 }) {
  if (!technologies.length) return null;
  const visible = technologies.slice(0, limit);
  const rest = technologies.length - visible.length;
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((tech) => (
        <span
          key={tech}
          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700"
        >
          {tech}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-400">
          +{rest}
        </span>
      )}
    </div>
  );
}

function ProjectActions({ slug, title, links, onLinkClick }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/projects/${slug}`}
        onClick={onLinkClick}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900 transition-colors hover:text-[#c43c3c]"
      >
        View case study
        <ArrowRight className="h-4 w-4" />
      </Link>
      {links?.repo && (
        <a
          href={links.repo}
          target="_blank"
          rel="noreferrer"
          onClick={onLinkClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:border-gray-300 hover:bg-white hover:text-gray-900"
          aria-label={`${title} repository`}
        >
          <GitHubIcon className="h-4 w-4" />
        </a>
      )}
      {links?.demo && (
        <a
          href={links.demo}
          target="_blank"
          rel="noreferrer"
          onClick={onLinkClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#c43c3c]"
        >
          Live Demo
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

function FeaturedProjectCard({ project }) {
  const { getContent } = useTranslation();
  const router = useRouter();
  const { slug, role, links, images, image, metrics, technologies } = project;
  const title = getContent(project, "title");
  const description = getContent(project, "description").trim();
  const highlights = getContent(project, "highlights").slice(0, 2);
  const coverImage = images?.[0] || image;

  const handleCardClick = (e) => {
    if (e.target.closest("a") || e.target.closest("button")) return;
    router.push(`/projects/${slug}`);
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <article
      onClick={handleCardClick}
      className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
    >
      <div className="absolute left-5 top-5 z-20 rounded-full bg-[#c43c3c] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
        Featured
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Link
          href={`/projects/${slug}`}
          onClick={stopProp}
          className="relative block min-h-[240px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 lg:min-h-[340px]"
          aria-label={`View ${title} case study`}
        >
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute bottom-5 left-5 right-5 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-lg">
              View case study
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <div className="flex flex-col p-6 md:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap gap-2">
            {role.map((r) => (
              <span
                key={r}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
              >
                {r}
              </span>
            ))}
          </div>

          <h2 className="mb-3 text-2xl font-black tracking-tight text-gray-900 transition-colors group-hover:text-[#c43c3c] md:text-3xl">
            <AnimatedText>{title}</AnimatedText>
          </h2>

          <div className="mb-4">
            <MetricChips metrics={metrics} />
          </div>

          <p className="mb-5 line-clamp-3 text-sm font-medium leading-relaxed text-gray-500 md:text-base">
            {description}
          </p>

          <div className="mb-5">
            <TechChips technologies={technologies} limit={6} />
          </div>

          <ul className="mb-6 space-y-2 text-sm font-medium text-gray-600">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[#c43c3c]" />
                <AnimatedText>{h}</AnimatedText>
              </li>
            ))}
          </ul>

          <div className="mt-auto border-t border-gray-100 pt-5">
            <ProjectActions
              slug={slug}
              title={title}
              links={links}
              onLinkClick={stopProp}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project, index }) {
  const { getContent } = useTranslation();
  const router = useRouter();
  const { slug, role, links, images, image, technologies, metrics } = project;
  const title = getContent(project, "title");
  const description = getContent(project, "description").trim();
  const highlights = getContent(project, "highlights").slice(0, 2);
  const coverImage = images?.[0] || image;

  const handleCardClick = (e) => {
    if (e.target.closest("a") || e.target.closest("button")) return;
    router.push(`/projects/${slug}`);
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
    >
      <Link
        href={`/projects/${slug}`}
        onClick={stopProp}
        className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-50 to-white"
        aria-label={`View ${title} details`}
      >
        <span className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-gray-500 backdrop-blur-sm">
          {String(index).padStart(2, "0")}
        </span>
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </Link>

      <div className="flex min-h-0 flex-grow flex-col p-5 md:p-6">
        <div className="mb-3 flex min-h-[26px] flex-wrap gap-2">
          {role.slice(0, 2).map((r) => (
            <span
              key={r}
              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600"
            >
              {r}
            </span>
          ))}
        </div>

        <h3 className="mb-2 line-clamp-2 min-h-[3.5rem] text-xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-[#c43c3c] md:min-h-[4rem] md:text-2xl">
          <AnimatedText>{title}</AnimatedText>
        </h3>

        <div className="mb-3 min-h-[28px]">
          {metrics?.length > 0 && <MetricChips metrics={metrics} />}
        </div>

        <p className="mb-4 line-clamp-2 min-h-[2.75rem] text-sm font-medium leading-relaxed text-gray-500">
          {description}
        </p>

        <div className="mb-4 min-h-[56px]">
          <TechChips technologies={technologies} limit={4} />
        </div>

        <ul className="mb-5 min-h-[4.5rem] space-y-1.5 text-sm font-medium text-gray-600">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
              <span className="line-clamp-2">
                <AnimatedText>{h}</AnimatedText>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <ProjectActions
            slug={slug}
            title={title}
            links={links}
            onLinkClick={stopProp}
          />
        </div>
      </div>
    </article>
  );
}

export default function ProjectList() {
  const [featured, ...rest] = projects;

  return (
    <>
      <PageTransition>
        <div className="relative min-h-screen overflow-hidden bg-[#f9fafb] pb-24 pt-24 md:pt-28">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.15,
                maskImage:
                  "radial-gradient(circle at 80% 0%, black 15%, transparent 65%)",
              }}
            />
            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-red-100/30 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
            <ScrollReveal width="100%">
              <header className="mb-10 md:mb-14">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c43c3c]">
                  Portfolio
                </p>
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                      Projects
                    </h1>
                    <p className="mt-2 max-w-xl text-base font-medium text-gray-500">
                      Selected work across web development, system design, IoT,
                      and software testing.
                    </p>
                  </div>
                  <div className="flex gap-6 text-sm font-semibold text-gray-500">
                    <span>
                      <strong className="text-2xl font-black text-gray-900">
                        {projects.length}
                      </strong>
                      <span className="ml-1.5">projects</span>
                    </span>
                  </div>
                </div>
              </header>
            </ScrollReveal>

            <div className="space-y-10 md:space-y-12">
              <ScrollReveal width="100%">
                <FeaturedProjectCard project={featured} />
              </ScrollReveal>

              <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8">
                {rest.map((project, idx) => (
                  <ScrollReveal
                    key={project.slug}
                    width="100%"
                    className="h-full"
                    delay={(idx + 1) * 0.08}
                  >
                    <ProjectCard project={project} index={idx + 2} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
