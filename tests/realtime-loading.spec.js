const { test } = require('@playwright/test');

test('Capture loading screen immediately', async ({ page }) => {
    console.log('\n📸 Capturing initial loading state...\n');

    // Navigate and capture immediately
    await page.goto('http://localhost:3001/tiktok-video-feed.html', { waitUntil: 'domcontentloaded' });

    // Screenshot at 500ms (should show loading screen)
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/realtime-00-500ms.png', fullPage: true });
    console.log('  ✅ Screenshot at 500ms');

    // Screenshot at 1s
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/realtime-01-1s.png', fullPage: true });
    console.log('  ✅ Screenshot at 1s');

    // Screenshot at 2s
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/realtime-02-2s.png', fullPage: true });
    console.log('  ✅ Screenshot at 2s');

    // Screenshot at 3s
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/realtime-03-3s.png', fullPage: true });
    console.log('  ✅ Screenshot at 3s');

    // Screenshot at 5s
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/realtime-04-5s.png', fullPage: true });
    console.log('  ✅ Screenshot at 5s');

    const loadingVisible = await page.locator('#loading').isVisible();
    const videoCount = await page.locator('video').count();

    console.log(`\n  Loading screen visible: ${loadingVisible}`);
    console.log(`  Videos on page: ${videoCount}\n`);
});
