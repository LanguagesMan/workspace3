const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });
  
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(5000);
  
  console.log('\n📊 Error Summary:');
  console.log(`Total Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  } else {
    console.log('✅ No errors detected!');
  }
  
  await browser.close();
})();
