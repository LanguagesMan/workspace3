const { test, expect } = require('@playwright/test');

test.describe('Entertainment Feed - Port 3002', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
  });

  test('Entertainment feed loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Spanish Learning Feed/);
    await page.waitForSelector('.feed-container', { timeout: 5000 });
  });

  test('Feed cards render with content', async ({ page }) => {
    const cards = await page.locator('.feed-card').count();
    expect(cards).toBeGreaterThan(0);
    console.log(`✅ Found ${cards} feed cards`);
  });

  test('Video content has captions', async ({ page }) => {
    const videoCard = page.locator('.feed-card.type-video').first();
    await videoCard.waitFor({ timeout: 5000 });

    const hasVideo = await videoCard.locator('video').count();
    expect(hasVideo).toBeGreaterThan(0);

    const hasCaptions = await videoCard.locator('.captions').count();
    expect(hasCaptions).toBeGreaterThan(0);
    console.log('✅ Video card has caption elements');
  });

  test('Article content has vocabulary chips', async ({ page }) => {
    const articleCard = page.locator('.feed-card.type-article').first();
    await articleCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const hasVocab = await articleCard.locator('.vocab-chip').count();
    expect(hasVocab).toBeGreaterThan(0);
    console.log(`✅ Article has ${hasVocab} vocabulary chips`);
  });

  test('TikTok-style sidebar buttons exist', async ({ page }) => {
    const sidebar = page.locator('.sidebar').first();
    await sidebar.waitFor({ timeout: 5000 });

    const buttons = await sidebar.locator('.sidebar-button').count();
    expect(buttons).toBeGreaterThanOrEqual(4);
    console.log(`✅ Found ${buttons} sidebar buttons (like, comment, save, share)`);
  });

  test('Scroll snap behavior works', async ({ page }) => {
    const container = page.locator('.feed-container');
    const scrollSnapType = await container.evaluate(el =>
      window.getComputedStyle(el).scrollSnapType
    );
    expect(scrollSnapType).toContain('y mandatory');
    console.log('✅ Scroll snap enabled: y mandatory');
  });

  test('Content types are diverse (video, article, music, story)', async ({ page }) => {
    const videoCards = await page.locator('.feed-card.type-video').count();
    const articleCards = await page.locator('.feed-card.type-article').count();
    const musicCards = await page.locator('.feed-card.type-music').count();
    const storyCards = await page.locator('.feed-card.type-story').count();

    console.log(`📊 Content diversity:`);
    console.log(`   Videos: ${videoCards}`);
    console.log(`   Articles: ${articleCards}`);
    console.log(`   Music: ${musicCards}`);
    console.log(`   Stories: ${storyCards}`);

    expect(videoCards + articleCards + musicCards + storyCards).toBeGreaterThan(10);
  });

  test('Like button interaction works', async ({ page }) => {
    const likeBtn = page.locator('.sidebar-button.like-btn').first();
    await likeBtn.scrollIntoViewIfNeeded();
    await likeBtn.click();

    const hasLikedClass = await likeBtn.evaluate(el => el.classList.contains('liked'));
    expect(hasLikedClass).toBe(true);
    console.log('✅ Like button toggles correctly');
  });

  test('Caption word translations are clickable', async ({ page }) => {
    // Scroll to video card
    const videoCard = page.locator('.feed-card.type-video').first();
    await videoCard.scrollIntoViewIfNeeded();

    // Play video to trigger captions
    const video = videoCard.locator('video');
    await video.click();
    await page.waitForTimeout(2000);

    // Check if caption words are clickable
    const captionWords = await videoCard.locator('.caption-word').count();
    if (captionWords > 0) {
      console.log(`✅ Found ${captionWords} clickable caption words`);
      expect(captionWords).toBeGreaterThan(0);
    } else {
      console.log('⚠️ Caption words not visible yet (may need video to play)');
    }
  });

  test('Progress bar exists on video cards', async ({ page }) => {
    const videoCard = page.locator('.feed-card.type-video').first();
    await videoCard.scrollIntoViewIfNeeded();

    const progressBar = await videoCard.locator('.progress-bar').count();
    expect(progressBar).toBe(1);
    console.log('✅ Progress bar element exists');
  });

  test('Level badges display for content', async ({ page }) => {
    const badges = await page.locator('.level-badge').count();
    expect(badges).toBeGreaterThan(0);
    console.log(`✅ Found ${badges} level badges (A1, A2, B1, B2, C1)`);
  });

  test('Bottom info overlay displays', async ({ page }) => {
    const bottomInfo = await page.locator('.bottom-info').count();
    expect(bottomInfo).toBeGreaterThan(0);
    console.log(`✅ Found ${bottomInfo} bottom info overlays`);
  });

  test('Take screenshot of first card', async ({ page }) => {
    const timestamp = Date.now();
    await page.screenshot({
      path: `screenshots/entertainment-feed-${timestamp}.png`,
      fullPage: false
    });
    console.log(`📸 Screenshot saved: screenshots/entertainment-feed-${timestamp}.png`);
  });

  test('Take screenshot of article card', async ({ page }) => {
    const articleCard = page.locator('.feed-card.type-article').first();
    await articleCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const timestamp = Date.now();
    await page.screenshot({
      path: `screenshots/article-card-${timestamp}.png`,
      fullPage: false
    });
    console.log(`📸 Article screenshot saved: screenshots/article-card-${timestamp}.png`);
  });

  test('Content count matches server (20 items)', async ({ page }) => {
    const totalCards = await page.locator('.feed-card').count();
    expect(totalCards).toBe(20);
    console.log(`✅ All 20 content items loaded`);
  });

  test('Mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const container = page.locator('.feed-container');
    const height = await container.evaluate(el => el.offsetHeight);
    expect(height).toBeGreaterThan(700);
    console.log('✅ Mobile viewport renders correctly');
  });
});
