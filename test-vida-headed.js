const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001/vida-app.html');

  console.log('Waiting 8 seconds - CHECK THE BROWSER WINDOW');
  await page.waitForTimeout(8000);

  // Check video element state
  const videoInfo = await page.$eval('video', el => ({
    src: el.src,
    width: el.videoWidth,
    height: el.videoHeight,
    paused: el.paused,
    ended: el.ended,
    readyState: el.readyState,
    networkState: el.networkState,
    error: el.error ? el.error.message : null
  }));

  console.log('Video state:', JSON.stringify(videoInfo, null, 2));

  await page.waitForTimeout(3000);
  await browser.close();
})();
