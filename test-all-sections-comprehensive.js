const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🧪 Testing all sections: Homepage→Articles→Videos→Music→Stories');

    // Test 1: Homepage (Videos tab - default)
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000); // Wait for video to load
    await page.screenshot({ path: 'screenshots/1-homepage-videos.png', fullPage: true });
    console.log('✅ Screenshot 1: Homepage (Videos feed)');

    // Test 2: Articles Feed
    await page.locator('text=Articles').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/2-articles-feed.png', fullPage: true });
    console.log('✅ Screenshot 2: Articles feed');

    // Test 3: Videos (click back to Videos tab)
    await page.locator('text=Videos').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/3-videos-feed.png', fullPage: true });
    console.log('✅ Screenshot 3: Videos feed (return)');

    // Test 4: Music Feed
    await page.locator('text=Music').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/4-music-feed.png', fullPage: true });
    console.log('✅ Screenshot 4: Music feed');

    // Test 5: Stories Feed
    await page.locator('text=Stories').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/5-stories-feed.png', fullPage: true });
    console.log('✅ Screenshot 5: Stories feed');

    // Test 6: Profile
    await page.locator('text=Profile').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/6-profile.png', fullPage: true });
    console.log('✅ Screenshot 6: Profile');

    console.log('\n🎉 All sections tested successfully!');
    console.log('📸 Screenshots saved to screenshots/ directory');

    await browser.close();
})();
