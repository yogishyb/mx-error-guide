import { test, expect } from '@playwright/test';

test.describe('Message Type Guides (Reference Page)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iso20022/reference');
    await page.waitForLoadState('networkidle');
  });

  test('Reference page loads correctly', async ({ page }) => {
    // Should have back button
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();

    // Should have page title
    await expect(page.getByText('Reference')).toBeVisible();
  });

  test('displays message type cards', async ({ page }) => {
    // Check all 3 message types are present
    await expect(page.getByText('pacs.008')).toBeVisible();
    await expect(page.getByText('pacs.009')).toBeVisible();
    await expect(page.getByText('camt.053')).toBeVisible();
  });

  test('shows full names for message types', async ({ page }) => {
    // Check full names are displayed
    await expect(page.getByText(/Customer Credit Transfer/i)).toBeVisible();
    await expect(page.getByText(/Financial Institution/i)).toBeVisible();
    await expect(page.getByText(/Bank to Customer/i)).toBeVisible();
  });

  test('opens modal when clicking pacs.008 card', async ({ page }) => {
    // Click pacs.008 card
    await page.getByText('pacs.008').click();
    await page.waitForTimeout(500);

    // Modal should open with pacs.008 details
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Customer Credit Transfer/i)).toBeVisible();
  });

  test('modal has tabs for different sections', async ({ page }) => {
    await page.getByText('pacs.008').click();
    await page.waitForTimeout(500);

    // Check tabs exist
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('tab', { name: /overview/i })).toBeVisible();
  });

  test('closes modal with close button', async ({ page }) => {
    await page.getByText('pacs.008').click();
    await page.waitForTimeout(500);

    // Close modal
    const closeButton = page.getByRole('button', { name: /close/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try clicking outside or pressing escape
      await page.keyboard.press('Escape');
    }

    await page.waitForTimeout(300);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('pacs.009 card opens correct modal', async ({ page }) => {
    await page.getByText('pacs.009').click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Financial Institution/i)).toBeVisible();
  });

  test('camt.053 card opens correct modal', async ({ page }) => {
    await page.getByText('camt.053').click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/Bank to Customer/i)).toBeVisible();
  });

  test('back button navigates to homepage', async ({ page }) => {
    const backButton = page.getByRole('button', { name: /back/i });
    await backButton.click();

    await page.waitForURL(/\/iso20022\/?$/);
    expect(page.url()).toMatch(/\/iso20022\/?$/);
  });
});

test.describe('Message Guides - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('reference page is readable on mobile', async ({ page }) => {
    await page.goto('/iso20022/reference');
    await page.waitForLoadState('networkidle');

    // Content should be visible
    await expect(page.getByText('pacs.008')).toBeVisible();
    await expect(page.getByText('pacs.009')).toBeVisible();
  });

  test('modal works on mobile', async ({ page }) => {
    await page.goto('/iso20022/reference');
    await page.waitForLoadState('networkidle');

    await page.getByText('pacs.008').click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('Visual Regression - Reference', () => {
  test('Reference page screenshot', async ({ page }) => {
    await page.goto('/iso20022/reference');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/screenshots/reference-page.png', fullPage: true });
  });

  test('pacs.008 modal screenshot', async ({ page }) => {
    await page.goto('/iso20022/reference');
    await page.waitForLoadState('networkidle');

    await page.getByText('pacs.008').click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/pacs008-modal.png', fullPage: true });
  });
});
