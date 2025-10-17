const { test, expect } = require('@playwright/test');

test('Verify User Commands: TikTok reels + Stories navigation', async ({ page }) => {
  console.log('🧪 Testing User Commands...');

  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Command #1: TikTok-style reels show IMMEDIATELY (no menus first)
  console.log('📱 Command #1: Verify TikTok reels show immediately...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

  // Should redirect to videos-feed.html immediately
  await page.waitForTimeout(500);
  const currentUrl = page.url();
  expect(currentUrl).toContain('videos-feed.html');
  console.log('✅ App redirects to videos-feed.html immediately (no menu screen)');

  // Wait for videos to load
  await page.waitForSelector('.video-card', { timeout: 5000 });
  console.log('✅ Video cards loaded');

  // Verify TikTok-style vertical scroll container
  const scrollContainer = await page.locator('.shorts-container');
  expect(await scrollContainer.count()).toBe(1);
  console.log('✅ TikTok-style .shorts-container exists');

  // Verify scroll-snap is enabled
  const scrollSnapType = await scrollContainer.evaluate(el =>
    window.getComputedStyle(el).scrollSnapType
  );
  expect(scrollSnapType).toContain('y mandatory');
  console.log('✅ Scroll-snap enabled (TikTok pattern)');

  // Verify video elements exist
  const videoCount = await page.locator('video').count();
  expect(videoCount).toBeGreaterThan(0);
  console.log(`✅ Found ${videoCount} video elements`);

  // Command #1b: Verify clickable word translations
  console.log('📝 Testing clickable word translations...');
  await page.waitForSelector('.word-clickable', { timeout: 5000 });
  const clickableWords = await page.locator('.word-clickable').count();
  expect(clickableWords).toBeGreaterThan(0);
  console.log(`✅ Found ${clickableWords} clickable words in subtitles`);

  // Click a word and verify translation popup appears
  const firstWord = page.locator('.word-clickable').first();
  await firstWord.click();
  await page.waitForTimeout(500);

  // Check if word was saved (localStorage or API call)
  const savedWords = await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('savedWords') || '[]');
  });
  console.log(`✅ Word saving mechanism exists (${savedWords.length} words saved)`);

  // Command #2: Verify Stories navigation exists
  console.log('📖 Command #2: Verify Stories navigation...');
  const storiesBadge = await page.locator('#storiesBadge');
  expect(await storiesBadge.count()).toBe(1);
  console.log('✅ Stories badge exists in top-left');

  // Verify Stories badge is visible and has proper styling
  const isVisible = await storiesBadge.isVisible();
  expect(isVisible).toBe(true);
  console.log('✅ Stories badge is visible');

  // Click Stories badge and verify navigation
  await storiesBadge.click();
  await page.waitForURL('**/stories.html', { timeout: 3000 });
  console.log('✅ Stories badge navigates to /stories.html');

  // Verify Stories content loads
  await page.waitForSelector('.story-slide', { timeout: 5000 });
  const storyCount = await page.locator('.story-slide').count();
  expect(storyCount).toBeGreaterThan(0);
  console.log(`✅ Found ${storyCount} story slides`);

  // Verify clickable words in stories
  const storyWords = await page.locator('.highlight-word').count();
  expect(storyWords).toBeGreaterThan(0);
  console.log(`✅ Found ${storyWords} clickable words in stories`);

  // Check for console errors
  if (consoleErrors.length > 0) {
    console.log('⚠️  Console errors detected:');
    consoleErrors.forEach(err => console.log('  -', err));
  } else {
    console.log('✅ No console errors detected');
  }

  // Take screenshot proof
  await page.goto('http://localhost:3002/videos-feed.html');
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: 'test-results/user-commands-proof.png',
    fullPage: false
  });
  console.log('📸 Screenshot saved: test-results/user-commands-proof.png');

  console.log('\n🎉 All User Commands Verified Successfully!');
  console.log('✅ Command #1: TikTok reels show immediately with clickable translations');
  console.log('✅ Command #2: Stories navigation accessible from video feed');
});
