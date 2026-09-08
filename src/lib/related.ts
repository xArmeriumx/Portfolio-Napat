import type { PresentationNote, PresentationProject } from "@/content/presentation";

// Canonical topic keys. Alias groups let a note about "Next.js" match a
// project built with "react", or an "SQL" note match "PostgreSQL"/"Prisma".
const TECH_ALIASES: Record<string, string[]> = {
  nextjs: ["next.js", "nextjs", "react"],
  typescript: ["typescript"],
  sql: ["sql", "postgresql", "postgres", "prisma", "mysql"],
  testing: ["playwright", "vitest", "qa", "testing", "test", "uat", "automation", "testcase", "test-case"],
};

export type NoteTopicKey = "nextjs" | "typescript" | "sql" | "testing";

export const NOTE_TOPICS: Record<
  NoteTopicKey,
  { label: string; title: string; description: string; notes: string[] }
> = {
  nextjs: {
    label: "Next.js",
    title: "Next.js Guides & Cheatsheets",
    description:
      "Practical Next.js guides by Napat Pamornsut — App Router, Server Components, routing, Server Actions and data fetching. คู่มือ Next.js ฉบับใช้งานจริง",
    notes: ["nextjs-app-router-guide"],
  },
  typescript: {
    label: "TypeScript",
    title: "TypeScript Reference & Guides",
    description:
      "TypeScript reference and practical guides by Napat Pamornsut — types, generics and patterns used in real projects. เอกสารอ้างอิง TypeScript",
    notes: ["typescript-reference-guide"],
  },
  sql: {
    label: "SQL",
    title: "SQL Basics & Query Examples",
    description:
      "SQL fundamentals and query examples by Napat Pamornsut — basics, codes and response tables for real work. สรุป SQL พื้นฐานและตัวอย่าง query",
    notes: ["sql-basics", "sql-query-examples"],
  },
  testing: {
    label: "Testing",
    title: "Software Testing Guides",
    description:
      "Software testing guides by Napat Pamornsut — Playwright automation, UAT and QA practices. คู่มือทดสอบซอฟต์แวร์",
    notes: [],
  },
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9.+]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function expandWithAliases(tokens: string[]): Set<string> {
  const expanded = new Set(tokens);
  for (const [key, aliases] of Object.entries(TECH_ALIASES)) {
    if (tokens.some((token) => token === key || aliases.includes(token))) {
      expanded.add(key);
      for (const alias of aliases) expanded.add(alias);
    }
  }
  return expanded;
}

function noteTokens(note: PresentationNote): Set<string> {
  const topics = Object.entries(NOTE_TOPICS)
    .filter(([, topic]) => topic.notes.includes(note.slug))
    .map(([key]) => key);
  return expandWithAliases([...topics, ...tokenize(`${note.displayTitle} ${note.name} ${note.slug}`)]);
}

function projectTokens(project: PresentationProject): Set<string> {
  return expandWithAliases([
    ...project.technologies.flatMap(tokenize),
    ...tokenize(`${project.title} ${project.title_th} ${project.description}`),
  ]);
}

function scoreOverlap(a: Set<string>, b: Set<string>): number {
  let score = 0;
  for (const token of a) {
    if (b.has(token)) score += token.length > 3 ? 2 : 1;
  }
  return score;
}

export type RelatedProject = Pick<PresentationProject, "slug" | "title" | "title_th" | "technologies" | "featured">;
export type RelatedNote = Pick<PresentationNote, "slug" | "displayTitle" | "name">;

export function getRelatedProjects(
  note: PresentationNote,
  projects: PresentationProject[],
  limit = 3,
): RelatedProject[] {
  const source = noteTokens(note);
  return projects
    .map((project) => ({ project, score: scoreOverlap(source, projectTokens(project)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.project.featured) - Number(a.project.featured))
    .slice(0, limit)
    .map(({ project }) => ({
      slug: project.slug,
      title: project.title,
      title_th: project.title_th,
      technologies: project.technologies,
      featured: project.featured,
    }));
}

export function getRelatedNotes(
  project: PresentationProject,
  notes: PresentationNote[],
  limit = 3,
): RelatedNote[] {
  const source = projectTokens(project);
  return notes
    .map((note) => ({ note, score: scoreOverlap(source, noteTokens(note)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ note }) => ({ slug: note.slug, displayTitle: note.displayTitle, name: note.name }));
}

export function getTopicHub(topic: NoteTopicKey, notes: PresentationNote[]): PresentationNote[] {
  const slugs = NOTE_TOPICS[topic].notes;
  const bySlug = new Map(notes.map((note) => [note.slug, note]));
  const configured = slugs.flatMap((slug) => bySlug.has(slug) ? [bySlug.get(slug)!] : []);
  const additional = notes.filter((note) =>
    !Object.values(NOTE_TOPICS).some((entry) => entry.notes.includes(note.slug)) && noteTokens(note).has(topic),
  );
  return [...configured, ...additional];
}

export function isNoteTopicKey(value: string): value is NoteTopicKey {
  return Object.prototype.hasOwnProperty.call(NOTE_TOPICS, value);
}

export function getLocalizedTopic(key: NoteTopicKey, locale: "en" | "th") {
  const topic = NOTE_TOPICS[key];
  const th = {
    nextjs: { title: "คู่มือ Next.js จากงานพัฒนาเว็บ", description: "โน้ต Next.js เรื่อง App Router, Server Components และการจัดการข้อมูล พร้อมเชื่อมโยงกับผลงานพัฒนาเว็บ" },
    typescript: { title: "คู่มือ TypeScript และการออกแบบชนิดข้อมูล", description: "โน้ต TypeScript เรื่อง types, generics และรูปแบบการเขียนโค้ดที่ใช้ในการพัฒนาเว็บ" },
    sql: { title: "พื้นฐาน SQL และตัวอย่าง Query", description: "เรียนรู้การอ่านและจัดการข้อมูลด้วย SQL ผ่านตัวอย่าง query และผลลัพธ์" },
    testing: { title: "การทดสอบซอฟต์แวร์และ QA Automation", description: "แนวทางตรวจสอบคุณภาพซอฟต์แวร์ ตั้งแต่ test cases และ UAT ไปจนถึงการทดสอบอัตโนมัติ" },
  };
  return locale === "th" ? { ...topic, ...th[key] } : { ...topic, description: topic.description.split(/ คู่มือ| เอกสาร| สรุป/)[0] };
}
