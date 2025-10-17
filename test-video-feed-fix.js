/**
 * Quick diagnostic test for TikTok video feed fixes
 * Tests: MIME types, API endpoint, video loading
 */

const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Testing TikTok Video Feed Fixes...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 } // iPhone viewport
    });
    const page = await context.newPage();

    // Track console logs and errors
    const errors = [];
    const warnings = [];

    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            errors.push(text);
            console.log('❌ Console Error:', text);
        } else if (msg.type() === 'warning' && text.includes('MIME')) {
            warnings.push(text);
            console.log('⚠️  Console Warning:', text);
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('❌ Page Error:', error.message);
    });

    try {
        console.log('📱 Loading page...');
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for videos to load
        console.log('⏳ Waiting for videos to load...');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Check how many videos loaded
        const videoCount = await page.locator('.video-card').count();
        console.log(`✅ Videos loaded: ${videoCount}`);

        // Check for MIME type errors
        const mimeErrors = errors.filter(e => e.includes('MIME') || e.includes('text/html'));
        const hasMimeErrors = mimeErrors.length > 0;

        console.log('\n📊 TEST RESULTS:');
        console.log('='.repeat(50));
        console.log(`✅ Page loaded: YES`);
        console.log(`✅ Videos rendered: ${videoCount} videos`);
        console.log(`${hasMimeErrors ? '❌' : '✅'} MIME type errors: ${hasMimeErrors ? 'FOUND' : 'NONE'}`);
        console.log(`${errors.length > 0 ? '⚠️ ' : '✅'} Total errors: ${errors.length}`);
        console.log(`${warnings.length > 0 ? '⚠️ ' : '✅'} Total warnings: ${warnings.length}`);

        if (hasMimeErrors) {
            console.log('\n❌ MIME Type Errors Found:');
            mimeErrors.forEach(err => console.log(`   - ${err}`));
        }

        if (errors.length > 0) {
            console.log('\n⚠️  All Errors:');
            errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
        }

        // Take screenshot
        await page.screenshot({ path: '/tmp/video-feed-test.png' });
        console.log('\n📸 Screenshot saved: /tmp/video-feed-test.png');

        console.log('\n🎯 MVP STATUS:');
        if (videoCount >= 5 && !hasMimeErrors && errors.length === 0) {
            console.log('✅ READY FOR MVP LAUNCH!');
        } else if (videoCount >= 5) {
            console.log('⚠️  FUNCTIONAL - but has minor issues');
        } else {
            console.log('❌ NOT READY - critical issues remain');
        }

        // Keep browser open for 10 seconds to inspect
        console.log('\n⏸️  Keeping browser open for 10 seconds to inspect...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();
