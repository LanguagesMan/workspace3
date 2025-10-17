const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('❌ 404 Error:', response.url());
    }
  });
  
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(3000);
  
  await browser.close();
})();
