const { test, expect } = require('@playwright/test');

test.describe('🧪 CURRENT STATE TEST - DOCUMENT EVERYTHING', () => {

  test('1. TEST UNIFIED FEED - Main Page', async ({ page }) => {
    console.log('\n📍 TESTING: unified-infinite-feed.html');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Check for content cards
    const contentCards = await page.locator('.content-card').count();
    console.log(`✓ Content cards loaded: ${contentCards}`);

    // Check for videos
    const videoElements = await page.locator('video').count();
    console.log(`✓ Video elements: ${videoElements}`);

    // Check floating controls
    const floatingBtns = await page.locator('.floating-btn').count();
    console.log(`✓ Floating buttons: ${floatingBtns}`);

    // Screenshot
    await page.screenshot({ path: 'screenshots/STATE-unified-feed.png', fullPage: true });
    console.log('📸 Screenshot: STATE-unified-feed.png');

    console.log(`\n${contentCards > 0 ? '✅' : '❌'} Unified feed ${contentCards > 0 ? 'WORKING' : 'BROKEN'}`);
  });

  test('2. TEST APPLE FEED - Secondary Page', async ({ page }) => {
    console.log('\n📍 TESTING: apple-feed.html');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Check cards
    const cards = await page.locator('.card').count();
    console.log(`✓ Feed cards: ${cards}`);

    // Check FAB buttons
    const fabButtons = await page.locator('.fab').count();
    console.log(`✓ FAB buttons: ${fabButtons}`);

    // Check clickable words
    const spanishWords = await page.locator('.spanish-word').count();
    console.log(`✓ Clickable Spanish words: ${spanishWords}`);

    await page.screenshot({ path: 'screenshots/STATE-apple-feed.png', fullPage: true });
    console.log('📸 Screenshot: STATE-apple-feed.png');

    console.log(`\n${cards > 0 ? '✅' : '❌'} Apple feed ${cards > 0 ? 'WORKING' : 'BROKEN'}`);
  });

  test('3. TEST VIDEO INTEGRATION', async ({ page }) => {
    console.log('\n📍 TESTING: Video Integration in Feed');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Look for video cards specifically
    const videoCards = await page.locator('.content-card:has(video)').count();
    console.log(`✓ Video cards in feed: ${videoCards}`);

    if (videoCards > 0) {
      const firstVideo = page.locator('video').first();
      const videoSrc = await firstVideo.getAttribute('src');
      console.log(`✓ First video source: ${videoSrc}`);

      // Check if video has controls
      const hasControls = await firstVideo.getAttribute('controls');
      console.log(`✓ Video has controls: ${hasControls !== null ? 'YES' : 'NO'}`);
    }

    await page.screenshot({ path: 'screenshots/STATE-video-integration.png', fullPage: true });
    console.log('📸 Screenshot: STATE-video-integration.png');

    console.log(`\n${videoCards > 0 ? '✅' : '❌'} Video integration ${videoCards > 0 ? 'WORKING' : 'BROKEN'}`);
  });

  test('4. TEST API ENDPOINTS', async ({ page }) => {
    console.log('\n📍 TESTING: API Endpoints');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/unified-infinite-feed.html');

    // Test unified feed API
    const feedData = await page.evaluate(async () => {
      const res = await fetch('/api/unified-feed?limit=10');
      return await res.json();
    });

    console.log(`✓ Unified feed API success: ${feedData.success ? 'YES' : 'NO'}`);
    console.log(`✓ Content items returned: ${feedData.videos?.length || 0}`);

    const videoCount = feedData.videos?.filter(v => v.type === 'video').length || 0;
    console.log(`✓ Videos in API response: ${videoCount}`);

    // Test video catalog API
    const videosData = await page.evaluate(async () => {
      const res = await fetch('/api/videos/with-subtitles');
      return await res.json();
    });

    console.log(`✓ Video catalog API success: ${videosData.success ? 'YES' : 'NO'}`);
    console.log(`✓ Videos with subtitles: ${videosData.count || 0}`);

    console.log(`\n${feedData.success && videosData.success ? '✅' : '❌'} APIs ${feedData.success && videosData.success ? 'WORKING' : 'BROKEN'}`);
  });

  test('5. TEST MOBILE RESPONSIVE', async ({ page }) => {
    console.log('\n📍 TESTING: Mobile Responsive');
    console.log('='.repeat(60));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    const contentCards = await page.locator('.content-card').count();
    console.log(`✓ Cards on mobile: ${contentCards}`);

    await page.screenshot({ path: 'screenshots/STATE-mobile.png', fullPage: false });
    console.log('📸 Screenshot: STATE-mobile.png');

    console.log(`\n${contentCards > 0 ? '✅' : '❌'} Mobile view ${contentCards > 0 ? 'WORKING' : 'BROKEN'}`);
  });

  test('6. TEST TIKTOK VIDEO PAGE - NEW', async ({ page }) => {
    console.log('\n📍 TESTING: tiktok-videos.html (NEW PAGE)');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(3000);

    // Check for video slides
    const videoSlides = await page.locator('.video-slide').count();
    console.log(`✓ TikTok video slides: ${videoSlides}`);

    // Check for video players
    const videoPlayers = await page.locator('.video-player').count();
    console.log(`✓ Video players: ${videoPlayers}`);

    // Check for side actions (like, comment, bookmark, share)
    const sideActions = await page.locator('.side-actions').count();
    console.log(`✓ Side action buttons: ${sideActions}`);

    // Check for transcription boxes
    const transcriptionBoxes = await page.locator('.transcription-box').count();
    console.log(`✓ Transcription boxes: ${transcriptionBoxes}`);

    // Check for clickable words in transcriptions
    const clickableWords = await page.locator('.word').count();
    console.log(`✓ Clickable Spanish words: ${clickableWords}`);

    await page.screenshot({ path: 'screenshots/STATE-tiktok-videos.png', fullPage: false });
    console.log('📸 Screenshot: STATE-tiktok-videos.png');

    console.log(`\n${videoSlides > 0 && transcriptionBoxes > 0 ? '✅' : '❌'} TikTok videos ${videoSlides > 0 && transcriptionBoxes > 0 ? 'WORKING' : 'BROKEN'}`);
  });

  test('7. TEST HOME NAVIGATION PAGE - NEW', async ({ page }) => {
    console.log('\n📍 TESTING: home.html (NEW PAGE)');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/home.html');
    await page.waitForTimeout(1000);

    // Check for navigation cards
    const navCards = await page.locator('.nav-card').count();
    console.log(`✓ Navigation cards: ${navCards}`);

    // Check for streak widget
    const streakWidget = await page.locator('.streak-widget').count();
    console.log(`✓ Streak widget: ${streakWidget}`);

    // Check for logo
    const logoText = await page.locator('.logo-text').count();
    console.log(`✓ VIDA logo: ${logoText}`);

    // Verify all 3 main navigation links exist
    const videosLink = await page.locator('a[href="/tiktok-videos.html"]').count();
    const feedLink = await page.locator('a[href="/unified-infinite-feed.html"]').count();
    const practiceLink = await page.locator('a[href="/apple-feed.html"]').count();

    console.log(`✓ Videos link: ${videosLink > 0 ? 'YES' : 'NO'}`);
    console.log(`✓ Feed link: ${feedLink > 0 ? 'YES' : 'NO'}`);
    console.log(`✓ Practice link: ${practiceLink > 0 ? 'YES' : 'NO'}`);

    await page.screenshot({ path: 'screenshots/STATE-home.png', fullPage: true });
    console.log('📸 Screenshot: STATE-home.png');

    console.log(`\n${navCards === 3 && streakWidget > 0 ? '✅' : '❌'} Home page ${navCards === 3 && streakWidget > 0 ? 'WORKING' : 'BROKEN'}`);
  });

});
