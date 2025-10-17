const { chromium } = require('playwright');

(async () => {
  console.log('🎬 Testing TikTok-style scroll + word translations...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  // Navigate to app
  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(8000);

  // TEST 1: Videos loaded
  const videoCount = await page.locator('.video-slide').count();
  console.log(`✅ Videos loaded: ${videoCount}`);

  // TEST 2: Check for Spanish subtitles
  const subtitles = await page.locator('.subtitle-line').first().textContent();
  const hasSpanish = /[áéíóúñü¿¡]|por|qué|está|muy|sí|el|la/i.test(subtitles);
  console.log(`${hasSpanish ? '✅' : '❌'} Spanish subtitles: "${subtitles.substring(0, 50)}..."`);

  // TEST 3: Scroll to second video (TikTok scroll snap)
  console.log('\n📜 Testing TikTok scroll...');
  const firstVideo = page.locator('.video-slide').first();
  const secondVideo = page.locator('.video-slide').nth(1);

  // Get initial position
  const initialY = await firstVideo.boundingBox();
  console.log(`   Initial Y position: ${initialY.y}`);

  // Scroll down
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(1000);

  // Check if snapped to second video
  const afterScrollY = await secondVideo.boundingBox();
  console.log(`   After scroll Y position: ${afterScrollY.y}`);
  const snapped = Math.abs(afterScrollY.y) < 50; // Should be near top (0)
  console.log(`${snapped ? '✅' : '❌'} Scroll snap working: ${snapped ? 'Yes' : 'No'}`);

  // TEST 4: Click Spanish word for translation
  console.log('\n💬 Testing word translation...');
  const word = page.locator('.subtitle-word').first();
  const wordText = await word.textContent();
  console.log(`   Clicking word: "${wordText}"`);

  await word.click();
  await page.waitForTimeout(2000);

  // Check for translation popup
  const popup = page.locator('.translation-popup');
  const popupVisible = await popup.count() > 0;
  console.log(`${popupVisible ? '✅' : '❌'} Translation popup shown: ${popupVisible ? 'Yes' : 'No'}`);

  if (popupVisible) {
    const translation = await popup.locator('.translation-english').textContent();
    console.log(`   Translation: "${translation}"`);
  }

  // TEST 5: Check localStorage for saved words
  const savedWords = await page.evaluate(() => {
    return Object.keys(localStorage).filter(k => k.includes('word') || k.includes('userId'));
  });
  console.log(`\n💾 LocalStorage entries: ${savedWords.length > 0 ? savedWords.join(', ') : 'None'}`);

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Videos: ${videoCount} (Spanish-only per Command #3)`);
  console.log(`   Spanish subtitles: ${hasSpanish ? 'Yes' : 'No'}`);
  console.log(`   TikTok scroll snap: ${snapped ? 'Yes' : 'No'}`);
  console.log(`   Word translations: ${popupVisible ? 'Yes' : 'No'}`);
  console.log(`   JavaScript errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ JavaScript Errors:');
    errors.forEach(e => console.log(`   - ${e}`));
  }

  await browser.close();

  // Command #3: Only Spanish videos with subtitles (expect 3+, not 10)
  const allPassed = videoCount >= 3 && hasSpanish && snapped && popupVisible && errors.length === 0;
  console.log(`\n${allPassed ? '🎉 ALL TESTS PASSED! (Commands #1, #2, #3 working)' : '⚠️  Some tests failed'}`);
  process.exit(allPassed ? 0 : 1);
})();
