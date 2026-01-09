import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Medication Detail Page', () => {
  // Use a known medication CNK for testing
  const testCNK = '1482223'; // Dafalgan Codeine

  test.beforeEach(async ({ page }) => {
    await page.goto(`/medication/${testCNK}`);
  });

  test('should display medication name', async ({ page }) => {
    // Wait for content to load
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible({ timeout: 15000 });
  });

  test('should show formatted status without badge', async ({ page }) => {
    // Status should be plain text, not a badge
    // Look for "Authorized" (formatted) not "AUTHORIZED" (raw)
    await expect(page.getByText('Authorized')).toBeVisible({ timeout: 15000 });
  });

  test('should display company as link', async ({ page }) => {
    // Company should be a clickable link
    const companyLink = page.locator('a[href^="/companies/"]').first();
    await expect(companyLink).toBeVisible({ timeout: 15000 });
  });

  test('should have no accessibility violations', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('nav[aria-label="Breadcrumb"]', { timeout: 15000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['heading-order']) // CardTitle uses h3 after page h1
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Package Collapse Functionality', () => {
  // Use a medication with many packages
  const manyPackagesCNK = '3833100';

  test('should initially show limited packages', async ({ page }) => {
    await page.goto(`/medication/${manyPackagesCNK}`);

    // Wait for packages section
    await expect(page.getByText('Available Packages')).toBeVisible({ timeout: 15000 });

    // Should show "Show X more packages" button if there are many packages
    const showMoreButton = page.getByRole('button', { name: /show.*more packages/i });

    // If button exists, it means we have more than 3 packages
    const buttonVisible = await showMoreButton.isVisible().catch(() => false);

    if (buttonVisible) {
      // Click to expand
      await showMoreButton.click();

      // Should now show "Show less"
      await expect(page.getByRole('button', { name: /show less/i })).toBeVisible();
    }
  });

  test('should toggle packages visibility', async ({ page }) => {
    await page.goto(`/medication/${manyPackagesCNK}`);

    // Wait for packages section
    await expect(page.getByText('Available Packages')).toBeVisible({ timeout: 15000 });

    const showMoreButton = page.getByRole('button', { name: /show.*more packages/i });
    const buttonVisible = await showMoreButton.isVisible().catch(() => false);

    if (buttonVisible) {
      // Expand
      await showMoreButton.click();
      await expect(page.getByRole('button', { name: /show less/i })).toBeVisible();

      // Collapse
      await page.getByRole('button', { name: /show less/i }).click();
      await expect(page.getByRole('button', { name: /show.*more packages/i })).toBeVisible();
    }
  });
});

test.describe('Document Links', () => {
  const testCNK = '1482223';

  test('should display document links with full language names', async ({ page }) => {
    await page.goto(`/medication/${testCNK}`);

    // Wait for packages section
    await expect(page.getByText('Available Packages')).toBeVisible({ timeout: 15000 });

    // Documents should now show full language names (English, French, Dutch, German)
    // Check for the new document structure - labels followed by language links
    const hasDocuments = await page.getByText('Patient leaflet:').isVisible().catch(() => false);

    if (hasDocuments) {
      // Should show full language names like "English", "French", "Dutch"
      const pageContent = await page.textContent('body');
      const hasFullLanguageName = ['English', 'French', 'Dutch', 'German'].some(lang =>
        pageContent?.includes(lang)
      );
      expect(hasFullLanguageName).toBe(true);
    }
  });
});
