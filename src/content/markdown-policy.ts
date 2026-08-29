const fencedCodePattern = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;
const inlineCodePattern = /`[^`\n]*`/g;

const unsafeMarkdownPatterns = [
  /<!--[\s\S]*?-->/i,
  /<\s*\/?\s*(?:script|iframe|object|embed|style|svg|math|link|meta|base|form|input|textarea|select|button|video|audio|source|img)\b/i,
  /\bon[a-z]+\s*=/i,
  /\]\(\s*(?:javascript|vbscript|data):/i,
  /<[^>]+\b(?:href|src)\s*=\s*["']?\s*(?:javascript|vbscript|data):/i,
];

export const MARKDOWN_SAFETY_MESSAGE = "Markdown contains unsafe HTML, event handlers, or URL schemes";

export function isSafeMarkdown(markdown: string) {
  const prose = markdown.replace(fencedCodePattern, " ").replace(inlineCodePattern, " ");
  return !unsafeMarkdownPatterns.some((pattern) => pattern.test(prose));
}
