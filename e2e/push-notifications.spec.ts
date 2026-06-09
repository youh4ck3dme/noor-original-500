import { test, expect } from '@playwright/test';

test.describe('Push notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('noor_push_dismissed');
      window.localStorage.removeItem('noor_push_subscribed');
    });
  });

  test('shows push prompt on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('push-prompt')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('push-allow')).toBeVisible();
    await expect(page.getByTestId('push-dismiss')).toBeVisible();
  });

  test('dismiss hides prompt and persists in localStorage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('push-prompt')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('push-dismiss').click();
    await expect(page.getByTestId('push-prompt')).toHaveCount(0);

    const dismissed = await page.evaluate(() => window.localStorage.getItem('noor_push_dismissed'));
    expect(dismissed).toBe('1');
  });

  test('POST /api/push/subscribe accepts token payload', async ({ request }) => {
    const response = await request.post('/api/push/subscribe', {
      data: {
        token: `e2e-test-token-${Date.now()}`,
        topics: ['general'],
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });

  test('POST /api/push/send rejects missing secret', async ({ request }) => {
    const response = await request.post('/api/push/send', {
      data: { title: 'Test', body: 'Unauthorized', url: '/' },
    });

    expect(response.status()).toBe(401);
  });
});
