import { test, expect } from '@playwright/test';

test.describe('Comprehensive Screenshot Analysis', () => {
  test('Screenshot all routes and features', async ({ page }) => {
    const timestamp = Date.now();

    // Test root - should be unified-infinite-feed
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `screenshots/root-${timestamp}.png`,
      fullPage: true
    });

    // Check for Spanish content
    const hasSpanish = await page.locator('text=/español|Spanish|VIDA/i').count() > 0;
    console.log(`✅ Root has Spanish content: ${hasSpanish}`);

    // Test stats dashboard
    await page.goto('http://localhost:3002/stats');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `screenshots/stats-${timestamp}.png`,
      fullPage: true
    });

    // Test unified platform
    await page.goto('http://localhost:3002/unified');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `screenshots/unified-${timestamp}.png`,
      fullPage: true
    });

    // Test comedy creator
    await page.goto('http://localhost:3002/comedy');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `screenshots/comedy-${timestamp}.png`,
      fullPage: true
    });

    // Test API health
    const response = await page.goto('http://localhost:3002/health');
    const health = await response.json();
    console.log('Health check:', JSON.stringify(health, null, 2));

    // Test accessibility
    await page.goto('http://localhost:3002');
    const hasAriaLabels = await page.locator('[aria-label]').count() > 0;
    const hasRoles = await page.locator('[role]').count() > 0;

    console.log(`✅ ARIA labels: ${hasAriaLabels}`);
    console.log(`✅ Semantic roles: ${hasRoles}`);

    expect(hasSpanish).toBeTruthy();
    expect(hasAriaLabels).toBeTruthy();
    expect(hasRoles).toBeTruthy();
  });
});
