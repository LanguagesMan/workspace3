const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Running visual inspection...');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=375,812']
  });

  const page = await browser.newPage();
  await page.setViewport({width: 375, height: 812});

  // Navigate to app
  await page.goto('http://localhost:3002', {waitUntil: 'networkidle0', timeout: 10000});

  // Wait for content to load
  await page.waitForSelector('.reels-container', {timeout: 5000});
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const timestamp = Date.now();
  const screenshotPath = `screenshots/visual-inspection-${timestamp}.png`;
  await page.screenshot({path: screenshotPath, fullPage: false});
  console.log(`✅ Screenshot saved: ${screenshotPath}`);

  // Run checks
  const checks = await page.evaluate(() => {
    return {
      hasReelsContainer: !!document.querySelector('.reels-container'),
      hasBottomNav: !!document.querySelector('.bottom-nav'),
      navCount: document.querySelectorAll('nav').length,
      hasVideo: !!document.querySelector('video'),
      videoCount: document.querySelectorAll('video').length,
      hasModals: !!document.querySelector('.modal, [class*="modal"]'),
      hasPopups: !!document.querySelector('.popup, [class*="popup"]'),
      hasAchievements: !!document.querySelector('[class*="achievement"]'),
      bodyContent: document.body.textContent.substring(0, 100)
    };
  });

  console.log('\n🧠 SELF-AWARENESS CHECKS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Reels container:', checks.hasReelsContainer ? 'PASS' : 'FAIL');
  console.log('✅ Bottom nav:', checks.hasBottomNav ? 'PASS' : 'FAIL');
  console.log('📊 Nav count:', checks.navCount, checks.navCount === 1 ? '✅ PASS (must be 1)' : '❌ FAIL');
  console.log('🎬 Videos loaded:', checks.videoCount);
  console.log('🚫 Modals:', checks.hasModals ? '❌ FAIL (should be 0)' : '✅ PASS');
  console.log('🚫 Popups:', checks.hasPopups ? '❌ FAIL (should be 0)' : '✅ PASS');
  console.log('🚫 Achievements:', checks.hasAchievements ? '❌ FAIL (should be 0)' : '✅ PASS');

  const allPassed = checks.hasReelsContainer &&
                    checks.hasBottomNav &&
                    checks.navCount === 1 &&
                    !checks.hasModals &&
                    !checks.hasPopups &&
                    !checks.hasAchievements;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(allPassed ? '✅ ALL CHECKS PASSED!' : '❌ SOME CHECKS FAILED!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Keep browser open for 3 seconds to see the app
  await new Promise(r => setTimeout(r, 3000));

  await browser.close();

  process.exit(allPassed ? 0 : 1);
})();
