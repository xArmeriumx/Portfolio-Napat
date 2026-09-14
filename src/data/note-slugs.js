export const NOTE_SLUG_ALIASES = {
  "nextjs-app-router-guide": "NEXTJS_ARCHITECTURE",
  "typescript-reference-guide": "TYPESCRIPT_REFERENCE",
  "sql-basics": "sql_basics_with_examples_easy",
  "sql-query-examples": "sql_code_and_response_tables",
};

export function canonicalNoteSlug(slug) {
  if (NOTE_SLUG_ALIASES[slug]) return slug;
  return (
    Object.entries(NOTE_SLUG_ALIASES).find(([, legacySlug]) => legacySlug === slug)?.[0] ||
    slug
  );
}

export function legacyNoteSlug(slug) {
  return NOTE_SLUG_ALIASES[canonicalNoteSlug(slug)] || null;
}
