import { test, expect } from '@playwright/test';
import { PRODUCT_HANDLES } from './fixtures/routes';

const PDP_HANDLE = process.env.E2E_PDP_HANDLE || PRODUCT_HANDLES[0];
const AUTH_ENABLED =
  process.env.E2E_AUTH === '1' &&
  Boolean(process.env.E2E_TEST_EMAIL) &&
  Boolean(process.env.E2E_TEST_PASSWORD);

test.describe('Customer journey (smoke)', () => {
  test('PDP tabs switch and show tab panels', async ({ page }) => {
    await page.goto(`/produkty/${PDP_HANDLE}`);

    const compositionTab = page.getByRole('tab', { name: 'Zloženie' });
    await expect(compositionTab).toBeVisible();
    await compositionTab.click();
    await expect(page.getByRole('tabpanel')).toBeVisible();

    const dosageTab = page.getByRole('tab', { name: 'Dávkovanie' });
    await dosageTab.click();
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('PDP rapid tab switching stays stable (Framer Motion)', async ({ page }) => {
    await page.goto(`/produkty/${PDP_HANDLE}`);

    const tabs = ['Popis', 'Zloženie', 'Dávkovanie', 'Laboratórne testy'];
    for (let round = 0; round < 3; round += 1) {
      for (const tabName of tabs) {
        const tab = page.getByRole('tab', { name: tabName });
        if (await tab.isVisible()) {
          await tab.click();
        }
      }
    }

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await expect(page.getByRole('button', { name: /Do košíka|Vypredané|Pridávam/i })).toBeVisible();
  });

  test('reviews section shows login CTA when unauthenticated', async ({ page }) => {
    await page.goto(`/produkty/${PDP_HANDLE}`);

    await expect(page.getByRole('heading', { name: 'Recenzie zákazníkov' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'prihláste do účtu' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Odoslať recenziu' })).toHaveCount(0);
  });

  test('homepage shows AI recommendations section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'AI odporúčania' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Prihláste sa pre personalizované odporúčania/i }),
    ).toBeVisible();
  });
});

test.describe('Customer journey @auth', () => {
  test.beforeEach(() => {
    test.skip(
      !AUTH_ENABLED,
      'Set E2E_AUTH=1 with E2E_TEST_EMAIL and E2E_TEST_PASSWORD (see app/lib/ai/testovaciucet.md)',
    );
  });

  test('login, save fitness goals, verify AI widget and submit review', { tag: '@auth', timeout: 60_000 }, async ({
    page,
  }) => {
    const email = process.env.E2E_TEST_EMAIL!;
    const password = process.env.E2E_TEST_PASSWORD!;

    await page.goto('/ucet/prihlasenie');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Heslo').fill(password);
    await page.getByRole('button', { name: 'Prihlásiť sa' }).click();

    await page.waitForURL('**/ucet', { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Môj účet' })).toBeVisible();

    await page.getByRole('button', { name: 'Moje objednávky' }).click();
    await expect(page.getByRole('heading', { name: 'Moje objednávky' })).toBeVisible();

    await page.getByRole('button', { name: 'Fitness ciele' }).click();
    const regeneraciaCheckbox = page.getByRole('checkbox', { name: 'Regenerácia' });
    await regeneraciaCheckbox.check();
    await page.getByRole('button', { name: 'Uložiť profil' }).click();
    await expect(page.getByText('Profil bol uložený.')).toBeVisible({ timeout: 10_000 });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'AI odporúčania' })).toBeVisible();

    await page.goto(`/produkty/${PDP_HANDLE}`);
    await expect(page.getByRole('heading', { name: 'Recenzie zákazníkov' })).toBeVisible();

    const reviewBody = `E2E recenzia ${Date.now()}`;
    await page.getByLabel('Vaša recenzia').fill(reviewBody);
    await page.getByRole('button', { name: 'Odoslať recenziu' }).click();
    await expect(page.getByText('Ďakujeme za recenziu.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(reviewBody)).toBeVisible();
  });
});
