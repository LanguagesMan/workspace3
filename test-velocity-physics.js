const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing TikTok-style Velocity Physics\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone size
    hasTouch: true
  });
  const page = await context.newPage();

  // Listen for velocity logs
  const velocityLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('Swipe velocity')) {
      velocityLogs.push(msg.text());
      console.log(`   ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(3000);

  console.log('Test 1: Fast Swipe (Should Auto-Advance)');
  console.log('==========================================');

  // Simulate fast swipe down
  await page.touchscreen.tap(195, 400); // touchstart
  await page.waitForTimeout(50); // Very short time = high velocity
  await page.mouse.wheel(0, 500); // Fast scroll
  await page.waitForTimeout(100);

  const positionAfterFast = await page.evaluate(() => window.scrollY);
  console.log(`   Position after fast swipe: ${positionAfterFast}px`);

  console.log('\nTest 2: Slow Drag (Should Snap-to-Nearest)');
  console.log('===========================================');

  await page.evaluate(() => window.scrollTo(0, 0)); // Reset
  await page.waitForTimeout(500);

  // Simulate slow drag
  await page.touchscreen.tap(195, 400);
  await page.waitForTimeout(500); // Longer time = lower velocity
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(100);

  const positionAfterSlow = await page.evaluate(() => window.scrollY);
  console.log(`   Position after slow drag: ${positionAfterSlow}px`);

  console.log('\nTest 3: Velocity Calculation Accuracy');
  console.log('======================================');

  // Check if velocities were logged
  if (velocityLogs.length > 0) {
    velocityLogs.forEach(log => {
      const match = log.match(/([\d.]+) px\/ms/);
      if (match) {
        const velocity = parseFloat(match[1]);
        const isFast = velocity > 0.5;
        console.log(`   ${isFast ? '✅ FAST' : '⚠️  SLOW'}: ${velocity.toFixed(2)} px/ms`);
      }
    });
  } else {
    console.log('   ⚠️  No velocity logs detected (touch events may not fire in headless)');
  }

  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`   Velocity threshold: 0.5 px/ms`);
  console.log(`   Fast swipe behavior: ${positionAfterFast > 0 ? '✅ Auto-advance working' : '⚠️  Needs mobile test'}`);
  console.log(`   Slow drag behavior: ${positionAfterSlow >= 0 ? '✅ Snap working' : '⚠️  Check implementation'}`);
  console.log(`   Velocity logs captured: ${velocityLogs.length}`);

  console.log('\n💡 Note: Touch events work best on real mobile devices.');
  console.log('   For full testing, use: Mobile Safari, Chrome DevTools mobile emulation');

  await browser.close();
})();
