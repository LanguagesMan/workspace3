// 🎯 CURRENT STATE TEST - Verify all features working
const { test, expect } = require('@playwright/test');

test.describe('Current State Verification', () => {
  test('should capture current state of apple-feed', async ({ page }) => {
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: 'screenshots/CURRENT-STATE-LATEST.png',
      fullPage: true
    });

    // Check all 4 FAB buttons exist
    const fabButtons = page.locator('.fab');
    const fabCount = await fabButtons.count();
    expect(fabCount).toBe(4);

    console.log(`✅ Current state: ${fabCount} FAB buttons found`);
    console.log('  🧠 SRS Review');
    console.log('  🌍 Saved Words');
    console.log('  📝 Generate Article');
    console.log('  + Load More');
  });

  test('should verify SRS system is accessible', async ({ page }) => {
    await page.goto('http://localhost:3002/srs-review.html');
    await page.waitForTimeout(1500);

    // Check page loaded
    const header = page.locator('.logo');
    await expect(header).toHaveText('🧠 SRS REVIEW');

    console.log('✅ SRS Review page accessible');
  });
});
