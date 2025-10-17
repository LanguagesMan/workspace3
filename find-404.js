const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const missing = [];

  page.on('response', response => {
    if (response.status() === 404) {
      missing.push(response.url());
      console.log('❌ 404:', response.url());
    }
  });

  await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log(`\n📊 Total 404s: ${missing.length}`);
  missing.forEach(url => console.log('   ', url));

  await browser.close();
})();
