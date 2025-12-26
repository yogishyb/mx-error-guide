import { test, expect } from '@playwright/test';

test.describe('Message Type Guides', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');
  });

  test('shows Guides button in header', async ({ page }) => {
    const guidesButton = page.getByRole('button', { name: /guides/i });
    await expect(guidesButton).toBeVisible();
  });

  test('opens Guides drawer when clicking button', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();

    // Drawer should be visible - use heading role for precision
    await expect(page.getByRole('heading', { name: 'Message Type Guides' })).toBeVisible();
  });

  test('displays 3 message type cards', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500); // Wait for drawer animation

    // Check all 3 message types are present in the drawer
    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer.getByText('pacs.008')).toBeVisible();
    await expect(drawer.getByText('pacs.009')).toBeVisible();
    await expect(drawer.getByText('camt.053')).toBeVisible();
  });

  test('shows full names for message types', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer.getByText('FIToFICustomerCreditTransfer')).toBeVisible();
    await expect(drawer.getByText('FinancialInstitutionCreditTransfer')).toBeVisible();
    await expect(drawer.getByText('BankToCustomerStatement')).toBeVisible();
  });

  test('shows Coming Soon section', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer.getByText('Coming Soon')).toBeVisible();
  });

  test('opens modal when clicking pacs.008 card', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    // Click on the pacs.008 card within drawer
    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();

    // Modal should open with tabs
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tab', { name: /use cases/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /key fields/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /common errors/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /related/i })).toBeVisible();
  });

  test('displays Use Cases tab content', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    // Use Cases tab is default
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/cross-border customer payments/i)).toBeVisible();
  });

  test('switches to Key Fields tab and shows table', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    // Click Key Fields tab
    await page.getByRole('tab', { name: /key fields/i }).click();
    await page.waitForTimeout(300);

    // Should show table content - check for specific field descriptions
    const dialog = page.locator('.MuiDialog-paper');
    await expect(dialog.getByText('Unique identifier assigned by the instructing party')).toBeVisible();
    await expect(dialog.getByText('Unique ID assigned by the originator, passed through entire chain')).toBeVisible();
  });

  test('switches to Common Errors tab', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    // Click Common Errors tab
    await page.getByRole('tab', { name: /common errors/i }).click();
    await page.waitForTimeout(300);

    // Should show error codes
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('AC01 - Incorrect Account Number')).toBeVisible();
  });

  test('switches to Related tab', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    // Click Related tab
    await page.getByRole('tab', { name: /related/i }).click();
    await page.waitForTimeout(300);

    // Should show related messages
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('pacs.002')).toBeVisible();
  });

  test('closes modal with close button', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    // Wait for modal dialog (not drawer)
    const modal = page.locator('.MuiDialog-paper');
    await expect(modal).toBeVisible();

    // Click close button in modal header
    await modal.locator('[data-testid="CloseIcon"]').click();
    await page.waitForTimeout(300);

    // Modal should close (drawer stays open)
    await expect(modal).not.toBeVisible();
  });

  test('closes drawer with close button', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Message Type Guides' })).toBeVisible();

    // Click close button on drawer
    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('[data-testid="CloseIcon"]').click();
    await page.waitForTimeout(300);

    // Drawer should close
    await expect(page.getByRole('heading', { name: 'Message Type Guides' })).not.toBeVisible();
  });

  test('pacs.009 card opens correct modal', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.009' }).click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('FinancialInstitutionCreditTransfer')).toBeVisible();
  });

  test('camt.053 card opens correct modal', async ({ page }) => {
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'camt.053' }).click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('BankToCustomerStatement')).toBeVisible();
  });
});

test.describe('Message Guides - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('drawer is full width on mobile', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    const box = await drawer.boundingBox();

    expect(box?.width).toBe(375);
  });

  test('cards are readable on mobile', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await expect(drawer.getByText('pacs.008')).toBeVisible();
    await expect(drawer.getByText('pacs.009')).toBeVisible();
    await expect(drawer.getByText('camt.053')).toBeVisible();
  });
});

test.describe('Visual Regression', () => {
  test('Guides drawer screenshot', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Message Type Guides' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/guides-drawer.png', fullPage: true });
  });

  test('pacs.008 modal screenshot', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/pacs008-modal.png' });
  });

  test('Key Fields tab screenshot', async ({ page }) => {
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /guides/i }).click();
    await page.waitForTimeout(500);

    const drawer = page.locator('.MuiDrawer-paper');
    await drawer.locator('.MuiCard-root').filter({ hasText: 'pacs.008' }).click();
    await page.waitForTimeout(300);

    await page.getByRole('tab', { name: /key fields/i }).click();
    await page.waitForTimeout(300);

    const modal = page.locator('.MuiDialog-paper');
    await expect(modal.getByText('Unique identifier assigned by the instructing party')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/key-fields-tab.png' });
  });
});
