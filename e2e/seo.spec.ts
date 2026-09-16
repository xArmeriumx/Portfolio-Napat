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
  test("bilingual notes collection is indexable in both locales", async ({ page }) => {
    await page.goto('/notes');
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://napatdev.com/notes',
    );

    await page.goto('/th/notes');
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://napatdev.com/th/notes',
    );
  });

  test("Thai-only note permanently redirects from the English route to its real locale", async ({ request }) => {
    const response = await request.get('/notes/sql-query-examples', { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers().location).toBe('/th/notes/sql-query-examples');
  });

  test("Thai core pages render localized primary content", async ({ page }) => {
    await page.goto('/th/about');
    await expect(page.getByRole('heading', { level: 1, name: /ณภัทร ภมรสูตร/ })).toBeVisible();
    await expect(page.getByText('การศึกษา', { exact: true })).toBeVisible();
    await expect(page.getByText('กรุงเทพฯ ประเทศไทย', { exact: true })).toHaveCount(2);

    await page.goto('/th/projects');
    await expect(page.getByRole('heading', { level: 1, name: 'โปรเจคพัฒนาเว็บและทดสอบซอฟต์แวร์' })).toBeVisible();
    await expect(page.getByText('ผลงานเด่น', { exact: true })).toBeVisible();

    await page.goto('/th/contact');
    await expect(page.getByText('กรุงเทพฯ ประเทศไทย', { exact: true })).toBeVisible();
    await expect(page.getByText('ดูโปรเจค', { exact: true })).toBeVisible();

    await page.goto('/th/notes/odoo');
    await expect(page.getByText('อ่านโน้ต', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('โน้ตทั้งหมด', { exact: true })).toBeVisible();
  });

  test("bilingual SEO note is canonical, indexable and advertises both locales", async ({ page }) => {
    await page.goto('/th/notes/odoo-automated-action-store-attr');

    await expect(
      page.getByRole('heading', { level: 1, name: /Odoo Automated Action.*STORE_ATTR/i }),
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://napatdev.com/th/notes/odoo-automated-action-store-attr',
    );
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[hreflang="th"]')).toHaveAttribute(
      'href',
      'https://napatdev.com/th/notes/odoo-automated-action-store-attr',
    );
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      'https://napatdev.com/notes/odoo-automated-action-store-attr',
    );
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      'https://napatdev.com/notes/odoo-automated-action-store-attr',
    );
  });

  test("sitemap includes both locales for bilingual SEO clusters", async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);

    const xml = await response.text();
    expect(xml).toContain(
      'https://napatdev.com/th/notes/odoo-automated-action-store-attr',
    );
    expect(xml).toContain('https://napatdev.com/th/notes/odoo');
    expect(xml).toContain('https://napatdev.com/th/notes/testing');
    expect(xml).toContain('https://napatdev.com/th/notes/prisma');
    expect(xml).toContain('<loc>https://napatdev.com/th/notes</loc>');
    expect(xml).toContain('<loc>https://napatdev.com/notes</loc>');
    expect(xml).toContain(
      '<loc>https://napatdev.com/notes/odoo-automated-action-store-attr</loc>',
    );
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
