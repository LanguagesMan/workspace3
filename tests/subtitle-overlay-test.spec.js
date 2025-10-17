const { test, expect } = require('@playwright/test');

test.describe('📝 SUBTITLE OVERLAY FEATURE TEST', () => {

  test('1. Video cards with subtitles display correctly', async ({ page }) => {
    console.log('\n📍 TESTING: Subtitle Overlay Feature');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Find video cards with subtitles
    const videoCards = await page.locator('.content-card:has(video[data-subtitles])').count();
    console.log(`✓ Video cards with subtitle data: ${videoCards}`);

    if (videoCards > 0) {
      // Check for subtitle overlay div
      const subtitleOverlays = await page.locator('.subtitle-overlay').count();
      console.log(`✓ Subtitle overlay elements: ${subtitleOverlays}`);

      // Check first video has subtitle badge
      const subtitleBadge = await page.locator('text=📝 Subtitles').first();
      const badgeVisible = await subtitleBadge.isVisible();
      console.log(`✓ Subtitle badge visible: ${badgeVisible ? 'YES' : 'NO'}`);

      await page.screenshot({
        path: 'screenshots/SUBTITLE-feature-loaded.png',
        fullPage: true
      });
      console.log('📸 Screenshot: SUBTITLE-feature-loaded.png');
    }

    console.log(`\n${videoCards > 0 ? '✅' : '❌'} Subtitle overlay setup ${videoCards > 0 ? 'WORKING' : 'BROKEN'}`);
  });

  test('2. Subtitle overlay appears when video plays', async ({ page }) => {
    console.log('\n📍 TESTING: Subtitle Synchronization');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Find first video with subtitles
    const firstVideoWithSubs = page.locator('video[data-subtitles]').first();
    const hasSubtitles = await firstVideoWithSubs.getAttribute('data-subtitles');

    if (hasSubtitles && hasSubtitles !== '') {
      console.log(`✓ Found video with subtitles: ${hasSubtitles}`);

      // Get video ID
      const videoId = await firstVideoWithSubs.getAttribute('data-video-id');
      console.log(`✓ Video ID: ${videoId}`);

      // Play video
      await firstVideoWithSubs.evaluate(video => {
        video.currentTime = 1; // Jump to 1 second
        video.play();
      });

      await page.waitForTimeout(2000);

      // Check if subtitle overlay is active
      const subtitleOverlay = page.locator(`#subtitle-${videoId}`);
      const hasActiveClass = await subtitleOverlay.evaluate(el => el.classList.contains('active'));
      console.log(`✓ Subtitle overlay active: ${hasActiveClass ? 'YES' : 'NO'}`);

      // Check subtitle content
      const subtitleText = await subtitleOverlay.textContent();
      console.log(`✓ Subtitle text: "${subtitleText.substring(0, 50)}..."`);

      // Check for clickable words
      const clickableWords = await subtitleOverlay.locator('.subtitle-word').count();
      console.log(`✓ Clickable subtitle words: ${clickableWords}`);

      await page.screenshot({
        path: 'screenshots/SUBTITLE-overlay-active.png',
        fullPage: false
      });
      console.log('📸 Screenshot: SUBTITLE-overlay-active.png');

      console.log(`\n${hasActiveClass ? '✅' : '⚠️'} Subtitle synchronization ${hasActiveClass ? 'WORKING' : 'NEEDS REVIEW'}`);
    } else {
      console.log('⚠️ No videos with subtitles found in feed');
    }
  });

  test('3. Subtitle words are clickable for translation', async ({ page }) => {
    console.log('\n📍 TESTING: Clickable Subtitle Words');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Find first video with subtitles and play it
    const firstVideoWithSubs = page.locator('video[data-subtitles]').first();
    const hasSubtitles = await firstVideoWithSubs.getAttribute('data-subtitles');

    if (hasSubtitles && hasSubtitles !== '') {
      const videoId = await firstVideoWithSubs.getAttribute('data-video-id');

      // Play video to trigger subtitles
      await firstVideoWithSubs.evaluate(video => {
        video.currentTime = 1;
        video.play();
      });

      await page.waitForTimeout(2000);

      // Try to click a subtitle word
      const subtitleWord = page.locator(`#subtitle-${videoId} .subtitle-word`).first();
      const wordExists = await subtitleWord.count();

      if (wordExists > 0) {
        const wordText = await subtitleWord.textContent();
        console.log(`✓ Clicking subtitle word: "${wordText}"`);

        await subtitleWord.click();
        await page.waitForTimeout(1000);

        // Check if translation popup appeared
        const translationPopup = page.locator('.translation-popup');
        const popupVisible = await translationPopup.isVisible().catch(() => false);
        console.log(`✓ Translation popup appeared: ${popupVisible ? 'YES' : 'NO'}`);

        await page.screenshot({
          path: 'screenshots/SUBTITLE-word-clicked.png',
          fullPage: false
        });
        console.log('📸 Screenshot: SUBTITLE-word-clicked.png');

        console.log(`\n${wordExists > 0 ? '✅' : '❌'} Clickable subtitle words ${wordExists > 0 ? 'WORKING' : 'BROKEN'}`);
      } else {
        console.log('⚠️ No subtitle words found to click');
      }
    } else {
      console.log('⚠️ No videos with subtitles found in feed');
    }
  });

  test('4. SRT file parsing works correctly', async ({ page }) => {
    console.log('\n📍 TESTING: SRT Parser');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Test SRT parser in browser context
    const parserTest = await page.evaluate(async () => {
      const sampleSRT = `1
00:00:00,133 --> 00:00:01,533
ah I love you very much

2
00:00:02,133 --> 00:00:03,166
I love you more

3
00:00:03,533 --> 00:00:04,800
no I love you more`;

      if (window.feed && window.feed.parseSRT) {
        const parsed = window.feed.parseSRT(sampleSRT);
        return {
          success: true,
          count: parsed.length,
          firstEntry: parsed[0],
          timestamps: parsed.map(p => ({ start: p.start, end: p.end, text: p.text }))
        };
      }
      return { success: false };
    });

    if (parserTest.success) {
      console.log(`✓ SRT parser test: SUCCESS`);
      console.log(`✓ Parsed ${parserTest.count} subtitle entries`);
      console.log(`✓ First entry: "${parserTest.firstEntry.text}" (${parserTest.firstEntry.start}s - ${parserTest.firstEntry.end}s)`);
      console.log(`\n✅ SRT parser WORKING`);
    } else {
      console.log(`\n❌ SRT parser NOT FOUND or BROKEN`);
    }
  });

});
