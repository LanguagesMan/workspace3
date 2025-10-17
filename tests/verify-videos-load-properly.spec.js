const { test, expect } = require('@playwright/test');

test('✅ Videos load properly with enough wait time', async ({ page }) => {
    console.log('\n🎬 Testing TikTok videos with proper wait...\n');

    // Go to main page
    await page.goto('http://localhost:3002/');
    
    // Wait for JavaScript to execute and videos to load
    console.log('⏳ Waiting for videos to load (10 seconds)...');
    await page.waitForTimeout(10000);

    // Check video slides
    const videoSlides = await page.locator('.video-slide');
    const count = await videoSlides.count();

    console.log(`📊 Results:`);
    console.log(`   Video slides found: ${count}`);

    if (count > 0) {
        // Get first video details
        const firstVideo = videoSlides.first().locator('video');
        const src = await firstVideo.getAttribute('src');
        
        console.log(`   First video src: ${src}`);
        console.log(`   ✅ Videos ARE loading!`);

        // Check subtitle words
        const subtitleWords = await page.locator('.clickable-word').count();
        console.log(`   Clickable words: ${subtitleWords}`);

        // Take screenshot
        await page.screenshot({ path: 'videos-loaded-proof.png' });
        console.log(`\n📸 Screenshot: videos-loaded-proof.png`);

        expect(count).toBeGreaterThan(0);
    } else {
        console.log(`   ❌ NO videos found - app might be broken!`);
        
        // Debug: Check what's in the container
        const containerHTML = await page.locator('#videoContainer').innerHTML();
        console.log(`\n📦 Container HTML (first 500 chars):`);
        console.log(containerHTML.substring(0, 500));

        throw new Error('Videos not loading!');
    }
});
