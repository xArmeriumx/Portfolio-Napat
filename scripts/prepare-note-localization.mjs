/* global process, console */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// Offline only. Input: [{id, revisionId, payload}]. Manifest: [{id, bodySha256, translations:{en,th}}].
// Output payloads must pass the normal authenticated CMS draft endpoint before publishing.
const [inputFile, manifestFile, outputFile] = process.argv.slice(2);
if (!inputFile || !manifestFile || !outputFile) throw new Error('Usage: node scripts/prepare-note-localization.mjs snapshot.json reviewed-manifest.json drafts.json');
const notes = JSON.parse(await readFile(inputFile, 'utf8'));
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
const inventory = notes.map(note => ({ id: note.id, revisionId: note.revisionId, slug: note.payload.slug, bodySha256: createHash('sha256').update(note.payload.bodyMarkdown).digest('hex'), locales: Object.keys(note.payload.bodyMarkdownByLocale || {}) }));
const drafts = [];
for (const entry of manifest) {
  const note = notes.find(note => note.id === entry.id);
  if (!note) throw new Error(`Unknown note ${entry.id}`);
  if (inventory.find(note => note.id === entry.id).bodySha256 !== entry.bodySha256) throw new Error(`Content changed for ${entry.id}; review a fresh snapshot`);
  if (!entry.translations || Object.keys(entry.translations).some(locale => !['en','th'].includes(locale))) throw new Error('Only explicitly reviewed en/th translations are allowed');
  for (const body of Object.values(entry.translations)) if (typeof body !== 'string' || !body.trim()) throw new Error('A translation must contain Markdown');
  drafts.push({ id: note.id, expectedRevisionId: note.revisionId, payload: { ...note.payload, bodyMarkdownByLocale: { ...note.payload.bodyMarkdownByLocale, ...entry.translations } } });
}
await writeFile(outputFile, JSON.stringify({ mode: 'offline-dry-run', inventory, drafts }, null, 2)+'\n', { flag: 'wx' });
console.log(JSON.stringify({ inventoryCount: inventory.length, preparedDrafts: drafts.length, outputFile, databaseWrites: 0 }));
