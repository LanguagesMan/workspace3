const { chromium } = require('playwright');

(async () => {
  console.log('📸 Taking screenshots for TikTok comparison...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone 14 size

  // Navigate and wait for videos to load
  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(8000);

  // Screenshot 1: First video with Spanish subtitles
  console.log('📸 Screenshot 1: First video with Spanish subtitles');
  await page.screenshot({
    path: '/tmp/workspace3-reel-1.png',
    fullPage: false
  });

  // Scroll to second video
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(1500);

  // Screenshot 2: Second video after scroll
  console.log('📸 Screenshot 2: Second video (after scroll)');
  await page.screenshot({
    path: '/tmp/workspace3-reel-2.png',
    fullPage: false
  });

  // Click a word to show translation
  const word = page.locator('.subtitle-word').first();
  await word.click();
  await page.waitForTimeout(1500);

  // Screenshot 3: Translation popup
  console.log('📸 Screenshot 3: Translation popup');
  await page.screenshot({
    path: '/tmp/workspace3-translation.png',
    fullPage: false
  });

  await browser.close();

  console.log('\n✅ Screenshots saved:');
  console.log('   /tmp/workspace3-reel-1.png');
  console.log('   /tmp/workspace3-reel-2.png');
  console.log('   /tmp/workspace3-translation.png');
  console.log('\n🎯 Compare these to TikTok to verify visual parity!');
})();
