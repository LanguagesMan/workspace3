/**
 * Entertainment Feed Sections Test
 * Tests ALL sections: Homepage (Videos) → Articles → Music → Stories
 * Each section is a DIFFERENT page, not the same page!
 *
 * Evidence: Instagram/TikTok 2025 pattern - bottom nav navigates to different pages
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Entertainment Feed - All Sections Navigation', () => {
    const baseURL = 'http://localhost:3002';
    const screenshotDir = path.join(__dirname, '..', 'screenshots');

    test('1. Homepage - Videos Feed (TikTok vertical scroll)', async ({ page }) => {
        console.log('📹 Testing Videos Feed (Homepage)...');

        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for videos to load

        // Verify TikTok-style vertical scroll container
        const reelsContainer = await page.locator('.reels-container');
        await expect(reelsContainer).toBeVisible();

        // Verify bottom navigation exists
        const bottomNav = await page.locator('.bottom-nav');
        await expect(bottomNav).toBeVisible();

        // Verify Videos tab is active
        const videosTab = await page.locator('.nav-item[data-page="videos"]');
        await expect(videosTab).toHaveClass(/active/);

        // Verify video elements loaded
        const firstReel = await page.locator('.reel').first();
        await expect(firstReel).toBeVisible();

        // Screenshot VIDEOS page
        await page.screenshot({
            path: path.join(screenshotDir, 'entertainment-feed-1-videos.png'),
            fullPage: false
        });

        console.log('✅ Videos Feed working - Screenshot saved: entertainment-feed-1-videos.png');
    });

    test('2. Articles Feed - Navigate from Videos', async ({ page }) => {
        console.log('📰 Testing Articles Feed navigation...');

        // Start at homepage
        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Click Articles tab
        const articlesTab = await page.locator('.nav-item[data-page="articles"]');
        await articlesTab.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify we navigated to DIFFERENT page (articles-feed.html)
        expect(page.url()).toContain('articles-feed.html');

        // Verify articles grid exists
        const articlesGrid = await page.locator('.articles-grid');
        await expect(articlesGrid).toBeVisible();

        // Verify article cards exist
        const articleCards = await page.locator('.article-card');
        const cardCount = await articleCards.count();
        expect(cardCount).toBeGreaterThan(0);

        // Screenshot ARTICLES page
        await page.screenshot({
            path: path.join(screenshotDir, 'entertainment-feed-2-articles.png'),
            fullPage: true
        });

        console.log(`✅ Articles Feed working - ${cardCount} articles loaded - Screenshot saved: entertainment-feed-2-articles.png`);
    });

    test('3. Music Feed - Navigate from Videos', async ({ page }) => {
        console.log('🎵 Testing Music Feed navigation...');

        // Start at homepage
        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Click Music tab
        const musicTab = await page.locator('.nav-item[data-page="music"]');
        await musicTab.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify we navigated to DIFFERENT page (music-feed.html)
        expect(page.url()).toContain('music-feed.html');

        // Verify music container exists
        const musicContainer = await page.locator('.music-container');
        await expect(musicContainer).toBeVisible();

        // Verify music cards exist
        const musicCards = await page.locator('.music-card');
        const cardCount = await musicCards.count();
        expect(cardCount).toBeGreaterThan(0);

        // Screenshot MUSIC page
        await page.screenshot({
            path: path.join(screenshotDir, 'entertainment-feed-3-music.png'),
            fullPage: true
        });

        console.log(`✅ Music Feed working - ${cardCount} songs loaded - Screenshot saved: entertainment-feed-3-music.png`);
    });

    test('4. Stories Feed - Navigate from Videos', async ({ page }) => {
        console.log('📖 Testing Stories Feed navigation...');

        // Start at homepage
        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Click Stories tab
        const storiesTab = await page.locator('.nav-item[data-page="stories"]');
        await storiesTab.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify we navigated to DIFFERENT page (stories.html)
        expect(page.url()).toContain('stories.html');

        // Verify stories container exists
        const storiesContainer = await page.locator('.stories-container');
        await expect(storiesContainer).toBeVisible();

        // Verify progress bars exist (Instagram pattern)
        const progressContainer = await page.locator('.progress-container');
        await expect(progressContainer).toBeVisible();

        // Screenshot STORIES page
        await page.screenshot({
            path: path.join(screenshotDir, 'entertainment-feed-4-stories.png'),
            fullPage: false
        });

        console.log('✅ Stories Feed working - Screenshot saved: entertainment-feed-4-stories.png');
    });

    test('5. Full Navigation Flow - Videos → Articles → Music → Stories → Videos', async ({ page }) => {
        console.log('🔄 Testing full navigation flow...');

        // 1. Start at Videos
        await page.goto(baseURL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('index.html');
        console.log('  ✓ Started at Videos (index.html)');

        // 2. Navigate to Articles
        await page.locator('.nav-item[data-page="articles"]').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('articles-feed.html');
        console.log('  ✓ Navigated to Articles');

        // 3. Navigate to Music
        await page.locator('.nav-item[data-page="music"]').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('music-feed.html');
        console.log('  ✓ Navigated to Music');

        // 4. Navigate to Stories
        await page.locator('.nav-item[data-page="stories"]').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        expect(page.url()).toContain('stories.html');
        console.log('  ✓ Navigated to Stories');

        // 5. Navigate back to Videos
        await page.locator('.nav-item[data-page="videos"]').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        // Should return to index.html (homepage)
        expect(page.url()).toMatch(/index\.html|localhost:3002\/?$/);
        console.log('  ✓ Navigated back to Videos');

        console.log('✅ Full navigation flow verified - ALL sections accessible!');
    });

    test('6. Visual Verification - Bottom Nav Consistent Across All Pages', async ({ page }) => {
        console.log('🎨 Testing bottom nav consistency...');

        const pages = [
            { name: 'Videos', url: baseURL },
            { name: 'Articles', url: `${baseURL}/articles-feed.html` },
            { name: 'Music', url: `${baseURL}/music-feed.html` },
            { name: 'Stories', url: `${baseURL}/stories.html` }
        ];

        for (const pageInfo of pages) {
            await page.goto(pageInfo.url);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            // Verify bottom nav exists on every page
            const bottomNav = await page.locator('.bottom-nav');
            await expect(bottomNav).toBeVisible();

            // Verify all 5 nav items exist
            const navItems = await page.locator('.nav-item');
            const count = await navItems.count();
            expect(count).toBe(5); // Videos, Articles, Music, Stories, Profile

            console.log(`  ✓ ${pageInfo.name} - Bottom nav present with 5 tabs`);
        }

        console.log('✅ Bottom navigation consistent across all pages!');
    });
});
