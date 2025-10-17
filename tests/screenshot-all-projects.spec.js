const { test } = require('@playwright/test');

test.describe('🎯 SCREENSHOT ALL DISCOVERED PROJECTS', () => {
    const timestamp = Date.now();

    test('Screenshot PocketSpanish if running', async ({ page }) => {
        try {
            await page.goto('http://localhost:3000', { timeout: 5000 });
            await page.waitForTimeout(2000);
            await page.screenshot({
                path: `screenshots/PROJECT-PocketSpanish-${timestamp}.png`,
                fullPage: true
            });
            console.log('✅ PocketSpanish screenshot captured');
        } catch (error) {
            console.log('⏭️ PocketSpanish not running, skipping');
        }
    });

    test('Screenshot workspace3 main page', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);
        await page.screenshot({
            path: `screenshots/PROJECT-workspace3-main-${timestamp}.png`,
            fullPage: true
        });
        console.log('✅ Workspace3 main page captured');
    });

    test('Screenshot workspace3 stats dashboard', async ({ page }) => {
        await page.goto('http://localhost:3002/stats');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/PROJECT-workspace3-stats-${timestamp}.png`,
            fullPage: true
        });
        console.log('✅ Workspace3 stats dashboard captured');
    });

    test('Screenshot workspace3 unified app', async ({ page }) => {
        await page.goto('http://localhost:3002/unified');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/PROJECT-workspace3-unified-${timestamp}.png`,
            fullPage: true
        });
        console.log('✅ Workspace3 unified app captured');
    });

    test('Screenshot workspace3 comedy creator', async ({ page }) => {
        await page.goto('http://localhost:3002/comedy');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/PROJECT-workspace3-comedy-${timestamp}.png`,
            fullPage: true
        });
        console.log('✅ Workspace3 comedy creator captured');
    });

    test('API Response Screenshots', async ({ page, request }) => {
        // Test Globe Universe API and screenshot response
        const globeResponse = await request.get('http://localhost:3002/api/globe-universe/story');
        const globeData = await globeResponse.json();

        console.log('🌍 Globe Universe Story Generated:');
        console.log(`   Title: ${globeData.story?.title}`);
        console.log(`   Spanish: ${globeData.story?.structure?.spanishLearning?.sentence1}`);
        console.log(`   Vocabulary: ${globeData.story?.metadata?.vocabulary_count} words`);

        // Test unified feed API
        const feedResponse = await request.get('http://localhost:3002/api/unified-feed?level=A2&interests=news,culture');
        const feedData = await feedResponse.json();

        console.log('📰 Unified Feed Content:');
        console.log(`   Videos: ${feedData.videos?.length || 0} items`);
        console.log(`   Sources: ${feedData.metadata?.sources?.join(', ')}`);
    });
});
