const { chromium } = require('playwright');

const pages = [
  { name: 'tiktok-video-feed', url: 'http://localhost:3001/tiktok-video-feed.html' },
  { name: 'profile', url: 'http://localhost:3001/profile.html' },
  { name: 'dashboard', url: 'http://localhost:3001/dashboard.html' },
  { name: 'leaderboard', url: 'http://localhost:3001/leaderboard.html' },
  { name: 'discover-ai', url: 'http://localhost:3001/discover-ai.html' },
  { name: 'discover-articles', url: 'http://localhost:3001/discover-articles.html' },
  { name: 'stories', url: 'http://localhost:3001/stories.html' },
  { name: 'review-queue', url: 'http://localhost:3001/review-queue.html' },
  { name: 'games-hub', url: 'http://localhost:3001/games-hub.html' },
  { name: 'music-player', url: 'http://localhost:3001/music-player.html' }
];

(async () => {
  const browser = await chromium.launch();

  // Desktop screenshots
  console.log('📸 Taking desktop screenshots (1920x1080)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();

  for (const page of pages) {
    try {
      console.log(`  → ${page.name} (desktop)`);
      await desktopPage.goto(page.url, { waitUntil: 'networkidle' });
      await desktopPage.waitForTimeout(1000); // Let animations settle
      await desktopPage.screenshot({
        path: `/tmp/design-screenshots/before/desktop/${page.name}.png`,
        fullPage: true
      });
    } catch (error) {
      console.error(`  ✗ Failed: ${page.name} - ${error.message}`);
    }
  }
  await desktopContext.close();

  // Mobile screenshots
  console.log('\n📱 Taking mobile screenshots (375x667)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const mobilePage = await mobileContext.newPage();

  for (const page of pages) {
    try {
      console.log(`  → ${page.name} (mobile)`);
      await mobilePage.goto(page.url, { waitUntil: 'networkidle' });
      await mobilePage.waitForTimeout(1000); // Let animations settle
      await mobilePage.screenshot({
        path: `/tmp/design-screenshots/before/mobile/${page.name}.png`,
        fullPage: true
      });
    } catch (error) {
      console.error(`  ✗ Failed: ${page.name} - ${error.message}`);
    }
  }
  await mobileContext.close();

  console.log('\n✅ Screenshots complete!');
  await browser.close();
})();
