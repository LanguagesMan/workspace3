/**
 * DEBUG TRANSCRIPTION - Check console logs
 */

const { test } = require('@playwright/test');

test('Debug transcription loading', async ({ page }) => {
    // Capture console logs
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log(`📢 Browser: ${text}`);
    });

    // Capture errors
    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
    });

    await page.goto('http://localhost:3002');
    console.log('\n✅ Page loaded\n');

    // Wait for videos
    await page.waitForSelector('.reel video', { timeout: 10000 });
    console.log('✅ Videos found\n');

    // Wait longer to see if transcription loads
    await page.waitForTimeout(5000);

    console.log('\n📊 All console logs:');
    logs.forEach(log => console.log(`  - ${log}`));

    // Check if transcription observer was created
    const hasObserver = logs.some(log => log.includes('Loading transcriptions'));
    console.log(`\n🎬 Transcription loading triggered: ${hasObserver}`);

    // Check DOM state
    const videoCount = await page.locator('.reel').count();
    const hasSubtitlesAttr = await page.locator('.reel').first().evaluate(reel => {
        const videoData = reel.querySelector('video');
        return videoData ? 'checked' : 'no video';
    });

    console.log(`\n📹 Reels on page: ${videoCount}`);
    console.log(`Video check: ${hasSubtitlesAttr}`);

    await page.screenshot({ path: `screenshots/debug-transcription-${Date.now()}.png` });
});
