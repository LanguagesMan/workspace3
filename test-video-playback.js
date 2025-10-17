const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Opening http://localhost:3002/vida-app.html...');
  await page.goto('http://localhost:3002/vida-app.html');

  console.log('Waiting 6 seconds - WATCH THE BROWSER!');
  await page.waitForTimeout(6000);

  const videoCount = await page.$$eval('video', videos => videos.length);
  console.log(`\n✅ Found ${videoCount} video elements`);

  const firstVideoInfo = await page.$eval('video', el => ({
    src: el.src,
    width: el.videoWidth,
    height: el.videoHeight,
    paused: el.paused,
    currentTime: el.currentTime,
    duration: el.duration,
    readyState: el.readyState,
    networkState: el.networkState,
    error: el.error ? el.error.message : null
  }));

  console.log('\n📹 First Video:');
  console.log(JSON.stringify(firstVideoInfo, null, 2));

  const transcriptionCount = await page.$$eval('.trans-line', lines => lines.length);
  console.log(`\n📝 Transcriptions: ${transcriptionCount} lines`);

  console.log('\nKeeping browser open 5 more seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
})();
