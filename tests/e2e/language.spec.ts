import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display language switcher in header', async ({ page }) => {
    // Language switcher should be visible
    const languageButton = page.getByRole('button', { name: /select language/i });
    await expect(languageButton).toBeVisible();
  });

  test('should show language options when clicked', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: /select language/i });
    await languageButton.click();

    // Should show all language options
    await expect(page.getByRole('option', { name: /english/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /nederlands/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /français/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /deutsch/i })).toBeVisible();
  });

  test('should change language when option selected', async ({ page }) => {
    const languageButton = page.getByRole('button', { name: /select language/i });
    await languageButton.click();

    // Select French
    await page.getByRole('option', { name: /français/i }).click();

    // Button should now show FR
    await expect(languageButton).toContainText('FR');
  });

  test('should persist language selection', async ({ page }) => {
    // Select Dutch
    const languageButton = page.getByRole('button', { name: /select language/i });
    await languageButton.click();
    await page.getByRole('option', { name: /nederlands/i }).click();

    // Reload page
    await page.reload();

    // Should still show NL
    await expect(page.getByRole('button', { name: /select language/i })).toContainText('NL');
  });
});

test.describe('Language Integration', () => {
  test('should pass language parameter in search API calls', async ({ page }) => {
    // Set language to French first
    await page.goto('/');
    const languageButton = page.getByRole('button', { name: /select language/i });
    await languageButton.click();
    await page.getByRole('option', { name: /français/i }).click();

    // Intercept API calls to verify language param
    let apiCallMade = false;
    await page.route('**/api/medications*', async (route) => {
      const url = route.request().url();
      if (url.includes('lang=fr')) {
        apiCallMade = true;
      }
      await route.continue();
    });

    // Perform a search
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('paracetamol');
    await searchInput.press('Enter');

    // Wait for API call
    await page.waitForTimeout(500);

    expect(apiCallMade).toBe(true);
  });
});
