---
title: "Playwright Page Object Model: a test structure that stays maintainable"
excerpt: "Playwright suites rot past 50 cases because selectors scatter across files. Fix it with the Page Object Model: one class per page, human-readable test files, and a real project layout."
seo_title: "Playwright Page Object Model guide"
seo_description: "Playwright Page Object Model: structure E2E tests so they stay maintainable. Keep locators in page objects with code examples and a real project layout."
order: 16
---

# Playwright Page Object Model: a test structure that stays maintainable

**Short answer:** As suites grow, selectors scatter across files and one UI change breaks ten tests. The Page Object Model (POM) fixes this by collecting each page's elements and actions in a single class, so test files read like human language.

## Environment

- Playwright 1.x + TypeScript
- Read [What is Playwright?](/notes/playwright-thai-guide) first for the basics

## The problem POM solves

Unstructured tests (one change, ten broken files):

```ts
// tests/contact-a.spec.ts
await page.getByLabel('Email').fill('a@example.com');
await page.getByRole('button', { name: 'Send message' }).click();

// tests/contact-b.spec.ts — same selectors, copy-pasted
await page.getByLabel('Email').fill('b@example.com');
await page.getByRole('button', { name: 'Send message' }).click();
```

Rename the email label and you must chase every copy. POM keeps it in one place — one fix, done.

## Recommended project layout

```text
tests/
  pages/
    contact.page.ts      # one page object per page
    notes.page.ts
  fixtures/
    test.ts              # extended base test wiring page objects
  contact.spec.ts        # test files consume fixtures
  notes.spec.ts
```

## Real example: contact page

`tests/pages/contact.page.ts`:

```ts
import { type Locator, type Page } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.messageInput = page.getByLabel('Message');
    this.sendButton = page.getByRole('button', { name: 'Send message' });
    this.successMessage = page.getByText('Message sent');
  }

  async goto() {
    await this.page.goto('/contact');
  }

  async submit(email: string, message: string) {
    await this.emailInput.fill(email);
    await this.messageInput.fill(message);
    await this.sendButton.click();
  }
}
```

`tests/fixtures/test.ts` — wire the page object into the test context:

```ts
import { test as base } from '@playwright/test';
import { ContactPage } from '../pages/contact.page';

type Fixtures = {
  contactPage: ContactPage;
};

export const test = base.extend<Fixtures>({
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
});
export { expect } from '@playwright/test';
```

`tests/contact.spec.ts` — test files read like prose:

```ts
import { test, expect } from './fixtures/test';

test('contact message succeeds', async ({ contactPage }) => {
  await contactPage.goto();
  await contactPage.submit('test@example.com', 'Hello');

  await expect(contactPage.successMessage).toBeVisible();
});
```

## Three rules of a good POM

1. **Locators live in page objects only** — a `getBy*` in a test file means a leak.
2. **Name methods after user actions** — `submit()`, `searchFor()`, not `clickButton()`, so a button-to-link redesign never touches test files.
3. **No `expect` in page objects** — assertions belong to test files; page objects act, they do not judge.

## Common mistakes

1. **God-class page objects** — pages with many sections deserve components (e.g. `SearchBar`, `Pagination`) composed together.
2. **Cross-test state in page objects** — construct them fresh per test via fixtures; never cache data between tests.
3. **POM from day one with 3 tests** — over-engineering. Write plainly first; extract a page object when a selector repeats in a third file.
4. **Test data mixed with locators** — test emails and messages should be method parameters, not class constants.

## References

- Playwright documentation: https://playwright.dev/docs/api/class-test

## Related notes

- [What is Playwright? Start E2E testing with TypeScript for real projects](/notes/playwright-thai-guide)
- [All testing notes](/notes/testing)

---

Author: Napat Pamornsut — [About](/about) · [Projects](/projects) · [All notes](/notes)
