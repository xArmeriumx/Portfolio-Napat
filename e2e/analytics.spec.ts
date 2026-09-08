import { test, expect } from "@playwright/test";

test("analytics waits for consent, deduplicates pageviews and excludes private URLs", async ({ page }) => {
  const requests: string[] = [];
  await page.route('https://www.googletagmanager.com/**', async route => {
    requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* mocked GA runtime: no external collection */' });
  });
  await page.goto('/contact?email=do-not-send@example.com#private');
  const allow = page.getByRole('button', { name: 'Allow analytics', exact: true });
  test.skip(await allow.count() === 0, 'Run local server with NEXT_PUBLIC_GA_MEASUREMENT_ID=G-SEO1234 (Google requests are mocked).');
  expect(requests).toHaveLength(0);
  await allow.click();
  await expect.poll(() => requests.length).toBe(1);
  const events = () => page.evaluate(() => (window.dataLayer || []).map(entry => Array.from(entry as ArrayLike<unknown>)));
  await expect.poll(async () => (await events()).filter(entry => entry[1] === 'page_view').length).toBe(1);
  await page.evaluate(() => document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a[href^="mailto:"]')) event.preventDefault();
  }));
  await page.locator('a[href^="mailto:"]:visible').first().click();
  await expect.poll(async () => (await events()).filter(entry => entry[1] === 'contact_click').length).toBe(1);
  await page.locator('a[href="/about"]:visible').first().click();
  await expect.poll(async () => (await events()).filter(entry => entry[1] === 'page_view').length).toBe(2);
  expect(JSON.stringify(await events())).not.toContain('do-not-send');
  expect(JSON.stringify(await events())).not.toContain('#private');
  await page.getByRole('button', { name: 'Disable analytics', exact: true }).click();
  await page.waitForLoadState();
  await expect(page.getByRole('button', { name: 'Enable analytics', exact: true })).toBeVisible();
  expect(requests).toHaveLength(1);
  await page.evaluate(() => localStorage.setItem('portfolio-analytics-consent', 'granted'));
  await page.goto('/admin/login?token=do-not-send');
  expect(requests).toHaveLength(1);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});
