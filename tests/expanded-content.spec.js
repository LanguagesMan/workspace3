// Test expanded video catalog
const { test, expect } = require('@playwright/test');

test('should load expanded video catalog with preloading', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000);

    // Check console for video counts
    const subtitledLog = logs.find(l => l.includes('REAL Spanish subtitles'));
    const addedLog = logs.find(l => l.includes('Added') && l.includes('more videos'));

    console.log('Logs:', logs.filter(l => l.includes('videos') || l.includes('Loaded')));

    // Count reels in DOM
    const reels = await page.locator('.reel');
    const count = await reels.count();

    console.log(`✅ Total reels loaded: ${count}`);
    expect(count).toBeGreaterThanOrEqual(3);

    // Take screenshot
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: '/tmp/expanded-content.png' });
    console.log('📸 Screenshot: /tmp/expanded-content.png');
});
