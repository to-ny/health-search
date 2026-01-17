import { test, expect } from '@playwright/test';

test('home to search results flow', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('h1')).toContainText('MedSearch');

  const searchInput = page.locator('input[aria-label="Search"]');
  await searchInput.fill('paracetamol');
  await searchInput.press('Enter');

  await expect(page).toHaveURL(/\/en\/search\?q=paracetamol/);
  await expect(page.locator('h2')).toContainText(/\d+ results?/);
});

test('click result navigates to detail page', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/(substances|generics|medications|packages|companies|classifications|therapeutic-groups)\//);
});

test('CNK code search', async ({ page }) => {
  await page.goto('/en/search?q=4757811');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);
});

test('ATC code search', async ({ page }) => {
  await page.goto('/en/search?q=N02BE01');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);
});

test('no results state', async ({ page }) => {
  await page.goto('/en/search?q=xyznonexistent12345');
  await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 10000 });
});
