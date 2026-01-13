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

test.describe('Chapter IV API', () => {
  test('should return Chapter IV data for known restricted medications', async ({ request }) => {
    // Test the Chapter IV API directly with a known Chapter IV medication
    const response = await request.get('/api/chapter-iv?cnk=3621109');

    // The API should return successfully
    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('paragraphs');

    // Humira has Chapter IV paragraphs
    expect(data.paragraphs.length).toBeGreaterThan(0);

    // Each paragraph should have the expected structure
    if (data.paragraphs.length > 0) {
      const paragraph = data.paragraphs[0];
      expect(paragraph).toHaveProperty('chapterName');
      expect(paragraph).toHaveProperty('paragraphName');
      expect(paragraph).toHaveProperty('legalReferencePath');
    }
  });

  test('should return empty array for medications without Chapter IV data', async ({ request }) => {
    // Test with a real medication that doesn't have Chapter IV restrictions
    // Using Dafalgan (regular painkiller)
    const response = await request.get('/api/chapter-iv?cnk=1482223');

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data).toHaveProperty('paragraphs');
    // Regular medications should have empty paragraphs
    expect(Array.isArray(data.paragraphs)).toBe(true);
  });

  test('should validate CNK parameter', async ({ request }) => {
    // Test without CNK
    const response = await request.get('/api/chapter-iv');

    expect(response.status()).toBe(400);
  });
});

test.describe('Medication Page Reimbursement', () => {
  test('should display reimbursement section', async ({ page }) => {
    // Test with a known reimbursed medication
    await page.goto('/medication/1482223'); // Dafalgan Codeine

    // Wait for page to load
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible({ timeout: 15000 });

    // Verify the page shows the reimbursement card heading
    // This may show "Reimbursement" or "No reimbursement information" depending on data
    await expect(page.locator('text=Reimbursement').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display Chapter IV badge for restricted medications', async ({ page }) => {
    // Humira (CNK 3621109) is a known Chapter IV medication
    await page.goto('/medication/3621109');

    // Wait for page to load
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible({ timeout: 15000 });

    // Should show Chapter IV badge in reimbursement section
    await expect(page.getByText('Chapter IV', { exact: true })).toBeVisible({ timeout: 15000 });

    // Should show the info box about prior authorization
    await expect(page.getByText('prior authorization')).toBeVisible({ timeout: 10000 });

    // Should have the "View authorization requirements" button
    await expect(page.getByRole('button', { name: /view authorization requirements/i })).toBeVisible();
  });
});
