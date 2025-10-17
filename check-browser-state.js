const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ CONSOLE ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ PAGE ERROR:', error.message);
  });

  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      console.log(`❌ ${status} ${response.url()}`);
    }
  });

  console.log('🌐 Opening http://localhost:3002...');

  try {
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(5000);

    // Check what's actually on the page
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
    const videoCount = await page.evaluate(() => document.querySelectorAll('video').length);
    const hasLoading = await page.evaluate(() => {
      const loading = document.querySelector('.loading');
      return loading && loading.style.display !== 'none';
    });

    console.log('\n📊 PAGE STATE:');
    console.log('Title:', title);
    console.log('Videos found:', videoCount);
    console.log('Loading visible:', hasLoading);
    console.log('Body text:', bodyText);
    console.log('\n📝 Console messages:', consoleMessages.length);
    console.log('❌ Errors:', errors.length);

    if (errors.length > 0) {
      console.log('\n🚨 ERRORS:', errors);
    }

    console.log('\n✋ Browser will stay open. Press Ctrl+C to close.');

    // Keep browser open for inspection
    await page.waitForTimeout(300000); // 5 minutes

  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
  }

  await browser.close();
})();
