const { chromium } = require('playwright');

(async () => {
  console.log('📰 Testing Articles Section - P0 Vision.md Requirement\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3002');
  console.log('✅ Page loaded');

  // Wait for page to initialize
  await page.waitForTimeout(3000);

  // Find and click Articles tab
  console.log('\n🖱️ Clicking Articles tab...');
  const articlesTab = page.locator('button[data-tab="articles"]');
  await articlesTab.click();

  // Wait for articles to render
  await page.waitForTimeout(2000);

  // Check if articles are displayed
  const articles = await page.locator('.content-card').count();
  console.log(`📊 Found ${articles} article cards`);

  if (articles > 0) {
    console.log('✅ Articles section working!');

    // Check for key features
    const hasClickableWords = await page.locator('.clickable-word').count() > 0;
    console.log(`   ${hasClickableWords ? '✅' : '❌'} Clickable words: ${hasClickableWords}`);

    const hasSimplifyButton = await page.locator('button:has-text("Simplify")').count() > 0;
    console.log(`   ${hasSimplifyButton ? '✅' : '❌'} Simplify button: ${hasSimplifyButton}`);

    const hasTranslation = await page.locator('text=/English Translation/i').count() > 0;
    console.log(`   ${hasTranslation ? '✅' : '❌'} English translation: ${hasTranslation}`);

    // Take screenshot
    await page.screenshot({
      path: '/Users/mindful/_projects/workspace3/screenshots/articles-section-test.png',
      fullPage: true
    });
    console.log('\n📸 Screenshot saved: screenshots/articles-section-test.png');
  } else {
    console.log('❌ No articles found!');
  }

  await browser.close();
  console.log('\n✅ Articles section test complete');
})();
