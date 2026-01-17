import { test, expect } from '@playwright/test';

test('filter by entity type', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol&types=amp');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);
  await expect(page.locator('a.block.group').first()).toBeVisible();
});

test('pagination navigation', async ({ page }) => {
  await page.goto('/en/search?q=para');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);

  const paginationNav = page.locator('nav[aria-label="Pagination"]');
  if (await paginationNav.isVisible()) {
    await page.locator('button[aria-label="Next page"]').click();
    await expect(page).toHaveURL(/page=2/);
  }
});

test('relationship filter', async ({ page }) => {
  await page.goto('/en/search?atc=N02BE01');
  await expect(page.locator('h2')).toBeVisible();
});
