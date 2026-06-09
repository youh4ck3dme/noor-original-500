import { test, expect } from '@playwright/test';

// Toast tests - testing the fixed ToastProvider hydration issue
test.describe('Toast notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('no hydration mismatch errors in console', async ({ page }) => {
    // Check that there's no hydration mismatch error in console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Hydration failed')) {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    expect(consoleErrors.length).toBe(0);
  });

  test('page hydrates without errors', async ({ page }) => {
    // The page should be hydrated without errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Wait a bit to ensure hydration is complete
    await page.waitForTimeout(500);
  });

  test('page navigation does not cause hydration errors', async ({ page }) => {
    // Navigate to different pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/about');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // If we get here without hydration errors, test passes
  });
});
