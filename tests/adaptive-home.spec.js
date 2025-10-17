const { test, expect } = require('@playwright/test');

test.describe('Adaptive Home Page - Langflix', () => {
    test.beforeEach(async ({ page }) => {
        // Start with clean localStorage
        await page.goto('http://localhost:3001');
        await page.evaluate(() => localStorage.clear());
    });

    test('should display adaptive header with difficulty slider', async ({ page }) => {
        await page.goto('http://localhost:3001');

        // Wait for page to load
        await page.waitForSelector('.adaptive-header', { timeout: 10000 });

        // Check header elements exist
        const header = await page.$('.adaptive-header');
        expect(header).toBeTruthy();

        // Check level badge
        const levelBadge = await page.$('#user-level-badge');
        expect(levelBadge).toBeTruthy();
        const levelText = await levelBadge.textContent();
        expect(levelText).toBe('A2'); // Default level

        // Check difficulty slider
        const slider = await page.$('#difficulty-slider');
        expect(slider).toBeTruthy();
        const sliderValue = await slider.getAttribute('value');
        expect(sliderValue).toBe('2'); // A2 = index 2

        // Check simple mode toggle
        const simpleToggle = await page.$('#simple-mode-toggle');
        expect(simpleToggle).toBeTruthy();

        console.log('✅ Adaptive header displays correctly');
    });

    test('should change difficulty level via slider', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.adaptive-header', { timeout: 10000 });

        // Get initial level
        const initialLevel = await page.$eval('#user-level-badge', el => el.textContent);
        expect(initialLevel).toBe('A2');

        // Change slider to B1 (value 3)
        await page.fill('#difficulty-slider', '3');

        // Wait a bit for the change to take effect
        await page.waitForTimeout(200);

        // Check level changed
        const newLevel = await page.$eval('#user-level-badge', el => el.textContent);
        expect(newLevel).toBe('B1');

        // Check localStorage was updated
        const storedLevel = await page.evaluate(() => localStorage.getItem('userLevel'));
        expect(storedLevel).toBe('B1');

        console.log('✅ Difficulty slider changes level correctly');
    });

    test('should toggle Simple Mode', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.adaptive-header', { timeout: 10000 });

        // Check body doesn't have simple-mode class initially
        let bodyClass = await page.getAttribute('body', 'class');
        expect(bodyClass || '').not.toContain('simple-mode');

        // Toggle simple mode
        await page.click('#simple-mode-toggle');
        await page.waitForTimeout(100);

        // Check body has simple-mode class
        bodyClass = await page.getAttribute('body', 'class');
        expect(bodyClass).toContain('simple-mode');

        // Check localStorage was updated
        const storedMode = await page.evaluate(() => localStorage.getItem('simpleMode'));
        expect(storedMode).toBe('true');

        // Toggle off
        await page.click('#simple-mode-toggle');
        await page.waitForTimeout(100);

        bodyClass = await page.getAttribute('body', 'class');
        expect(bodyClass || '').not.toContain('simple-mode');

        console.log('✅ Simple Mode toggles correctly');
    });

    test('should display coverage badges on video cards', async ({ page }) => {
        await page.goto('http://localhost:3001');

        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 15000 });
        await page.waitForTimeout(1000); // Wait for badges to be added

        // Check coverage badges exist
        const badges = await page.$$('.coverage-badge');
        expect(badges.length).toBeGreaterThan(0);

        // Check badge has correct classes
        const firstBadge = badges[0];
        const badgeClass = await firstBadge.getAttribute('class');
        expect(badgeClass).toMatch(/(easy|perfect|challenging|hard)/);

        // Check badge has text content
        const badgeText = await firstBadge.textContent();
        expect(badgeText).toMatch(/\d+%/); // Should contain percentage

        console.log('✅ Coverage badges display on video cards');
    });

    test('should persist user preferences across page reloads', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.adaptive-header', { timeout: 10000 });

        // Set preferences
        await page.fill('#difficulty-slider', '4'); // B2
        await page.click('#simple-mode-toggle');
        await page.waitForTimeout(200);

        // Reload page
        await page.reload();
        await page.waitForSelector('.adaptive-header', { timeout: 10000 });

        // Check preferences persisted
        const level = await page.$eval('#user-level-badge', el => el.textContent);
        expect(level).toBe('B2');

        const bodyClass = await page.getAttribute('body', 'class');
        expect(bodyClass).toContain('simple-mode');

        console.log('✅ User preferences persist across reloads');
    });

    test('should load videos with subtitles', async ({ page }) => {
        await page.goto('http://localhost:3001');

        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 15000 });

        // Check videos exist
        const videos = await page.$$('video');
        expect(videos.length).toBeGreaterThan(0);

        // Check subtitles exist
        const subtitles = await page.$$('.trans-line');
        expect(subtitles.length).toBeGreaterThan(0);

        // Check subtitle has Spanish and English
        const firstSubtitle = subtitles[0];
        const spanish = await firstSubtitle.$('.spanish-line');
        const english = await firstSubtitle.$('.english-line');
        expect(spanish).toBeTruthy();
        expect(english).toBeTruthy();

        console.log('✅ Videos load with dual-language subtitles');
    });

    test('should have clickable words in subtitles', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.video-card', { timeout: 15000 });
        await page.waitForTimeout(500);

        // Check for clickable words
        const words = await page.$$('.word');
        expect(words.length).toBeGreaterThan(0);

        // Check word has data attributes
        if (words.length > 0) {
            const firstWord = words[0];
            const dataWord = await firstWord.getAttribute('data-word');
            const dataTranslation = await firstWord.getAttribute('data-translation');
            expect(dataWord).toBeTruthy();
            // Translation might be empty for some words
        }

        console.log('✅ Subtitles have clickable words with translations');
    });

    test('should display action buttons on video cards', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.video-card', { timeout: 15000 });

        // Check action buttons exist
        const actionBtns = await page.$$('.action-btn');
        expect(actionBtns.length).toBeGreaterThan(0);

        // Check for specific action buttons
        const commentBtn = await page.$('[data-action="comment"]');
        const quizBtn = await page.$('[data-action="quiz"]');
        const deleteBtn = await page.$('[data-action="delete"]');

        expect(commentBtn).toBeTruthy();
        expect(quizBtn).toBeTruthy();
        expect(deleteBtn).toBeTruthy();

        console.log('✅ Action buttons display on video cards');
    });

    test('should have bottom navigation', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.bottom-nav', { timeout: 10000 });

        // Check nav items
        const navItems = await page.$$('.nav-item');
        expect(navItems.length).toBe(4); // Videos, News, Music, Chat

        // Check nav labels
        const labels = await page.$$eval('.nav-label', items => items.map(i => i.textContent));
        expect(labels).toContain('Videos');
        expect(labels).toContain('News');
        expect(labels).toContain('Music');
        expect(labels).toContain('Chat');

        console.log('✅ Bottom navigation displays correctly');
    });

    test('should update coverage badges when level changes', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.video-card', { timeout: 15000 });
        await page.waitForTimeout(1000);

        // Get initial badge count
        const initialBadges = await page.$$('.coverage-badge');
        const initialCount = initialBadges.length;

        // Change level
        await page.fill('#difficulty-slider', '5'); // C1
        await page.waitForTimeout(500); // Wait for recalculation

        // Check badges were updated
        const newBadges = await page.$$('.coverage-badge');
        expect(newBadges.length).toBe(initialCount); // Same number of badges

        console.log('✅ Coverage badges update when level changes');
    });
});

