import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {
  test('should allow changing and persisting language', async ({ page }) => {
    await page.goto('/');

    // Open language menu and select French
    const languageButton = page.getByRole('button', { name: /select language/i });
    await expect(languageButton).toBeVisible();
    await languageButton.click();
    await page.getByRole('option', { name: /français/i }).click();

    // Should show FR
    await expect(languageButton).toContainText('FR');

    // Should persist after reload
    await page.reload();
    await expect(page.getByRole('button', { name: /select language/i })).toContainText('FR');
  });
});
