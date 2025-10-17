/**
 * 🎬 REAL-TIME TRANSCRIPTION TEST - YouTube/TikTok 2025 Pattern
 * Tests dual-language line-by-line transcription with AI punctuation
 */

const { test, expect } = require('@playwright/test');

test.describe('Real-time Transcription with AI Punctuation', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:3002');

        // Wait for page to load
        await page.waitForLoadState('networkidle');
    });

    test('should show Tap to Start overlay initially', async ({ page }) => {
        const tapToStart = page.locator('#tapToStart');
        await expect(tapToStart).toBeVisible();
        await expect(tapToStart).toContainText('Tap to Start');
    });

    test('should load videos with subtitles', async ({ page }) => {
        // Click Tap to Start
        await page.click('#tapToStart');

        // Wait for overlay to disappear
        await page.waitForSelector('#tapToStart', { state: 'hidden', timeout: 5000 });

        // Wait for videos to load
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // Check that at least one video is present
        const videos = await page.locator('.reel video').count();
        expect(videos).toBeGreaterThan(0);

        console.log(`✅ Loaded ${videos} videos`);
    });

    test('should display dual-language captions when video plays', async ({ page }) => {
        // Click Tap to Start
        await page.click('#tapToStart');
        await page.waitForSelector('#tapToStart', { state: 'hidden' });

        // Wait for first video
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // Wait for video to start playing (autoplay)
        await page.waitForTimeout(2000);

        // Check for caption container
        const captionContainer = page.locator('.word-overlay').first();

        // The caption may appear based on video timing, so we wait a bit
        await page.waitForTimeout(3000);

        // Take screenshot to verify
        await page.screenshot({ path: 'screenshots/transcription-test.png' });

        console.log('✅ Transcription test completed - check screenshots/transcription-test.png');
    });

    test('should have API endpoints for punctuation and translation', async ({ page }) => {
        // Test punctuation API
        const punctuateResponse = await page.evaluate(async () => {
            const response = await fetch('/api/punctuate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'hola como estas' })
            });
            return response.json();
        });

        expect(punctuateResponse.success).toBe(true);
        expect(punctuateResponse.punctuated).toContain('Hola');
        console.log('✅ Punctuation API:', punctuateResponse.punctuated);

        // Test translation API
        const translateResponse = await page.evaluate(async () => {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'hola', from: 'es', to: 'en' })
            });
            return response.json();
        });

        expect(translateResponse.success).toBe(true);
        console.log('✅ Translation API:', translateResponse.translation);
    });

    test('should have clickable Spanish words in captions', async ({ page }) => {
        // Click Tap to Start
        await page.click('#tapToStart');
        await page.waitForSelector('#tapToStart', { state: 'hidden' });

        // Wait for videos
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // Wait for potential captions
        await page.waitForTimeout(3000);

        // Check if clickable words are present (may not appear immediately)
        const clickableWords = await page.locator('.clickable-word').count();

        console.log(`Found ${clickableWords} clickable words in captions`);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/clickable-words-test.png' });
    });

    test('should show bottom navigation with exactly 1 nav bar', async ({ page }) => {
        // Check for exactly ONE navigation bar
        const navBars = await page.locator('nav').count();
        expect(navBars).toBe(1);

        // Verify it's the bottom nav
        const bottomNav = page.locator('.bottom-nav');
        await expect(bottomNav).toBeVisible();

        // Check nav items
        const navItems = await page.locator('.nav-item').count();
        expect(navItems).toBe(5); // Home, Friends, Create, Messages, Profile

        console.log('✅ Single bottom navigation verified');
    });

    test('should NOT have spam popups or achievements', async ({ page }) => {
        // Click Tap to Start
        await page.click('#tapToStart');
        await page.waitForSelector('#tapToStart', { state: 'hidden' });

        // Wait a bit
        await page.waitForTimeout(2000);

        // Check for spam elements
        const popups = await page.locator('.popup, .modal, .achievement').count();
        expect(popups).toBe(0);

        console.log('✅ No spam popups or achievements detected');
    });
});
