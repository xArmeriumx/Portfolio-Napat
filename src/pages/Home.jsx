import { useState, useEffect } from "react";
import SEO from "../components/utils/SEO.jsx";
import Breadcrumbs from "../components/utils/Breadcrumbs.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import { profile } from "../data/profile.js";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // SEO Meta Tags handled by SEO component

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      // setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // WebSite Schema for Sitelinks Search Box Candidate
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Napatdev",
    url: "https://napatdev.com/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://napatdev.com/projects?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <SEO
        title={`${profile.name} (ณภัทร ภมรสูตร) | Frontend Developer & Software Tester`}
        description={profile.tagline}
        keywords="Napat Pamornsut, ณภัทร ภมรสูตร, Napatdev, Frontend Developer, Software Tester, React Developer, Node.js, Playwright, Bangkok, Thailand"
        structuredData={webSiteSchema}
      />
      <Breadcrumbs />
      <PageTransition>
        <section className="min-h-[90vh] flex items-center justify-center relative bg-[#fafafa] overflow-hidden pt-16">
          {/* Dimensional Background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Subtle Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.3,
                maskImage:
                  "radial-gradient(circle at center, black 40%, transparent 100%)",
              }}
            />
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-200/50 rounded-full blur-3xl opacity-40 mix-blend-multiply" />
          </div>
          <div className="relative z-10 w-full max-w-4xl px-6 text-center">
            <ScrollReveal width="100%">
              {/* Kicker */}
              <div className="mb-6">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Hello World, I'm
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                {profile.name}
                <span className="sr-only"> (ณภัทร ภมรสูตร)</span>
              </h1>

              {/* Role */}
              <div className="text-xl md:text-3xl font-bold text-gray-800 mb-6">
                Frontend Developer{" "}
                <span className="text-gray-400 font-light px-2">|</span>{" "}
                Software Tester
              </div>

              {/* Description */}
              <p className="max-w-2xl mx-auto text-lg text-gray-500 leading-relaxed mb-10 font-medium">
                {profile.tagline}
              </p>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-700 font-semibold border border-gray-300 hover:border-gray-900 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
                  href={profile.links.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>

                {profile.links.linkedin && (
                  <a
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-700 font-semibold border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
                    href={profile.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </a>
                )}

                <a
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#c43c3c] text-white font-bold hover:bg-[#a83232] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  href="/resume.pdf"
                  download
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download CV
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </PageTransition>
    </>
  );
}
