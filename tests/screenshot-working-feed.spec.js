const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

  // Wait for content to load
  await page.waitForSelector('.reel', { timeout: 10000 });

  console.log('✅ Feed loaded successfully');

  // Take screenshots of different content types
  await page.screenshot({
    path: '/Users/mindful/_projects/workspace3/screenshots/feed-working-videos.png',
    fullPage: false
  });
  console.log('📸 Screenshot 1: Videos section');

  // Scroll down to see more content
  await page.evaluate(() => {
    document.getElementById('reelsContainer').scrollBy(0, window.innerHeight);
  });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: '/Users/mindful/_projects/workspace3/screenshots/feed-working-scroll-1.png',
    fullPage: false
  });
  console.log('📸 Screenshot 2: Scrolled view 1');

  // Scroll again
  await page.evaluate(() => {
    document.getElementById('reelsContainer').scrollBy(0, window.innerHeight);
  });
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: '/Users/mindful/_projects/workspace3/screenshots/feed-working-scroll-2.png',
    fullPage: false
  });
  console.log('📸 Screenshot 3: Scrolled view 2 (might show article/music)');

  // Check if we have different content types
  const contentTypes = await page.evaluate(() => {
    const reels = Array.from(document.querySelectorAll('.reel'));
    return {
      totalReels: reels.length,
      videoReels: reels.filter(r => r.querySelector('video')).length,
      articleCards: document.querySelectorAll('.article-card').length,
      musicCards: document.querySelectorAll('.music-card').length,
      storyCards: document.querySelectorAll('.story-card').length
    };
  });

  console.log('📊 Content breakdown:', contentTypes);

  await page.waitForTimeout(2000);
  await browser.close();

  console.log('✅ Screenshots saved to screenshots/feed-working-*.png');
})();
