import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Belgium Medication Database');
  });

  test('should have search input', async ({ page }) => {
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('should show search type dropdown', async ({ page }) => {
    const dropdown = page.getByRole('button', { name: /name/i });
    await expect(dropdown).toBeVisible();
  });

  test('should display quick action cards', async ({ page }) => {
    // Use more specific selectors to avoid matching hero text
    await expect(page.getByRole('heading', { name: 'Browse Companies' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compare Prices' })).toBeVisible();
  });

  test('should navigate to companies page', async ({ page }) => {
    await page.getByText('Browse Companies').click();
    await expect(page).toHaveURL('/companies');
  });

  test('should have no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show search hint text', async ({ page }) => {
    await expect(page.getByText('Enter at least 3 characters to search')).toBeVisible();
  });

  test('should change search type', async ({ page }) => {
    const dropdown = page.getByRole('button', { name: /name/i });
    await dropdown.click();

    await page.getByRole('option', { name: 'CNK Code' }).click();
    await expect(page.getByText('Enter a 7-digit CNK code')).toBeVisible();
  });
});

test.describe('Company Filter', () => {
  test('should show company filter banner when URL has company param', async ({ page }) => {
    await page.goto('/?company=1');

    // Should show the company filter banner
    await expect(page.getByText(/Showing products from company/i)).toBeVisible({ timeout: 10000 });

    // Should show clear filter button
    await expect(page.getByRole('button', { name: /clear filter/i })).toBeVisible();
  });

  test('should clear company filter when clicking clear button', async ({ page }) => {
    await page.goto('/?company=1');

    // Wait for banner to appear
    await expect(page.getByText(/Showing products from company/i)).toBeVisible({ timeout: 10000 });

    // Click clear filter
    await page.getByRole('button', { name: /clear filter/i }).click();

    // Banner should disappear
    await expect(page.getByText(/Showing products from company/i)).not.toBeVisible();

    // URL should no longer have company param
    await expect(page).toHaveURL('/');
  });
});
