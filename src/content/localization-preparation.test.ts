import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

it("prepares a locale draft without changing its source, rejects stale hashes and existing output", () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-seo-test-"));
  const snapshot = path.join(folder, "snapshot.json"), manifest = path.join(folder, "manifest.json"), output = path.join(folder, "drafts.json");
  try {
    const source = [{ id: "test-note", revisionId: "revision-1", payload: { slug: "test-note", bodyMarkdown: "# Original" } }];
    fs.writeFileSync(snapshot, JSON.stringify(source));
    const entry = { id: "test-note", bodySha256: createHash("sha256").update("# Original").digest("hex"), translations: { th: "# ไทย" } };
    fs.writeFileSync(manifest, JSON.stringify([entry]));
    const args = ["scripts/prepare-note-localization.mjs", snapshot, manifest, output];
    execFileSync(process.execPath, args, { stdio: "pipe" });
    const result = JSON.parse(fs.readFileSync(output, "utf8"));
    expect(result.drafts[0]).toMatchObject({ expectedRevisionId: "revision-1", payload: { bodyMarkdown: "# Original", bodyMarkdownByLocale: { th: "# ไทย" } } });
    expect(JSON.parse(fs.readFileSync(snapshot, "utf8"))).toEqual(source);
    expect(() => execFileSync(process.execPath, args, { stdio: "pipe" })).toThrow();
    fs.writeFileSync(manifest, JSON.stringify([{ ...entry, bodySha256: "changed" }]));
    expect(() => execFileSync(process.execPath, [...args.slice(0, -1), path.join(folder, "other.json")], { stdio: "pipe" })).toThrow();
  } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});
