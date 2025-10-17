const { test } = require('@playwright/test');

test('capture page errors', async ({ page }) => {
  const errors = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[CONSOLE ${type}] ${text}`);
    if (type === 'error') errors.push(text);
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    console.log('Stack:', err.stack);
    errors.push(err.message);
  });

  await page.goto('http://localhost:3002/tiktok-videos.html');
  await page.waitForTimeout(3000);

  console.log('\n========== ERRORS CAPTURED ==========');
  if (errors.length === 0) {
    console.log('NO ERRORS - Page loaded successfully!');
  } else {
    errors.forEach(e => console.log('ERROR:', e));
  }
  console.log('=====================================\n');

  // Check if videos loaded
  const videoCount = await page.locator('.video-container').count();
  console.log('Video containers found:', videoCount);

  const loadingVisible = await page.locator('#loading').isVisible();
  console.log('Loading still visible?', loadingVisible);
});
