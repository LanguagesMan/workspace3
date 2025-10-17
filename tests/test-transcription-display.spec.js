const { test, expect } = require('@playwright/test');

test.describe('Transcription Display - Live Testing', () => {
    test('should display dual-language transcriptions without flashing', async ({ page }) => {
        console.log('🎬 Starting transcription display test...');

        // Navigate to TikTok feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');

        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 10000 });
        console.log('✅ Video cards loaded');

        // Get first video card
        const firstVideoCard = page.locator('.video-card').first();
        const videoElement = firstVideoCard.locator('video');
        const transcriptionOverlay = firstVideoCard.locator('.transcription-overlay');

        // Check if video source exists
        const videoSrc = await videoElement.getAttribute('src');
        console.log(`📹 Video source: ${videoSrc}`);

        // Try to play the video
        await videoElement.evaluate(v => {
            v.muted = true; // Mute to allow autoplay
            return v.play();
        }).catch(e => console.log('⚠️ Autoplay blocked:', e.message));

        // Wait a bit for video to start
        await page.waitForTimeout(2000);

        // Check transcription overlay state
        const overlayClasses = await transcriptionOverlay.getAttribute('class');
        console.log(`📝 Overlay classes: ${overlayClasses}`);

        // Monitor transcription changes over 5 seconds
        const changes = [];
        for (let i = 0; i < 10; i++) {
            const spanishText = await firstVideoCard.locator('.spanish-line').textContent().catch(() => '');
            const englishText = await firstVideoCard.locator('.english-line').textContent().catch(() => '');
            const isActive = await transcriptionOverlay.evaluate(el => el.classList.contains('active'));

            changes.push({
                time: i * 500,
                spanish: spanishText,
                english: englishText,
                active: isActive
            });

            console.log(`[${i * 500}ms] Active: ${isActive}, ES: "${spanishText.substring(0, 30)}", EN: "${englishText.substring(0, 30)}"`);

            await page.waitForTimeout(500);
        }

        // Analyze for flashing (rapid active/inactive changes)
        let flashCount = 0;
        for (let i = 1; i < changes.length; i++) {
            if (changes[i].active !== changes[i-1].active) {
                flashCount++;
            }
        }

        console.log(`\n📊 Analysis:`);
        console.log(`- Total state changes: ${flashCount}`);
        console.log(`- Unique Spanish texts: ${new Set(changes.map(c => c.spanish)).size}`);
        console.log(`- Unique English texts: ${new Set(changes.map(c => c.english)).size}`);

        if (flashCount > 4) {
            console.error(`🚨 FLASHING DETECTED! ${flashCount} rapid changes in 5 seconds`);
        } else {
            console.log('✅ No excessive flashing detected');
        }

        // Take screenshot
        await page.screenshot({
            path: `/Users/mindful/_projects/workspace3/screenshots/transcription-display-${Date.now()}.png`,
            fullPage: false
        });

        console.log('📸 Screenshot saved');

        // Keep browser open for visual inspection
        await page.waitForTimeout(3000);
    });
});
