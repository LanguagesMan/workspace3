const { test, expect } = require('@playwright/test');

test.describe('Audio Integration Testing', () => {
    const timestamp = Date.now();

    test('Root page with audio controls', async ({ page }) => {
        console.log('🧪 Testing unified-infinite-feed with audio controls...');

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000); // Wait for content to load

        // Take full page screenshot
        await page.screenshot({
            path: `screenshots/audio-integration-root-${timestamp}.png`,
            fullPage: true
        });

        // Check for audio buttons
        const audioButtons = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`✅ Found ${audioButtons} audio buttons`);

        expect(audioButtons).toBeGreaterThan(0);

        // Check Spanish content
        const spanishText = await page.locator('.spanish-text').count();
        console.log(`✅ Found ${spanishText} Spanish text blocks`);

        expect(spanishText).toBeGreaterThan(0);
    });

    test('Audio button interaction', async ({ page }) => {
        console.log('🎙️ Testing audio button clicks...');

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Find first audio button
        const firstAudioBtn = page.locator('button:has-text("🔊 Listen")').first();

        if (await firstAudioBtn.count() > 0) {
            // Screenshot before click
            await page.screenshot({
                path: `screenshots/audio-before-click-${timestamp}.png`,
                fullPage: true
            });

            // Click audio button
            await firstAudioBtn.click();

            // Wait for loading state
            await page.waitForTimeout(1000);

            // Screenshot during audio loading/playing
            await page.screenshot({
                path: `screenshots/audio-during-play-${timestamp}.png`,
                fullPage: true
            });

            console.log('✅ Audio button clicked successfully');
        } else {
            console.log('⚠️ No audio buttons found to test');
        }
    });

    test('Multiple routes with audio', async ({ page }) => {
        const routes = ['/', '/stats', '/unified', '/comedy'];

        for (const route of routes) {
            console.log(`📸 Testing route: ${route}`);

            await page.goto(`http://localhost:3002${route}`);
            await page.waitForTimeout(1500);

            await page.screenshot({
                path: `screenshots/route${route.replace(/\//g, '-') || '-root'}-audio-${timestamp}.png`,
                fullPage: true
            });

            console.log(`✅ Screenshot: route${route.replace(/\//g, '-')}`);
        }
    });

    test('Feed card structure with audio controls', async ({ page }) => {
        console.log('🔍 Analyzing feed card structure...');

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check card actions structure
        const cardActions = await page.locator('.card-actions').first();

        if (await cardActions.count() > 0) {
            const actionsHTML = await cardActions.innerHTML();

            // Check for all action buttons
            const hasAudioBtn = actionsHTML.includes('🔊 Listen');
            const hasLikeBtn = actionsHTML.includes('❤️');
            const hasShareBtn = actionsHTML.includes('📤 Share');
            const hasSaveBtn = actionsHTML.includes('📚 Save');

            console.log(`✅ Card Actions Structure:
- Audio Button: ${hasAudioBtn ? '✅' : '❌'}
- Like Button: ${hasLikeBtn ? '✅' : '❌'}
- Share Button: ${hasShareBtn ? '✅' : '❌'}
- Save Button: ${hasSaveBtn ? '✅' : '❌'}`);

            expect(hasAudioBtn).toBeTruthy();
            expect(hasLikeBtn).toBeTruthy();

            await page.screenshot({
                path: `screenshots/card-structure-${timestamp}.png`,
                fullPage: true
            });
        }
    });

    test('Accessibility with audio controls', async ({ page }) => {
        console.log('♿ Testing accessibility with audio integration...');

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const html = await page.content();

        // Check ARIA labels
        const hasAriaLabels = html.includes('aria-label="Listen to Spanish pronunciation"');
        const hasSemanticHTML = html.includes('role="main"');
        const hasH1 = html.includes('h1');

        console.log(`♿ Accessibility Check:
- Audio ARIA labels: ${hasAriaLabels ? '✅' : '❌'}
- Semantic HTML: ${hasSemanticHTML ? '✅' : '❌'}
- H1 tag: ${hasH1 ? '✅' : '❌'}`);

        expect(hasAriaLabels).toBeTruthy();
        expect(hasSemanticHTML).toBeTruthy();

        await page.screenshot({
            path: `screenshots/accessibility-audio-${timestamp}.png`,
            fullPage: true
        });
    });

    test('Mobile viewport with audio', async ({ page }) => {
        console.log('📱 Testing mobile viewport...');

        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: `screenshots/mobile-audio-${timestamp}.png`,
            fullPage: true
        });

        const audioButtons = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`📱 Mobile: ${audioButtons} audio buttons visible`);

        expect(audioButtons).toBeGreaterThan(0);
    });

    test('Desktop viewport with audio', async ({ page }) => {
        console.log('💻 Testing desktop viewport...');

        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: `screenshots/desktop-audio-${timestamp}.png`,
            fullPage: true
        });

        const audioButtons = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`💻 Desktop: ${audioButtons} audio buttons visible`);

        expect(audioButtons).toBeGreaterThan(0);
    });
});
