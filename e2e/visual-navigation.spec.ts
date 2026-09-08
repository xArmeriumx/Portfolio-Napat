import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`deliberate navigation and readable surfaces at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const path of ['/', '/about', '/th']) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(700);
      expect(new URL(page.url()).pathname).toBe(path);
    }
    await expect(page.locator('.selected-work-row').first()).toBeVisible();
    const selectedLink = page.locator('.selected-work-image').first();
    await expect(selectedLink).toHaveCSS('position', 'relative');
    await selectedLink.click();
    await expect(page.getByRole('button', { name: 'ขยายภาพผลงาน' })).toBeVisible();
    const thumbnails = page.getByRole('button', { name: /^ดูภาพ / });
    if (await thumbnails.count() > 1) {
      await thumbnails.nth(1).click();
      await expect(thumbnails.nth(1)).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: 'ขยายภาพผลงาน' }).click();
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toHaveCount(0);
    await page.goto('/notes/sql-query-examples');
    await expect(page.locator('.notes-reading main')).toHaveCSS('overflow-y', 'visible');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (viewport.width < 1024) {
      await page.getByText('On this page', { exact: true }).first().click();
      await expect(page.locator('details a').first()).toBeVisible();
    }
  });
}
