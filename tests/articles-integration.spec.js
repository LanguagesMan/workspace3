const { test, expect } = require('@playwright/test');

test.describe('Articles Integration in TikTok Feed', () => {
    test('feed should contain both videos and articles', async ({ page }) => {
        // Navigate to the feed
        await page.goto('http://localhost:3002/tiktok-videos.html');

        // Wait for content to load
        await page.waitForSelector('.video-container', { timeout: 10000 });

        // Check that feed has loaded
        const containers = await page.locator('.video-container').count();
        console.log(`Total feed items: ${containers}`);
        expect(containers).toBeGreaterThan(0);

        // Check for article cards
        const articleCards = await page.locator('.article-card').count();
        console.log(`Article cards found: ${articleCards}`);
        expect(articleCards).toBeGreaterThanOrEqual(1);

        // Check for video cards
        const videoCards = await page.locator('video').count();
        console.log(`Video cards found: ${videoCards}`);
        expect(videoCards).toBeGreaterThanOrEqual(1);

        console.log('✅ Feed contains mixed content (videos + articles)');
    });

    test('article cards should have proper structure', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });

        // Check article components
        const hasTitle = await page.locator('.article-title').count();
        const hasSpanish = await page.locator('.article-spanish').count();
        const hasEnglish = await page.locator('.article-english').count();
        const hasSource = await page.locator('.article-source').count();

        expect(hasTitle).toBeGreaterThan(0);
        expect(hasSpanish).toBeGreaterThan(0);
        expect(hasEnglish).toBeGreaterThan(0);
        expect(hasSource).toBeGreaterThan(0);

        console.log('✅ Article cards have proper structure');
    });

    test('article translation toggle should work', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });

        // Scroll to article card
        await page.evaluate(() => {
            const article = document.querySelector('.article-card');
            if (article) article.scrollIntoView();
        });

        await page.waitForTimeout(500);

        // Check English is hidden by default
        const englishEl = await page.locator('.article-english').first();
        const isHidden = await englishEl.evaluate(el =>
            !el.classList.contains('show')
        );
        expect(isHidden).toBe(true);

        // Click translate button
        const translateBtn = await page.locator('.article-card .controls button[title="Translate"]').first();
        await translateBtn.click();

        await page.waitForTimeout(300);

        // Check English is now visible
        const isVisible = await englishEl.evaluate(el =>
            el.classList.contains('show')
        );
        expect(isVisible).toBe(true);

        console.log('✅ Article translation toggle working');
    });
});
