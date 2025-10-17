const { chromium } = require('@playwright/test');

(async () => {
    console.log('🎯 ENTERTAINMENT FEED TRANSCRIPTION TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 1. Navigate to entertainment feed (port 3001)
        console.log('1️⃣ Loading entertainment feed...');
        await page.goto('http://localhost:3001/entertainment-feed.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(6000); // Increased wait for API fetch + video rendering
        console.log('   ✅ Page loaded\n');

        // 2. Check if videos are present
        console.log('2️⃣ Checking for videos...');

        // Wait for video element to appear (broader selector)
        await page.waitForSelector('video', { timeout: 10000 }).catch(() => null);
        await page.waitForTimeout(2000); // Extra time for data-video-id attribute

        const videos = await page.$$('video');
        console.log(`   ✅ Found ${videos.length} videos\n`);

        if (videos.length === 0) {
            console.log('   ❌ NO VIDEOS FOUND - Feed not loading correctly\n');
            await browser.close();
            return;
        }

        // 3. Check if WordLevelSubtitles system is initialized
        console.log('3️⃣ Checking transcription system...');
        const systemInitialized = await page.evaluate(() => {
            return {
                feedExists: typeof window.feed !== 'undefined',
                subtitlesSystemExists: window.feed?.subtitlesSystem !== undefined,
                wordLevelSubtitlesClass: typeof WordLevelSubtitles !== 'undefined'
            };
        });
        console.log('   System status:', systemInitialized);

        if (!systemInitialized.subtitlesSystemExists) {
            console.log('   ❌ TRANSCRIPTION SYSTEM NOT INITIALIZED!\n');
        } else {
            console.log('   ✅ Transcription system initialized\n');
        }

        // 4. Play first video and check for subtitles
        console.log('4️⃣ Testing subtitles on first video...');
        await page.evaluate(() => {
            const video = document.querySelector('video[data-video-id]');
            if (video) {
                video.play();
                video.currentTime = 2; // Jump to 2 seconds
            }
        });

        await page.waitForTimeout(2000);

        // 5. Check for subtitle container
        const subtitleCheck = await page.evaluate(() => {
            const container = document.querySelector('.video-subtitle-container');
            const spanishCaption = document.querySelector('.caption-spanish');
            const englishCaption = document.querySelector('.caption-english');

            return {
                containerExists: !!container,
                containerHTML: container ? container.innerHTML.substring(0, 200) : 'NO CONTAINER',
                spanishText: spanishCaption ? spanishCaption.textContent : 'NO SPANISH',
                englishText: englishCaption ? englishCaption.textContent : 'NO ENGLISH'
            };
        });

        console.log('   Subtitle check:', subtitleCheck);

        if (!subtitleCheck.containerExists) {
            console.log('   ❌ NO SUBTITLE CONTAINER - Transcriptions not rendering!\n');
        } else if (subtitleCheck.spanishText === 'NO SPANISH') {
            console.log('   ⚠️  Container exists but no Spanish text showing\n');
        } else {
            console.log('   ✅ TRANSCRIPTIONS WORKING!\n');
            console.log(`   🇪🇸 Spanish: "${subtitleCheck.spanishText}"`);
            console.log(`   🇺🇸 English: "${subtitleCheck.englishText}"\n`);
        }

        // 6. Check clickable words
        console.log('5️⃣ Testing clickable word translations...');
        const clickableWords = await page.$$('.caption-spanish .word-clickable');
        console.log(`   ✅ Found ${clickableWords.length} clickable words\n`);

        // 7. Screenshot
        console.log('6️⃣ Taking screenshot...');
        await page.screenshot({
            path: `screenshots/entertainment-feed-${Date.now()}.png`,
            fullPage: true
        });
        console.log('   ✅ Screenshot saved to screenshots/\n');

        // FINAL VERDICT
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 FINAL VERDICT:\n');

        const allGood = videos.length > 0 &&
                       systemInitialized.feedExists &&
                       systemInitialized.subtitlesSystemExists &&
                       subtitleCheck.containerExists &&
                       subtitleCheck.spanishText !== 'NO SPANISH';

        if (allGood) {
            console.log('✅ ✅ ✅ TRANSCRIPTION FIX VERIFIED! ✅ ✅ ✅');
            console.log(`   • ${videos.length} videos loaded`);
            console.log('   • Transcription system initialized');
            console.log('   • Dual-language captions rendering');
            console.log(`   • ${clickableWords.length} clickable words`);
        } else {
            console.log('❌ TRANSCRIPTIONS STILL BROKEN:');
            if (videos.length === 0) console.log('   • No videos found');
            if (!systemInitialized.feedExists) console.log('   • Feed class not initialized');
            if (!systemInitialized.subtitlesSystemExists) console.log('   • Subtitle system not initialized');
            if (!subtitleCheck.containerExists) console.log('   • No subtitle container');
            if (subtitleCheck.spanishText === 'NO SPANISH') console.log('   • No Spanish text showing');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await browser.close();
    }
})();
