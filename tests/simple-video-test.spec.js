const { test, expect } = require('@playwright/test');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test('Simple video test', async ({ page }) => {
  console.log('\n🎬 Testing simple video page...');

  await page.goto('http://localhost:3002/test-video.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const status = await page.locator('#status').textContent();
  console.log(`Status: ${status}`);

  await page.screenshot({
    path: path.join(screenshotsDir, `${timestamp}_simple_video_test.png`)
  });

  const video = page.locator('video');
  const videoProps = await video.evaluate((el) => ({
    readyState: el.readyState,
    networkState: el.networkState,
    error: el.error ? { code: el.error.code, message: el.error.message } : null,
    src: el.src,
    currentSrc: el.currentSrc,
    paused: el.paused,
    duration: el.duration,
    videoWidth: el.videoWidth,
    videoHeight: el.videoHeight
  }));

  console.log('Video properties:', JSON.stringify(videoProps, null, 2));
});
