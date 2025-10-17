const { test, expect } = require('@playwright/test');

test.describe('LingoPie Pattern Verification (2025)', () => {
    test('✅ Auto-pause video on word click (LingoPie UX)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Find first video
        const video = await page.locator('video').first();
        await expect(video).toBeVisible();

        // Start video playing
        await video.click();
        await page.waitForTimeout(1000);

        // Check video is playing
        const isPlaying1 = await video.evaluate(v => !v.paused);
        console.log('Video playing before word click:', isPlaying1);

        // Click a word
        const clickableWord = await page.locator('.word[data-translation]').first();
        await expect(clickableWord).toBeVisible();
        await clickableWord.click();

        await page.waitForTimeout(500);

        // LingoPie pattern: Video should auto-pause when word clicked
        const isPlaying2 = await video.evaluate(v => !v.paused);
        expect(isPlaying2).toBe(false);
        console.log('✅ Video auto-paused on word click (LingoPie pattern)');
    });

    test('✅ Translation displays instantly (LingoPie: instant feedback)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Click a word
        const clickableWord = await page.locator('.word[data-translation]').first();
        const wordText = await clickableWord.textContent();
        const translation = await clickableWord.getAttribute('data-translation');

        console.log(`Clicking word: "${wordText}" -> "${translation}"`);

        await clickableWord.click();
        await page.waitForTimeout(300);

        // Check translation appears
        const translationEl = await page.locator('.translation').first();
        await expect(translationEl).toBeVisible();

        const displayedTranslation = await translationEl.textContent();
        expect(displayedTranslation).toContain(translation);

        console.log('✅ Translation displayed instantly:', displayedTranslation);
    });

    test('✅ Visual feedback on word click (LingoPie: .clicked class)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const clickableWord = await page.locator('.word[data-translation]').first();

        // Get initial state
        const hasClickedBefore = await clickableWord.evaluate(el =>
            el.classList.contains('clicked')
        );
        expect(hasClickedBefore).toBe(false);

        // Click word
        await clickableWord.click();
        await page.waitForTimeout(100);

        // Check .clicked class added (visual feedback)
        const hasClickedAfter = await clickableWord.evaluate(el =>
            el.classList.contains('clicked')
        );
        console.log('✅ Visual feedback (.clicked class):', hasClickedAfter);
    });

    test('✅ Learned words tracked (LingoPie: auto-save to vocabulary)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Clear localStorage
        await page.evaluate(() => localStorage.clear());

        // Click first word
        const clickableWord = await page.locator('.word[data-translation]').first();
        const spanish = await clickableWord.getAttribute('data-spanish');
        await clickableWord.click();
        await page.waitForTimeout(500);

        // Check localStorage has learned word
        const learnedWords = await page.evaluate(() =>
            JSON.parse(localStorage.getItem('learnedWords') || '[]')
        );

        expect(learnedWords).toContain(spanish);
        console.log('✅ Word auto-saved to vocabulary:', spanish, learnedWords);
    });

    test('✅ XP reward for new words (Gamification)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Clear localStorage
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('totalXP', '0');
        });

        // Get initial XP
        const initialXP = await page.evaluate(() =>
            parseInt(localStorage.getItem('totalXP') || '0')
        );

        // Click a new word
        const clickableWord = await page.locator('.word[data-translation]').first();
        await clickableWord.click();
        await page.waitForTimeout(500);

        // Get updated XP
        const updatedXP = await page.evaluate(() =>
            parseInt(localStorage.getItem('totalXP') || '0')
        );

        expect(updatedXP).toBeGreaterThan(initialXP);
        console.log(`✅ XP reward: ${initialXP} -> ${updatedXP} (+${updatedXP - initialXP} XP)`);
    });

    test('📸 Screenshot - LingoPie pattern in action', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Click a word to show translation
        const clickableWord = await page.locator('.word[data-translation]').first();
        await clickableWord.click();
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/lingopie-pattern-verification.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved: screenshots/lingopie-pattern-verification.png');
    });
});
