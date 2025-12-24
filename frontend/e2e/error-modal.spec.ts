import { test, expect } from '@playwright/test';

test.describe('ErrorModal - Backdrop Click', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
  });

  test('opens ErrorModal when using URL hash', async ({ page }) => {
    // Navigate to URL with hash to open modal
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Modal dialog should be visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify modal content shows AC04
    const modalContent = page.locator('.MuiDialog-paper');
    await expect(modalContent).toBeVisible();
    await expect(modalContent.getByText('AC04').first()).toBeVisible();
  });

  test('closes ErrorModal when clicking backdrop (outside dialog)', async ({ page }) => {
    // Open modal via URL hash
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Verify modal is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Get the backdrop element (MUI creates a backdrop element)
    const backdrop = page.locator('.MuiBackdrop-root');
    await expect(backdrop).toBeVisible();

    // Click on the backdrop (outside the dialog content) - force click to bypass interception
    await backdrop.click({ force: true });
    await page.waitForTimeout(300);

    // Modal should close
    await expect(dialog).not.toBeVisible();
  });

  test('closes ErrorModal when clicking X button', async ({ page }) => {
    // Open modal via URL hash
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Verify modal is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Find and click the close button (X icon)
    const modalContent = page.locator('.MuiDialog-paper');
    const closeButton = modalContent.locator('[data-testid="CloseIcon"]').first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await page.waitForTimeout(300);

    // Modal should close
    await expect(dialog).not.toBeVisible();
  });

  test('backdrop click does not affect other elements', async ({ page }) => {
    // Open modal via hash
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Verify modal is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click backdrop to close - force click to bypass interception
    const backdrop = page.locator('.MuiBackdrop-root');
    await backdrop.click({ force: true });
    await page.waitForTimeout(300);

    // Modal closed
    await expect(dialog).not.toBeVisible();

    // Error cards should still be visible
    const cards = page.locator('.MuiCard-root');
    await expect(cards.first()).toBeVisible();
  });

  test('can re-open modal after closing via backdrop', async ({ page }) => {
    // Open modal via hash
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Verify modal is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Close via backdrop - force click to bypass interception
    const backdrop = page.locator('.MuiBackdrop-root');
    await backdrop.click({ force: true });
    await page.waitForTimeout(300);

    // Verify closed
    await expect(dialog).not.toBeVisible();

    // Re-open modal via hash
    await page.goto('http://localhost:5173/#AM05');
    await page.waitForTimeout(500);

    // Modal should open again
    await expect(dialog).toBeVisible();
    await expect(page.locator('.MuiDialog-paper').getByText('AM05').first()).toBeVisible();
  });

  test('clicking inside dialog does not close modal', async ({ page }) => {
    // Open modal via hash
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Verify modal is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click inside the dialog content
    const modalContent = page.locator('.MuiDialog-paper');
    await modalContent.click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(300);

    // Modal should remain open
    await expect(dialog).toBeVisible();
  });
});

test.describe('ErrorModal - Mobile Backdrop', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('backdrop click works on mobile', async ({ page }) => {
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    // Verify modal is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click backdrop - force click to bypass interception
    const backdrop = page.locator('.MuiBackdrop-root');
    await backdrop.click({ force: true });
    await page.waitForTimeout(300);

    // Modal should close
    await expect(dialog).not.toBeVisible();
  });
});

test.describe('Visual Regression - ErrorModal', () => {
  test('ErrorModal open screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/#AC04');
    await page.waitForTimeout(500);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/error-modal-open.png', fullPage: true });
  });
});
