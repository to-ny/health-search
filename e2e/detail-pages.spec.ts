import { test, expect } from '@playwright/test';

test('VTM (substance) page renders', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol&types=vtm');
  await expect(page.locator('h2')).toContainText(/\d+ results?/, { timeout: 10000 });

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/substances\//);
  await expect(page.locator('h1')).toBeVisible();
});

test('VMP (generic) page renders', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol&types=vmp');
  await expect(page.locator('h2')).toContainText(/\d+ results?/, { timeout: 10000 });

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/generics\//);
  await expect(page.locator('h1')).toBeVisible();
});

test('AMP (brand) page renders', async ({ page }) => {
  await page.goto('/en/search?q=dafalgan&types=amp');
  await expect(page.locator('h2')).toContainText(/\d+ results?/, { timeout: 10000 });

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/medications\//);
  await expect(page.locator('h1')).toBeVisible();
});

test('AMPP (package) page renders', async ({ page }) => {
  await page.goto('/en/search?q=paracetamol&types=ampp');
  await expect(page.locator('h2')).toContainText(/\d+ results?/, { timeout: 10000 });

  await page.locator('a.block.group').first().click();
  await expect(page).toHaveURL(/\/en\/packages\//);
  await expect(page.locator('h1')).toBeVisible();
});

test('company page renders', async ({ page }) => {
  await page.goto('/en/search?q=pharma&types=company');
  await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });

  const firstResult = page.locator('a.block.group').first();
  if (await firstResult.isVisible()) {
    await firstResult.click();
    await expect(page).toHaveURL(/\/en\/companies\//);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('ATC classification page renders', async ({ page }) => {
  await page.goto('/en/search?q=N02BE&types=atc');
  await expect(page.locator('h2')).toBeVisible({ timeout: 10000 });

  const firstResult = page.locator('a.block.group').first();
  if (await firstResult.isVisible()) {
    await firstResult.click();
    await expect(page).toHaveURL(/\/en\/classifications\//);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('404 for non-existent entity', async ({ page }) => {
  await page.goto('/en/medications/nonexistent-12345');
  await expect(page.getByText(/not found/i)).toBeVisible();
});
