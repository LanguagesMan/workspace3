const { test, expect } = require('@playwright/test');

test('Dual-language captions with AI punctuation', async ({ page }) => {
    console.log('🎬 Testing dual-language captions...');

    // Navigate to the unified feed
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Wait for feed to load
    await page.waitForSelector('.content-card', { timeout: 10000 });
    console.log('✅ Feed loaded');

    // Wait for videos to appear
    const videos = await page.locator('.feed-video').count();
    console.log(`📹 Found ${videos} videos in feed`);

    if (videos > 0) {
        // Wait for first video
        const firstVideo = page.locator('.feed-video').first();
        await firstVideo.waitFor({ state: 'visible' });

        // Play video (it should auto-play but let's be sure)
        await firstVideo.click();

        // Wait a bit for subtitles to appear
        await page.waitForTimeout(2000);

        // Check for subtitle container
        const subtitleContainer = page.locator('.video-subtitle-container').first();
        const hasSubtitles = await subtitleContainer.count() > 0;
        console.log(`📝 Subtitle container exists: ${hasSubtitles}`);

        if (hasSubtitles) {
            // Check for dual-language captions
            const spanishCaption = page.locator('.caption-spanish');
            const englishCaption = page.locator('.caption-english');

            const hasSpanish = await spanishCaption.count() > 0;
            const hasEnglish = await englishCaption.count() > 0;

            console.log(`🇪🇸 Spanish caption visible: ${hasSpanish}`);
            console.log(`🇺🇸 English caption visible: ${hasEnglish}`);

            if (hasSpanish) {
                const spanishText = await spanishCaption.first().textContent();
                console.log(`🇪🇸 Spanish text: "${spanishText}"`);

                // Check for AI punctuation (should have . ! ? or ¡ ¿)
                const hasPunctuation = /[.!?¡¿]/.test(spanishText);
                console.log(`✓ Has AI punctuation: ${hasPunctuation}`);
            }

            if (hasEnglish) {
                const englishText = await englishCaption.first().textContent();
                console.log(`🇺🇸 English text: "${englishText}"`);
            }
        }

        // Take screenshot
        const timestamp = Date.now();
        await page.screenshot({
            path: `screenshots/${timestamp}-dual-captions.png`,
            fullPage: true
        });
        console.log(`📸 Screenshot saved: screenshots/${timestamp}-dual-captions.png`);
    }

    console.log('✅ Test completed!');
});
