import { test, expect } from '@playwright/test';

test('language selector visible', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('select[aria-label="Select language"]')).toBeVisible();
});

test('switch language updates URL', async ({ page }) => {
  await page.goto('/en');
  await page.locator('select[aria-label="Select language"]').selectOption('nl');
  await expect(page).toHaveURL(/\/nl\/?$/);
});

test('preserve language on search', async ({ page }) => {
  await page.goto('/nl');
  const searchInput = page.locator('input[aria-label="Search"]');
  await searchInput.fill('paracetamol');
  await searchInput.press('Enter');
  await expect(page).toHaveURL(/\/nl\/search/);
});

test('preserve query when switching language', async ({ page }) => {
  await page.goto('/en/search?q=ibuprofen');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);

  await page.locator('select[aria-label="Select language"]').selectOption('fr');
  await expect(page).toHaveURL(/\/fr\/search\?q=ibuprofen/);
});

test('direct URL access works for all languages', async ({ page }) => {
  for (const lang of ['en', 'nl', 'fr', 'de']) {
    await page.goto(`/${lang}`);
    await expect(page.locator('h1')).toBeVisible();
  }
});
