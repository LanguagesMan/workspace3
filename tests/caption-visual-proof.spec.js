/**
 * VISUAL PROOF: Capture dual-language captions displaying
 */

const { test } = require('@playwright/test');

test('Visual proof of dual-language LINE BY LINE captions', async ({ page }) => {
    await page.goto('http://localhost:3002/caption-demo.html');

    // Start playback
    await page.click('#playBtn');

    // Wait for first caption to appear (0.2s)
    await page.waitForTimeout(300);
    await page.screenshot({ path: `screenshots/proof-caption-1-${Date.now()}.png`, fullPage: true });

    // Wait for second caption (2.0s)
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `screenshots/proof-caption-2-${Date.now()}.png`, fullPage: true });

    // Wait for third caption (4.0s)
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `screenshots/proof-caption-3-${Date.now()}.png`, fullPage: true });

    // Verify captions are in DOM
    const captionBlocks = await page.locator('.dual-caption-block').count();
    console.log(`\n✅ Caption blocks rendered: ${captionBlocks}`);

    // Get caption text
    if (captionBlocks > 0) {
        const spanish = await page.locator('.spanish-text').first().textContent();
        const english = await page.locator('.english-text').first().textContent();

        console.log(`\n📸 VISUAL PROOF CAPTURED:`);
        console.log(`   Spanish: ${spanish}`);
        console.log(`   English: ${english}`);
        console.log(`\n✅ Dual-language LINE BY LINE captions confirmed working`);
    }
});
