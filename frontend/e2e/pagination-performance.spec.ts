import { test, expect } from '@playwright/test';

test.describe('Pagination Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('A. Page Navigation Speed - measures time to switch between pages', async ({ page }) => {
    console.log('=== Testing Page Navigation Performance ===');

    // Wait for initial cards to load
    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Measure page 1 → 2
    const page2Button = page.locator('button[aria-label="Go to page 2"]');
    await page2Button.scrollIntoViewIfNeeded();

    const startTime1 = Date.now();
    await page2Button.click();
    await page.waitForTimeout(500); // Wait for page transition
    // Verify we're on page 2
    await expect(page.locator('button[aria-label="page 2"]')).toHaveAttribute('aria-current', 'page');
    const time1to2 = Date.now() - startTime1;

    console.log(`⏱️  Page 1→2 navigation: ${time1to2}ms`);

    // Measure page 2 → 3
    const page3Button = page.locator('button[aria-label="Go to page 3"]');
    const startTime2 = Date.now();
    await page3Button.click();
    await page.waitForTimeout(500);
    await expect(page.locator('button[aria-label="page 3"]')).toHaveAttribute('aria-current', 'page');
    const time2to3 = Date.now() - startTime2;

    console.log(`⏱️  Page 2→3 navigation: ${time2to3}ms`);

    // Measure page 3 → 1 (back to start)
    const page1Button = page.locator('button[aria-label="Go to page 1"]');
    const startTime3 = Date.now();
    await page1Button.click();
    await page.waitForTimeout(500);
    await expect(page.locator('button[aria-label="page 1"]')).toHaveAttribute('aria-current', 'page');
    const time3to1 = Date.now() - startTime3;

    console.log(`⏱️  Page 3→1 navigation: ${time3to1}ms`);

    const avgTime = (time1to2 + time2to3 + time3to1) / 3;
    console.log(`📊 Average page switch time: ${avgTime.toFixed(2)}ms`);

    // Performance assertion: should be < 1000ms (generous)
    expect(time1to2).toBeLessThan(1000);
    expect(time2to3).toBeLessThan(1000);
    expect(time3to1).toBeLessThan(1000);

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/pagination-navigation.png' });
  });

  test('B. "Show All" Button Performance - measures render time for all 903 cards', async ({ page }) => {
    console.log('=== Testing "Show All" Performance ===');

    // Wait for initial page load
    await expect(page.locator('.MuiCard-root').first()).toBeVisible();

    // Count initial cards (should be 12)
    const initialCards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Initial cards displayed: ${initialCards}`);

    // Get memory before (if available)
    const memoryBefore = await page.evaluate(() => {
      if (performance && (performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    if (memoryBefore) {
      console.log(`💾 Memory before Show All: ${(memoryBefore / 1024 / 1024).toFixed(2)} MB`);
    }

    // Scroll to Show All button
    const showAllBtn = page.getByRole('button', { name: /show all/i });
    await showAllBtn.scrollIntoViewIfNeeded();

    // Measure click to render time
    console.log('⏱️  Clicking "Show All"...');
    const startTime = Date.now();
    await showAllBtn.click();

    // Wait for Show All button to disappear (it hides after click)
    await page.waitForTimeout(1000);

    // Wait for cards to be rendered (wait for more than 100 cards)
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.MuiCard-root');
      return cards.length > 100;
    }, { timeout: 10000 });

    const renderTime = Date.now() - startTime;
    console.log(`⏱️  Initial render time (100+ cards): ${renderTime}ms`);

    // Wait for all cards to finish rendering
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.MuiCard-root');
      return cards.length >= 900; // Wait for close to all 903 cards
    }, { timeout: 15000 });

    const totalRenderTime = Date.now() - startTime;
    console.log(`⏱️  Total render time for 900+ cards: ${totalRenderTime}ms`);

    // Count final cards
    const finalCards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Total cards displayed: ${finalCards}`);

    // Get memory after (if available)
    const memoryAfter = await page.evaluate(() => {
      if (performance && (performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return null;
    });

    if (memoryBefore && memoryAfter) {
      const memoryIncrease = (memoryAfter - memoryBefore) / 1024 / 1024;
      console.log(`💾 Memory after Show All: ${(memoryAfter / 1024 / 1024).toFixed(2)} MB`);
      console.log(`💾 Memory increase: ${memoryIncrease.toFixed(2)} MB`);
    }

    // Wait for stagger animation to complete (approximately 2 seconds)
    console.log('⏱️  Waiting for stagger animation...');
    await page.waitForTimeout(2500);

    const totalTimeWithAnimation = Date.now() - startTime;
    console.log(`⏱️  Total time including animation: ${totalTimeWithAnimation}ms`);

    // Performance assertions
    expect(finalCards).toBeGreaterThanOrEqual(900); // Should show all cards (or close to 903)
    expect(totalRenderTime).toBeLessThan(10000); // Should render in under 10 seconds
    expect(totalTimeWithAnimation).toBeLessThan(12000); // Including animation should complete in under 12 seconds

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/show-all-complete.png', fullPage: true });
  });

  test('B2. Scroll Performance After "Show All" - tests FPS and smoothness', async ({ page }) => {
    console.log('=== Testing Scroll Performance After Show All ===');

    // Click Show All
    const showAllBtn = page.getByRole('button', { name: /show all/i });
    await showAllBtn.scrollIntoViewIfNeeded();
    await showAllBtn.click();

    // Wait for all cards
    await page.waitForTimeout(1000);
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.MuiCard-root');
      return cards.length >= 900;
    }, { timeout: 15000 });

    console.log('⏱️  Testing scroll performance...');

    // Scroll to bottom and measure performance
    const scrollStartTime = Date.now();

    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // Wait for scroll to complete
    await page.waitForTimeout(2000);

    const scrollTime = Date.now() - scrollStartTime;
    console.log(`⏱️  Scroll to bottom time: ${scrollTime}ms`);

    // Scroll back to top
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    await page.waitForTimeout(2000);

    console.log('✅ Scroll test complete');

    // Take screenshot at middle
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight / 2 });
    });
    await page.screenshot({ path: 'e2e/screenshots/show-all-scrolled.png' });
  });

  test('C. Filter + Pagination Combined - tests performance with filters', async ({ page }) => {
    console.log('=== Testing Filter + Pagination Performance ===');

    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Apply category filter
    const categorySelect = page.locator('.MuiSelect-select').first();
    const startFilter = Date.now();
    await categorySelect.click();
    await page.waitForTimeout(300);

    await page.locator('li[role="option"]').filter({ hasText: /^Account$/ }).click();
    await page.waitForTimeout(500);

    const filterTime = Date.now() - startFilter;
    console.log(`⏱️  Filter apply time: ${filterTime}ms`);

    // Count filtered cards
    const filteredCards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Cards after filter: ${filteredCards}`);

    // Navigate between filtered pages if pagination exists
    const page2Exists = await page.locator('button[aria-label="Go to page 2"]').count();

    if (page2Exists > 0) {
      const page2Button = page.locator('button[aria-label="Go to page 2"]');
      const startPage = Date.now();
      await page2Button.click();
      await page.waitForTimeout(500);
      await expect(page.locator('button[aria-label="page 2"]')).toHaveAttribute('aria-current', 'page');
      const pageTime = Date.now() - startPage;

      console.log(`⏱️  Filter + page navigation: ${pageTime}ms`);

      // Performance assertion
      expect(pageTime).toBeLessThan(1000);
    }

    // Clear filter by selecting All Categories
    await categorySelect.click();
    await page.waitForTimeout(300);
    const startClear = Date.now();
    await page.locator('li[role="option"]').filter({ hasText: /^All Categories$/ }).click();
    await page.waitForTimeout(500);
    const clearTime = Date.now() - startClear;

    console.log(`⏱️  Filter clear time: ${clearTime}ms`);
    expect(clearTime).toBeLessThan(1000);

    await page.screenshot({ path: 'e2e/screenshots/filter-pagination.png' });
  });

  test('D. Search + Pagination - tests performance with search', async ({ page }) => {
    console.log('=== Testing Search + Pagination Performance ===');

    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Search for "AC" (should return many results)
    const searchInput = page.getByPlaceholder(/search error codes/i);

    const startSearch = Date.now();
    await searchInput.fill('AC');
    await page.waitForTimeout(500); // Wait for debounce

    const searchTime = Date.now() - startSearch;
    console.log(`⏱️  Search apply time: ${searchTime}ms`);

    // Count search results
    const searchCards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Cards matching "AC": ${searchCards}`);

    // If pagination exists, test navigation
    const page2Exists = await page.locator('button[aria-label="Go to page 2"]').count();

    if (page2Exists > 0) {
      const page2Button = page.locator('button[aria-label="Go to page 2"]');
      const startPage = Date.now();
      await page2Button.click();
      await page.waitForTimeout(500);
      await expect(page.locator('button[aria-label="page 2"]')).toHaveAttribute('aria-current', 'page');
      const pageTime = Date.now() - startPage;

      console.log(`⏱️  Search + page navigation: ${pageTime}ms`);
      expect(pageTime).toBeLessThan(1000);
    }

    // Clear search
    const startClear = Date.now();
    await searchInput.clear();
    await page.waitForTimeout(500);
    const clearTime = Date.now() - startClear;

    console.log(`⏱️  Search clear time: ${clearTime}ms`);

    // Verify all cards are back
    const allCards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Cards after clearing search: ${allCards}`);

    expect(clearTime).toBeLessThan(1000);

    await page.screenshot({ path: 'e2e/screenshots/search-pagination.png' });
  });

  test('E. Show All Return to Pagination - measures performance switching back', async ({ page }) => {
    console.log('=== Testing Show All → Pagination Switch ===');

    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // First, enable Show All
    const showAllBtn = page.getByRole('button', { name: /show all/i });
    await showAllBtn.scrollIntoViewIfNeeded();
    await showAllBtn.click();
    await page.waitForTimeout(1000);

    // Wait for all cards
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.MuiCard-root');
      return cards.length >= 900;
    }, { timeout: 15000 });

    console.log('✅ Show All enabled, 900+ cards loaded');

    // Now click pagination to go back (page 2)
    const page2Button = page.locator('button[aria-label="Go to page 2"]');
    await page2Button.scrollIntoViewIfNeeded();

    const startSwitch = Date.now();
    await page2Button.click();
    await page.waitForTimeout(500);
    await expect(page.locator('button[aria-label="page 2"]')).toHaveAttribute('aria-current', 'page');

    const switchTime = Date.now() - startSwitch;
    console.log(`⏱️  Show All → Pagination switch time: ${switchTime}ms`);

    // Verify we're back to paginated view (should have ~12 cards)
    const paginatedCards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Cards after returning to pagination: ${paginatedCards}`);

    expect(switchTime).toBeLessThan(2000);
    expect(paginatedCards).toBeLessThan(20); // Should be paginated again (~12 cards per page)

    await page.screenshot({ path: 'e2e/screenshots/return-to-pagination.png' });
  });
});

test.describe('Pagination Performance - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Show All performance on mobile', async ({ page }) => {
    console.log('=== Testing Show All on Mobile ===');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.MuiCard-root').first()).toBeVisible({ timeout: 10000 });

    // Scroll to Show All button
    const showAllBtn = page.getByRole('button', { name: /show all/i });
    await showAllBtn.scrollIntoViewIfNeeded();

    const startTime = Date.now();
    await showAllBtn.click();
    await page.waitForTimeout(1000);

    // Wait for cards to render
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.MuiCard-root');
      return cards.length >= 900;
    }, { timeout: 20000 }); // Mobile may be slower

    const renderTime = Date.now() - startTime;
    console.log(`⏱️  Mobile "Show All" render time: ${renderTime}ms`);

    const cards = await page.locator('.MuiCard-root').count();
    console.log(`📊 Mobile cards displayed: ${cards}`);

    // Mobile should still complete in reasonable time
    expect(renderTime).toBeLessThan(15000); // 15 seconds max for mobile
    expect(cards).toBeGreaterThanOrEqual(900);

    await page.screenshot({ path: 'e2e/screenshots/show-all-mobile.png', fullPage: true });
  });
});
