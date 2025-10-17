const { chromium } = require('@playwright/test');

(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('📸 Taking evidence screenshots...\n');
    
    // 1. Homepage
    await page.goto('http://localhost:3001/entertainment-feed.html');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `screenshots/evidence-${timestamp}-01-homepage.png`, fullPage: true });
    console.log('✅ Screenshot 1: Homepage');
    
    // 2. Wait for videos to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `screenshots/evidence-${timestamp}-02-videos-loaded.png`, fullPage: true });
    console.log('✅ Screenshot 2: Videos loaded');
    
    // 3. Click first video to play and show transcriptions
    const firstVideo = await page.locator('video').first();
    if (await firstVideo.count() > 0) {
        await firstVideo.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `screenshots/evidence-${timestamp}-03-video-playing.png`, fullPage: true });
        console.log('✅ Screenshot 3: Video playing with transcriptions');
    }
    
    await browser.close();
    console.log('\n✅ Evidence screenshots saved!');
})();
