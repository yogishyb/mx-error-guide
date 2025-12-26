import { test, expect } from '@playwright/test';

test.describe('LIVE DEMO: Try It Section with Error Code Chips', () => {
  test.use({
    viewport: { width: 1280, height: 720 },
  });

  test('slow visual demo of Try It chips', async ({ page }) => {
    console.log('\n🎬 STARTING LIVE DEMO - Watch your Chrome browser!\n');

    // Step 1: Navigate to homepage
    console.log('Step 1: Loading homepage...');
    await page.goto('/iso20022');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait so user can see homepage
    console.log('✓ Homepage loaded\n');

    // Step 2: Scroll to Try It section
    console.log('Step 2: Scrolling to "Try it" section...');
    const tryItSection = page.locator('text="Try it: Click an example error to see how it works"').first();
    await tryItSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);

    // Verify chips are visible
    const ac04Chip = page.locator('text="AC04"').first();
    const am05Chip = page.locator('text="AM05"').first();
    const rc01Chip = page.locator('text="RC01"').first();
    const be04Chip = page.locator('text="BE04"').first();

    await expect(ac04Chip).toBeVisible();
    await expect(am05Chip).toBeVisible();
    await expect(rc01Chip).toBeVisible();
    await expect(be04Chip).toBeVisible();
    console.log('✓ All 4 chips visible: AC04, AM05, RC01, BE04\n');

    await page.screenshot({ path: 'e2e/screenshots/demo-01-try-it-section.png', fullPage: true });
    await page.waitForTimeout(3000);

    // Step 3: Click AC04 chip
    console.log('Step 3: Clicking AC04 chip...');
    await ac04Chip.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verify we're on AC04 page
    await expect(page).toHaveURL(/AC04/);
    console.log('✓ Navigated to AC04 error page\n');
    await page.screenshot({ path: 'e2e/screenshots/demo-02-ac04-page.png', fullPage: true });

    // Step 4: Click Back button
    console.log('Step 4: Clicking Back button...');
    const backButton = page.locator('button:has-text("Back")').first();
    await backButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✓ Returned to homepage\n');

    // Step 5: Click AM05 chip
    console.log('Step 5: Clicking AM05 chip...');
    await am05Chip.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/AM05/);
    console.log('✓ Navigated to AM05 error page\n');
    await page.screenshot({ path: 'e2e/screenshots/demo-03-am05-page.png', fullPage: true });

    // Step 6: Click Back button
    console.log('Step 6: Clicking Back button...');
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✓ Returned to homepage\n');

    // Step 7: Click RC01 chip
    console.log('Step 7: Clicking RC01 chip...');
    await rc01Chip.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/RC01/);
    console.log('✓ Navigated to RC01 error page\n');
    await page.screenshot({ path: 'e2e/screenshots/demo-04-rc01-page.png', fullPage: true });

    // Step 8: Click backdrop (outside modal if any) - testing navigate(-1) fix
    console.log('Step 8: Testing Back navigation...');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✓ Navigate back successful\n');

    // Step 9: Click BE04 chip
    console.log('Step 9: Clicking BE04 chip...');
    await be04Chip.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/BE04/);
    console.log('✓ Navigated to BE04 error page\n');
    await page.screenshot({ path: 'e2e/screenshots/demo-05-be04-page.png', fullPage: true });

    // Final pause
    await page.waitForTimeout(3000);
    console.log('\n✅ DEMO COMPLETE - All chips functional!\n');
  });
});
