import { test, expect } from '@playwright/test';

test.describe('Account experience', () => {
  test('login page renders auth form', async ({ page }) => {
    await page.goto('/ucet/prihlasenie');
    await expect(page.getByRole('heading', { name: 'Môj účet' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Prihlásenie' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Registrácia' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pokračovať cez Google' })).toBeVisible();
  });

  test('account page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/ucet');
    await page.waitForURL('**/ucet/prihlasenie');
    await expect(page).toHaveURL(/\/ucet\/prihlasenie$/);
  });

  test('header links to account page', async ({ page }) => {
    await page.goto('/');
    const accountLink = page.getByRole('link', { name: 'Môj účet' });
    await expect(accountLink).toBeVisible();
    await accountLink.click();
    await page.waitForURL('**/ucet**');
  });
});
