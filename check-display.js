const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(5000);

  // Check what's actually displaying
  const subtitles = await page.locator('.subtitles').first().innerHTML();
  console.log('ACTUAL DISPLAY:');
  console.log(subtitles);

  await page.waitForTimeout(30000); // Keep open for manual inspection
  await browser.close();
})();
