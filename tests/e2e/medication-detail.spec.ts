import { test, expect } from '@playwright/test';

test.describe('Medication Detail Page', () => {
  const testCNK = '1482223'; // Dafalgan Codeine

  test('should display medication details', async ({ page }) => {
    await page.goto(`/medication/${testCNK}`);

    // Wait for page to load and show breadcrumb
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible({ timeout: 15000 });

    // Should show medication info
    await expect(page.getByText('Authorized')).toBeVisible();
    await expect(page.locator('a[href^="/companies/"]').first()).toBeVisible();
  });

  test('should show packages section', async ({ page }) => {
    await page.goto(`/medication/${testCNK}`);

    await expect(page.getByText('Available Packages')).toBeVisible({ timeout: 15000 });
  });
});
