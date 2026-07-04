"use client";

import Link from "next/link";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import { useScrollToNextPage } from "../hooks/useScrollToNextPage.js";
import { profile } from "../data/profile.js";

export default function Home() {
  // Scroll ถึงก้นหน้า → navigate ไป About (ผ่าน overlay)
  useScrollToNextPage("/about");

  return (
    <PageTransition>
      <section className="flex min-h-screen items-center bg-[#fafafa] px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="mx-auto w-full max-w-4xl">
          <ScrollReveal width="100%">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.22em] text-[#c43c3c]">
              Portfolio
            </p>

            <h1 className="max-w-4xl text-[clamp(3.25rem,10vw,7rem)] font-black leading-[0.92] tracking-[-0.07em] text-gray-950">
              {profile.name}
              <span className="sr-only"> (ณภัทร ภมรสูตร)</span>
            </h1>

            <p className="mt-6 max-w-3xl text-2xl font-black tracking-[-0.04em] text-gray-800 md:text-4xl">
              Web Developer / Software Tester
            </p>

            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
              {profile.tagline}
            </p>

            <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-gray-400">
              {profile.contact.location}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[#c43c3c] px-7 py-3.5 text-sm font-black text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a83232] hover:shadow-lg"
                href="/projects"
              >
                View Projects
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3.5 text-sm font-black text-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
                href="/about"
              >
                About Me
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3.5 text-sm font-black text-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
                href="/contact"
              >
                Contact Me
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
