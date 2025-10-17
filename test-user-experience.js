const { chromium } = require('playwright');

(async () => {
  console.log('🧪 REAL USER TEST - Finding what\'s BROKEN or NOT FUN\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  console.log('Test #1: Frustrated Beginner (First-Time User)');
  console.log('- Opens app for first time');
  console.log('- Gets confused immediately?\n');

  await page.goto('http://localhost:3001/');

  // Wait and see what loads
  await page.waitForTimeout(3000);

  // Check what user sees
  const loadingVisible = await page.locator('.loading').isVisible().catch(() => false);
  const videosVisible = await page.locator('.video-slide').count();

  console.log(`   Loading spinner: ${loadingVisible ? 'YES (BAD!)' : 'No (good)'}`);
  console.log(`   Videos visible: ${videosVisible}`);
  console.log(`   ${videosVisible > 0 ? '✅' : '❌'} Is it INSTANTLY obvious what to do? ${videosVisible > 0 ? 'YES' : 'NO'}\n`);

  console.log('Test #2: Impatient Intermediate User (Wants Speed)');
  console.log('- Hates slow/laggy experiences\n');

  const startTime = Date.now();
  await page.reload();
  await page.waitForSelector('.video-slide', { timeout: 3000 }).catch(() => {});
  const loadTime = Date.now() - startTime;

  console.log(`   Load time: ${loadTime}ms ${loadTime < 3000 ? '✅' : '❌'}`);
  console.log(`   JavaScript errors: ${errors.length} ${errors.length === 0 ? '✅' : '❌'}\n`);

  console.log('Test #3: Critical Power User (High Standards)');
  console.log('- Compares to TikTok constantly\n');

  // Check subtitle quality
  const subtitle = await page.locator('.subtitle-line').first().textContent().catch(() => '');
  const hasPunctuation = /[.!?¡¿]/.test(subtitle);
  const hasCapitalization = /^[A-ZÁÉÍÓÚÑ¡¿]/.test(subtitle);

  console.log(`   Subtitles: "${subtitle.substring(0, 50)}..."`);
  console.log(`   ${hasPunctuation ? '✅' : '❌'} Has punctuation?`);
  console.log(`   ${hasCapitalization ? '✅' : '❌'} Has capitalization?`);

  // Test word click
  console.log('\n   Testing word click...');
  const word = page.locator('.subtitle-word').first();
  await word.click();
  await page.waitForTimeout(1000);

  const popupVisible = await page.locator('.translation-popup').count() > 0;
  const popupText = await page.locator('.translation-popup').textContent().catch(() => '');

  console.log(`   ${popupVisible ? '✅' : '❌'} Translation popup shows?`);
  console.log(`   Popup content: "${popupText.substring(0, 80)}..."`);

  // Test scroll
  console.log('\n   Testing TikTok scroll...');
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(1500);

  const secondVideo = await page.locator('.video-slide').nth(1).boundingBox();
  const scrollSnapped = secondVideo && Math.abs(secondVideo.y) < 50;

  console.log(`   ${scrollSnapped ? '✅' : '❌'} Scroll snap working?`);

  console.log('\n📊 CRITICAL QUESTION:');
  console.log('   "If I was a REAL USER paying $10/month, would I be HAPPY?"');

  const allGood = videosVisible > 0 &&
                  loadTime < 3000 &&
                  errors.length === 0 &&
                  hasPunctuation &&
                  hasCapitalization &&
                  popupVisible &&
                  scrollSnapped;

  console.log(`\n   ${allGood ? '✅ YES - Ship it!' : '❌ NO - Need to fix issues!'}`);

  if (errors.length > 0) {
    console.log('\n❌ JavaScript Errors Found:');
    errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('\n⏳ Keeping browser open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
  process.exit(allGood ? 0 : 1);
})();
