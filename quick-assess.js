const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3001/unified-infinite-feed.html');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: `screenshots/current-state-${Date.now()}.png`, fullPage: false });

  // Check what sections exist
  const tabs = await page.$$('.nav-tab');
  console.log(`Found ${tabs.length} nav tabs`);

  // Check for videos
  const videos = await page.$$('video');
  console.log(`Found ${videos.length} video elements`);

  // Check for transcriptions
  const transcriptions = await page.$$('.subtitle, .transcription, .caption');
  console.log(`Found ${transcriptions.length} transcription elements`);

  await browser.close();
})();
