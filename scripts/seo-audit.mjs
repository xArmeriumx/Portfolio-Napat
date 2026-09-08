import process from "node:process";
import console from "node:console";
import { URL } from "node:url";
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile } from 'node:fs/promises';
const exec = promisify(execFile);
const base = new URL(process.argv[2] || 'https://napatdev.com');
const output = process.argv[3];
const decode = (s) => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'");
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(([,k,v]) => [k.toLowerCase(), decode(v)]));
const plain = (s) => decode(s.replace(/<[^>]*>/g, '').trim());
async function fetchUrl(url) {
  try {
    const { stdout } = await exec('curl', ['-sS', '-L', '--max-redirs', '5', '--max-time', '30', '-A', 'PortfolioSEOAudit/1.0', '-w', '\n%{json}', url], { maxBuffer: 8 * 1024 * 1024 });
    const split = stdout.lastIndexOf('\n');
    const info = JSON.parse(stdout.slice(split + 1));
    return { body: stdout.slice(0, split), status: info.http_code, finalUrl: info.url_effective, redirects: info.num_redirects, seconds: info.time_total };
  } catch (error) { return { error: error.message.slice(0, 250), status: 0, body: '' }; }
}
const sitemap = await fetchUrl(new URL('/sitemap.xml', base).href);
const robots = await fetchUrl(new URL('/robots.txt', base).href);
const sitemapPaths = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/gs)].map(([,url]) => new URL(decode(url)).pathname);
const queue = [...new Set([...sitemapPaths, '/', '/th', '/about', '/th/about', '/projects', '/th/projects', '/notes', '/th/notes', '/contact', '/th/contact', '/search', '/th/search', '/seo-audit-missing-page', '/th/seo-audit-missing-page'])];
const results = [];
const visited = new Set();
while (queue.length && visited.size < 150) {
  const paths = queue.splice(0, 4).filter((path) => !visited.has(path));
  paths.forEach((path) => visited.add(path));
  await Promise.all(paths.map(async (path) => {
    const result = await fetchUrl(new URL(path, base).href);
    const { body, ...status } = result;
    const tags = [...body.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(([tag]) => attrs(tag));
    const links = [...body.matchAll(/<a\b[^>]*>/gi)].map(([tag]) => attrs(tag).href).filter(Boolean).flatMap((href) => {
      try { const u = new URL(href, base); return u.origin === base.origin && !u.search ? [u.pathname] : []; } catch { return []; }
    });
    for (const link of links) if (!visited.has(link) && !queue.includes(link) && !/^\/(admin|preview|api)(\/|$)/.test(link) && !/\.[a-z0-9]+$/i.test(link)) queue.push(link);
    const schemas = [...body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(([,json]) => { try { return JSON.parse(json); } catch { return { invalidJson: true }; } });
    results.push({ path, ...status, lang: attrs(body.match(/<html\b[^>]*>/i)?.[0] || '').lang, title: plain(body.match(/<title>(.*?)<\/title>/s)?.[1] || ''), description: tags.find(t => t.name === 'description')?.content, robots: tags.filter(t => ['robots','googlebot'].includes(t.name)).map(t => t.content), canonical: tags.find(t => t.rel === 'canonical')?.href, alternates: tags.filter(t => t.hreflang).map(t => ({ locale: t.hreflang, url: t.href })), h1: [...body.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gs)].map(([,h]) => plain(h)), imagesMissingAlt: [...body.matchAll(/<img\b[^>]*>/gi)].filter(([tag]) => !('alt' in attrs(tag))).length, schemaTypes: schemas.flatMap(s => (s['@graph'] || [s]).map(n => n['@type'] || 'INVALID')), schemaPages: schemas.flatMap(s => s['@graph'] || [s]).filter(n => ['TechArticle','Article','WebPage','ProfilePage','AboutPage','ContactPage','CollectionPage'].includes(n['@type'])).map(n => ({ type: n['@type'], url: n.url, language: n.inLanguage })), links: [...new Set(links)] });
  }));
}
const findings = [];
const indexable = row => row.status === 200 && !row.redirects && !row.robots.some(r => r.toLowerCase().includes('noindex'));
const normalizedUrl = url => { try { return new URL(url, base).href; } catch { return null; } };
const pathOf = url => { try { return new URL(url, base).pathname; } catch { return null; } };
for (const row of results) {
  if (indexable(row)) {
    if (!row.canonical) findings.push(`${row.path}: missing canonical`);
    if (!row.description) findings.push(`${row.path}: missing description`);
    if (!row.title) findings.push(`${row.path}: missing title`);
    if (row.h1.length !== 1) findings.push(`${row.path}: ${row.h1.length} H1s`);
    if (row.imagesMissingAlt) findings.push(`${row.path}: ${row.imagesMissingAlt} images without alt attributes`);
    if (row.schemaTypes.includes('INVALID')) findings.push(`${row.path}: invalid JSON-LD`);
    if (row.canonical && pathOf(row.canonical) !== row.path) findings.push(`${row.path}: canonical points to ${row.canonical}`);
    for (const alternate of row.alternates) {
      const target = results.find(r => r.path === pathOf(alternate.url));
      if (!target || !indexable(target)) findings.push(`${row.path}: alternate ${alternate.locale} is not a crawled direct indexable 200`);
      else {
        if (normalizedUrl(target.canonical) !== normalizedUrl(alternate.url)) findings.push(`${row.path}: alternate ${alternate.locale} does not match target canonical`);
        if (alternate.locale !== 'x-default' && target.lang !== alternate.locale) findings.push(`${row.path}: alternate language does not match target HTML lang`);
        if (!target.alternates.some(a => normalizedUrl(a.url) === normalizedUrl(row.canonical))) findings.push(`${row.path}: alternate ${alternate.locale} is not reciprocal`);
      }
    }
    for (const node of row.schemaPages) if (node.url && normalizedUrl(node.url) !== normalizedUrl(row.canonical)) findings.push(`${row.path}: ${node.type} schema URL differs from canonical`);
  }
  if (sitemapPaths.includes(row.path) && !indexable(row)) findings.push(`${row.path}: in sitemap but not a direct indexable 200`);
  for (const link of row.links) {
    const target = results.find(r => r.path === link);
    if (target?.status >= 400 && !link.startsWith('/cdn-cgi/')) findings.push(`${row.path}: broken link ${link} (${target.status})`);
  }
}
for (const field of ['title','description']) {
  const groups = new Map();
  for (const row of results.filter(indexable)) if (row[field]) groups.set(row[field], [...(groups.get(row[field]) || []), row.path]);
  for (const paths of groups.values()) if (paths.length > 1) findings.push(`Duplicate ${field}: ${paths.join(', ')}`);
}
for (const path of sitemapPaths) if (!results.some(r => r.path !== path && r.links.includes(path))) findings.push(`${path}: no inbound anchor found in crawl`);
const report = { capturedAt: new Date().toISOString(), base: base.href, limitations: ['HTTP crawl; not Search Console indexing evidence or a browser performance score', 'Maximum 150 HTML pages; private routes excluded', 'CDN email-protection paths are recorded but excluded from authored broken-link findings', 'Image downloads, field indexing and external schema validators are separate checks'], sitemap: { status: sitemap.status, paths: sitemapPaths }, robots: { status: robots.status, body: robots.body }, results: results.sort((a,b) => a.path.localeCompare(b.path)), findings: [...new Set(findings)] };
if (output) await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ pages: results.length, sitemapStatus: sitemap.status, findings: report.findings, output }, null, 2));
