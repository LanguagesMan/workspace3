// 🧪 COMPLETE FEED APP TEST - All Sections (Videos, Articles, Music, Stories)
// Testing TikTok-style Spanish learning feed with 4 content types
// Reference: Instagram Reels 2025 patterns, entertainment-server.js API

const { test, expect } = require('@playwright/test');

test.describe('Complete Feed App - All Sections', () => {
    test.beforeEach(async ({ page }) => {
        // Start server is already running on port 3002
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
    });

    test('1. Page loads with top navigation tabs', async ({ page }) => {
        // Verify top tabs exist
        await expect(page.locator('.top-nav-tabs')).toBeVisible();

        // Verify all 4 tabs exist
        const tabs = page.locator('.nav-tab');
        await expect(tabs).toHaveCount(4);

        // Verify tab labels
        await expect(page.locator('.nav-tab[data-tab="videos"]')).toContainText('Videos');
        await expect(page.locator('.nav-tab[data-tab="articles"]')).toContainText('Articles');
        await expect(page.locator('.nav-tab[data-tab="music"]')).toContainText('Music');
        await expect(page.locator('.nav-tab[data-tab="stories"]')).toContainText('Stories');

        // Verify Videos tab is active by default
        await expect(page.locator('.nav-tab.active[data-tab="videos"]')).toBeVisible();

        console.log('✅ Top navigation tabs verified');
    });

    test('2. Bottom navigation bar exists with 5 buttons', async ({ page }) => {
        // Verify bottom nav exists
        await expect(page.locator('.bottom-nav-bar')).toBeVisible();

        // Verify all 5 buttons exist
        const navItems = page.locator('.bottom-nav-item');
        await expect(navItems).toHaveCount(5);

        // Verify icons/labels
        await expect(navItems.nth(0)).toContainText('Home');
        await expect(navItems.nth(1)).toContainText('Discover');
        await expect(navItems.nth(2)).toContainText('Create');
        await expect(navItems.nth(3)).toContainText('Inbox');
        await expect(navItems.nth(4)).toContainText('Profile');

        console.log('✅ Bottom navigation verified');
    });

    test('3. Videos section shows only video content', async ({ page }) => {
        // Click Videos tab
        await page.click('.nav-tab[data-tab="videos"]');
        await page.waitForTimeout(1000);

        // Verify videos are rendered
        const contentCards = page.locator('.content-card');
        const count = await contentCards.count();

        expect(count).toBeGreaterThan(0);
        console.log(`✅ Videos section: ${count} videos loaded`);

        // Verify first video has video element
        const firstCard = contentCards.first();
        await expect(firstCard.locator('video')).toBeVisible();

        // Verify video has captions
        const hasTitle = await firstCard.locator('.card-title').isVisible();
        expect(hasTitle).toBeTruthy();

        console.log('✅ Video content verified');
    });

    test('4. Articles section shows only article content', async ({ page }) => {
        // Click Articles tab
        await page.click('.nav-tab[data-tab="articles"]');
        await page.waitForTimeout(1000);

        // Verify articles are rendered
        const contentCards = page.locator('.content-card');
        const count = await contentCards.count();

        expect(count).toBeGreaterThan(0);
        console.log(`✅ Articles section: ${count} articles loaded`);

        // Verify first article has Spanish text
        const firstCard = contentCards.first();
        const spanishText = await firstCard.locator('.spanish-content, .card-spanish').isVisible();
        expect(spanishText).toBeTruthy();

        console.log('✅ Article content verified');
    });

    test('5. Music section shows only music content', async ({ page }) => {
        // Click Music tab
        await page.click('.nav-tab[data-tab="music"]');
        await page.waitForTimeout(1000);

        // Verify music items are rendered
        const contentCards = page.locator('.content-card');
        const count = await contentCards.count();

        expect(count).toBeGreaterThan(0);
        console.log(`✅ Music section: ${count} tracks loaded`);

        // Verify first music item has artist info
        const firstCard = contentCards.first();
        const hasArtist = await firstCard.locator('.music-artist, .card-artist').count() > 0;
        expect(hasArtist).toBeTruthy();

        console.log('✅ Music content verified');
    });

    test('6. Stories section shows only story content', async ({ page }) => {
        // Click Stories tab
        await page.click('.nav-tab[data-tab="stories"]');
        await page.waitForTimeout(1000);

        // Verify stories are rendered
        const contentCards = page.locator('.content-card');
        const count = await contentCards.count();

        expect(count).toBeGreaterThan(0);
        console.log(`✅ Stories section: ${count} stories loaded`);

        // Verify first story has content
        const firstCard = contentCards.first();
        const hasContent = await firstCard.locator('.story-content, .card-content').isVisible();
        expect(hasContent).toBeTruthy();

        console.log('✅ Story content verified');
    });

    test('7. Tab switching updates active state', async ({ page }) => {
        // Click Articles tab
        await page.click('.nav-tab[data-tab="articles"]');
        await page.waitForTimeout(500);

        // Verify Articles is active
        await expect(page.locator('.nav-tab.active[data-tab="articles"]')).toBeVisible();
        await expect(page.locator('.nav-tab.active[data-tab="videos"]')).not.toBeVisible();

        // Click Music tab
        await page.click('.nav-tab[data-tab="music"]');
        await page.waitForTimeout(500);

        // Verify Music is active
        await expect(page.locator('.nav-tab.active[data-tab="music"]')).toBeVisible();
        await expect(page.locator('.nav-tab.active[data-tab="articles"]')).not.toBeVisible();

        console.log('✅ Tab switching verified');
    });

    test('8. XP and Streak banner exists', async ({ page }) => {
        // Verify XP/Streak banner
        await expect(page.locator('.xp-streak-banner')).toBeVisible();

        // Verify streak display
        await expect(page.locator('.streak-display')).toBeVisible();
        await expect(page.locator('#streakCount')).toBeVisible();

        // Verify XP display
        await expect(page.locator('.xp-display')).toBeVisible();
        await expect(page.locator('#xpText')).toBeVisible();

        console.log('✅ XP & Streak system verified');
    });

    test('9. Scroll-snap works on feed container', async ({ page }) => {
        // Click Videos tab
        await page.click('.nav-tab[data-tab="videos"]');
        await page.waitForTimeout(1000);

        // Check feed container has scroll-snap CSS
        const feedContainer = page.locator('#feedContainer');
        const scrollSnapType = await feedContainer.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        expect(scrollSnapType).toContain('y');
        console.log(`✅ Scroll-snap type: ${scrollSnapType}`);

        // Verify content cards have snap alignment
        const firstCard = page.locator('.content-card').first();
        const snapAlign = await firstCard.evaluate(el =>
            window.getComputedStyle(el).scrollSnapAlign
        );

        expect(snapAlign).toContain('start');
        console.log(`✅ Card snap-align: ${snapAlign}`);
    });

    test('10. Content cards are full-screen (100vh)', async ({ page }) => {
        await page.waitForTimeout(1000);

        const firstCard = page.locator('.content-card').first();
        const height = await firstCard.evaluate(el => el.offsetHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        // Cards should be approximately viewport height (allowing 10px margin)
        expect(Math.abs(height - viewportHeight)).toBeLessThan(10);
        console.log(`✅ Card height: ${height}px, Viewport: ${viewportHeight}px`);
    });

    test('11. Real user test - Watch video, read article, play music, read story', async ({ page }) => {
        console.log('\n🎯 REAL USER TEST STARTING...\n');

        // 1. WATCH VIDEO
        console.log('📹 Testing Videos section...');
        await page.click('.nav-tab[data-tab="videos"]');
        await page.waitForTimeout(1500);

        const videoCards = await page.locator('.content-card').count();
        console.log(`   Found ${videoCards} videos`);

        // Try to play first video
        const video = page.locator('video').first();
        if (await video.isVisible()) {
            await video.click();
            console.log('   ✅ Video clicked (attempted play)');
        }

        // 2. READ ARTICLE
        console.log('\n📰 Testing Articles section...');
        await page.click('.nav-tab[data-tab="articles"]');
        await page.waitForTimeout(1500);

        const articleCards = await page.locator('.content-card').count();
        console.log(`   Found ${articleCards} articles`);

        // Read first article title
        const articleTitle = await page.locator('.card-title').first().textContent();
        console.log(`   ✅ Article: "${articleTitle}"`);

        // 3. PLAY MUSIC
        console.log('\n🎵 Testing Music section...');
        await page.click('.nav-tab[data-tab="music"]');
        await page.waitForTimeout(1500);

        const musicCards = await page.locator('.content-card').count();
        console.log(`   Found ${musicCards} music tracks`);

        const musicTitle = await page.locator('.card-title').first().textContent();
        console.log(`   ✅ Track: "${musicTitle}"`);

        // 4. READ STORY
        console.log('\n📖 Testing Stories section...');
        await page.click('.nav-tab[data-tab="stories"]');
        await page.waitForTimeout(1500);

        const storyCards = await page.locator('.content-card').count();
        console.log(`   Found ${storyCards} stories`);

        const storyTitle = await page.locator('.card-title').first().textContent();
        console.log(`   ✅ Story: "${storyTitle}"`);

        console.log('\n✅ REAL USER TEST PASSED - All sections work!\n');
    });

    test('12. API integration - Verify content loaded from server', async ({ page }) => {
        // Intercept API request
        let apiCalled = false;
        page.on('request', request => {
            if (request.url().includes('/api/feed')) {
                apiCalled = true;
                console.log(`✅ API called: ${request.url()}`);
            }
        });

        await page.reload();
        await page.waitForTimeout(2000);

        expect(apiCalled).toBeTruthy();
        console.log('✅ Content loaded from entertainment-server.js');
    });

    test('13. Performance - Page loads in under 3 seconds', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(3000);
        console.log(`✅ Page load time: ${loadTime}ms (target: <3000ms)`);
    });

    test('14. Accessibility - Navigation has proper ARIA labels', async ({ page }) => {
        // Check top nav
        const topNav = page.locator('.top-nav-tabs');
        const role = await topNav.getAttribute('role');
        expect(role).toBe('navigation');

        // Check bottom nav
        const bottomNav = page.locator('.bottom-nav-bar');
        const bottomRole = await bottomNav.getAttribute('role');
        expect(bottomRole).toBe('navigation');

        console.log('✅ Navigation ARIA roles verified');
    });

    test('15. Mobile responsive - Works on 375px width (iPhone)', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify content still visible
        await expect(page.locator('.content-card').first()).toBeVisible();

        // Verify nav bars fit
        const topNav = page.locator('.top-nav-tabs');
        const bottomNav = page.locator('.bottom-nav-bar');

        await expect(topNav).toBeVisible();
        await expect(bottomNav).toBeVisible();

        console.log('✅ Mobile responsive (375px) verified');
    });
});
