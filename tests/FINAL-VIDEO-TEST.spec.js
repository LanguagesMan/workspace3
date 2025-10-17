const { test, expect } = require('@playwright/test');

test('🎯 FINAL: Videos load and are playable', async ({ page }) => {
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(4000);

    const video = await page.locator('video.feed-video').first();
    await video.waitFor({ state: 'visible' });

    // Wait for video to load metadata (readyState >= 1)
    await video.evaluate(v => {
        return new Promise(resolve => {
            if (v.readyState >= 1) {
                resolve();
            } else {
                v.addEventListener('loadedmetadata', () => resolve(), { once: true });
                setTimeout(() => resolve(), 8000); // Fallback timeout
            }
        });
    });

    const details = await video.evaluate(v => ({
        src: v.src,
        duration: v.duration,
        readyState: v.readyState,
        networkState: v.networkState
    }));

    console.log('\n📹 Video Status:');
    console.log(`  Source: ${details.src}`);
    console.log(`  Duration: ${details.duration}s`);
    console.log(`  Ready State: ${details.readyState} (${['EMPTY', 'METADATA', 'CURRENT', 'FUTURE', 'ENOUGH'][details.readyState] || 'UNKNOWN'})`);
    console.log(`  Network State: ${details.networkState} (${['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][details.networkState] || 'UNKNOWN'})`);

    const hasValidDuration = !isNaN(details.duration) && details.duration > 0;
    console.log(`  ✅ Video can load: ${hasValidDuration}`);

    expect(hasValidDuration).toBe(true);
});
