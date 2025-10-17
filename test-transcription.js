const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('🎬 Testing Real-time Transcription Feature...\n');

    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // Click "Tap to Start" to begin
    console.log('▶️  Clicking "Tap to Start"...');
    await page.click('text=Tap to Start');
    await page.waitForTimeout(3000);

    // Wait for video to start playing
    await page.waitForSelector('video', { timeout: 10000 });
    console.log('✅ Video element found');

    // Wait for subtitles to appear
    await page.waitForSelector('.subtitle-overlay', { timeout: 10000 });
    console.log('✅ Subtitle overlay found');

    // Check for dual-language captions
    const spanishCaption = await page.locator('.caption-spanish').first();
    const englishCaption = await page.locator('.caption-english').first();

    if (await spanishCaption.isVisible()) {
        const spanishText = await spanishCaption.textContent();
        console.log('🇪🇸 Spanish caption:', spanishText);
    }

    if (await englishCaption.isVisible()) {
        const englishText = await englishCaption.textContent();
        console.log('🇺🇸 English caption:', englishText);
    }

    // Watch for 10 seconds to see real-time updates
    console.log('\n⏱️  Watching transcription for 10 seconds...\n');

    for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(1000);

        const captions = await page.locator('.dual-caption-block').all();
        if (captions.length > 0) {
            console.log(`[${i+1}s] Active captions: ${captions.length}`);

            // Get first visible caption
            const firstCaption = captions[0];
            const spanish = await firstCaption.locator('.caption-spanish .subtitle-text').textContent();
            const english = await firstCaption.locator('.caption-english .subtitle-text').textContent();

            console.log(`   🇪🇸 ${spanish}`);
            console.log(`   🇺🇸 ${english}\n`);
        }
    }

    // Take screenshot
    await page.screenshot({ path: '/tmp/transcription-test.png' });
    console.log('📸 Screenshot saved: /tmp/transcription-test.png');

    // Test clickable word translation
    console.log('\n🔤 Testing clickable word translation...');
    const clickableWords = await page.locator('.clickable-word').all();
    if (clickableWords.length > 0) {
        console.log(`✅ Found ${clickableWords.length} clickable words`);

        // Click first word
        await clickableWords[0].click();
        await page.waitForTimeout(1000);

        // Check for translation popup
        const popup = await page.locator('.word-translation-popup').first();
        if (await popup.isVisible()) {
            const translation = await popup.textContent();
            console.log('✅ Translation popup appeared:', translation);
        }
    }

    console.log('\n✅ Transcription test complete!');

    await page.waitForTimeout(3000);
    await browser.close();
})();
