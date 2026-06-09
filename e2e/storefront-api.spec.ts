import { test, expect } from '@playwright/test';

test('GET /api/chat returns provider config', async ({ request }) => {
  const response = await request.get('/api/chat');
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.available_providers).toContain('gemini');
});

test('GET /api/search without query returns empty', async ({ request }) => {
  const response = await request.get('/api/search');
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.results).toEqual([]);
});

test('GET /api/search with query returns results array', async ({ request }) => {
  const response = await request.get('/api/search?q=energy');
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(Array.isArray(json.results)).toBeTruthy();
});

test('POST /api/cart create returns cart id', async ({ request }) => {
  const response = await request.post('/api/cart', {
    data: { action: 'create' },
  });
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.id).toBeTruthy();
  expect(json.checkoutUrl).toBeTruthy();
});

test('favicon is served', async ({ request }) => {
  const response = await request.get('/favicon.ico');
  expect(response.status()).toBe(200);
});
