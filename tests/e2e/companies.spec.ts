import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Companies Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/companies');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pharmaceutical Companies');
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('should have search button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('should show empty state initially', async ({ page }) => {
    await expect(page.getByText('Search for pharmaceutical companies')).toBeVisible();
  });

  test('should have no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
