import { test, expect } from '@playwright/test';

test.describe('ErrorPage - Modal Behavior (/error/AC04)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');
  });

  test('displays dark backdrop behind content', async ({ page }) => {
    // Find the backdrop element (the outer Box with dark background)
    const backdrop = page.locator('body > div').first();

    // Check backdrop has semi-transparent dark background
    const bgColor = await backdrop.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should be rgba(0, 0, 0, 0.5) or similar dark semi-transparent color
    expect(bgColor).toContain('rgba');
  });

  test('navigates back to home when clicking backdrop area (sides)', async ({ page }) => {
    // Get the backdrop element (outermost Box)
    const backdrop = page.locator('body > div').first();

    // Click on the backdrop area (outside the content paper)
    // Click on far left side to ensure we're clicking the backdrop
    await backdrop.click({ position: { x: 10, y: 300 } });

    // Should navigate back to home
    await page.waitForURL('/iso20022');
    expect(page.url()).toContain('/');
  });

  test('copy link button copies URL to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Find the copy link button (LinkIcon)
    const copyButton = page.locator('button').filter({ has: page.locator('[data-testid="LinkIcon"]') });
    await expect(copyButton).toBeVisible();

    // Click the copy button
    await copyButton.click();

    // Verify the button shows success state (CheckIcon)
    await expect(page.locator('[data-testid="CheckIcon"]')).toBeVisible();

    // Read clipboard and verify URL was copied
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/iso20022/error/AC04');
    expect(clipboardText).toContain('toolgalaxy.in');
  });

  test('close button (X icon) navigates back to home', async ({ page }) => {
    // Find the close button (CloseIcon)
    const closeButton = page.locator('button').filter({ has: page.locator('[data-testid="CloseIcon"]') });
    await expect(closeButton).toBeVisible();

    // Click close button
    await closeButton.click();

    // Should navigate back to home
    await page.waitForURL('/iso20022');
    expect(page.url()).toContain('/');
  });

  test('displays error details correctly', async ({ page }) => {
    // Verify error code is displayed
    await expect(page.getByRole('heading', { level: 1 })).toContainText('AC04');

    // Verify error name is visible
    await expect(page.getByRole('heading', { level: 5 })).toBeVisible();

    // Verify description section
    await expect(page.getByText(/What This Error Means/i)).toBeVisible();

    // Verify chips (category and severity)
    const chips = page.locator('.MuiChip-root');
    await expect(chips).not.toHaveCount(0);
  });

  test('clicking inside Paper content does not navigate back', async ({ page }) => {
    // Click inside the Paper content
    const paper = page.locator('.MuiPaper-root').first();
    await paper.click({ position: { x: 100, y: 100 } });

    // Wait a bit to see if navigation happens
    await page.waitForTimeout(500);

    // Should still be on error page
    expect(page.url()).toContain('/error/AC04');
  });

  test('Back button works', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /Back/i });
    await expect(backButton).toBeVisible();

    await backButton.click();

    await page.waitForURL('/iso20022');
    expect(page.url()).toContain('/');
  });

  test('breadcrumb Home link works', async ({ page }) => {
    const homeLink = page.locator('.MuiBreadcrumbs-root a').filter({ hasText: 'Home' });
    await expect(homeLink).toBeVisible();

    await homeLink.click();

    await page.waitForURL('/iso20022');
    expect(page.url()).toContain('/');
  });
});

test.describe('ErrorPage Modal - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('backdrop click works on mobile', async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');

    // Click backdrop on mobile
    const backdrop = page.locator('body > div').first();
    await backdrop.click({ position: { x: 10, y: 100 } });

    await page.waitForURL('/iso20022');
    expect(page.url()).toContain('/');
  });

  test('copy link button works on mobile', async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const copyButton = page.locator('button').filter({ has: page.locator('[data-testid="LinkIcon"]') });
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    await expect(page.locator('[data-testid="CheckIcon"]')).toBeVisible();
  });

  test('close button works on mobile', async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');

    const closeButton = page.locator('button').filter({ has: page.locator('[data-testid="CloseIcon"]') });
    await closeButton.click();

    await page.waitForURL('/iso20022');
    expect(page.url()).toContain('/');
  });
});

test.describe('Visual Regression - ErrorPage Modal', () => {
  test('ErrorPage with backdrop screenshot', async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'e2e/screenshots/error-page-modal-ac04.png',
      fullPage: true
    });
  });
});
