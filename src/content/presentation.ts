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
  seo: ProjectContent["seo"];
};

export type PresentationNote = {
  path: string;
  id: string;
  content: string;
  name: string;
  rawName: string;
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
  return {
    slug: project.slug,
    title: project.title.en,
    title_th: project.title.th,
    images: project.media.slice().sort((a, b) => a.order - b.order).map((media) => media.url),
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
    seo: project.seo,
  };
}

export function toPresentationNote(note: NoteContent): PresentationNote {
  return {
    path: `/src/data/notes/${note.rawName}`,
    id: note.slug,
    content: note.bodyMarkdown,
    name: note.title.en,
    rawName: note.rawName,
    seo: note.seo,
  };
}
