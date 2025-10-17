const { chromium } = require('playwright');

const pages = [
  { path: '/tiktok-video-feed.html', name: 'video-feed' },
  { path: '/leaderboard.html', name: 'leaderboard' },
  { path: '/profile.html', name: 'profile' },
  { path: '/discover-ai.html', name: 'discover-ai' },
  { path: '/discover-articles.html', name: 'discover-articles' },
  { path: '/stories.html', name: 'stories' },
  { path: '/review-queue.html', name: 'review-queue' },
  { path: '/preference-setup.html', name: 'preference-setup' },
  { path: '/games-hub.html', name: 'games-hub' },
  { path: '/dashboard.html', name: 'dashboard' }
];

const baseUrl = 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch();

  console.log('Starting desktop screenshots (1920x1080)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();

  for (const page of pages) {
    try {
      console.log(`Capturing desktop: ${page.name}`);
      await desktopPage.goto(`${baseUrl}${page.path}`, { waitUntil: 'networkidle', timeout: 10000 });
      await desktopPage.waitForTimeout(1000); // Let animations settle
      await desktopPage.screenshot({
        path: `/tmp/design-audit/desktop/${page.name}.png`,
        fullPage: true
      });
      console.log(`✓ Desktop ${page.name} captured`);
    } catch (error) {
      console.error(`✗ Failed desktop ${page.name}: ${error.message}`);
    }
  }

  await desktopContext.close();

  console.log('\nStarting mobile screenshots (375x667)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mobilePage = await mobileContext.newPage();

  for (const page of pages) {
    try {
      console.log(`Capturing mobile: ${page.name}`);
      await mobilePage.goto(`${baseUrl}${page.path}`, { waitUntil: 'networkidle', timeout: 10000 });
      await mobilePage.waitForTimeout(1000); // Let animations settle
      await mobilePage.screenshot({
        path: `/tmp/design-audit/mobile/${page.name}.png`,
        fullPage: true
      });
      console.log(`✓ Mobile ${page.name} captured`);
    } catch (error) {
      console.error(`✗ Failed mobile ${page.name}: ${error.message}`);
    }
  }

  await mobileContext.close();
  await browser.close();

  console.log('\n✓ All screenshots captured!');
})();
