const { test, expect } = require('@playwright/test');

test('Assess current video feed state', async ({ page }) => {
  console.log('🧪 Testing current state of VIDA app...');

  // Navigate to app
  await page.goto('http://localhost:3001');

  // Wait for page load
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: `screenshots/current-state-${Date.now()}.png`, fullPage: true });

  // Check if videos are present
  const videos = await page.locator('video').count();
  console.log(`✅ Found ${videos} video elements`);

  // Check for transcription elements
  const transcriptionOverlay = await page.locator('.transcription-overlay, .captions').count();
  console.log(`📝 Found ${transcriptionOverlay} transcription overlays`);

  // Check for Spanish text
  const spanishText = await page.locator('.spanish-line, .caption-spanish').count();
  console.log(`🇪🇸 Found ${spanishText} Spanish text elements`);

  // Check for English translation
  const englishText = await page.locator('.english-line, .caption-english').count();
  console.log(`🇺🇸 Found ${englishText} English translation elements`);

  // Check if first video is visible and try to play
  if (videos > 0) {
    const firstVideo = page.locator('video').first();
    await firstVideo.scrollIntoViewIfNeeded();

    // Check if video has source
    const videoSrc = await firstVideo.getAttribute('src');
    console.log(`🎬 First video source: ${videoSrc}`);

    // Try to play
    await firstVideo.click();
    await page.waitForTimeout(2000);

    // Check if transcription appears during playback (now always visible)
    const transcriptionVisible = await page.locator('.transcription-overlay').isVisible().catch(() => false);
    console.log(`📺 Transcription visible: ${transcriptionVisible}`);

    // Check if Spanish and English text is present
    const spanishVisible = await page.locator('.spanish-line').first().isVisible().catch(() => false);
    const englishVisible = await page.locator('.english-line').first().isVisible().catch(() => false);
    console.log(`🇪🇸 Spanish line visible: ${spanishVisible}`);
    console.log(`🇺🇸 English line visible: ${englishVisible}`);
  }

  console.log('✅ Assessment complete!');
});
