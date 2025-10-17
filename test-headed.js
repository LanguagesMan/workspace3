const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Running HEADED visual inspection (you will see the browser)...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 375, height: 812 },
    args: [
      '--window-size=375,812',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  console.log('📱 Opening http://localhost:3002...');

  try {
    await page.goto('http://localhost:3002', {
      waitUntil: 'domcontentloaded',
      timeout: 5000
    });
  } catch (err) {
    console.log('⚠️  Timeout waiting for networkidle, continuing anyway...');
  }

  // Wait to see content
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const timestamp = Date.now();
  const screenshotPath = `screenshots/verification-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`✅ Screenshot: ${screenshotPath}\n`);

  // Run checks
  const checks = await page.evaluate(() => {
    const results = {
      hasReelsContainer: !!document.querySelector('.reels-container'),
      hasBottomNav: !!document.querySelector('.bottom-nav'),
      navCount: document.querySelectorAll('nav').length,
      videoCount: document.querySelectorAll('video').length,
      loadingText: document.querySelector('.loading')?.textContent || 'none',
      hasError: document.body.textContent.toLowerCase().includes('error'),
      bodyStart: document.body.textContent.substring(0, 200)
    };
    return results;
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧠 VISUAL INSPECTION RESULTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Reels container:', checks.hasReelsContainer ? 'PASS ✅' : 'FAIL ❌');
  console.log('✅ Bottom nav:', checks.hasBottomNav ? 'PASS ✅' : 'FAIL ❌');
  console.log('📊 Nav count:', checks.navCount, checks.navCount === 1 ? 'PASS ✅' : 'FAIL ❌');
  console.log('🎬 Videos loaded:', checks.videoCount);
  console.log('📄 Loading status:', checks.loadingText);
  console.log('🚨 Has errors:', checks.hasError ? 'YES ❌' : 'NO ✅');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (checks.hasError) {
    console.log('⚠️  Error detected in page content:');
    console.log(checks.bodyStart);
  }

  const allPassed = checks.hasReelsContainer &&
                    checks.hasBottomNav &&
                    checks.navCount === 1 &&
                    !checks.hasError;

  console.log(allPassed ? '\n✅ ALL CHECKS PASSED!\n' : '\n❌ SOME CHECKS FAILED!\n');

  // Keep browser open for 10 seconds to visually inspect
  console.log('👀 Browser will stay open for 10 seconds for visual inspection...');
  await new Promise(r => setTimeout(r, 10000));

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
