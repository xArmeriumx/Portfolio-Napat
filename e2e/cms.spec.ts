import { expect, test } from "@playwright/test";

const adminEmail = process.env.CMS_E2E_ADMIN_EMAIL;
const adminPassword = process.env.CMS_E2E_ADMIN_PASSWORD;
const allowMutations = process.env.CMS_E2E_ALLOW_MUTATIONS === "true";

async function signIn(page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail || "");
  await page.getByLabel("Password").fill(adminPassword || "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
}

test.describe("Portfolio CMS published lifecycle", () => {
  test("public routes expose published content and derived consumers", async ({ page, request }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Napat Pamornsut|Napatdev/i);
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /\/api\/og\?/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /https:\/\/napatdev\.com\/?$/);

    const ogResponse = await request.get("/api/og?kind=site");
    expect(ogResponse.ok()).toBeTruthy();
    expect(ogResponse.headers()["content-type"]).toContain("image/png");

    const robots = await request.get("/robots.txt");
    const robotsText = await robots.text();
    expect(robotsText).toContain("Disallow: /admin");
    expect(robotsText).toContain("Disallow: /preview");
    expect(robotsText).toContain("Sitemap: https://napatdev.com/sitemap.xml");

    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
    const projectLink = page.getByRole("link", { name: /View .*case study/i }).first();
    await expect(projectLink).toBeVisible();
    const projectHref = await projectLink.getAttribute("href");
    expect(projectHref).toMatch(/^\/projects\//);
    await page.goto(projectHref || "/projects");
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);

    await page.goto("/notes");
    await expect(page.getByRole("heading", { name: "Developer Notes", exact: true })).toBeVisible();
    const noteLink = page.getByRole("link", { name: /Read note/i }).first();
    await expect(noteLink).toBeVisible();
    const noteHref = await noteLink.getAttribute("href");
    expect(noteHref).toMatch(/^\/notes\//);
    await page.goto(noteHref || "/notes");
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);

    await page.goto("/search?q=TypeScript");
    await expect(page.getByRole("heading", { name: /Search Napatdev/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("TypeScript");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain("https://napatdev.com/projects/");
    expect(sitemapText).toContain("https://napatdev.com/notes/");
  });

  test("admin validation, draft isolation, exact preview, publish, and derived consumers", async ({ page, request }) => {
    test.skip(!adminEmail || !adminPassword || !allowMutations, "Set CMS_E2E_ADMIN_EMAIL, CMS_E2E_ADMIN_PASSWORD, and CMS_E2E_ALLOW_MUTATIONS=true");
    await signIn(page);

    let originalName = "";
    let originalGithub = "";
    let publishedDraftName = "";
    try {
      await page.goto("/admin/profile");
      const nameField = page.getByLabel("Name EN");
      const githubField = page.getByLabel("GitHub", { exact: true });
      originalName = await nameField.inputValue();
      originalGithub = await githubField.inputValue();
      publishedDraftName = `${originalName} E2E ${Date.now()}`;

      await githubField.fill("javascript:alert(1)");
      await page.getByRole("button", { name: "Save Draft" }).click();
      await expect(page.locator('p[role="alert"]')).toContainText("ตรวจสอบข้อมูล");

      await githubField.fill(originalGithub);
      await nameField.fill(publishedDraftName);
      await page.getByRole("button", { name: "Save Draft" }).click();
      await expect(page.getByRole("status")).toContainText("บันทึก Draft");

      await page.goto("/");
      await expect(page.locator("body")).not.toContainText(publishedDraftName);

      await page.goto("/admin/profile");
      const previewPromise = page.waitForEvent("popup");
      await page.getByRole("button", { name: "Preview exact Draft" }).click();
      const preview = await previewPromise;
      await preview.waitForLoadState("domcontentloaded");
      await expect(preview).toHaveURL(/\/preview\/profile\?token=/);
      await expect(preview.locator("body")).toContainText(publishedDraftName);
      await preview.close();

      await page.getByRole("button", { name: "Publish" }).click();
      await expect(page.getByRole("status")).toContainText("เผยแพร่ revision");

      await page.goto("/");
      await expect(page.locator("body")).toContainText(publishedDraftName);
      await expect(page).toHaveTitle(new RegExp(publishedDraftName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(jsonLd.join("\n")).toContain(publishedDraftName);

      const sitemap = await request.get("/sitemap.xml");
      expect(sitemap.ok()).toBeTruthy();
      expect(await sitemap.text()).toContain("https://napatdev.com/");
    } finally {
      if (originalName) {
        await page.goto("/admin/profile");
        await page.getByLabel("Name EN").fill(originalName);
        await page.getByLabel("GitHub", { exact: true }).fill(originalGithub);
        await page.getByRole("button", { name: "Save Draft" }).click();
        await expect(page.getByRole("status")).toContainText("บันทึก Draft");
        await page.getByRole("button", { name: "Publish" }).click();
        await expect(page.getByRole("status")).toContainText("เผยแพร่ revision");
      }
      await page.goto("/admin");
      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });
});
