import { z } from "zod";
import { isSafeMarkdown, MARKDOWN_SAFETY_MESSAGE } from "./markdown-policy";

export const localeSchema = z.enum(["en", "th"]);

export const localizedTextSchema = z.object({
  en: z.string(),
  th: z.string(),
});

export type Locale = z.infer<typeof localeSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export function toLocalizedText(en: string, th?: string | null): LocalizedText {
  const english = String(en ?? "");
  const thai = typeof th === "string" && th.trim() ? th : english;
  return { en: english, th: thai };
}

export function resolveLocalizedText(value: LocalizedText, locale: Locale): string {
  return value[locale].trim() ? value[locale] : value.en;
}

const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "#" ||
      value.startsWith("/") ||
      value.startsWith("mailto:") ||
      /^https?:\/\//i.test(value),
    "URL must use http, https, mailto, or a site-relative path",
  );

export const revisionSchema = z.object({
  revisionId: z.string().min(1),
  revisionNumber: z.number().int().positive(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.string().datetime().nullable(),
});

const localizedStringArraySchema = z.array(localizedTextSchema);

export const skillSchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  logo: safeUrlSchema,
});

export const skillCategorySchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  order: z.number().int().nonnegative(),
  skills: z.array(skillSchema),
});

export const profileContentSchema = z.object({
  id: z.literal("profile"),
  revision: revisionSchema,
  identity: z.object({
    name: localizedTextSchema,
    headline: localizedTextSchema,
    tagline: localizedTextSchema,
  }),
  biography: localizedTextSchema,
  education: localizedStringArraySchema,
  contact: z.object({
    location: localizedTextSchema,
    phone: z.string(),
    links: z.object({
      email: z.string().email(),
      github: safeUrlSchema.nullable(),
      linkedin: safeUrlSchema.nullable(),
      resume: safeUrlSchema.nullable(),
    }),
  }),
  skillCategories: z.array(skillCategorySchema),
  seo: z.object({
    title: localizedTextSchema.nullable(),
    description: localizedTextSchema.nullable(),
    image: safeUrlSchema.nullable(),
  }),
});

export const mediaReferenceSchema = z.object({
  id: z.string().min(1),
  storageKey: z.string().nullable(),
  url: safeUrlSchema,
  mimeType: z.string().min(1),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  alt: localizedTextSchema,
  caption: localizedTextSchema.nullable(),
  order: z.number().int().nonnegative(),
});

export const projectContentSchema = z.object({
  id: z.string().min(1),
  revision: revisionSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: localizedTextSchema,
  description: localizedTextSchema,
  role: z.array(z.string()),
  technologies: z.array(z.string()),
  keyFeatures: z.object({ en: z.array(z.string()), th: z.array(z.string()) }),
  highlights: z.object({ en: z.array(z.string()), th: z.array(z.string()) }),
  responsibilities: z.object({ en: z.array(z.string()), th: z.array(z.string()) }),
  metrics: z.array(z.string()),
  links: z.object({
    demo: safeUrlSchema.nullable(),
    repo: safeUrlSchema.nullable(),
  }),
  featured: z.boolean(),
  order: z.number().int().nonnegative(),
  media: z.array(mediaReferenceSchema),
  seo: z.object({
    title: localizedTextSchema.nullable(),
    description: localizedTextSchema.nullable(),
    image: safeUrlSchema.nullable(),
  }),
});

export const noteContentSchema = z.object({
  id: z.string().min(1),
  revision: revisionSchema,
  // The migration baseline contains uppercase/underscore filenames; new admin
  // inputs use the stricter normalized slug schema in the database layer.
  slug: z.string().regex(/^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/),
  title: localizedTextSchema,
  bodyMarkdown: z.string().refine(isSafeMarkdown, MARKDOWN_SAFETY_MESSAGE),
  excerpt: localizedTextSchema,
  order: z.number().int().nonnegative(),
  rawName: z.string().min(1),
  seo: z.object({
    title: localizedTextSchema.nullable(),
    description: localizedTextSchema.nullable(),
  }),
});

export type Revision = z.infer<typeof revisionSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type ProfileContent = z.infer<typeof profileContentSchema>;
export type MediaReference = z.infer<typeof mediaReferenceSchema>;
export type ProjectContent = z.infer<typeof projectContentSchema>;
export type NoteContent = z.infer<typeof noteContentSchema>;

export const publishedRevision = {
  revisionId: "static-published",
  revisionNumber: 1,
  status: "PUBLISHED" as const,
  publishedAt: null,
};
