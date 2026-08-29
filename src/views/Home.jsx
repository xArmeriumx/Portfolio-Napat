"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";
import { useScrollToNextPage } from "../hooks/useScrollToNextPage.js";

function ProfileIde({ profile }) {
  const lines = [
    <><span className="text-[#a23b3b]">const</span> <span className="text-[#73508f]">profile</span> <span className="text-gray-500">= &#123;</span></>,
    <><span className="text-[#73508f]">  name</span><span className="text-gray-500">: </span><span className="text-[#477b55]">&quot;{profile.name}&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-[#73508f]">  role</span><span className="text-gray-500">: </span><span className="text-[#477b55]">&quot;Web Developer&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-[#73508f]">  location</span><span className="text-gray-500">: </span><span className="text-[#477b55]">&quot;{profile.contact.location}&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-[#73508f]">  strengths</span><span className="text-gray-500">: [</span></>,
    <><span className="text-gray-500">    </span><span className="text-[#477b55]">&quot;reliable web apps&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-gray-500">    </span><span className="text-[#477b55]">&quot;quality-focused testing&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-gray-500">    </span><span className="text-[#477b55]">&quot;practical solutions&quot;</span></>,
    <><span className="text-gray-500">  ],</span></>,
    <><span className="text-[#73508f]">  approach</span><span className="text-gray-500">: </span><span className="text-[#477b55]">&quot;build, test, improve&quot;</span></>,
    <><span className="text-gray-500">&#125;;</span></>,
    <></>,
    <><span className="text-[#a23b3b]">export default</span> <span className="text-[#73508f]">profile</span><span className="text-gray-500">;</span></>,
  ];

  return (
    <div className="relative mx-auto w-full max-w-[570px]">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f8f6] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
        <div className="flex h-12 items-center border-b border-gray-200 bg-white px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#df9a93]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5c887]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#a9c9a8]" />
          </div>
          <div className="ml-5 flex h-full items-center border-b-2 border-[#c43c3c] px-3 text-[11px] font-bold text-gray-700">
            about.tsx
          </div>
          <span className="ml-auto font-mono text-[10px] text-gray-400">personal profile</span>
        </div>

        <div className="grid min-h-[330px] grid-cols-[2.5rem_1fr] py-6 font-mono text-[11px] leading-[2] sm:grid-cols-[3.5rem_1fr] sm:text-xs">
          <div className="select-none border-r border-gray-200 pr-3 text-right text-gray-300 sm:pr-4">
            {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
          </div>
          <pre className="overflow-hidden pl-4 pr-3 text-gray-600 sm:pl-5 sm:pr-6"><code>{lines.map((line, index) => <div key={index} className="whitespace-pre">{line}</div>)}</code></pre>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> profile</span>
          <span>TypeScript</span>
          <span className="hidden sm:block">13 lines</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
        <span>Read the full profile</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#c43c3c]" />
      </div>
    </div>
  );
}

export default function Home({ profile }) {
  // Scroll ถึงก้นหน้า → navigate ไป About (ผ่าน overlay)
  useScrollToNextPage("/about");

  return (
    <PageTransition>
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#fafafa] px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="hero-grid" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-red-50/70 blur-3xl" />
        <div className="relative mx-auto w-full max-w-7xl">
          <ScrollReveal width="100%">
            <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-16">
              <div>
                <p className="mb-5 text-xs font-black uppercase tracking-[0.22em] text-[#c43c3c]">
                  Portfolio
                </p>

            <h1 className="max-w-4xl text-[clamp(3rem,8.5vw,6.25rem)] font-black leading-[0.92] tracking-[-0.07em] text-gray-950">
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
              </div>

              <div className="pt-2 lg:pt-0">
                <div className="mb-4 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <span>About me</span>
                  <span className="font-mono text-gray-300">01 / 01</span>
                </div>
                <ProfileIde profile={profile} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
}
