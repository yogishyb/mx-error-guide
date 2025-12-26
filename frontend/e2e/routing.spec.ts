import { test, expect } from '@playwright/test';

/**
 * End-to-end routing tests for ISO 20022 path-based routing
 *
 * These tests verify:
 * 1. Base path routing (/iso20022)
 * 2. SPA routing for error pages
 * 3. Asset loading works correctly
 * 4. Navigation between pages
 */
test.describe('ISO 20022 Base Path Routing', () => {
  test('homepage loads at /iso20022', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');

    // Wait for React to render content
    await page.waitForTimeout(1000);

    // Verify the page rendered (not blank) - check for app-specific content
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty({ timeout: 10000 });

    // Check page title is correct
    await expect(page).toHaveTitle(/MX Error Guide/i);
  });

  test('homepage loads at /iso20022/ (with trailing slash)', async ({ page }) => {
    await page.goto('/iso20022/');
    await page.waitForLoadState('networkidle');

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('error page AC04 loads correctly', async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');

    // Verify React rendered
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // Check for AC04 in the page
    await expect(page.getByText('AC04')).toBeVisible();
  });

  test('error page works without trailing slash', async ({ page }) => {
    await page.goto('/iso20022/error/AM05');
    await page.waitForLoadState('networkidle');

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    await expect(page.getByText('AM05')).toBeVisible();
  });

  test('reference page loads correctly', async ({ page }) => {
    await page.goto('/iso20022/reference');
    await page.waitForLoadState('networkidle');

    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // Should have some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test('assets load with correct paths', async ({ page }) => {
    const assetRequests: string[] = [];
    const failedAssets: string[] = [];

    page.on('request', request => {
      const url = request.url();
      // In dev mode, assets are under /iso20022/src or /iso20022/@
      // In prod mode, assets are under /iso20022/assets
      if (url.includes('/iso20022/') && (url.includes('/assets/') || url.includes('/src/') || url.includes('/@'))) {
        assetRequests.push(url);
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/iso20022/') && url.includes('/assets/') && response.status() >= 400) {
        failedAssets.push(`${url} - ${response.status()}`);
      }
    });

    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');

    // Should have loaded some assets (dev or prod paths)
    expect(assetRequests.length).toBeGreaterThan(0);

    // No asset should have failed
    expect(failedAssets).toEqual([]);
  });

  test('JavaScript executes without errors', async ({ page }) => {
    const jsErrors: string[] = [];

    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');

    // Wait a bit for any delayed errors
    await page.waitForTimeout(1000);

    // Should have no JS errors
    expect(jsErrors).toEqual([]);
  });

  test('navigation from home to error page works', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');

    // Find and click on an error card (if visible)
    const errorCard = page.locator('[data-testid="error-card"]').first();

    if (await errorCard.isVisible()) {
      await errorCard.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to an error page
      expect(page.url()).toContain('/iso20022/error/');

      // Page should have content
      const root = page.locator('#root');
      await expect(root).not.toBeEmpty();
    }
  });

  test('navigation from error page back to home works', async ({ page }) => {
    await page.goto('/iso20022/error/AC04');
    await page.waitForLoadState('networkidle');

    // Look for back button or home link
    const homeLink = page.locator('a[href="/iso20022"]').first();
    const backButton = page.getByRole('button', { name: /back/i }).first();

    if (await homeLink.isVisible()) {
      await homeLink.click();
    } else if (await backButton.isVisible()) {
      await backButton.click();
    }

    await page.waitForLoadState('networkidle');

    // Should be back at home
    expect(page.url()).toMatch(/\/iso20022\/?$/);
  });
});

test.describe('Console Error Debugging', () => {
  test('capture all console messages on homepage', async ({ page }) => {
    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      } else {
        logs.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });

    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Log all captured info for debugging
    console.log('=== CONSOLE LOGS ===');
    logs.forEach(log => console.log('LOG:', log));
    console.log('=== WARNINGS ===');
    warnings.forEach(warn => console.log('WARN:', warn));
    console.log('=== ERRORS ===');
    errors.forEach(err => console.log('ERROR:', err));

    // Take a screenshot
    await page.screenshot({ path: 'e2e/screenshots/routing-debug.png', fullPage: true });

    // Check if there are critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('adsbygoogle')
    );

    // Report but don't fail on non-critical errors
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
  });

  test('HTML content check', async ({ page }) => {
    const response = await page.goto('/iso20022');

    console.log('Response status:', response?.status());
    console.log('Response headers:', response?.headers());

    const html = await page.content();
    console.log('HTML length:', html.length);
    console.log('Contains #root:', html.includes('id="root"'));
    console.log('Contains script tags:', html.includes('<script'));

    // Check if it's the right HTML
    expect(html).toContain('id="root"');
    // In dev mode, uses /iso20022/src/..., in prod uses /iso20022/assets/...
    expect(html).toMatch(/\/iso20022\/(assets|src)\//);
  });
});
