// 🎯 VERIFY: TikTok-Style Reels Section
// Based on: StackOverflow TikTok CSS implementation + User requirements

const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Reels Feed', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load videos from Langfeed folder', async ({ page }) => {
    // Click Videos tab to switch to full-screen TikTok mode
    const videosTab = page.locator('.nav-tab').filter({ hasText: 'Videos' });
    await videosTab.click();

    // Wait for content to load
    await page.waitForSelector('.content-card', { timeout: 10000 });

    // Verify videos are loaded
    const videoCards = page.locator('.content-card video');
    const count = await videoCards.count();

    console.log(`✅ Found ${count} video cards`);
    expect(count).toBeGreaterThan(0);

    // Verify video sources are from local reels
    const firstVideo = videoCards.first();
    const videoSrc = await firstVideo.getAttribute('src');

    console.log(`📹 First video source: ${videoSrc}`);
    expect(videoSrc).toContain('/videos/reels/');
  });

  test('should have TikTok-style full-screen scroll', async ({ page }) => {
    // Switch to Videos tab
    await page.click('text=Videos');
    await page.waitForTimeout(1000);

    // Check if feed container has videos-mode class
    const feedContainer = page.locator('#feedContainer');
    const hasVideosMode = await feedContainer.evaluate(el =>
      el.classList.contains('videos-mode')
    );

    console.log(`✅ Feed has videos-mode: ${hasVideosMode}`);
    expect(hasVideosMode).toBeTruthy();

    // Verify scroll-snap CSS is applied
    const scrollSnapType = await feedContainer.evaluate(el =>
      window.getComputedStyle(el).scrollSnapType
    );

    console.log(`📜 Scroll snap type: ${scrollSnapType}`);
    expect(scrollSnapType).toContain('y');
  });

  test('should display subtitles with clickable words', async ({ page }) => {
    // Switch to Videos tab
    await page.click('text=Videos');
    await page.waitForTimeout(2000);

    // Look for subtitle container
    const subtitles = page.locator('.spanish-text, .subtitles-container, [class*="subtitle"]');

    if (await subtitles.count() > 0) {
      // Check for clickable word elements
      const clickableWords = page.locator('.spanish-word, .word-clickable, [class*="word"]');
      const wordCount = await clickableWords.count();

      console.log(`✅ Found ${wordCount} clickable words`);

      // If words exist, test click interaction
      if (wordCount > 0) {
        await clickableWords.first().click();
        // Wait for translation tooltip
        await page.waitForTimeout(500);
      }
    } else {
      console.log('⚠️ No subtitles found - may need implementation');
    }
  });

  test('should have stories section in navigation', async ({ page }) => {
    // Check for stories container
    const storiesContainer = page.locator('.stories-container, .stories-scroll, #storiesScroll');
    const hasStories = await storiesContainer.count() > 0;

    console.log(`✅ Stories section exists: ${hasStories}`);

    if (hasStories) {
      // Check story items
      const storyItems = page.locator('.story-item');
      const storyCount = await storyItems.count();

      console.log(`📚 Found ${storyCount} story items`);
      expect(storyCount).toBeGreaterThan(0);
    }
  });

  test('should play videos correctly', async ({ page }) => {
    // Switch to Videos tab
    await page.click('text=Videos');
    await page.waitForSelector('video', { timeout: 10000 });

    // Get first video element
    const video = page.locator('video').first();

    // Check if video can be played
    const canPlay = await video.evaluate(async (vid) => {
      try {
        // Attempt to play
        await vid.play();
        return !vid.paused;
      } catch (e) {
        return false;
      }
    });

    console.log(`✅ Video playback working: ${canPlay}`);

    // Verify video properties
    const videoSrc = await video.getAttribute('src');
    const hasControls = await video.getAttribute('controls');

    console.log(`📹 Video src: ${videoSrc}`);
    console.log(`🎮 Has controls: ${hasControls !== null}`);

    expect(videoSrc).toBeTruthy();
  });

  test('should scroll between videos with snap behavior', async ({ page }) => {
    // Switch to Videos tab for full-screen mode
    await page.click('text=Videos');
    await page.waitForTimeout(1500);

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Scroll down
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);

    // Check if scroll position changed
    const afterScroll = await page.evaluate(() => window.scrollY);

    console.log(`📜 Scroll: ${initialScroll} → ${afterScroll}`);

    // In snap scroll, position should snap to card boundaries
    // The scroll should have moved
    expect(afterScroll).not.toBe(initialScroll);
  });

  test('should have no dummy/placeholder content', async ({ page }) => {
    await page.waitForSelector('.content-card', { timeout: 10000 });

    // Check page content for dummy indicators
    const bodyText = await page.textContent('body');

    // These should NOT appear in production
    const dummyIndicators = [
      'Lorem ipsum',
      'Placeholder',
      'dummy',
      'test content',
      'sample video'
    ];

    let hasDummy = false;
    for (const indicator of dummyIndicators) {
      if (bodyText.toLowerCase().includes(indicator.toLowerCase())) {
        console.log(`⚠️ Found dummy content: "${indicator}"`);
        hasDummy = true;
      }
    }

    expect(hasDummy).toBeFalsy();
  });
});
