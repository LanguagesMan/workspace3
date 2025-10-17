/**
 * Direct Video Loading Test - Test if videos actually load
 */

const { test, expect } = require('@playwright/test');

test('CRITICAL: Videos must load without DEMUXER errors', async ({ page }) => {
  test.setTimeout(60000);

  // Clear cache first
  await page.context().clearCookies();

  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Get first video
  const firstVideo = page.locator('video').first();
  await firstVideo.waitFor({ state: 'visible', timeout: 10000 });

  // Get video src
  const videoSrc = await firstVideo.getAttribute('src');
  console.log(`\n🎬 Testing video: ${videoSrc}`);

  // Wait for video to start loading
  await page.waitForTimeout(3000);

  // Check video properties
  const videoState = await firstVideo.evaluate((v) => {
    return {
      readyState: v.readyState,
      networkState: v.networkState,
      error: v.error ? {
        code: v.error.code,
        message: v.error.message
      } : null,
      duration: v.duration,
      currentSrc: v.currentSrc
    };
  });

  console.log(`📊 Video State:`);
  console.log(`   - readyState: ${videoState.readyState} (0=HAVE_NOTHING, 1=HAVE_METADATA, 4=HAVE_ENOUGH_DATA)`);
  console.log(`   - networkState: ${videoState.networkState} (0=EMPTY, 1=IDLE, 2=LOADING, 3=NO_SOURCE)`);
  console.log(`   - duration: ${videoState.duration}`);
  console.log(`   - error: ${videoState.error ? JSON.stringify(videoState.error) : 'None'}`);

  if (videoState.error) {
    console.log(`\n❌ VIDEO ERROR DETECTED!`);
    console.log(`   Code: ${videoState.error.code}`);
    console.log(`   Message: ${videoState.error.message}`);

    // Try to diagnose
    console.log(`\n🔍 Diagnosis:`);

    // Check if file exists via fetch
    const response = await page.evaluate(async (src) => {
      try {
        const res = await fetch(src);
        return {
          status: res.status,
          headers: Array.from(res.headers.entries()),
          ok: res.ok
        };
      } catch (e) {
        return { error: e.message };
      }
    }, videoSrc);

    console.log(`   - Fetch status: ${response.status || 'ERROR'}`);
    console.log(`   - Content-Type: ${response.headers?.find(h => h[0] === 'content-type')?.[1] || 'Unknown'}`);

    throw new Error(`Video failed to load: ${videoState.error.message}`);
  }

  // Video should at least reach HAVE_METADATA
  expect(videoState.readyState).toBeGreaterThanOrEqual(1);
  expect(videoState.error).toBeNull();

  console.log(`\n✅ Video loaded successfully!`);
});
