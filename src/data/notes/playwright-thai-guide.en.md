---
title: "What is Playwright? Start E2E testing with TypeScript for real projects"
excerpt: "Playwright drives real browsers for end-to-end testing. Install it, write your first test, use resilient locators and assertions, and run it on CI like production."
seo_title: "What is Playwright? E2E with TypeScript"
seo_description: "What is Playwright? A practical guide to end-to-end testing with TypeScript: installation, first test, locators, assertions, Trace Viewer, and CI setup."
order: 15
---

# What is Playwright? Start E2E testing with TypeScript for real projects

**Short answer:** Playwright is an end-to-end (E2E) testing tool that drives real browsers (Chromium, Firefox, WebKit) to click, type and assert automatically. It fits TypeScript teams because tests use the same language as the app, run fast, ship a Trace Viewer for replaying failures, and plug into CI easily.

## Environment

- Node.js 18+
- A TypeScript project (works with Next.js out of the box)
- Playwright 1.x (`npm init playwright@latest`)

## Install

```bash
npm init playwright@latest
```

The wizard asks four things; recommended answers:

1. TypeScript — Yes
2. Test folder — `tests` (default)
3. GitHub Actions workflow — Yes (if you use GitHub)
4. Install browsers — Yes

## First test: open a page and check its heading

File `tests/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('homepage shows the correct heading', async ({ page }) => {
  await page.goto('https://napatdev.com/');

  await expect(page).toHaveTitle(/Napat/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

Run:

```bash
npx playwright test
```

View the HTML report:

```bash
npx playwright show-report
```

## Locators: selecting elements that do not break easily

Golden rule — prefer locators in this stability order, most stable first:

```ts
// 1. Best — role + user-visible name (bound to the real UI)
await page.getByRole('button', { name: 'Send message' }).click();

// 2. Good — form labels
await page.getByLabel('Email').fill('test@example.com');

// 3. OK — placeholder / text
await page.getByPlaceholder('Search notes').fill('playwright');

// 4. Avoid — deep CSS/XPath (breaks on every layout change)
// page.locator('div > div:nth-child(3) > button.btn-primary')
```

`getByRole` is best because deleting the button fails the test correctly (a real bug), while merely moving the button keeps it green.

## Frequently used assertions

```ts
// Text appears
await expect(page.getByText('Message sent')).toBeVisible();

// Input value
await expect(page.getByLabel('Email')).toHaveValue('test@example.com');

// URL changed after submit
await expect(page).toHaveURL(/\/success/);

// List count
await expect(page.getByRole('listitem')).toHaveCount(5);
```

Playwright auto-retries: `expect` waits until the condition holds (up to the timeout), so never hand-write `sleep` — this is the main reason Playwright suites are more stable than older tools.

## Replay failures with Trace Viewer

Enable traces once in `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'on-first-retry',
  },
});
```

When the first run fails, you get a step-by-step trace showing each moment — what the page looked like, what was clicked — so you can debug CI failures you cannot watch live.

## Run on CI (GitHub Actions)

A production-ready `.github/workflows/playwright.yml`:

```yaml
name: E2E
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

Chromium alone on CI is enough (and fastest); run Firefox/WebKit on dev machines before merging.

## Common mistakes

1. **Hand-written `sleep` / `waitForTimeout`** — brittle and slow; use auto-retrying `expect`.
2. **Deep layout-coupled selectors** — a small CSS change breaks the suite; use roles/labels.
3. **Coupled tests (test 2 requires test 1 first)** — every test must set up its own state; open a fresh page in `test.beforeEach`.
4. **Unpinned CI browsers** — always `install --with-deps` in the same workflow; never rely on the runner's browsers.

## Next steps

- [Playwright Page Object Model: a test structure that stays maintainable](/notes/playwright-page-object-model)
- [All testing notes](/notes/testing)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
