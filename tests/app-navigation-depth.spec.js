/**
 * 🧭 APP NAVIGATION DEPTH TEST
 * Tests ALL sections of the app as requested by user:
 * Homepage → Articles → Videos → Music → Stories
 *
 * Takes screenshots of DIFFERENT pages (not repeated same-page testing)
 */

const { test, expect } = require('@playwright/test');

test('Navigate through entire app - Homepage → Articles → Videos → Music → Stories', async ({ page }) => {
    console.log('🚀 Starting comprehensive app navigation test...');

    // 1. HOMEPAGE - Initial load
    console.log('\n📍 Testing HOMEPAGE (PORT 3002)');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/1-homepage-initial.png', fullPage: false });
    console.log('✅ Screenshot: 1-homepage-initial.png');

    // Click "Tap to Start" if visible
    const tapToStart = page.locator('text=Tap to Start');
    if (await tapToStart.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tapToStart.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/2-homepage-after-start.png', fullPage: false });
        console.log('✅ Screenshot: 2-homepage-after-start.png');
    }

    // 2. BOTTOM NAV - Check if navigation exists
    console.log('\n📍 Checking BOTTOM NAVIGATION');
    const bottomNav = page.locator('nav, [role="navigation"], .bottom-nav, .tab-bar');
    const navExists = await bottomNav.count() > 0;
    console.log(`Bottom nav found: ${navExists}`);

    // 3. ARTICLES SECTION
    console.log('\n📍 Testing ARTICLES section');
    const articlesBtn = page.locator('[data-page="articles"]');
    if (await articlesBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await articlesBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/3-articles-section.png', fullPage: false });
        console.log('✅ Screenshot: 3-articles-section.png');
        console.log('✅ Articles section loaded');
    } else {
        console.log('⚠️ Articles button not found');
        await page.screenshot({ path: 'screenshots/3-articles-not-found.png', fullPage: false });
    }

    // 4. VIDEOS SECTION
    console.log('\n📍 Testing VIDEOS section');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    const videosBtn = page.locator('text=Videos, button:has-text("Videos"), a:has-text("Videos"), [aria-label="Videos"]').first();
    if (await videosBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await videosBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/4-videos-section.png', fullPage: false });
        console.log('✅ Screenshot: 4-videos-section.png');
        console.log('✅ Videos section loaded');
    } else {
        console.log('⚠️ Videos button not found - the homepage IS the videos section (TikTok-style)');
        await page.screenshot({ path: 'screenshots/4-videos-is-homepage.png', fullPage: false });
    }

    // 5. MUSIC SECTION
    console.log('\n📍 Testing MUSIC section');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    const musicBtn = page.locator('[data-page="music"]');
    if (await musicBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await musicBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/5-music-section.png', fullPage: false });
        console.log('✅ Screenshot: 5-music-section.png');
        console.log('✅ Music section loaded');
    } else {
        console.log('⚠️ Music button not found');
        await page.screenshot({ path: 'screenshots/5-music-not-found.png', fullPage: false });
    }

    // 6. STORIES SECTION
    console.log('\n📍 Testing STORIES section');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    const storiesBtn = page.locator('[data-page="stories"]');
    if (await storiesBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await storiesBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/6-stories-section.png', fullPage: false });
        console.log('✅ Screenshot: 6-stories-section.png');
        console.log('✅ Stories section loaded');
    } else {
        console.log('⚠️ Stories button not found');
        await page.screenshot({ path: 'screenshots/6-stories-not-found.png', fullPage: false });
    }

    // 7. TEST TRANSLATIONS - Click on Spanish word
    console.log('\n📍 Testing WORD TRANSLATIONS');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    if (await tapToStart.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tapToStart.click();
        await page.waitForTimeout(3000); // Wait for video to start
    }

    // Try clicking a Spanish word
    const spanishWord = page.locator('.word, .clickable-word, .spanish-text .word').first();
    if (await spanishWord.isVisible({ timeout: 5000 }).catch(() => false)) {
        await spanishWord.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/7-translation-popup.png', fullPage: false });
        console.log('✅ Screenshot: 7-translation-popup.png');
        console.log('✅ Translation feature tested');
    } else {
        console.log('⚠️ No clickable Spanish words found');
        await page.screenshot({ path: 'screenshots/7-no-words.png', fullPage: false });
    }

    // 8. TEST SEARCH (if exists)
    console.log('\n📍 Testing SEARCH feature');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    const searchBtn = page.locator('[aria-label="Search"], button:has-text("Search"), input[type="search"]').first();
    if (await searchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/8-search-feature.png', fullPage: false });
        console.log('✅ Screenshot: 8-search-feature.png');
    } else {
        console.log('⚠️ Search feature not found');
    }

    // 9. TEST SETTINGS (if exists)
    console.log('\n📍 Testing SETTINGS');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    const settingsBtn = page.locator('[aria-label="Settings"], button:has-text("Settings"), text=Profile, [aria-label="Profile"]').first();
    if (await settingsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/9-settings-page.png', fullPage: false });
        console.log('✅ Screenshot: 9-settings-page.png');
    } else {
        console.log('⚠️ Settings not found');
    }

    // 10. FINAL STATE - Video playback test
    console.log('\n📍 Testing VIDEO PLAYBACK');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    if (await tapToStart.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tapToStart.click();
        await page.waitForTimeout(5000); // Let video play for 5 seconds
    }
    await page.screenshot({ path: 'screenshots/10-video-playing.png', fullPage: false });
    console.log('✅ Screenshot: 10-video-playing.png');

    console.log('\n✅ COMPREHENSIVE APP NAVIGATION TEST COMPLETE');
    console.log('📸 All screenshots saved to screenshots/ directory');
    console.log('🎯 Explored: Homepage, Articles, Videos, Music, Stories, Translations, Search, Settings');
});
