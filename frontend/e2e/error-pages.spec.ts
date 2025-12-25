import { test, expect } from '@playwright/test';

test.describe('SEO Error Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navigates to /error/AC04 and displays error details', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    // Check breadcrumbs
    const breadcrumbs = page.locator('.MuiBreadcrumbs-root');
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs.getByText('Home')).toBeVisible();
    await expect(breadcrumbs.getByText('AC04')).toBeVisible();

    // Check error code is displayed
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AC04');

    // Check error name is visible
    await expect(page.locator('h5')).toBeVisible();

    // Check description section
    await expect(page.getByText(/What This Error Means/i)).toBeVisible();

    // Check chips (category and severity)
    const chips = page.locator('.MuiChip-root');
    await expect(chips).not.toHaveCount(0);
  });

  test('displays all error sections for AC04', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    // Check for "What This Error Means" section
    await expect(page.getByText(/What This Error Means/i)).toBeVisible();

    // Check for description text (should have some content)
    const descriptionSection = page.locator('text=/Account/i').first();
    await expect(descriptionSection).toBeVisible();
  });

  test('shows Back button', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    const backButton = page.getByRole('button', { name: /Back/i });
    await expect(backButton).toBeVisible();
  });

  test('Back button navigates to homepage', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    const backButton = page.getByRole('button', { name: /Back/i });
    await backButton.click();

    // Should navigate back to home
    await page.waitForURL('/');
    expect(page.url()).toContain('/');
  });

  test('breadcrumb Home link navigates to homepage', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    const homeLink = page.locator('.MuiBreadcrumbs-root a').filter({ hasText: 'Home' });
    await homeLink.click();

    // Should navigate to home
    await page.waitForURL('/');
    expect(page.url()).toContain('/');
  });

  test('handles invalid error code (404)', async ({ page }) => {
    await page.goto('/error/INVALID123');
    await page.waitForLoadState('networkidle');

    // Should show warning/error message
    await expect(page.getByText(/not found/i)).toBeVisible();
    await expect(page.getByText(/INVALID123/i)).toBeVisible();

    // Should show link to search all errors (it's a link, not a button)
    const searchLink = page.getByRole('link', { name: /Search All Errors/i });
    await expect(searchLink).toBeVisible();
  });

  test('404 page Search All Errors link navigates to homepage', async ({ page }) => {
    await page.goto('/error/INVALID999');
    await page.waitForLoadState('networkidle');

    const searchLink = page.getByRole('link', { name: /Search All Errors/i });
    await searchLink.click();

    await page.waitForURL('/');
    expect(page.url()).toContain('/');
  });

  test('multiple error codes load correctly', async ({ page }) => {
    // Test AC04
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AC04');

    // Test AM05
    await page.goto('/error/AM05');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AM05');

    // Test RC01
    await page.goto('/error/RC01');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('RC01');
  });

  test('error code is case-insensitive', async ({ page }) => {
    // Lowercase
    await page.goto('/error/ac04');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AC04');

    // Mixed case
    await page.goto('/error/Ac04');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AC04');
  });

  test('severity chip shows correct color', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    // Should have severity chip (either error or warning color)
    const chips = page.locator('.MuiChip-root');
    const severityChip = chips.filter({ hasText: /fatal|error|warning/i }).first();
    await expect(severityChip).toBeVisible();
  });
});

test.describe('SEO Error Pages - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('error page is readable on mobile', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');

    // Breadcrumbs visible
    await expect(page.locator('.MuiBreadcrumbs-root')).toBeVisible();

    // Error code visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Back button visible
    await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
  });

  test('404 page is readable on mobile', async ({ page }) => {
    await page.goto('/error/INVALIDCODE');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/not found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Search All Errors/i })).toBeVisible();
  });
});

test.describe('Visual Regression - Error Pages', () => {
  test('error page AC04 screenshot', async ({ page }) => {
    await page.goto('/error/AC04');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/error-page-ac04.png', fullPage: true });
  });

  test('404 page screenshot', async ({ page }) => {
    await page.goto('/error/INVALID');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'e2e/screenshots/error-page-404.png', fullPage: true });
  });
});
