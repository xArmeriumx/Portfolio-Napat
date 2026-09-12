import { test, expect } from "@playwright/test";

test.describe("public SEO", () => {
  test("Thai homepage keeps its URL language and main content is visible without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${baseURL}/th`);
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: 'ดูผลงาน', exact: true })).toHaveAttribute('href', '/th/projects');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://napatdev.com/th');
    await context.close();
  });
  test("home titles reinforce Napatdev and the localized personal name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Napat Pamornsut.*Napatdev/);

    await page.goto("/th");
    await expect(page).toHaveTitle(/Napatdev.*ณภัทร ภมรสูตร/);
  });

  test("stored language cannot override an English URL", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('language', 'th'));
    await page.goto('/about');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://napatdev.com/about');
  });
  test("404 and search do not advertise indexable alternate pages", async ({ request }) => {
    for (const path of ['/seo-test-not-a-page', '/th/seo-test-not-a-page']) {
      const response = await request.get(path);
      expect(response.status()).toBe(404);
      expect(await response.text()).toContain('noindex');
    }
    const search = await request.get('/search?q=secret');
    const html = await search.text();
    expect(html).toContain('noindex');
    expect(html).not.toMatch(/<link[^>]+hreflang=/);
  });
  test("legacy note remains readable, has one H1 and crawlable navigation", async ({ page }) => {
    await page.goto('/notes/sql-query-examples');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByRole('status')).toContainText('translation');
    expect(await page.locator('a[href^="/notes/"]').count()).toBeGreaterThan(0);
  });
  test("public graph on Thai about uses Thai page URL and one stable person entity", async ({ page }) => {
    await page.goto('/th/about');
    const data = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = data.flatMap(text => JSON.parse(text)['@graph']);
    expect(nodes.find(n => n['@type'] === 'ProfilePage').url).toBe('https://napatdev.com/th/about');
    expect(nodes.find(n => n['@type'] === 'Person')['@id']).toBe('https://napatdev.com/#person');
  });  test("legacy note slugs permanently redirect to clean lowercase URLs", async ({ request }) => {
    const response = await request.get("/notes/NEXTJS_ARCHITECTURE", { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers().location).toBe("/notes/nextjs-app-router-guide");
  });

  test("canonical Next.js note loads without starting AI challenges in the background", async ({ page }) => {
    const backgroundAiRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("challenges.cloudflare.com/turnstile") || url.includes("/api/summary")) {
        backgroundAiRequests.push(url);
      }
    });

    await page.goto("/notes/nextjs-app-router-guide");
    await expect(page.getByRole("heading", { level: 1, name: /Next\.js Mastery/i })).toBeVisible();

    // The previous implementation started AI/Turnstile automatically after 3.5s.
    await page.waitForTimeout(3900);
    expect(backgroundAiRequests).toEqual([]);
  });

  test("homepage expertise content is rendered without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(baseURL || "/");
    await expect(page.getByRole("heading", { name: "Technologies for building and testing reliable software" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Read developer notes/i })).toHaveAttribute("href", "/notes");
    await context.close();
  });


});
