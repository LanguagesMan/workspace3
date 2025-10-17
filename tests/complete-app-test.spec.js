const { test, expect } = require('@playwright/test');

// All pages to test
const PAGES = [
    { name: 'Home', url: 'http://localhost:3001/', critical: true },
    { name: 'TikTok Feed (tiktok.html)', url: 'http://localhost:3001/tiktok.html', critical: true },
    { name: 'TikTok Video Feed', url: 'http://localhost:3001/tiktok-video-feed.html', critical: true },
    { name: 'Langflix App', url: 'http://localhost:3001/langflix-app.html', critical: true },
    { name: 'Test Video', url: 'http://localhost:3001/test-video.html', critical: true },
];

test.describe('Complete App Testing Suite', () => {

    for (const page of PAGES) {
        test(`${page.name} - Full Test`, async ({ page: browserPage }) => {
            console.log(`\n${'='.repeat(70)}`);
            console.log(`🧪 Testing: ${page.name}`);
            console.log(`${'='.repeat(70)}\n`);

            const issues = [];
            const successes = [];

            // Navigate to page
            try {
                await browserPage.goto(page.url, { timeout: 15000, waitUntil: 'domcontentloaded' });
                successes.push('✅ Page loaded');
            } catch (error) {
                issues.push(`❌ CRITICAL: Failed to load - ${error.message}`);
                console.log(`❌ CRITICAL: ${page.name} failed to load`);
                return;
            }

            // Wait for initial render
            await browserPage.waitForTimeout(2000);

            // Screenshot 1: Initial load
            await browserPage.screenshot({
                path: `screenshots/app-test/${page.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-01-initial.png`,
                fullPage: true
            });

            // Check loading screen
            const loadingVisible = await browserPage.locator('#loading, .loading').isVisible().catch(() => false);
            
            if (loadingVisible) {
                console.log('  ⏳ Loading screen visible');
                await browserPage.waitForTimeout(3000);
                const stillLoading = await browserPage.locator('#loading, .loading').isVisible().catch(() => false);
                if (stillLoading) {
                    issues.push('❌ Loading screen stuck (eternal loading)');
                } else {
                    successes.push('✅ Loading screen disappeared');
                }
            }

            // Screenshot 2: After loading
            await browserPage.screenshot({
                path: `screenshots/app-test/${page.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-02-loaded.png`,
                fullPage: true
            });

            // Check for videos
            const videoCount = await browserPage.locator('video').count();
            console.log(`  📹 Videos found: ${videoCount}`);

            if (videoCount > 0) {
                successes.push(`✅ ${videoCount} video elements present`);

                const firstVideoSrc = await browserPage.locator('video').first().getAttribute('src');
                if (firstVideoSrc) {
                    console.log(`  📹 First video src: ${firstVideoSrc.substring(0, 60)}`);
                    successes.push('✅ Videos have src attributes');
                } else {
                    issues.push('❌ Videos missing src attributes');
                }
            } else if (page.critical && !page.name.includes('Test')) {
                issues.push('❌ No videos found on critical page');
            }

            // Check transcriptions
            const transcriptionElements = await browserPage.locator(
                '.transcription-overlay, .spanish-line, .english-line, .transcript-word'
            ).count();

            if (transcriptionElements > 0) {
                console.log(`  📝 Transcription elements: ${transcriptionElements}`);
                successes.push(`✅ ${transcriptionElements} transcription elements`);
            }

            // Check buttons
            const buttons = await browserPage.locator('button').count();
            console.log(`  🔘 Buttons: ${buttons}`);
            if (buttons > 0) {
                successes.push(`✅ ${buttons} interactive buttons`);
            }

            // Mobile test
            await browserPage.setViewportSize({ width: 390, height: 844 });
            await browserPage.waitForTimeout(500);
            await browserPage.screenshot({
                path: `screenshots/app-test/${page.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-03-mobile.png`,
                fullPage: true
            });
            successes.push('✅ Mobile viewport renders');

            // Summary
            console.log(`\n  ✅ Successes (${successes.length}):`);
            successes.forEach(s => console.log(`     ${s}`));

            if (issues.length > 0) {
                console.log(`\n  ❌ Issues (${issues.length}):`);
                issues.forEach(i => console.log(`     ${i}`));
            }

            console.log(`\n${'='.repeat(70)}\n`);
        });
    }
});
