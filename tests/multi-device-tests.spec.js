// QUALITY GATE 2: Multi-Device Testing
// Tests on iPhone 12, iPhone 15 Pro Max, iPad Pro, Desktop

const { test, expect, devices } = require('@playwright/test');

// Device configurations
const testDevices = [
    { name: 'iPhone 12', ...devices['iPhone 12'] },
    { name: 'iPhone 15 Pro Max', ...devices['iPhone 15 Pro'] },
    { name: 'iPad Pro', ...devices['iPad Pro'] },
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } }
];

// Create individual tests for each device
testDevices.forEach(device => {
    test(`Feed loads correctly on ${device.name}`, async ({ browser }) => {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        await page.goto('http://localhost:3002');
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const cards = await page.locator('.content-card').count();
        expect(cards).toBeGreaterThan(0);

        console.log(`✓ ${device.name}: ${cards} cards loaded`);

        await context.close();
    });

    test(`XP/Streak banner visible on ${device.name}`, async ({ browser }) => {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        await page.goto('http://localhost:3002');

        const bannerVisible = await page.locator('.xp-streak-banner').isVisible();
        expect(bannerVisible).toBeTruthy();

        console.log(`✓ ${device.name}: XP banner visible`);

        await context.close();
    });

    test(`Interactions work on ${device.name}`, async ({ browser }) => {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        await page.goto('http://localhost:3002');
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const btn = page.locator('.action-btn').first();
        await btn.click();

        // Should not crash
        const stillVisible = await page.locator('.content-card').isVisible();
        expect(stillVisible).toBeTruthy();

        console.log(`✓ ${device.name}: Interactions work`);

        await context.close();
    });
});

// Performance test
test('Performance metrics across devices', async ({ browser }) => {
    const results = [];

    for (const device of testDevices) {
        const context = await browser.newContext(device);
        const page = await context.newPage();

        const startTime = Date.now();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.content-card', { timeout: 10000 });
        const loadTime = Date.now() - startTime;

        results.push({ device: device.name, loadTime });
        console.log(`✓ ${device.name}: Load time ${loadTime}ms`);

        await context.close();
    }

    // All devices should load reasonably fast
    results.forEach(r => {
        expect(r.loadTime).toBeLessThan(5000);
    });
});
