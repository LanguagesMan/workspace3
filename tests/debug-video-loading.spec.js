const { test, expect } = require('@playwright/test');

test('Debug: Why videos dont load', async ({ page }) => {
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push(msg.type() + ': ' + msg.text());
    });

    const errors = [];
    page.on('pageerror', error => {
        errors.push('PAGE ERROR: ' + error.message);
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html?t=' + Date.now());

    await page.evaluate(() => {
        localStorage.clear();
        localStorage.setItem('langflix_user_profile', JSON.stringify({
            cefrLevel: 'A2',
            knownWords: ['hola', 'adios'],
            completedAssessment: true
        }));
        localStorage.setItem('userLevel', 'A2');
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const videoCount = await page.locator('.video-card').count();
    const loadingVisible = await page.locator('#loading').isVisible();

    console.log('Video cards:', videoCount);
    console.log('Loading visible:', loadingVisible);
    console.log('Console messages (last 15):');
    consoleMessages.slice(-15).forEach(msg => console.log('  ' + msg));
    
    if (errors.length > 0) {
        console.log('Errors:');
        errors.forEach(err => console.log('  ' + err));
    }

    expect(videoCount).toBeGreaterThan(0);
});
