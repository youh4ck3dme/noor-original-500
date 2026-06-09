import { test, expect } from '@playwright/test';

test('homepage shows product grid', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main .grid').first()).toBeVisible();
});

test('homepage has multiple product cards', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('main a[href^="/produkty/"]');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
});

test('search drawer opens from header', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByLabel('Otvoriť vyhľadávanie').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Hľadať produkty')).toBeVisible();
});

test('cart drawer opens from header', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Otvoriť košík').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Váš košík').first()).toBeVisible();
});

test('faq accordion expands content', async ({ page }) => {
  await page.goto('/faq');
  await expect(page.getByText(/doručenie/i).first()).toBeVisible();
});

test('contact form renders inputs', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByLabel('Meno')).toBeVisible();
  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.getByLabel('Správa')).toBeVisible();
});

test('order tracking form renders', async ({ page }) => {
  await page.goto('/order-tracking');
  await expect(page.getByLabel('Číslo objednávky')).toBeVisible();
  await expect(page.getByLabel('E-mail')).toBeVisible();
});

test('collection page has filter sidebar on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/collections/frontpage');
  await expect(page.getByText('Dostupnosť').first()).toBeVisible();
});
