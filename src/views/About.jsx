"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "../context/LanguageContext.jsx";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import AnimatedText from "../components/ui/AnimatedText.jsx";
import { useScrollToNextPage } from "../hooks/useScrollToNextPage.js";
import { profile } from "../data/profile.js";
import {
  MapPin,
  Mail,
  GraduationCap,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

function SectionLabel({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-bold text-[#c43c3c] tracking-widest">
        {number}
      </span>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="h-px flex-grow bg-gray-100" />
    </div>
  );
}

function BentoCard({ children, className = "" }) {
  return (
    <div
      className={`h-full rounded-2xl border border-gray-100 bg-white p-6 md:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

function CopyEmailRow({ email }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-left transition-all hover:border-[#c43c3c]/30 hover:bg-white"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-gray-100">
          <Mail className="h-4 w-4 text-gray-500" />
        </span>
        <span className="truncate text-sm font-semibold text-gray-800">
          {email}
        </span>
      </div>
      <span className="flex flex-shrink-0 items-center gap-1 text-xs font-bold text-[#c43c3c]">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            Copy
          </>
        )}
      </span>
    </button>
  );
}

function SkillGroup({ category, skills }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
        <AnimatedText>{category}</AnimatedText>
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 transition-colors hover:border-gray-200 hover:bg-white"
          >
            <img
              src={skill.logo}
              alt=""
              className="h-5 w-5 object-contain"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-gray-800">
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function About() {
  const { getContent } = useTranslation();

  useEffect(() => {
    import("./ProjectList.jsx");
  }, []);

  useScrollToNextPage("/projects");

  const aboutText = getContent(profile, "about");
  const educationLines = getContent(profile, "education");
  const roles = profile.headline.split(" | ");

  return (
    <>
      <PageTransition>
        <div className="relative min-h-screen overflow-hidden bg-[#f9fafb] pt-28 pb-32">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.18,
                maskImage:
                  "radial-gradient(circle at 20% 0%, black 20%, transparent 70%)",
              }}
            />
            <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-red-100/40 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
            {/* Hero */}
            <ScrollReveal width="100%">
              <header className="mb-12 flex flex-col items-center gap-6 md:mb-14 md:flex-row md:items-center md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#c43c3c]/20 to-transparent blur-sm" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] md:h-28 md:w-28">
                    <img
                      src="/favicon.png"
                      alt=""
                      className="h-full w-full object-contain mix-blend-multiply"
                    />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#c43c3c]">
                    About
                  </p>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                    {profile.name}
                  </h1>
                  <p className="mt-2 text-base font-semibold text-gray-600 md:text-lg">
                    {profile.headline}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm"
                      >
                        {role}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {profile.contact.location}
                    </span>
                  </div>
                </div>
              </header>
            </ScrollReveal>

            {/* Bento grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {/* About Me */}
              <ScrollReveal width="100%" className="md:col-span-2">
                <BentoCard>
                  <SectionLabel number="01" title="About Me" />
                  <p className="text-base font-medium leading-relaxed text-gray-600 md:text-[17px] md:leading-loose">
                    <AnimatedText>{aboutText}</AnimatedText>
                  </p>
                  <p className="mt-5 border-t border-gray-100 pt-5 text-sm font-medium leading-relaxed text-gray-500">
                    <AnimatedText>{profile.tagline}</AnimatedText>
                  </p>
                </BentoCard>
              </ScrollReveal>

              {/* Education */}
              <ScrollReveal width="100%" delay={0.05}>
                <BentoCard>
                  <SectionLabel number="02" title="Education" />
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                    <GraduationCap className="h-5 w-5 text-[#c43c3c]" />
                  </div>
                  <ul className="space-y-3">
                    {educationLines.map((line, index) => (
                      <li
                        key={index}
                        className={`flex items-start gap-2 text-sm font-medium leading-snug ${
                          index === educationLines.length - 1
                            ? "text-[#c43c3c] font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
                        <AnimatedText>{line}</AnimatedText>
                      </li>
                    ))}
                  </ul>
                </BentoCard>
              </ScrollReveal>

              {/* Contact */}
              <ScrollReveal width="100%" delay={0.1} className="scroll-mt-24">
                <BentoCard>
                  <SectionLabel number="03" title="Contact" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-100">
                        <MapPin className="h-4 w-4 text-gray-500" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Location
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {profile.contact.location}
                        </p>
                      </div>
                    </div>
                    <CopyEmailRow email={profile.links.email} />
                    {profile.links.github && profile.links.github !== "#" && (
                      <a
                        href={profile.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 transition-all hover:border-gray-200 hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-100">
                            <svg
                              className="h-4 w-4 text-gray-700"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            GitHub
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    )}
                    <a
                      href="/resume.pdf"
                      download
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c43c3c]"
                    >
                      Download CV
                    </a>
                  </div>
                </BentoCard>
              </ScrollReveal>

              {/* Skills */}
              <ScrollReveal width="100%" delay={0.15} className="md:col-span-2">
                <BentoCard>
                  <SectionLabel number="04" title="Skills & Tools" />
                  <div className="space-y-7">
                    {profile.skillCategories.map((cat) => (
                      <SkillGroup
                        key={cat.category}
                        category={getContent(cat, "category")}
                        skills={cat.skills}
                      />
                    ))}
                  </div>
                </BentoCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
