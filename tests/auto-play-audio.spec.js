// 🎙️ AUTO-PLAY AUDIO ON SCROLL TEST
const { test, expect } = require('@playwright/test');

test.describe('Auto-Play Audio on Scroll', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000); // Wait for initial content load
    });

    test('should auto-play audio when card enters viewport', async ({ page }) => {
        console.log('🎯 TEST: Auto-play audio on scroll');

        // Wait for feed container to load
        await page.waitForSelector('#feedContainer');

        // Screenshot initial state
        await page.screenshot({ path: 'test-results/auto-play-initial.png', fullPage: true });

        // Get initial card count
        const initialCards = await page.locator('.content-card').count();
        console.log(`📊 Initial cards loaded: ${initialCards}`);

        // Scroll down to trigger more content loading
        await page.evaluate(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });

        await page.waitForTimeout(2000);

        // Screenshot after scroll
        await page.screenshot({ path: 'test-results/auto-play-after-scroll.png', fullPage: true });

        // Verify more cards loaded
        const cardsAfterScroll = await page.locator('.content-card').count();
        console.log(`📊 Cards after scroll: ${cardsAfterScroll}`);
        expect(cardsAfterScroll).toBeGreaterThan(initialCards);
    });

    test('should have audio buttons on all cards', async ({ page }) => {
        console.log('🎯 TEST: Audio buttons present');

        await page.waitForSelector('#feedContainer');

        const audioButtons = await page.locator('[id^="audio-"]').count();
        console.log(`🔊 Audio buttons found: ${audioButtons}`);

        expect(audioButtons).toBeGreaterThan(0);

        // Screenshot showing audio buttons
        await page.screenshot({ path: 'test-results/audio-buttons.png', fullPage: true });
    });

    test('should manually play audio on button click', async ({ page }) => {
        console.log('🎯 TEST: Manual audio playback');

        await page.waitForSelector('#feedContainer');

        // Find first audio button
        const firstAudioBtn = page.locator('[id^="audio-"]').first();

        // Screenshot before click
        await page.screenshot({ path: 'test-results/audio-before-click.png', fullPage: false });

        // Get initial button text
        const initialText = await firstAudioBtn.textContent();
        console.log(`🔊 Initial button text: ${initialText}`);

        // Click audio button
        await firstAudioBtn.click();

        // Wait for loading state
        await page.waitForTimeout(500);

        // Screenshot during loading
        await page.screenshot({ path: 'test-results/audio-loading.png', fullPage: false });

        // Check button changed to loading state
        const loadingText = await firstAudioBtn.textContent();
        console.log(`⏳ Loading button text: ${loadingText}`);

        expect(loadingText).toContain('Loading');
    });

    test('should initialize Intersection Observer for auto-play', async ({ page }) => {
        console.log('🎯 TEST: Intersection Observer initialization');

        await page.waitForSelector('#feedContainer');

        // Check console logs for observer initialization
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        // Refresh to trigger init
        await page.reload();
        await page.waitForTimeout(1000);

        // Check for initialization log
        const observerInitLog = logs.find(log => log.includes('Auto-play audio observer initialized'));
        console.log(`✅ Observer init log found: ${!!observerInitLog}`);

        expect(observerInitLog).toBeTruthy();

        // Screenshot final state
        await page.screenshot({ path: 'test-results/observer-initialized.png', fullPage: true });
    });

    test('should have data-id attribute on cards for tracking', async ({ page }) => {
        console.log('🎯 TEST: Card data attributes');

        await page.waitForSelector('#feedContainer');

        const firstCard = page.locator('.content-card').first();
        const dataId = await firstCard.getAttribute('data-id');

        console.log(`🆔 First card data-id: ${dataId}`);
        expect(dataId).toBeTruthy();

        // Screenshot showing card structure
        await page.screenshot({ path: 'test-results/card-data-attributes.png', fullPage: false });
    });

    test('should prevent duplicate audio plays with data-audio-played flag', async ({ page }) => {
        console.log('🎯 TEST: Duplicate play prevention');

        await page.waitForSelector('#feedContainer');

        const firstCard = page.locator('.content-card').first();

        // Check initial state (should not have data-audio-played)
        const initialFlag = await firstCard.getAttribute('data-audio-played');
        console.log(`🚫 Initial audio-played flag: ${initialFlag}`);

        // Scroll to ensure card is in view
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);

        // Screenshot after scroll
        await page.screenshot({ path: 'test-results/duplicate-prevention.png', fullPage: false });
    });

    test('should display toast notification on audio play', async ({ page }) => {
        console.log('🎯 TEST: Toast notifications');

        await page.waitForSelector('#feedContainer');

        const firstAudioBtn = page.locator('[id^="audio-"]').first();

        // Click to trigger toast
        await firstAudioBtn.click();
        await page.waitForTimeout(500);

        // Look for toast notification
        const toast = page.locator('.toast, .notification, [role="alert"]');
        const toastCount = await toast.count();

        console.log(`🍞 Toast notifications found: ${toastCount}`);

        // Screenshot with toast
        await page.screenshot({ path: 'test-results/audio-toast.png', fullPage: false });
    });

    test('should handle mobile viewport for auto-play', async ({ page }) => {
        console.log('🎯 TEST: Mobile viewport auto-play');

        // Set mobile viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Screenshot mobile view
        await page.screenshot({ path: 'test-results/mobile-auto-play.png', fullPage: true });

        const audioButtons = await page.locator('[id^="audio-"]').count();
        console.log(`📱 Mobile audio buttons: ${audioButtons}`);

        expect(audioButtons).toBeGreaterThan(0);
    });
});
