const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type.toUpperCase()}] ${text}`);
  });

  // Listen to errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002');

  // Wait 10 seconds to see what happens
  await page.waitForTimeout(10000);

  console.log('\n=== Taking screenshot ===');
  await page.screenshot({ path: 'screenshots/debug-console.png', fullPage: true });

  console.log('\nPress Ctrl+C to close browser...');
  await page.waitForTimeout(60000);

  await browser.close();
})();
