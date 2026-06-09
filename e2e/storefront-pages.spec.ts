import { test, expect } from '@playwright/test';
import { STATIC_PAGES } from './fixtures/routes';

for (const page of STATIC_PAGES) {
  test.describe(`page ${page.path}`, () => {
    test(`returns 200 for ${page.path}`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.path);
      expect(response?.status()).toBe(200);
    });

    test(`shows expected heading on ${page.path}`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await expect(browserPage.getByRole('heading').first()).toBeVisible();
      await expect(browserPage.locator('main')).toContainText(page.heading);
    });

    test(`has storefront header on ${page.path}`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await expect(browserPage.locator('header').getByText('GROWMEDICA').first()).toBeVisible();
    });

    test(`has footer on ${page.path}`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await expect(browserPage.locator('footer').first()).toBeVisible();
    });
  });
}
