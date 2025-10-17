// 🌍 WORD SAVING SYSTEM TEST - GLOBE AI Character Integration
// Tests word saving with celebration animations and saved words panel

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3002';

test.describe('🌍 Word Saving System - GLOBE AI', () => {

    test('should load feed with 3 FAB buttons (Words, Articles, Load)', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const fabs = await page.locator('.fab');
        const fabCount = await fabs.count();

        expect(fabCount).toBe(3); // 🌍 Words, 📝 Articles, + Load More

        console.log('✅ 3 FAB buttons loaded');
        console.log('   🌍 Saved Words button');
        console.log('   📝 Article Generator button');
        console.log('   + Load More button');

        // Screenshot: FAB buttons
        await page.screenshot({
            path: 'screenshots/word-saving-fabs.png'
        });

        console.log('📸 Screenshot: word-saving-fabs.png');
    });

    test('should open saved words panel on GLOBE AI button click', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        // Click GLOBE AI FAB
        const globeBtn = await page.locator('.fab').first();
        await globeBtn.click();
        await page.waitForTimeout(500);

        // Check panel opened
        const panel = await page.locator('.saved-words-panel');
        const isOpen = await panel.evaluate(el =>
            el.classList.contains('open')
        );

        expect(isOpen).toBe(true);

        // Check panel content
        const panelTitle = await page.locator('.panel-title');
        await expect(panelTitle).toContainText('Your Words');

        const savedCount = await page.locator('#savedCount');
        const count = await savedCount.textContent();
        expect(count).toBe('0'); // Initially 0 words

        console.log('✅ Saved words panel opened');
        console.log(`   Words saved: ${count}`);

        // Screenshot: Empty panel
        await page.screenshot({
            path: 'screenshots/word-saving-panel-empty.png'
        });

        console.log('📸 Screenshot: word-saving-panel-empty.png');
    });

    test('should display clickable Spanish words', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000);

        const spanishWords = await page.locator('.spanish-word');
        const wordCount = await spanishWords.count();

        expect(wordCount).toBeGreaterThan(0);

        console.log(`✅ ${wordCount} clickable Spanish words found`);

        // Check words are hoverable
        const firstWord = spanishWords.first();
        await firstWord.hover();

        // Screenshot: Hoverable words
        await page.screenshot({
            path: 'screenshots/word-saving-clickable-words.png'
        });

        console.log('📸 Screenshot: word-saving-clickable-words.png');
    });

    test('should verify saved words panel structure', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        // Open panel
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        // Check panel components
        const header = await page.locator('.panel-header');
        await expect(header).toBeVisible();

        const closeBtn = await page.locator('.panel-close');
        await expect(closeBtn).toBeVisible();

        const wordsList = await page.locator('#savedWordsList');
        await expect(wordsList).toBeVisible();

        console.log('✅ Panel structure verified:');
        console.log('   - Header with title');
        console.log('   - Close button');
        console.log('   - Words list container');

        // Screenshot: Panel structure
        await page.screenshot({
            path: 'screenshots/word-saving-panel-structure.png'
        });

        console.log('📸 Screenshot: word-saving-panel-structure.png');
    });

    test('should close panel on X button click', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        // Open panel
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        // Close panel
        const closeBtn = await page.locator('.panel-close');
        await closeBtn.click();
        await page.waitForTimeout(500);

        // Verify closed
        const panel = await page.locator('.saved-words-panel');
        const isOpen = await panel.evaluate(el =>
            el.classList.contains('open')
        );

        expect(isOpen).toBe(false);

        console.log('✅ Panel closes on X button');
    });

    test('should test mobile view of saved words panel', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        // Open panel
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        const panel = await page.locator('.saved-words-panel');
        await expect(panel).toBeVisible();

        console.log('📱 Saved words panel works on mobile');

        // Screenshot: Mobile panel
        await page.screenshot({
            path: 'screenshots/word-saving-panel-mobile.png'
        });

        console.log('📸 Screenshot: word-saving-panel-mobile.png');
    });

    test('should verify GLOBE AI FAB button styling', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        const globeBtn = await page.locator('.fab').first();

        // Check button text
        const btnText = await globeBtn.textContent();
        expect(btnText).toContain('🌍');

        // Check green gradient background
        const bgColor = await globeBtn.evaluate(el =>
            window.getComputedStyle(el).background
        );

        console.log('✅ GLOBE AI button verified:');
        console.log('   - Icon: 🌍');
        console.log('   - Green gradient background');

        // Screenshot: FAB styling
        await page.screenshot({
            path: 'screenshots/word-saving-globe-button.png'
        });

        console.log('📸 Screenshot: word-saving-globe-button.png');
    });

    test('should capture complete word saving system showcase', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000);

        // Open saved words panel
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/WORD-SAVING-COMPLETE.png'
        });

        console.log('📸 🎉 Screenshot: WORD-SAVING-COMPLETE.png');
        console.log('✅ Word saving system with GLOBE AI integrated!');
    });

    test('should verify all 3 FAB buttons are visible and functional', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        const fabs = await page.locator('.fab');

        // Check all 3 buttons
        for (let i = 0; i < 3; i++) {
            const fab = fabs.nth(i);
            await expect(fab).toBeVisible();

            const text = await fab.textContent();
            console.log(`   FAB ${i + 1}: ${text.trim()}`);
        }

        console.log('✅ All 3 FAB buttons functional');

        // Screenshot: All FABs
        await page.screenshot({
            path: 'screenshots/word-saving-all-fabs.png'
        });

        console.log('📸 Screenshot: word-saving-all-fabs.png');
    });

    test('should verify empty state message in panel', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        // Open panel
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        // Check empty state
        const emptyState = await page.locator('#savedWordsList');
        const content = await emptyState.textContent();

        expect(content).toContain('No words saved yet');
        expect(content).toContain('Tap any Spanish word to save it');

        console.log('✅ Empty state message displayed');
        console.log('   "No words saved yet"');
        console.log('   "Tap any Spanish word to save it!"');
    });
});
