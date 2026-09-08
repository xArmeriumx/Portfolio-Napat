export function publicAnalyticsPath(path: string): string | null {
  const clean = path.split(/[?#]/)[0];
  return /^\/(?:th\/)?(?:admin|preview|api)(?:\/|$)/.test(clean) ? null : clean;
}

export function interactionEvent(href: string, origin: string, path: string, download = false) {
  if (!publicAnalyticsPath(path)) return null;
  if (/^(mailto:|tel:)/.test(href)) return "contact_click";
  const url = new URL(href, origin);
  if (download || /(?:resume|cv)[^/]*\.(?:pdf|docx?)$/i.test(url.pathname)) return "resume_download";
  if (/^\/(?:th\/)?projects\//.test(path) && url.origin !== origin && /^https?:$/.test(url.protocol)) return "project_outbound_click";
  return null;
}
