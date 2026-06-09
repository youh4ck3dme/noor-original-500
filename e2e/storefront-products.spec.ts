import { test, expect } from '@playwright/test';
import { PRODUCT_HANDLES } from './fixtures/routes';

for (const handle of PRODUCT_HANDLES) {
  test.describe(`product ${handle}`, () => {
    test(`PDP loads for /produkty/${handle}`, async ({ page }) => {
      const response = await page.goto(`/produkty/${handle}`);
      expect(response?.status()).toBe(200);
    });

    test(`PDP shows product title for ${handle}`, async ({ page }) => {
      await page.goto(`/produkty/${handle}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test(`PDP has breadcrumb for ${handle}`, async ({ page }) => {
      await page.goto(`/produkty/${handle}`);
      await expect(page.getByLabel('Navigačná cesta')).toBeVisible();
    });

    test(`PDP has add-to-cart area for ${handle}`, async ({ page }) => {
      await page.goto(`/produkty/${handle}`);
      await expect(
        page.getByRole('button', { name: /Do košíka|Vypredané|Pridávam/i }),
      ).toBeVisible();
    });
  });
}

test('homepage links to product pages', async ({ page }) => {
  await page.goto('/');
  const productLink = page.locator('a[href^="/produkty/"]').first();
  await expect(productLink).toBeVisible();
  const href = await productLink.getAttribute('href');
  expect(href).toMatch(/^\/produkty\//);
});
