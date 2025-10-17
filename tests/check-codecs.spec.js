/**
 * Check what codecs Playwright's Chromium supports
 */

const { test } = require('@playwright/test');

test('Check Chromium codec support', async ({ page }) => {
  await page.goto('about:blank');

  const codecs = await page.evaluate(() => {
    const video = document.createElement('video');
    const results = {
      h264_baseline: video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
      h264_main: video.canPlayType('video/mp4; codecs="avc1.4D401E"'),
      h264_high: video.canPlayType('video/mp4; codecs="avc1.64001E"'),
      aac: video.canPlayType('video/mp4; codecs="mp4a.40.2"'),
      generic_mp4: video.canPlayType('video/mp4'),
    };
    return results;
  });

  console.log('\n🎬 Chromium Codec Support:');
  console.log(JSON.stringify(codecs, null, 2));
});
