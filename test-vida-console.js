const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  const errors = [];

  page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3001/vida-app.html');
  await page.waitForTimeout(4000);

  console.log('=== CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('\n=== ERRORS ===');
  errors.forEach(err => console.log(err));

  console.log('\n=== VIDEO FEED HTML ===');
  const feedHTML = await page.$eval('#video-feed', el => el.innerHTML);
  console.log(feedHTML.substring(0, 500));

  await browser.close();
})();
