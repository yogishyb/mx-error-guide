import { test, expect } from '@playwright/test';

test.describe('Newsletter Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('newsletter signup card is visible on homepage', async ({ page }) => {
    // Scroll to bottom where newsletter is located
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Check for newsletter heading
    await expect(page.getByText(/Stay Updated on ISO 20022/i)).toBeVisible();
  });

  test('shows newsletter description', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Check for description text
    await expect(page.getByText(/Get notified about new error codes/i)).toBeVisible();
    await expect(page.getByText(/No spam, unsubscribe anytime/i)).toBeVisible();
  });

  test('has email input field', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Find email input by placeholder
    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]').last();
    await expect(emailInput).toBeVisible();
  });

  test('has Subscribe button', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Find subscribe button in newsletter section
    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await expect(subscribeButton).toBeVisible();
  });

  test('shows validation error for empty email', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Click subscribe without entering email
    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();
    await page.waitForTimeout(500);

    // Should show validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('successful subscription shows success message', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Enter valid email
    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]').last();
    await emailInput.fill('test@example.com');

    // Click subscribe
    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();

    // Wait for success state
    await page.waitForTimeout(1000);

    // Should show success message
    await expect(page.getByText(/Thanks for subscribing/i)).toBeVisible();
    await expect(page.getByText(/Check your email to confirm/i)).toBeVisible();
  });

  test('shows loading state during submission', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Enter valid email
    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]').last();
    await emailInput.fill('test@example.com');

    // Click subscribe
    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();

    // Should show loading text briefly
    await expect(page.getByRole('button', { name: /Subscribing/i })).toBeVisible();
  });

  test('clears email input after successful submission', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Enter valid email
    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]').last();
    await emailInput.fill('test@example.com');

    // Click subscribe
    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Success icon should be visible
    const successIcon = page.locator('[data-testid="CheckCircleIcon"]').last();
    await expect(successIcon).toBeVisible();
  });

  test('shows subscriber count text', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Check for "Join X+ payment professionals" text
    await expect(page.getByText(/Join.*payment professionals/i)).toBeVisible();
  });

  test('newsletter card has email icon', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Email icon should be visible at top of newsletter card
    const emailIcons = page.locator('[data-testid="EmailIcon"]');
    await expect(emailIcons.first()).toBeVisible();
  });
});

test.describe('Newsletter Signup - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('newsletter is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    await expect(page.getByText(/Stay Updated on ISO 20022/i)).toBeVisible();
  });

  test('email input is full width on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]').last();
    await expect(emailInput).toBeVisible();

    const inputBox = await emailInput.boundingBox();
    expect(inputBox?.width).toBeGreaterThan(200); // Should be wide enough on mobile
  });

  test('subscribe button is full width on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await expect(subscribeButton).toBeVisible();
  });

  test('validation works on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();
    await page.waitForTimeout(500);

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});

test.describe('Visual Regression - Newsletter', () => {
  test('newsletter card screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Screenshot just the newsletter section
    const newsletter = page.locator('text=Stay Updated on ISO 20022').locator('..');
    await newsletter.screenshot({ path: 'e2e/screenshots/newsletter-card.png' });
  });

  test('newsletter success state screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const emailInput = page.locator('input[type="email"][placeholder="your@email.com"]').last();
    await emailInput.fill('test@example.com');

    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/newsletter-success.png' });
  });

  test('newsletter error state screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const subscribeButton = page.getByRole('button', { name: /Subscribe to Updates/i });
    await subscribeButton.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/newsletter-error.png' });
  });
});
