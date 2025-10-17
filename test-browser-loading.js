const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing vida-app.html in real browser...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('📱 Opening http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

  console.log('⏳ Waiting 8 seconds - WATCH THE BROWSER!\n');
  await page.waitForTimeout(8000);

  // Check what loaded
  const stats = await page.evaluate(() => ({
    title: document.title,
    videoElements: document.querySelectorAll('video').length,
    transcriptionLines: document.querySelectorAll('.trans-line').length,
    navCount: document.querySelectorAll('nav').length,
    loadingText: document.querySelector('.loading')?.textContent || 'none',
    firstVideoSrc: document.querySelector('video')?.src || 'none',
    firstVideoReady: document.querySelector('video')?.readyState || 0
  }));

  console.log('📊 RESULTS:');
  console.log('  Title:', stats.title);
  console.log('  Videos:', stats.videoElements);
  console.log('  Transcriptions:', stats.transcriptionLines);
  console.log('  Navigation menus:', stats.navCount);
  console.log('  Loading message:', stats.loadingText);
  console.log('  First video src:', stats.firstVideoSrc.substring(0, 80));
  console.log('  Video ready state:', stats.readyState);

  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(err => console.log('  -', err));
  } else {
    console.log('\n✅ No JavaScript errors!');
  }

  console.log('\n⏳ Keeping browser open 5 more seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
  
  // Summary
  console.log('\n📋 SUMMARY:');
  if (stats.videoElements > 0 && stats.transcriptionLines > 0 && stats.navCount === 1) {
    console.log('✅ APP LOADED SUCCESSFULLY!');
  } else {
    console.log('❌ APP HAS ISSUES - check above');
  }
})();
