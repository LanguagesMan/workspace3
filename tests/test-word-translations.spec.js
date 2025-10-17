const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Testing clickable word translations feature...\n');

  await page.goto('http://localhost:3002');
  await page.waitForSelector('.reel', { timeout: 10000 });

  // Wait for captions to appear
  await page.waitForTimeout(3000);

  // Check if word-level subtitles script loaded
  const hasWordSubtitles = await page.evaluate(() => {
    return typeof window.WordLevelSubtitles !== 'undefined';
  });

  console.log(`Word-level subtitles script loaded: ${hasWordSubtitles ? '✅' : '❌'}`);

  // Look for clickable words in captions
  const hasClickableWords = await page.locator('.word').count() > 0;
  console.log(`Clickable words found: ${hasClickableWords ? '✅' : '❌'}`);

  if (hasClickableWords) {
    const wordCount = await page.locator('.word').count();
    console.log(`   → ${wordCount} clickable words detected\n`);

    // Test clicking a word
    console.log('🖱️  Testing word click interaction...');
    const firstWord = page.locator('.word').first();
    const wordText = await firstWord.textContent();

    await firstWord.click();
    await page.waitForTimeout(500);

    // Check if translation popup appeared
    const translationVisible = await page.locator('.translation').isVisible().catch(() => false);
    console.log(`Translation popup appeared: ${translationVisible ? '✅' : '❌'}`);

    if (translationVisible) {
      const translationText = await page.locator('.translation').textContent();
      console.log(`   → Word: "${wordText}"`);
      console.log(`   → Translation: "${translationText}"\n`);
    }

    // Take screenshot
    await page.screenshot({
      path: '/Users/mindful/_projects/workspace3/screenshots/word-translation-test.png'
    });
    console.log('📸 Screenshot saved: screenshots/word-translation-test.png\n');
  } else {
    console.log('⚠️  No clickable words found - feature may not be working\n');

    // Check if captions container exists
    const hasCaptionContainer = await page.locator('[class*="caption-container"]').count() > 0;
    console.log(`Caption container exists: ${hasCaptionContainer ? '✅' : '❌'}`);

    // Check console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log('\n❌ Console errors detected:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
  }

  // Check if makeWordsClickable function exists
  const hasMakeWordsClickable = await page.evaluate(() => {
    return typeof makeWordsClickable === 'function';
  });

  console.log(`makeWordsClickable function exists: ${hasMakeWordsClickable ? '✅' : '❌'}`);

  await browser.close();

  console.log('\n✅ Word translation test complete');
})();
