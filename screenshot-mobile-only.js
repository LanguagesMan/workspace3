const { chromium } = require('playwright');

const pages = [
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

  console.log('📱 Taking remaining mobile screenshots (375x667)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const mobilePage = await mobileContext.newPage();

  for (const page of pages) {
    try {
      console.log(`  → ${page.name} (mobile)`);
      await mobilePage.goto(page.url, { waitUntil: 'networkidle', timeout: 10000 });
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({
        path: `/tmp/design-screenshots/before/mobile/${page.name}.png`,
        fullPage: true
      });
    } catch (error) {
      console.error(`  ✗ Failed: ${page.name} - ${error.message}`);
    }
  }
  await mobileContext.close();

  console.log('\n✅ Mobile screenshots complete!');
  await browser.close();
})();
