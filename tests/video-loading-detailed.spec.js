/**
 * Detailed video loading test - capture exact network errors
 */

const { test } = require('@playwright/test');

test('Detailed video loading with network capture', async ({ page }) => {
    const networkLogs = [];
    const consoleErrors = [];

    // Capture network requests
    page.on('request', request => {
        if (request.url().includes('/videos/')) {
            networkLogs.push({
                type: 'request',
                url: request.url(),
                method: request.method()
            });
        }
    });

    page.on('response', async response => {
        if (response.url().includes('/videos/')) {
            const headers = response.headers();
            networkLogs.push({
                type: 'response',
                url: response.url(),
                status: response.status(),
                contentType: headers['content-type'],
                contentLength: headers['content-length']
            });
        }
    });

    page.on('requestfailed', request => {
        if (request.url().includes('/videos/')) {
            networkLogs.push({
                type: 'failed',
                url: request.url(),
                failure: request.failure()
            });
        }
    });

    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        consoleErrors.push(`Page Error: ${error.message}`);
    });

    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel video', { timeout: 10000 });

    // Wait for video to attempt loading
    await page.waitForTimeout(5000);

    // Check video element details
    const videoDetails = await page.locator('.reel video').first().evaluate(video => ({
        src: video.src,
        currentSrc: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error ? {
            code: video.error.code,
            message: video.error.message
        } : null
    }));

    console.log('\n=== NETWORK LOGS ===');
    networkLogs.forEach(log => console.log(JSON.stringify(log, null, 2)));

    console.log('\n=== VIDEO ELEMENT STATE ===');
    console.log(JSON.stringify(videoDetails, null, 2));

    console.log('\n=== CONSOLE ERRORS ===');
    consoleErrors.forEach(err => console.log(err));

    await page.screenshot({ path: `screenshots/video-loading-debug-${Date.now()}.png` });
});
