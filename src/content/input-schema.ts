import { z } from "zod";
import {
  localizedTextSchema,
  mediaReferenceSchema,
  noteContentSchema,
  profileContentSchema,
  projectContentSchema,
} from "./schema";

export const adminSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens");

const safeAdminUrl = z
  .string()
  .trim()
  .refine(
    (value) => value === "#" || value.startsWith("/") || value.startsWith("mailto:") || /^https?:\/\//i.test(value),
    "URL must use http, https, mailto, or a site-relative path",
  );

export const profileDraftSchema = profileContentSchema
  .omit({ id: true, revision: true })
  .extend({
    contact: profileContentSchema.shape.contact.extend({
      links: profileContentSchema.shape.contact.shape.links.extend({
        github: safeAdminUrl.nullable(),
        linkedin: safeAdminUrl.nullable(),
        resume: safeAdminUrl.nullable(),
      }),
    }),
  });

export const projectDraftSchema = projectContentSchema.omit({ id: true, revision: true }).extend({
  slug: adminSlugSchema,
});

export const noteDraftSchema = noteContentSchema.omit({ id: true, revision: true }).extend({
  slug: adminSlugSchema,
});

export const contentDraftSchemas = {
  PROFILE: profileDraftSchema,
  PROJECT: projectDraftSchema,
  NOTE: noteDraftSchema,
} as const;

export type ProfileDraft = z.infer<typeof profileDraftSchema>;
export type ProjectDraft = z.infer<typeof projectDraftSchema>;
export type NoteDraft = z.infer<typeof noteDraftSchema>;

export function parseContentDraft(contentType: keyof typeof contentDraftSchemas, input: unknown) {
  return contentDraftSchemas[contentType].safeParse(input);
}

export const mediaMetadataSchema = mediaReferenceSchema.omit({ id: true, storageKey: true, url: true, order: true }).extend({
  alt: localizedTextSchema,
  caption: localizedTextSchema.nullable(),
});
