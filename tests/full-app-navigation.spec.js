/**
 * 🎯 COMPLETE ENTERTAINMENT FEED NAVIGATION TEST
 * Tests: Videos → Articles → Music → Stories → Profile
 * Takes screenshots of each section
 */

const { test, expect } = require('@playwright/test');

test('Complete Entertainment Feed - Videos | Articles | Music | Stories | Profile', async ({ page }) => {
    console.log('🚀 Testing complete entertainment feed navigation...\n');

    // 1. VIDEOS (Homepage)
    console.log('📍 1/5: VIDEOS section');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    // Click "Tap to Start" if visible
    const tapBtn = page.locator('text=Tap to Start');
    if (await tapBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tapBtn.click();
        await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'screenshots/nav-1-videos.png', fullPage: false });
    console.log('✅ Screenshot saved: nav-1-videos.png\n');

    // 2. ARTICLES
    console.log('📍 2/5: ARTICLES section');
    await page.goto('http://localhost:3002');

    // Dismiss tap to start overlay if present
    if (await tapBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tapBtn.click();
        await page.waitForTimeout(500);
    }

    const articlesBtn = page.locator('button[data-page="articles"]');
    await articlesBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/nav-2-articles.png', fullPage: false });
    console.log('✅ Screenshot saved: nav-2-articles.png\n');

    // 3. MUSIC
    console.log('📍 3/5: MUSIC section');
    await page.goto('http://localhost:3002');
    if (await tapBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tapBtn.click();
        await page.waitForTimeout(500);
    }
    const musicBtn = page.locator('button[data-page="music"]');
    await musicBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/nav-3-music.png', fullPage: false });
    console.log('✅ Screenshot saved: nav-3-music.png\n');

    // 4. STORIES
    console.log('📍 4/5: STORIES section');
    await page.goto('http://localhost:3002');
    if (await tapBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tapBtn.click();
        await page.waitForTimeout(500);
    }
    const storiesBtn = page.locator('button[data-page="stories"]');
    await storiesBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/nav-4-stories.png', fullPage: false });
    console.log('✅ Screenshot saved: nav-4-stories.png\n');

    // 5. PROFILE
    console.log('📍 5/5: PROFILE section');
    await page.goto('http://localhost:3002');
    if (await tapBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tapBtn.click();
        await page.waitForTimeout(500);
    }
    const profileBtn = page.locator('button[data-page="profile"]');
    await profileBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/nav-5-profile.png', fullPage: false });
    console.log('✅ Screenshot saved: nav-5-profile.png\n');

    console.log('✅ COMPLETE! All 5 sections tested and screenshotted');
    console.log('📸 Screenshots: nav-1-videos.png → nav-5-profile.png');
});
