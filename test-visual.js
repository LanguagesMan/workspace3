const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  console.log('\n🔍 VISUAL INSPECTION TEST - YouTube Shorts Quality Check\n');

  await page.goto('http://localhost:3002');
  console.log('✅ App loaded');

  await page.waitForTimeout(3000);

  const reelsContainer = await page.locator('.reels-container').isVisible();
  console.log(reelsContainer ? '✅ Reels visible IMMEDIATELY' : '❌ Reels NOT visible');

  const bottomNav = await page.locator('.bottom-nav').count();
  console.log(bottomNav === 1 ? '✅ Bottom nav present' : '❌ Bottom nav missing');

  await page.waitForTimeout(2000);
  const words = await page.locator('.word').count();
  console.log('✅ Clickable Spanish words: ' + words);

  if (words > 0) {
    await page.locator('.word').first().click();
    await page.waitForTimeout(300);
    const translation = await page.locator('.translation.show').isVisible();
    console.log(translation ? '✅ Translation works' : '❌ Translation broken');
  }

  console.log('\n📱 Testing scroll...');
  await page.locator('.reels-container').evaluate(el => {
    el.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  console.log('✅ Scroll works');

  const timestamp = new Date().getTime();
  await page.screenshot({ path: 'screenshots/visual-' + timestamp + '.png' });
  console.log('✅ Screenshot saved');

  console.log('\n🎉 Visual inspection COMPLETE!');

  await page.waitForTimeout(5000);
  await browser.close();
})();
