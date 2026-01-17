import { test, expect } from '@playwright/test';

test('navigate home via logo', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol');
  await page.locator('a', { has: page.locator('text=MedSearch') }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
});

test('header search on detail pages', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol');
  await expect(page.locator('h2')).toContainText(/\d+ results?/);
  await page.locator('a.block.group').first().click();
  await expect(page.locator('header input[aria-label="Search"]')).toBeVisible();
});

test('drill down: substance to generic to brand', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol&types=vtm');
  await expect(page.locator('h2')).toContainText(/\d+ results?/, { timeout: 10000 });

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/substances\//);

  const genericLink = page.locator('a[href*="/generics/"]').first();
  if (await genericLink.isVisible()) {
    await genericLink.click();
    await expect(page).toHaveURL(/\/en\/generics\//);

    const brandLink = page.locator('a[href*="/medications/"]').first();
    if (await brandLink.isVisible()) {
      await brandLink.click();
      await expect(page).toHaveURL(/\/en\/medications\//);
    }
  }
});

test('navigate from package to brand medication', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol&types=ampp');
  await expect(page.locator('h2')).toContainText(/\d+ results?/, { timeout: 10000 });

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/packages\//);

  const brandLink = page.locator('a[href*="/medications/"]').first();
  await expect(brandLink).toBeVisible();
  await brandLink.click();
  await expect(page).toHaveURL(/\/en\/medications\//);
});
