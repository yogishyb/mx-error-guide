import { test, expect } from '@playwright/test';

/**
 * Bug Reproduction Test: Filter + Pagination Issue
 *
 * Bug: When user is on page 5+ and applies a filter, the page stays on page 5
 * but the filtered results only have 1-2 pages worth of items, resulting in empty display.
 *
 * Expected: Pagination should reset to page 1 when filters change.
 */

test.describe('Filter + Pagination Bug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('BUG REPRODUCTION: empty page after filter applied on high page number', async ({ page }) => {
    // Step 1: Wait for errors to load
    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Step 2: Navigate to page 5
    const pagination = page.locator('.MuiPagination-root');
    await expect(pagination).toBeVisible();

    // Click page 5 button
    await page.locator('button[aria-label="Go to page 5"]').click();
    await page.waitForTimeout(500); // Wait for page transition

    // Verify we're on page 5
    const page5Button = page.locator('button[aria-label="page 5"]');
    await expect(page5Button).toHaveAttribute('aria-current', 'page');

    // Take screenshot before filter
    await page.screenshot({
      path: 'e2e/screenshots/filter-pagination-before.png',
      fullPage: true
    });

    // Step 3: Apply a category filter that will reduce results significantly
    // Click the first Select dropdown (Category filter)
    const categorySelect = page.locator('.MuiSelect-select').first();
    await categorySelect.click();
    await page.waitForTimeout(300);

    // Select "Account" category from the dropdown
    await page.locator('li[role="option"]').filter({ hasText: /^Account$/ }).click();
    await page.waitForTimeout(500); // Wait for filter to apply

    // Step 4: BUG - Check if cards are visible
    const errorCards = page.locator('.MuiCard-root');
    const cardCount = await errorCards.count();

    // Take screenshot of the bug
    await page.screenshot({
      path: 'e2e/screenshots/filter-pagination-bug-empty.png',
      fullPage: true
    });

    console.log(`[BUG] Card count on page 5 after "Account" filter: ${cardCount}`);
    console.log(`Expected: 12 cards (page 1 of filtered results)`);
    console.log(`Actual: ${cardCount} cards (likely 0 - page 5 of filtered results doesn't exist)`);

    // This demonstrates the bug - cardCount will be 0
    // because pagination didn't reset to page 1
  });

  test('EXPECTED BEHAVIOR TEST: pagination should reset when category filter changes', async ({ page }) => {
    // This test will FAIL until bug is fixed - it documents expected behavior

    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Navigate to page 5
    await page.locator('button[aria-label="Go to page 5"]').click();
    await page.waitForTimeout(500);

    // Apply Account filter
    const categorySelect = page.locator('.MuiSelect-select').first();
    await categorySelect.click();
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]').filter({ hasText: /^Account$/ }).click();
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/filter-pagination-expected-behavior.png',
      fullPage: true
    });

    // EXPECTED: Page should reset to 1 (this will FAIL with current bug)
    const page1Button = page.locator('button[aria-label="page 1"]');
    await expect(page1Button).toHaveAttribute('aria-current', 'page');

    // EXPECTED: Cards should be visible on page 1
    const errorCards = page.locator('.MuiCard-root');
    await expect(errorCards.first()).toBeVisible();
    const count = await errorCards.count();
    console.log(`Cards visible after filter reset: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('verify search query also should reset pagination', async ({ page }) => {
    // Test that search query changes should also reset pagination

    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Navigate to page 4
    await page.locator('button[aria-label="Go to page 4"]').click();
    await page.waitForTimeout(500);

    // Type search query
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('AC04');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/filter-pagination-search.png',
      fullPage: true
    });

    // EXPECTED: Page should reset to 1 when search changes
    // Note: This might already work if search is handled differently than filters
    const errorCards = page.locator('.MuiCard-root');
    await expect(errorCards.first()).toBeVisible();
  });
});
