import { test, expect } from '@playwright/test';
import { FOOTER_LINKS, HEADER_LINKS } from './fixtures/routes';

for (const href of HEADER_LINKS) {
  test(`header link ${href} navigates successfully`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const label = href === '/about' ? 'O nás' : 'Magazín';
    await page.getByRole('navigation').getByRole('link', { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
}

for (const href of FOOTER_LINKS) {
  test(`footer route ${href} is reachable`, async ({ page }) => {
    const response = await page.goto(href);
    expect(response?.status()).toBe(200);
  });
}

test('logo navigates to homepage', async ({ page }) => {
  await page.goto('/about');
  await page.locator('header').getByRole('link', { name: 'GROWMEDICA' }).click();
  await expect(page).toHaveURL('/');
});

test('404 page shows not found state', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist-xyz');
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/nenájdená|not found/i).first()).toBeVisible();
});
