const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Mobile screenshots we're missing
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mobilePage = await mobileContext.newPage();

  const pages = [
    { path: '/discover-articles.html', name: 'discover-articles' },
    { path: '/stories.html', name: 'stories' },
    { path: '/review-queue.html', name: 'review-queue' },
    { path: '/preference-setup.html', name: 'preference-setup' },
    { path: '/games-hub.html', name: 'games-hub' },
    { path: '/dashboard.html', name: 'dashboard' }
  ];

  for (const page of pages) {
    try {
      console.log(`Capturing mobile: ${page.name}`);
      await mobilePage.goto(`http://localhost:3001${page.path}`, { waitUntil: 'load', timeout: 15000 });
      await mobilePage.waitForTimeout(2000);
      await mobilePage.screenshot({
        path: `/tmp/design-audit/mobile/${page.name}.png`,
        fullPage: true
      });
      console.log(`✓ Mobile ${page.name} captured`);
    } catch (error) {
      console.error(`✗ Failed mobile ${page.name}: ${error.message}`);
    }
  }

  // Desktop discover-articles if needed
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const desktopPage = await desktopContext.newPage();

  try {
    console.log(`Capturing desktop: discover-articles`);
    await desktopPage.goto(`http://localhost:3001/discover-articles.html`, { waitUntil: 'load', timeout: 15000 });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({
      path: `/tmp/design-audit/desktop/discover-articles.png`,
      fullPage: true
    });
    console.log(`✓ Desktop discover-articles captured`);
  } catch (error) {
    console.error(`✗ Failed: ${error.message}`);
  }

  await browser.close();
  console.log('\n✓ Remaining screenshots captured!');
})();
