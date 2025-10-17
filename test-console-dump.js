const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const logs = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => logs.push(`[error] ${err.message}`));

    try {
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'networkidle',
            timeout: 20000
        });

        await page.waitForTimeout(8000);

        // Get video status
        const videoStatus = await page.evaluate(() => {
            const videos = document.querySelectorAll('video');
            return Array.from(videos).map((v, i) => ({
                index: i,
                src: v.src,
                readyState: v.readyState,
                paused: v.paused,
                muted: v.muted,
                error: v.error ? {code: v.error.code, message: v.error.message} : null
            }));
        });

        logs.push('\n=== VIDEO STATUS ===');
        logs.push(JSON.stringify(videoStatus, null, 2));

        // Write logs
        fs.writeFileSync('/tmp/console-dump.txt', logs.join('\n'));
        console.log('✅ Logs written to /tmp/console-dump.txt');
        console.log(`Found ${videoStatus.length} videos`);

    } catch (error) {
        logs.push(`ERROR: ${error.message}`);
        fs.writeFileSync('/tmp/console-dump.txt', logs.join('\n'));
    } finally {
        await browser.close();
    }
})();
