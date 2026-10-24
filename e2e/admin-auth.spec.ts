import { test, expect } from '@playwright/test';

test.describe('Admin auth', () => {
  test('unauthenticated /admin/products redirects to login with next param', async ({ page }) => {
    await page.goto('/admin/products');

    await page.waitForURL('**/ucet/prihlasenie**', { timeout: 15_000 });
    expect(page.url()).toContain('next=%2Fadmin%2Fproducts');
  });
});
