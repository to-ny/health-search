import { test, expect } from '@playwright/test';

test('search API returns results', async ({ request }) => {
  const response = await request.get('/api/search?q=paracetamol&lang=en');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data).toHaveProperty('results');
  expect(data).toHaveProperty('totalCount');
  expect(Array.isArray(data.results)).toBeTruthy();
});

test('search API rejects short query', async ({ request }) => {
  const response = await request.get('/api/search?q=a&lang=en');
  expect(response.status()).toBe(400);

  const data = await response.json();
  expect(data.error.code).toBe('QUERY_TOO_SHORT');
});

test('search API filters by type', async ({ request }) => {
  const response = await request.get('/api/search?q=paracetamol&lang=en&types=amp');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  for (const result of data.results) {
    expect(result.entityType).toBe('amp');
  }
});

test('search API rejects invalid type', async ({ request }) => {
  const response = await request.get('/api/search?q=test&lang=en&types=invalid');
  expect(response.status()).toBe(400);
});

test('search API supports pagination', async ({ request }) => {
  const page1 = await request.get('/api/search?q=para&lang=en&limit=5&offset=0');
  const page2 = await request.get('/api/search?q=para&lang=en&limit=5&offset=5');

  expect(page1.ok()).toBeTruthy();
  expect(page2.ok()).toBeTruthy();

  const data1 = await page1.json();
  const data2 = await page2.json();

  if (data1.results.length > 0 && data2.results.length > 0) {
    expect(data1.results[0].code).not.toBe(data2.results[0].code);
  }
});
