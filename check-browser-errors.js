const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Checking for browser errors...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=375,812']
  });

  const page = await browser.newPage();
  await page.setViewport({width: 375, height: 812});

  // Capture console messages
  const logs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    logs.push({type, text});

    if (type === 'error') {
      console.log('❌ ERROR:', text);
    } else if (type === 'warning') {
      console.log('⚠️  WARNING:', text);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('💥 PAGE ERROR:', error.message);
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log('🚫 FAILED REQUEST:', request.url(), request.failure().errorText);
  });

  try {
    console.log('📱 Navigating to http://localhost:3002...\n');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('\n✅ Page loaded successfully!');

    // Wait a bit for JavaScript to execute
    await new Promise(r => setTimeout(r, 3000));

    // Take screenshot
    const timestamp = Date.now();
    const screenshotPath = `screenshots/error-check-${timestamp}.png`;
    await page.screenshot({path: screenshotPath, fullPage: false});
    console.log(`📸 Screenshot saved: ${screenshotPath}`);

    // Check page content
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasReels: !!document.querySelector('.reels-container'),
        hasVideo: !!document.querySelector('video'),
        videoCount: document.querySelectorAll('video').length,
        loadingText: document.querySelector('.loading')?.textContent,
        bodyText: document.body.textContent.substring(0, 200)
      };
    });

    console.log('\n📊 Page content check:');
    console.log('  Title:', pageInfo.title);
    console.log('  Reels container:', pageInfo.hasReels ? '✅' : '❌');
    console.log('  Videos:', pageInfo.videoCount);
    console.log('  Loading text:', pageInfo.loadingText || 'none');

    // Keep browser open for inspection
    console.log('\n⏸️  Browser will stay open for 10 seconds for inspection...');
    await new Promise(r => setTimeout(r, 10000));

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error.message);
    await page.screenshot({path: 'screenshots/critical-error.png'});
  }

  await browser.close();
  console.log('\n✅ Check complete!');
})();
