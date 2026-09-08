import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { noteDraftSchema } from "./input-schema";
it("editorial payloads are valid CMS drafts with distinct reviewed-language slots", () => {
  const folder = path.resolve("docs/seo/content");
  const files = fs.readdirSync(folder).filter(file => file.endsWith(".json"));
  expect(files).toHaveLength(4);
  for (const file of files) {
    const draft = JSON.parse(fs.readFileSync(path.join(folder, file), "utf8"));
    const payload = noteDraftSchema.parse(draft.payload);
    expect(draft.status).toBe("DRAFT_NOT_PUBLISHED");
    expect(payload.bodyMarkdownByLocale.en).not.toBe(payload.bodyMarkdownByLocale.th);
    expect(payload.bodyMarkdownByLocale.en.length).toBeGreaterThan(500);
    expect(payload.bodyMarkdownByLocale.th.length).toBeGreaterThan(500);
  }
});
