import { test, expect } from '@playwright/test';

test.describe('Companies Page', () => {
  test('should display companies page and allow search', async ({ page }) => {
    await page.goto('/companies');

    // Page loads with correct heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pharmaceutical Companies');
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByText('Search for pharmaceutical companies')).toBeVisible();
  });
});

test.describe('Search Page', () => {
  test('should display search page and sync URL with search state', async ({ page }) => {
    await page.goto('/search');

    // Page loads correctly
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Search Medications');
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Name' })).toBeVisible();

    // Search updates URL
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('paracetamol');
    await page.waitForURL(/\/search\?q=paracetamol/, { timeout: 5000 });
  });

  test('should restore search state from URL', async ({ page }) => {
    await page.goto('/search?q=ibuprofen&type=cnk');

    await expect(page.getByRole('searchbox')).toHaveValue('ibuprofen');
    await expect(page.getByRole('button', { name: /CNK Code/i })).toBeVisible();
  });

  test('should handle company filter in URL', async ({ page }) => {
    await page.goto('/search?company=123456');
    await expect(page.getByText('#123456')).toBeVisible();
  });
});
