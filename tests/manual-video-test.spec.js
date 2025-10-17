const { test, expect } = require('@playwright/test');

test('Manual video loading test', async ({ page }) => {
    // Dismiss any alerts that appear
    page.on('dialog', dialog => dialog.accept());

    // Log all console messages from the page
    page.on('console', msg => {
        console.log(`🌐 Browser: ${msg.text()}`);
    });

    console.log('📱 Opening video feed...');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/step1-welcome.png' });
    console.log('📸 Step 1: Welcome screen');

    // Check if onboarding overlay is visible
    const onboardingOverlay = page.locator('#onboardingOverlay');
    const hasShowClass = await onboardingOverlay.evaluate(el => el.classList.contains('show'));
    console.log(`📋 Onboarding overlay has 'show' class: ${hasShowClass}`);

    // Click the cyan "Let's Go!" button (the visible one on welcome screen)
    const letsGoBtn = page.locator('button:has-text("Let\'s Go!")').last();

    if (await letsGoBtn.isVisible()) {
        console.log('🎬 Clicking Let\'s Go! button...');
        await letsGoBtn.click();
        await page.waitForTimeout(1000);

        // Check if overlay was hidden
        const stillHasShowClass = await onboardingOverlay.evaluate(el => el.classList.contains('show'));
        console.log(`📋 After click, overlay has 'show' class: ${stillHasShowClass}`);
    }

    await page.waitForTimeout(5000);

    // Take screenshot after clicking
    await page.screenshot({ path: '/tmp/step2-after-click.png', fullPage: true });
    console.log('📸 Step 2: After clicking');

    // Check what's visible
    const loadingVisible = await page.locator('.loading-spinner, .loading-container').count();
    const videosVisible = await page.locator('video').count();
    const videoCards = await page.locator('.video-card').count();

    console.log(`⏳ Loading indicators: ${loadingVisible}`);
    console.log(`🎥 Video elements: ${videosVisible}`);
    console.log(`📹 Video cards: ${videoCards}`);

    // Log any console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ Browser error: ${msg.text()}`);
        }
    });

    await page.waitForTimeout(3000);
});
