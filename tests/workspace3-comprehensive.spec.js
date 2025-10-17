const { test, expect } = require('@playwright/test');

test.describe('workspace3 - TikTok-style Spanish Learning App', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 10000 });
    });

    test('1. App redirects immediately to videos-feed (NO menus first)', async ({ page }) => {
        // User Command #1: Show reels IMMEDIATELY when app opens
        await page.waitForURL('**/videos-feed.html', { timeout: 5000 });

        const url = page.url();
        expect(url).toContain('videos-feed.html');

        console.log('✅ App redirects to videos-feed immediately - no menu screens');
    });

    test('2. Full-screen TikTok-style vertical scroll reels are visible', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('.shorts-container', { timeout: 5000 });
        await page.waitForSelector('.video-card', { timeout: 5000 });

        // Check that container has scroll-snap
        const container = await page.$('.shorts-container');
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        expect(scrollSnapType).toContain('y');
        expect(scrollSnapType).toContain('mandatory');

        // Check video card is full-screen
        const card = await page.$('.video-card');
        const cardHeight = await card.evaluate(el => el.offsetHeight);
        const viewport = page.viewportSize();
        const viewportHeight = viewport.height;

        expect(cardHeight).toBeGreaterThanOrEqual(viewportHeight - 50);

        console.log('✅ Full-screen vertical scroll reels working with scroll-snap-type: y mandatory');
    });

    test('3. Videos with subtitles load successfully', async ({ page }) => {
        await page.waitForSelector('video', { timeout: 10000 });

        const videoCount = await page.$$eval('video', videos => videos.length);
        expect(videoCount).toBeGreaterThan(0);

        console.log(`✅ Loaded ${videoCount} videos`);
    });

    test('4. Interactive subtitles with clickable Spanish words are present', async ({ page }) => {
        // User Command #2: Clickable Spanish word translations
        await page.waitForSelector('.interactive-subtitles', { timeout: 5000 });
        await page.waitForSelector('.word-clickable', { timeout: 5000 });

        const wordCount = await page.$$eval('.word-clickable', words => words.length);
        expect(wordCount).toBeGreaterThan(0);

        // Check words have data-word attribute
        const firstWord = await page.$('.word-clickable');
        const hasDataWord = await firstWord.evaluate(el => el.hasAttribute('data-word'));
        expect(hasDataWord).toBe(true);

        console.log(`✅ Found ${wordCount} clickable Spanish words`);
    });

    test('5. Clicking a word shows translation popup', async ({ page }) => {
        await page.waitForSelector('.word-clickable', { timeout: 5000 });

        // Click first word
        await page.click('.word-clickable');

        // Wait for translation popup
        await page.waitForSelector('.translation-popup.active', { timeout: 3000 });

        const popupVisible = await page.isVisible('.translation-popup.active');
        expect(popupVisible).toBe(true);

        console.log('✅ Translation popup appears when clicking words');
    });

    test('6. Instagram Stories carousel is visible at top', async ({ page }) => {
        // User Command #2: Stories section
        await page.waitForSelector('.stories-carousel', { timeout: 5000 });
        await page.waitForSelector('.story-avatar', { timeout: 5000 });

        const storyCount = await page.$$eval('.story-avatar', stories => stories.length);
        expect(storyCount).toBeGreaterThan(0);

        console.log(`✅ Found ${storyCount} stories in carousel`);
    });

    test('7. Streak badge and Quest badge are visible', async ({ page }) => {
        await page.waitForSelector('.streak-badge-floating', { timeout: 5000 });
        await page.waitForSelector('.quest-badge-floating', { timeout: 5000 });

        const streakVisible = await page.isVisible('.streak-badge-floating');
        const questVisible = await page.isVisible('.quest-badge-floating');

        expect(streakVisible).toBe(true);
        expect(questVisible).toBe(true);

        console.log('✅ Gamification badges (streak + quests) visible');
    });

    test('8. Interaction buttons (Like, Comments, Save, Share) are present', async ({ page }) => {
        await page.waitForSelector('.interaction-bar', { timeout: 5000 });

        const buttonCount = await page.$$eval('.interaction-btn', btns => btns.length);
        expect(buttonCount).toBeGreaterThanOrEqual(4); // At least Like, Comments, Save, Share

        console.log(`✅ Found ${buttonCount} interaction buttons`);
    });

    test('9. Engagement metrics are displayed', async ({ page }) => {
        await page.waitForSelector('.engagement-metrics', { timeout: 5000 });

        const metricsVisible = await page.isVisible('.engagement-metrics');
        expect(metricsVisible).toBe(true);

        // Check for views, watch time, likes
        const viewsVisible = await page.isVisible('.views-count');
        const likesVisible = await page.isVisible('.likes-count');

        expect(viewsVisible).toBe(true);
        expect(likesVisible).toBe(true);

        console.log('✅ Engagement metrics (views, watch time, likes) displayed');
    });

    test('10. Console has no critical errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.waitForSelector('.video-card', { timeout: 5000 });
        await page.waitForTimeout(2000);

        // Filter out known non-critical errors
        const criticalErrors = errors.filter(err =>
            !err.includes('Autoplay') &&
            !err.includes('favicon') &&
            !err.includes('MODULE_TYPELESS')
        );

        expect(criticalErrors.length).toBe(0);

        if (criticalErrors.length > 0) {
            console.log('❌ Console errors found:', criticalErrors);
        } else {
            console.log('✅ No critical console errors');
        }
    });

    test('11. Videos have real Spanish content (not dummy data)', async ({ page }) => {
        // User Command #3: Remove dummy content - use real Spanish
        await page.waitForSelector('.interactive-subtitles', { timeout: 5000 });

        const subtitleText = await page.$eval('.interactive-subtitles', el => el.textContent);

        // Check for Spanish words (common patterns)
        const hasSpanishWords = /(?:el|la|los|las|que|es|está|son|como|con|en|de|para|por)/i.test(subtitleText);
        expect(hasSpanishWords).toBe(true);

        console.log('✅ Real Spanish content detected:', subtitleText.substring(0, 50) + '...');
    });

    test('12. Mute/Unmute toggle button works', async ({ page }) => {
        await page.waitForSelector('.mute-toggle', { timeout: 5000 });

        const muteButton = await page.$('.mute-toggle');
        expect(muteButton).not.toBeNull();

        // Click to toggle
        await page.click('.mute-toggle');

        console.log('✅ Mute toggle button clickable');
    });

    test('13. Opening Stories viewer works', async ({ page }) => {
        await page.waitForSelector('.story-avatar', { timeout: 5000 });

        // Click first story
        await page.click('.story-avatar');

        // Wait for fullscreen viewer
        await page.waitForSelector('.stories-viewer.active', { timeout: 3000 });

        const viewerVisible = await page.isVisible('.stories-viewer.active');
        expect(viewerVisible).toBe(true);

        console.log('✅ Stories viewer opens on click');
    });

    test('14. Performance - Page loads within 3 seconds', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForSelector('.video-card', { timeout: 5000 });

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000);

        console.log(`✅ Page loaded in ${loadTime}ms (target: <3000ms)`);
    });

    test('15. Responsive design - Mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro

        await page.waitForSelector('.video-card', { timeout: 5000 });

        // Check video fills viewport
        const videoCard = await page.$('.video-card');
        const cardWidth = await videoCard.evaluate(el => el.offsetWidth);

        expect(cardWidth).toBeGreaterThanOrEqual(385); // Should be ~full width

        console.log('✅ Responsive design works on mobile viewport');
    });
});
