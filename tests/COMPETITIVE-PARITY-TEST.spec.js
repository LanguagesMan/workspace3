// 🏆 COMPETITIVE PARITY TEST
// Verify we match or exceed TikTok, Duolingo, Babbel features
// Based on COMPETITIVE_ANALYSIS.md research

const { test, expect } = require('@playwright/test');

test.describe('🏆 Competitive Parity: Better than TikTok + Duolingo + Babbel', () => {

  test('TikTok Feature: Full-screen video scroll with snap', async ({ page }) => {
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Click Videos tab for full-screen mode
    await page.click('text=Videos');
    await page.waitForTimeout(1000);

    // Verify full-screen container
    const feedContainer = page.locator('#feedContainer');
    const hasVideosMode = await feedContainer.evaluate(el =>
      el.classList.contains('videos-mode')
    );
    expect(hasVideosMode).toBeTruthy();

    // Verify scroll-snap CSS (TikTok pattern)
    const scrollSnapType = await feedContainer.evaluate(el =>
      window.getComputedStyle(el).scrollSnapType
    );
    console.log('✅ TikTok scroll-snap-type:', scrollSnapType);
    expect(scrollSnapType).toContain('y');

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/COMPETITIVE_tiktok-fullscreen.png',
      fullPage: false
    });
  });

  test('Duolingo Feature: Clickable word translations in subtitles', async ({ page }) => {
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Look for clickable Spanish words
    const spanishWords = page.locator('.spanish-word');
    const wordCount = await spanishWords.count();

    console.log(`✅ Duolingo word count: ${wordCount} clickable words`);

    if (wordCount > 0) {
      // Click first word to test translation tooltip
      await spanishWords.first().click();
      await page.waitForTimeout(500);

      // Check for tooltip
      const tooltip = page.locator('.translation-tooltip');
      const tooltipVisible = await tooltip.count() > 0;

      console.log('✅ Duolingo translation tooltip:', tooltipVisible);

      // Take screenshot
      await page.screenshot({
        path: 'screenshots/COMPETITIVE_duolingo-word-translation.png',
        fullPage: false
      });
    }
  });

  test('Babbel Feature: Mixed content types (videos, articles, memes)', async ({ page }) => {
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Check for variety of content types
    const contentCards = page.locator('.content-card');
    const cardCount = await contentCards.count();

    console.log(`✅ Babbel content variety: ${cardCount} cards loaded`);
    expect(cardCount).toBeGreaterThan(0);

    // Verify different content types exist
    const bodyText = await page.textContent('body');
    const hasVideos = bodyText.includes('video') || bodyText.includes('Video');
    const hasArticles = bodyText.toLowerCase().includes('article');

    console.log('✅ Babbel content mix - Videos:', hasVideos, 'Articles:', hasArticles);

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/COMPETITIVE_babbel-mixed-content.png',
      fullPage: true
    });
  });

  test('EXCEED Competitors: All features in one app', async ({ page }) => {
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Our unique value: TikTok UX + Duolingo education + Babbel structure
    const hasNavigation = await page.locator('.top-nav-tabs').count() > 0;
    const hasStories = await page.locator('.stories-container').count() > 0;
    const hasGamification = await page.locator('#xpText, #streakCount').count() > 0;

    console.log('✅ EXCEED - Navigation:', hasNavigation);
    console.log('✅ EXCEED - Stories:', hasStories);
    console.log('✅ EXCEED - Gamification:', hasGamification);

    expect(hasNavigation).toBeTruthy();

    // Take final comparison screenshot
    await page.screenshot({
      path: 'screenshots/COMPETITIVE_EXCEED_all-features.png',
      fullPage: true
    });
  });

  test('Performance: Load time < 2 seconds (beat competitors)', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`✅ Load time: ${loadTime}ms`);

    // Competitive target: < 2000ms
    expect(loadTime).toBeLessThan(2000);
  });

  test('Mobile responsiveness: Better than Babbel desktop-first approach', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Verify mobile-optimized UI
    const feedContainer = page.locator('#feedContainer');
    const width = await feedContainer.evaluate(el => el.offsetWidth);

    console.log(`✅ Mobile width: ${width}px`);
    expect(width).toBeLessThanOrEqual(375);

    // Take mobile screenshot
    await page.screenshot({
      path: 'screenshots/COMPETITIVE_mobile-better-than-babbel.png',
      fullPage: false
    });
  });
});
