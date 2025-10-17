const { chromium } = require('playwright');

(async () => {
    console.log('🔍 Network Debug Test\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Monitor ALL network activity
    const requests = [];
    const responses = [];
    const failures = [];

    page.on('request', request => {
        if (request.url().includes('test-ultra-compat')) {
            console.log(`\n📤 REQUEST: ${request.method()} ${request.url()}`);
            console.log(`   Headers:`, request.headers());
            requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
            });
        }
    });

    page.on('response', response => {
        if (response.url().includes('test-ultra-compat')) {
            console.log(`\n📥 RESPONSE: ${response.status()} ${response.url()}`);
            console.log(`   Headers:`, response.headers());
            responses.push({
                url: response.url(),
                status: response.status(),
                headers: response.headers()
            });
        }
    });

    page.on('requestfailed', request => {
        if (request.url().includes('test-ultra-compat')) {
            console.log(`\n❌ REQUEST FAILED: ${request.url()}`);
            console.log(`   Failure:`, request.failure());
            failures.push({
                url: request.url(),
                failure: request.failure()
            });
        }
    });

    // Navigate
    await page.goto('http://localhost:3001/test-ultra-compat-video.html');

    // Wait
    await page.waitForTimeout(10000);

    console.log(`\n\n📊 Summary:`);
    console.log(`   Requests: ${requests.length}`);
    console.log(`   Responses: ${responses.length}`);
    console.log(`   Failures: ${failures.length}`);

    if (responses.length > 0) {
        console.log(`\n✅ Video request succeeded with status ${responses[0].status}`);
        console.log(`   Content-Type: ${responses[0].headers['content-type']}`);
        console.log(`   Content-Length: ${responses[0].headers['content-length']}`);
    } else if (failures.length > 0) {
        console.log(`\n❌ Video request failed:`);
        console.log(JSON.stringify(failures, null, 2));
    } else {
        console.log(`\n⚠️  NO VIDEO REQUESTS DETECTED!`);
        console.log(`   This means the <video> tag isn't even trying to load the video.`);
    }

    await browser.close();
})();
