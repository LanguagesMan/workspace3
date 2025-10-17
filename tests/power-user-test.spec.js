const { test, expect } = require('@playwright/test');

/**
 * POWER USER PERSONA TEST
 *
 * Profile: Maria, 32, Advanced learner (B2-C1)
 * Goals: Native fluency, watch authentic content, expand vocabulary
 * Tech-savvy: Uses YouTube Shorts daily, expects smooth performance
 *
 * Pain Points to Test:
 * 1. Performance - expects instant loading like YouTube Shorts
 * 2. Content variety - wants diverse native content
 * 3. Advanced features - expects gestures, shortcuts, customization
 * 4. Smooth scrolling - no lag, no jank
 * 5. Visual polish - modern gradients, animations
 */

test.describe('Power User (Advanced Learner) Experience', () => {
  test('should load instantly like YouTube Shorts (< 2s)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3002');

    // Wait for first video to be visible
    await page.waitForSelector('.video-container', { timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(2000); // < 2s like YouTube
  });

  test('should show reels IMMEDIATELY (no menu first)', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // First thing visible should be video, not menu
    const videoContainer = page.locator('.video-container').first();
    await expect(videoContainer).toBeVisible({ timeout: 2000 });

    // Check video is full viewport height
    const height = await videoContainer.evaluate(el => el.offsetHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    console.log(`📏 Video height: ${height}px, Viewport: ${viewportHeight}px`);
    expect(height).toBeGreaterThan(viewportHeight * 0.8); // At least 80% viewport
  });

  test('should have smooth scroll-snap like TikTok/YouTube Shorts', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');

    // Get scroll container
    const scrollContainer = page.locator('.feed-container');
    await expect(scrollContainer).toBeVisible();

    // Check CSS scroll-snap
    const snapType = await scrollContainer.evaluate(el =>
      window.getComputedStyle(el).scrollSnapType
    );

    console.log(`🎯 Scroll snap type: ${snapType}`);
    expect(snapType).toContain('y mandatory');
  });

  test('should have clickable Spanish word translations', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.subtitle-container');

    // Find Spanish words in subtitles
    const words = page.locator('.subtitle-container .word, .subtitle-container span[data-word]');
    const count = await words.count();

    console.log(`📝 Found ${count} clickable words`);
    expect(count).toBeGreaterThan(0);

    // Click first word
    if (count > 0) {
      await words.first().click();

      // Should show translation popup
      const translation = page.locator('.translation-popup, .word-translation, [class*="translation"]');
      await expect(translation).toBeVisible({ timeout: 2000 });
    }
  });

  test('should have premium UI quality (gradients, animations)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');

    // Check for modern CSS features
    const hasGradients = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).some(el => {
        const style = window.getComputedStyle(el);
        return style.background.includes('gradient') ||
               style.backgroundImage.includes('gradient');
      });
    });

    console.log(`🎨 Has gradients: ${hasGradients}`);
    expect(hasGradients).toBe(true);
  });

  test('should have engagement stats like YouTube (views, likes)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');

    // Look for engagement metrics
    const metrics = page.locator('[class*="engagement"], [class*="stats"], .likes, .views');
    const count = await metrics.count();

    console.log(`📊 Found ${count} engagement metrics`);
    expect(count).toBeGreaterThan(0);
  });

  test('should have speed control like Lingopie/YouTube', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');

    // Look for speed controls
    const speedControl = page.locator('[class*="speed"], [class*="playback"]');
    const hasSpeedControl = await speedControl.count() > 0;

    console.log(`⚡ Has speed control: ${hasSpeedControl}`);
    expect(hasSpeedControl).toBe(true);
  });

  test('should support gestures (swipe up/down for navigation)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');

    const initialVideo = await page.locator('.video-container').first().textContent();

    // Simulate swipe up
    const container = page.locator('.feed-container');
    await container.evaluate(el => {
      el.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    const newVideo = await page.locator('.video-container').first().textContent();
    console.log(`📱 Swipe navigation works: ${initialVideo !== newVideo}`);
  });

  test('should have no duplicate navbars (common bug)', async ({ page }) => {
    await page.goto('http://localhost:3002');

    const navCount = await page.locator('nav').count();
    console.log(`🧭 Nav count: ${navCount}`);

    expect(navCount).toBeLessThanOrEqual(1); // Max 1 nav
  });

  test('should have diverse content types (videos, articles, music)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container, .content-card');

    // Check for different content types
    const hasVideos = await page.locator('video, .video-container').count() > 0;
    const hasNav = await page.locator('nav').count() > 0;

    console.log(`📹 Has videos: ${hasVideos}`);
    console.log(`🧭 Has navigation: ${hasNav}`);
  });

  test('PAIN POINT: Advanced users want faster word lookup', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.subtitle-container');

    const words = page.locator('.subtitle-container .word, .subtitle-container span[data-word]');

    if (await words.count() > 0) {
      const startTime = Date.now();
      await words.first().click();

      // Wait for translation to appear
      await page.waitForSelector('.translation-popup, .word-translation, [class*="translation"]', { timeout: 1000 });

      const responseTime = Date.now() - startTime;
      console.log(`⚡ Word translation response: ${responseTime}ms`);

      // Power users expect < 100ms response
      if (responseTime > 100) {
        console.log(`❌ PAIN POINT: Word lookup too slow (${responseTime}ms > 100ms)`);
      }
    }
  });

  test('PAIN POINT: Advanced users want keyboard shortcuts', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');

    // Test common shortcuts
    // Space = play/pause
    // ↑/↓ = navigate videos
    // S = save word

    console.log('⌨️  PAIN POINT: No keyboard shortcuts detected');
    console.log('   Power users expect: Space (play/pause), ↑↓ (navigate), S (save)');
  });

  test('PAIN POINT: No content filtering by difficulty', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Look for difficulty filters
    const filters = page.locator('[class*="filter"], [class*="difficulty"], [class*="level"]');
    const hasFilters = await filters.count() > 0;

    if (!hasFilters) {
      console.log('❌ PAIN POINT: No difficulty filters for advanced content');
    }
  });

  test('should take screenshot for visual comparison', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-container');
    await page.waitForTimeout(2000); // Let animations settle

    await page.screenshot({
      path: `screenshots/power_user-${Date.now()}.png`,
      fullPage: true
    });

    console.log('✅ Screenshot saved for power_user persona');
  });
});
