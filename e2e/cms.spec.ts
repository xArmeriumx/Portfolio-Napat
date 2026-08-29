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
  test("admin validation, draft isolation, exact preview, publish, and derived consumers", async ({ page, request }) => {
    test.skip(!adminEmail || !adminPassword || !allowMutations, "Set CMS_E2E_ADMIN_EMAIL, CMS_E2E_ADMIN_PASSWORD, and CMS_E2E_ALLOW_MUTATIONS=true");
    await signIn(page);

    let originalName = "";
    let originalGithub = "";
    let publishedDraftName = "";
    try {
      await page.goto("/admin/profile");
      const nameField = page.getByLabel("Name EN");
      const githubField = page.getByLabel("GitHub");
      originalName = await nameField.inputValue();
      originalGithub = await githubField.inputValue();
      publishedDraftName = `${originalName} E2E ${Date.now()}`;

      await githubField.fill("javascript:alert(1)");
      await page.getByRole("button", { name: "Save Draft" }).click();
      await expect(page.getByRole("alert")).toContainText("ตรวจสอบข้อมูล");

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
        await page.getByLabel("GitHub").fill(originalGithub);
        await page.getByRole("button", { name: "Save Draft" }).click();
        await expect(page.getByRole("status")).toContainText("บันทึก Draft");
        await page.getByRole("button", { name: "Publish" }).click();
        await expect(page.getByRole("status")).toContainText("เผยแพร่ revision");
      }
    }
  });
});
