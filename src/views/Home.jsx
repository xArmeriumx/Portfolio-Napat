"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx";

function ProfileIde({ profile, locale }) {
  const lines = [
    <><span className="syntax-keyword">const</span> <span className="syntax-property">profile</span> <span className="text-gray-500">= &#123;</span></>,
    <><span className="syntax-property">  name</span><span className="text-gray-500">: </span><span className="syntax-string">&quot;{profile.name}&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="syntax-property">  role</span><span className="text-gray-500">: </span><span className="syntax-string">&quot;Web Developer&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="syntax-property">  location</span><span className="text-gray-500">: </span><span className="syntax-string">&quot;{profile.contact.location}&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="syntax-property">  strengths</span><span className="text-gray-500">: [</span></>,
    <><span className="text-gray-500">    </span><span className="syntax-string">&quot;reliable web apps&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-gray-500">    </span><span className="syntax-string">&quot;quality-focused testing&quot;</span><span className="text-gray-500">,</span></>,
    <><span className="text-gray-500">    </span><span className="syntax-string">&quot;practical solutions&quot;</span></>,
    <><span className="text-gray-500">  ],</span></>,
    <><span className="syntax-property">  approach</span><span className="text-gray-500">: </span><span className="syntax-string">&quot;build, test, improve&quot;</span></>,
    <><span className="text-gray-500">&#125;;</span></>,
    <></>,
    <><span className="syntax-keyword">export default</span> <span className="syntax-property">profile</span><span className="text-gray-500">;</span></>,
  ];

  return (
    <div className="profile-ide-stage relative mx-auto w-full max-w-[570px]">
      <div className="profile-ide-window overflow-hidden rounded-2xl bg-surface">
        <div className="flex h-12 items-center border-b border-gray-200 bg-white px-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#df9a93]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#e5c887]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#a9c9a8]" />
          </div>
          <div className="ml-5 flex h-full items-center border-b-2 border-accent px-3 text-[11px] font-bold text-gray-700">
            about.tsx
          </div>
          <span className="ml-auto font-mono text-[10px] text-gray-400">personal profile</span>
        </div>

        <div className="grid min-h-[330px] grid-cols-[2.5rem_1fr] py-6 font-mono text-[11px] leading-[2] sm:grid-cols-[3.5rem_1fr] sm:text-xs">
          <div className="select-none border-r border-gray-200 pr-3 text-right text-gray-300 sm:pr-4">
            {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
          </div>
          <pre className="profile-ide-code overflow-x-auto pl-4 pr-3 text-gray-600 sm:pl-5 sm:pr-6"><code>{lines.map((line, index) => <div key={index} className="whitespace-pre">{line}</div>)}</code></pre>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> profile</span>
          <span>TypeScript</span>
          <span className="hidden sm:block">13 lines</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
        <Link href={locale === "th" ? "/th/about" : "/about"}>{locale === "th" ? "อ่านประวัติและทักษะ" : "Read the full profile"}</Link>
        <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
      </div>
    </div>
  );
}

export default function Home({ profile, selectedProjects = [], locale = "en" }) {
  const th = locale === "th";
  const prefix = th ? "/th" : "";

  return (
    <PageTransition>
      <section className="relative flex min-h-[min(100svh,920px)] items-center overflow-hidden bg-canvas px-4 pb-14 pt-24 sm:pb-16 md:min-h-screen md:px-6 md:pt-28">
        <div className="hero-grid" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl">
          <ScrollReveal width="100%">
            <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-16">
              <div>


            <h1 className="max-w-4xl text-[clamp(3rem,8.5vw,6rem)] font-black leading-[0.92] tracking-[-0.04em] text-gray-950">
              {th ? profile.name_th || profile.name : profile.name}
              <span className="sr-only"> (ณภัทร ภมรสูตร)</span>
            </h1>

            <p className="mt-6 max-w-3xl text-2xl font-black tracking-[-0.04em] text-gray-800 md:text-4xl">
              {th ? "นักพัฒนาเว็บ / นักทดสอบซอฟต์แวร์" : "Web Developer / Software Tester"}
            </p>

            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
              {th ? profile.tagline_th : profile.tagline}
            </p>

            <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-gray-400">
              {th ? profile.contact.location_th : profile.contact.location}
            </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-black text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-lg"
                href={`${prefix}/projects`}
              >
                {th ? "ดูผลงาน" : "View Projects"}
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3.5 text-sm font-black text-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
                href={`${prefix}/about`}
              >
                {th ? "เกี่ยวกับฉัน" : "About Me"}
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-7 py-3.5 text-sm font-black text-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-900 hover:shadow-md"
                href={`${prefix}/contact`}
              >
                {th ? "ติดต่อเรื่องงาน" : "Contact Me"}
              </Link>
                </div>
              </div>

              <div className="pt-2 lg:pt-0">
                <div className="mb-4 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <span>About me</span>

                </div>
                <ProfileIde profile={profile} locale={locale} />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      {profile.skillCategories?.length > 0 && (
        <section aria-labelledby="technical-expertise-title" className="responsive-section bg-canvas py-14 md:py-20">
          <div className="mx-auto max-w-7xl">
            <ScrollReveal width="100%">
              <div className="grid gap-8 border-y border-line py-10 md:py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
                    {th ? "ทักษะหลัก" : "Technical expertise"}
                  </p>
                  <h2 id="technical-expertise-title" className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-ink md:text-4xl">
                    {th ? "เทคโนโลยีที่ใช้สร้างและทดสอบซอฟต์แวร์" : "Technologies for building and testing reliable software"}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-muted md:text-base">
                    {th
                      ? "ครอบคลุมงานพัฒนาเว็บแบบ Full-stack, ฐานข้อมูล, การทดสอบอัตโนมัติ และเครื่องมือที่ใช้ส่งมอบระบบจริง"
                      : "Full-stack development, databases, automated testing, and delivery tooling used across real projects."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
                    <Link href={`${prefix}/about`} className="inline-flex items-center gap-1.5 text-accent">
                      {th ? "ดูทักษะทั้งหมด" : "View full skill set"} <ArrowUpRight size={16} />
                    </Link>
                    <Link href={`${prefix}/notes`} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-accent">
                      {th ? "อ่าน Developer Notes" : "Read developer notes"} <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="responsive-stack" data-columns="2">
                  {profile.skillCategories.slice(0, 4).map((category) => (
                    <div key={category.category} className="rounded-2xl border border-line bg-white p-5 transition-transform duration-300 motion-reduce:transition-none md:p-6">
                      <h3 className="text-sm font-black uppercase tracking-[0.14em] text-gray-500">
                        {th ? category.category_th || category.category : category.category}
                      </h3>
                      <p className="mt-3 text-sm font-medium leading-7 text-gray-700">
                        {category.skills.slice(0, 6).map((skill) => th ? skill.name_th || skill.name : skill.name).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {selectedProjects.length > 0 && (
        <section aria-labelledby="selected-work-title" className="selected-work bg-canvas px-4 md:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 id="selected-work-title" className="text-3xl font-bold tracking-tight text-ink md:text-5xl">{th ? "ผลงานที่คัดสรร" : "Selected work"}</h2>
              <Link href={`${prefix}/projects`} className="inline-flex items-center gap-2 py-3 text-sm font-semibold text-accent">{th ? "ดูผลงานทั้งหมด" : "All projects"}<ArrowUpRight size={18} /></Link>
            </div>
            {selectedProjects.map(project => {
              const title = th ? project.title_th || project.title : project.title;
              return <article key={project.slug} className="selected-work-row">
                <Link href={`${prefix}/projects/${project.slug}`} className="selected-work-image block" aria-label={title}>
                  {project.images[0] && <Image src={project.images[0]} alt={(th ? project.media?.[0]?.alt_th : project.media?.[0]?.alt) || title} fill sizes="(max-width: 767px) 100vw, 55vw" className="object-contain p-3 md:p-6" />}
                </Link>
                <div>
                  <p className="mb-3 text-sm text-muted">{project.role.join(" / ")}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-ink md:text-3xl"><Link href={`${prefix}/projects/${project.slug}`}>{title}</Link></h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-muted">{th ? project.description_th || project.description : project.description}</p>
                  <p className="mt-5 text-sm text-muted">{project.technologies.slice(0, 5).join(" · ")}</p>
                  <Link href={`${prefix}/projects/${project.slug}`} className="mt-6 inline-flex items-center gap-2 py-2 font-semibold text-accent">{th ? "อ่านรายละเอียดผลงาน" : "Explore the project"}<ArrowUpRight size={18} /></Link>
                </div>
              </article>;
            })}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