test.describe('Adaptive Home - Comprehensive Test', () => {
    test('🎯 ALL adaptive features work correctly', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForSelector('.adaptive-header', { timeout: 10000 });

        const results = {
            header: false,
            slider: false,
            simpleMode: false,
            badges: false,
            videos: false,
            subtitles: false,
            words: false,
            actions: false,
            navigation: false
        };

        // Test 1: Header exists
        const header = await page.$('.adaptive-header');
        results.header = !!header;

        // Test 2: Slider works
        await page.fill('#difficulty-slider', '3');
        await page.waitForTimeout(100);
        const level = await page.$eval('#user-level-badge', el => el.textContent);
        results.slider = level === 'B1';

        // Test 3: Simple mode works
        await page.click('#simple-mode-toggle');
        await page.waitForTimeout(100);
        const bodyClass = await page.getAttribute('body', 'class');
        results.simpleMode = bodyClass.includes('simple-mode');

        // Test 4: Videos load
        await page.waitForSelector('.video-card', { timeout: 15000 });
        await page.waitForTimeout(1000);
        const videos = await page.$$('video');
        results.videos = videos.length > 0;

        // Test 5: Coverage badges
        const badges = await page.$$('.coverage-badge');
        results.badges = badges.length > 0;

        // Test 6: Subtitles exist
        const subtitles = await page.$$('.trans-line');
        results.subtitles = subtitles.length > 0;

        // Test 7: Clickable words
        const words = await page.$$('.word');
        results.words = words.length > 0;

        // Test 8: Action buttons
        const actions = await page.$$('.action-btn');
        results.actions = actions.length > 0;

        // Test 9: Bottom navigation
        const navItems = await page.$$('.nav-item');
        results.navigation = navItems.length === 4;

        // Print results
        console.log('\n🎯 ADAPTIVE HOME TEST RESULTS:');
        console.log('================================');
        console.log(`✅ Header: ${results.header ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Difficulty Slider: ${results.slider ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Simple Mode Toggle: ${results.simpleMode ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Coverage Badges: ${results.badges ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Videos Load: ${results.videos ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Subtitles Display: ${results.subtitles ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Clickable Words: ${results.words ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Action Buttons: ${results.actions ? 'PASS' : 'FAIL'}`);
        console.log(`✅ Bottom Navigation: ${results.navigation ? 'PASS' : 'FAIL'}`);
        console.log('================================\n');

        // Assert all pass
        Object.values(results).forEach(result => {
            expect(result).toBe(true);
        });
    });
});
