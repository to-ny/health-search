import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Compare Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Compare Medications');
  });

  test('should show selection instructions', async ({ page }) => {
    await expect(page.getByText('Select a medication to compare')).toBeVisible();
  });

  test('should show empty state', async ({ page }) => {
    await expect(page.getByText('Search for a medication to compare')).toBeVisible();
  });

  test('should update placeholder when search type changes', async ({ page }) => {
    // Initial state: CNK is default, placeholder should mention CNK
    await expect(page.getByPlaceholder(/CNK/i)).toBeVisible();

    // Click the search type dropdown (shows "CNK Code")
    await page.getByRole('button', { name: /CNK Code/i }).click();

    // Select "Name" option
    await page.getByRole('option', { name: 'Name' }).click();

    // Placeholder should now mention medication name
    await expect(page.getByPlaceholder(/medication name/i)).toBeVisible();
  });

  test('should search by name and show results', async ({ page }) => {
    // Change search type to Name
    await page.getByRole('button', { name: /CNK Code/i }).click();
    await page.getByRole('option', { name: 'Name' }).click();

    // Type search query
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('dafalgan');
    await searchInput.press('Enter');

    // Wait for results to appear (the second card with "Select a medication" heading)
    await expect(page.getByRole('heading', { name: 'Select a medication', exact: true })).toBeVisible({
      timeout: 10000,
    });

    // Verify results contain the search term
    await expect(page.getByText(/Dafalgan/i).first()).toBeVisible();
  });

  test('should select medication from results for comparison', async ({ page }) => {
    // Change search type to Name
    await page.getByRole('button', { name: /CNK Code/i }).click();
    await page.getByRole('option', { name: 'Name' }).click();

    // Search for medication
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('dafalgan');
    await searchInput.press('Enter');

    // Wait for and click first result (search results have role="option")
    const firstResult = page.locator('[role="listbox"] [role="option"]', { hasText: /Dafalgan/i }).first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });
    await firstResult.click();

    // Verify comparison view shows selected medication
    await expect(page.getByText('Selected Medication')).toBeVisible({ timeout: 10000 });
  });

  test('should search by CNK code directly', async ({ page }) => {
    // CNK is default, enter a valid CNK code
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('1482223'); // Dafalgan Codeine CNK
    await searchInput.press('Enter');

    // Should go directly to comparison (no intermediate selection)
    await expect(page.getByText('Selected Medication')).toBeVisible({ timeout: 15000 });
  });

  test('should allow changing selection', async ({ page }) => {
    // First, search and select a medication
    await page.getByRole('button', { name: /CNK Code/i }).click();
    await page.getByRole('option', { name: 'Name' }).click();

    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('dafalgan');
    await searchInput.press('Enter');

    // Wait for and click first result (search results have role="option")
    const firstResult = page.locator('[role="listbox"] [role="option"]', { hasText: /Dafalgan/i }).first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });
    await firstResult.click();

    // Wait for comparison to load
    await expect(page.getByText('Selected Medication')).toBeVisible({ timeout: 10000 });

    // Click "Change selection" link
    await page.getByText('Change selection').click();

    // Should return to empty state
    await expect(page.getByText('Search for a medication to compare')).toBeVisible();
  });

  test('should have no accessibility violations', async ({ page }) => {
    // Exclude heading-order (best-practice) - CardTitle uses h3 after page h1
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['heading-order'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations with search results', async ({ page }) => {
    // Change to name search and get results
    await page.getByRole('button', { name: /CNK Code/i }).click();
    await page.getByRole('option', { name: 'Name' }).click();

    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('dafalgan');
    await searchInput.press('Enter');

    // Wait for results
    await expect(page.getByText(/Dafalgan/i).first()).toBeVisible({ timeout: 10000 });

    // Exclude heading-order (best-practice) - CardTitle uses h3 after page h1
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['heading-order'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should show search results section when searching by name', async ({ page }) => {
    // Change search type to Name
    await page.getByRole('button', { name: /CNK Code/i }).click();
    await page.getByRole('option', { name: 'Name' }).click();

    // Search for something
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('test');
    await searchInput.press('Enter');

    // Wait for the "Select a medication" card to appear (shows search is happening)
    // This verifies the search flow is working
    await expect(page.getByRole('heading', { name: 'Select a medication', exact: true })).toBeVisible({
      timeout: 15000,
    });
  });
});
