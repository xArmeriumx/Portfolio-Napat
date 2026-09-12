import type { NoteContent, ProfileContent, ProjectContent } from "./schema";

export type PresentationProfile = {
  name: string;
  name_th: string;
  headline: string;
  headline_th: string;
  tagline: string;
  tagline_th: string;
  about: string;
  about_th: string;
  education: string[];
  education_th: string[];
  contact: { location: string; location_th: string; phone: string };
  links: { email: string; github: string | null; linkedin: string | null; resume: string | null };
  skillCategories: Array<{
    category: string;
    category_th: string;
    skills: Array<{ name: string; name_th: string; logo: string }>;
  }>;
  skills: Array<{ name: string; logo: string }>;
  seo: ProfileContent["seo"];
};

export type PresentationProject = {
  slug: string;
  title: string;
  title_th: string;
  images: string[];
  media?: Array<{ src: string; alt: string; alt_th: string }>;
  role: string[];
  description: string;
  description_th: string;
  technologies: string[];
  keyFeatures: string[];
  keyFeatures_th: string[];
  highlights: string[];
  highlights_th: string[];
  responsibilities: string[];
  responsibilities_th: string[];
  links: { demo: string | null; repo: string | null };
  featured: boolean;
  metrics: string[];
  publishedAt: string | null;
  updatedAt: string | null;
  seo: ProjectContent["seo"];
};

export type PresentationNote = {
  availableLocales?: Array<"en" | "th">;
  contentLocale?: "en" | "th";
  isFallback?: boolean;
  path: string;
  slug: string;
  content: string;
  name: string;
  displayTitle: string;
  rawName: string;
  publishedAt: string | null;
  updatedAt: string | null;
  seo: NoteContent["seo"];
};

export function toPresentationProfile(profile: ProfileContent): PresentationProfile {
  return {
    name: profile.identity.name.en,
    name_th: profile.identity.name.th,
    headline: profile.identity.headline.en,
    headline_th: profile.identity.headline.th,
    tagline: profile.identity.tagline.en,
    tagline_th: profile.identity.tagline.th,
    about: profile.biography.en,
    about_th: profile.biography.th,
    education: profile.education.map((line) => line.en),
    education_th: profile.education.map((line) => line.th),
    contact: {
      location: profile.contact.location.en,
      location_th: profile.contact.location.th,
      phone: profile.contact.phone,
    },
    links: {
      email: profile.contact.links.email,
      github: profile.contact.links.github ?? null,
      linkedin: profile.contact.links.linkedin ?? null,
      resume: profile.contact.links.resume ?? null,
    },
    skillCategories: profile.skillCategories.map((category) => ({
      category: category.name.en,
      category_th: category.name.th,
      skills: category.skills.map((skill) => ({
        name: skill.name.en,
        name_th: skill.name.th,
        logo: skill.logo,
      })),
    })),
    skills: profile.skillCategories.flatMap((category) =>
      category.skills.map((skill) => ({ name: skill.name.en, logo: skill.logo })),
    ),
    seo: profile.seo,
  };
}

export function toPresentationProject(project: ProjectContent): PresentationProject {
  const media = project.media.slice().sort((a, b) => a.order - b.order);

  return {
    slug: project.slug,
    title: project.title.en,
    title_th: project.title.th,
    images: media.map((item) => item.url),
    media: media.map((item) => ({
      src: item.url,
      alt: item.alt.en,
      alt_th: item.alt.th,
    })),
    role: project.role,
    description: project.description.en,
    description_th: project.description.th,
    technologies: project.technologies,
    keyFeatures: project.keyFeatures.en,
    keyFeatures_th: project.keyFeatures.th,
    highlights: project.highlights.en,
    highlights_th: project.highlights.th,
    responsibilities: project.responsibilities.en,
    responsibilities_th: project.responsibilities.th,
    links: {
      demo: project.links.demo ?? null,
      repo: project.links.repo ?? null,
    },
    featured: project.featured,
    metrics: project.metrics,
    publishedAt: project.revision.publishedAt,
    updatedAt: project.revision.updatedAt ?? null,
    seo: project.seo,
  };
}

export function extractMarkdownH1(markdown: string): string | null {
  const match = markdown.match(/^#{1}\s+(.+)$/m);
  if (!match) return null;
  return match[1].replace(/[#*`_[\]()]/g, "").replace(/\s+/g, " ").trim() || null;
}

export function toPresentationNote(note: NoteContent, locale: "en" | "th" = "en"): PresentationNote {
  const availableLocales = getNoteLocales(note);
  const contentLocale = availableLocales.includes(locale) ? locale : availableLocales[0];
  const content = (contentLocale && note.bodyMarkdownByLocale?.[contentLocale]) || note.bodyMarkdown;
  return {
    path: `/src/data/notes/${note.rawName}`,
    slug: note.slug,
    content,
    availableLocales,
    contentLocale,
    isFallback: !availableLocales.includes(locale),
    name: note.title[contentLocale || locale] || note.title.en,
    displayTitle: extractMarkdownH1(content) ?? (note.title[contentLocale || locale] || note.title.en),
    rawName: note.rawName,
    publishedAt: note.revision.publishedAt,
    updatedAt: note.revision.updatedAt ?? null,
    seo: note.seo,
  };
}

// Explicit translations only: legacy mixed-language bodies need editorial inventory.
export function getNoteLocales(note: Pick<NoteContent, "bodyMarkdownByLocale" | "title">): Array<"en" | "th"> {
  return (["en", "th"] as const).filter((locale) =>
    Boolean(note.bodyMarkdownByLocale?.[locale]?.trim() && note.title[locale]?.trim()),
  );
}

export function getProjectLocales(project: Pick<ProjectContent, "title" | "description">): Array<"en" | "th"> {
  return (["en", "th"] as const).filter(locale => Boolean(project.title[locale]?.trim() && project.description[locale]?.trim()));
}
