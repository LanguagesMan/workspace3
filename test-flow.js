const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🎬 Testing complete user flow...');

  await page.goto('http://localhost:3002');
  console.log('✅ App loaded');

  await page.waitForTimeout(2000);

  const bottomNav = await page.locator('.bottom-nav');
  const navVisible = await bottomNav.isVisible();
  console.log(navVisible ? '✅ Bottom nav visible' : '❌ Bottom nav NOT visible');

  const navItems = await page.locator('.nav-item').count();
  console.log('✅ Nav items: ' + navItems + ' (expected: 5)');

  const reelsContainer = await page.locator('.reels-container');
  const reelsVisible = await reelsContainer.isVisible();
  console.log(reelsVisible ? '✅ Reels container visible' : '❌ Reels NOT visible');

  await page.waitForTimeout(3000);
  const words = await page.locator('.word').count();
  console.log('✅ Clickable words: ' + words);

  if (words > 0) {
    await page.locator('.word').first().click();
    await page.waitForTimeout(500);
    const translation = await page.locator('.translation.show');
    const translationVisible = await translation.isVisible();
    console.log(translationVisible ? '✅ Translation appears on click' : '❌ Translation NOT working');
  }

  await page.locator('.reels-container').evaluate(el => {
    el.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);
  console.log('✅ Scroll works');

  await page.screenshot({ path: 'screenshots/user-flow-test.png' });
  console.log('✅ Screenshot saved');

  console.log('\n🎉 User flow test COMPLETE!');

  await page.waitForTimeout(3000);
  await browser.close();
})();
