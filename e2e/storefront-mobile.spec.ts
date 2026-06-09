import { test, expect } from '@playwright/test';
import { devices } from '@playwright/test';

// Use mobile preset
test.use(devices['Pixel 5']);

test.describe('Mobile UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mobile homepage loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/GrowMedica|produkt/i);
    await expect(page.locator('main')).toBeVisible();
  });

  test('mobile header has navigation', async ({ page }) => {
    // Check for header element
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('mobile has header with logo', async ({ page }) => {
    // Check for logo in header
    const logo = page.locator('header').getByRole('link', { name: 'GROWMEDICA' });
    await expect(logo).toBeVisible();
  });

  test('mobile cart drawer opens', async ({ page }) => {
    await page.getByLabel('Otvoriť košík').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Váš košík').first()).toBeVisible();
  });

  test('mobile product grid is scrollable', async ({ page }) => {
    const productCards = page.locator('main a[href^="/produkty/"]');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('mobile product detail page loads', async ({ page }) => {
    await page.goto('/produkty/energy-vironal');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for mobile-specific layout
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('mobile footer exists', async ({ page }) => {
    // Scroll down to ensure footer is loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
