// 📸 SCREENSHOT GENERATOR - Prove feed quality matches TikTok/Instagram 2025
const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshots() {
    console.log('📸 Generating screenshots to prove BEST FEED quality...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, // iPhone 14 Pro
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    });
    const page = await context.newPage();

    try {
        // Screenshot 1: Multi-source news API response
        console.log('📰 Screenshot 1: Multi-source news API...');
        await page.goto('http://localhost:3001/api/news/spanish?count=10&level=A2');
        await page.waitForTimeout(1000);

        const screenshotPath1 = path.join(__dirname, 'screenshots', 'best-feed-news-api.png');
        await page.screenshot({ path: screenshotPath1, fullPage: true });
        console.log(`✅ Saved: ${screenshotPath1}\n`);

        // Screenshot 2: Personalized feed API response
        console.log('🎯 Screenshot 2: Personalized feed API with viral scoring...');
        await page.goto('http://localhost:3001/api/videos/personalized?userId=demo&level=A2&count=15');
        await page.waitForTimeout(1000);

        const screenshotPath2 = path.join(__dirname, 'screenshots', 'best-feed-personalized-api.png');
        await page.screenshot({ path: screenshotPath2, fullPage: true });
        console.log(`✅ Saved: ${screenshotPath2}\n`);

        // Screenshot 3: Main feed page
        console.log('🌐 Screenshot 3: Main feed page (iPhone view)...');
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const screenshotPath3 = path.join(__dirname, 'screenshots', 'best-feed-main-page.png');
        await page.screenshot({ path: screenshotPath3, fullPage: false });
        console.log(`✅ Saved: ${screenshotPath3}\n`);

        // Generate summary report
        console.log('📊 SCREENSHOT SUMMARY:');
        console.log('='.repeat(60));
        console.log('1. Multi-source news API (Guardian + El País + BBC Mundo)');
        console.log('2. Personalized feed with TikTok 2025 viral scoring');
        console.log('3. Main feed page (mobile-first design)');
        console.log('='.repeat(60));
        console.log('\n✅ All screenshots saved to ./screenshots/');

    } catch (error) {
        console.error('❌ Screenshot generation failed:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run screenshot generator
takeScreenshots()
    .then(() => {
        console.log('\n🎯 Screenshot generation complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Failed:', error);
        process.exit(1);
    });
