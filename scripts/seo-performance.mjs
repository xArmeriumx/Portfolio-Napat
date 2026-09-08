/* global process, console, PerformanceObserver, performance, window */
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'https://napatdev.com';
const output = process.argv[3];
const browser = await chromium.launch();
const rows = [];
for (const mobile of [true, false]) {
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  for (const path of ['/', '/about', '/projects', '/projects/shop-inventory-management', '/notes', '/notes/nextjs-app-router-guide']) for (const prefix of ['', '/th']) {
    const route = prefix + (prefix && path === '/' ? '' : path);
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.seoMetrics = { lcp: null, cls: 0 };
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.seoMetrics.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.seoMetrics.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    try {
      const response = await page.goto(base + route, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(1000);
      const metrics = await page.evaluate(() => ({ ...window.seoMetrics, ttfb: performance.getEntriesByType('navigation')[0]?.responseStart, scriptTransferBytes: performance.getEntriesByType('resource').filter(e => e.initiatorType === 'script').reduce((n,e) => n + e.transferSize, 0) }));
      rows.push({ route, device: mobile ? 'mobile viewport' : 'desktop viewport', status: response.status(), ...metrics });
    } catch(error) { rows.push({ route, device: mobile ? 'mobile viewport' : 'desktop viewport', error: error.message.slice(0,150) }); }
    await page.close();
  }
  await context.close();
}
await browser.close();
const report = { date: new Date().toISOString(), base, method: 'Single lab sample per route, Chromium, fresh page, no CPU/network throttle, 1s after load. Viewport simulation only; no INP interaction sample. CLS accumulated in this observation window. Not Lighthouse or CrUX.', rows };
if(output) await writeFile(output, JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ output, samples: rows.length, failures: rows.filter(r=>r.error).length }));
