const { test, expect } = require('@playwright/test');

test.describe('Quiz Cards Feature', () => {
    test('should display quiz cards in feed', async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for feed to load

        // Scroll down to find quiz cards
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 800);
            await page.waitForTimeout(500);
        }

        // Look for quiz card
        const quizCard = await page.locator('.type-quiz').first();
        await expect(quizCard).toBeVisible();

        // Take screenshot of quiz card
        await quizCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({
            path: 'tests/screenshots/quiz-card-initial.png',
            fullPage: false
        });
        console.log('✓ Screenshot saved: quiz-card-initial.png');
    });

    test('should handle correct quiz answer', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Scroll to find quiz card
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 800);
            await page.waitForTimeout(500);
        }

        // Find first quiz card
        const quizCard = await page.locator('.quiz-container').first();
        await quizCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Click first option (might be correct or incorrect)
        const firstOption = await quizCard.locator('.quiz-option').first();
        await firstOption.click();
        await page.waitForTimeout(1000);

        // Verify feedback appears
        const feedback = await quizCard.locator('.quiz-feedback');
        await expect(feedback).toBeVisible();

        // Take screenshot of answered quiz
        await page.screenshot({
            path: 'tests/screenshots/quiz-card-answered.png',
            fullPage: false
        });
        console.log('✓ Screenshot saved: quiz-card-answered.png');

        // Verify XP reward is shown
        const xpReward = await feedback.locator('.quiz-xp-reward');
        await expect(xpReward).toBeVisible();
    });

    test('should show correct and incorrect states', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Scroll to find quiz card
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 800);
            await page.waitForTimeout(500);
        }

        // Find quiz card
        const quizCard = await page.locator('.quiz-container').first();
        await quizCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Click an option
        const option = await quizCard.locator('.quiz-option').nth(1);
        await option.click();
        await page.waitForTimeout(1000);

        // Verify option has correct or incorrect class
        const hasCorrect = await option.evaluate(el => el.classList.contains('correct'));
        const hasIncorrect = await option.evaluate(el => el.classList.contains('incorrect'));
        expect(hasCorrect || hasIncorrect).toBeTruthy();

        // Take screenshot
        await page.screenshot({
            path: 'tests/screenshots/quiz-card-feedback.png',
            fullPage: false
        });
        console.log('✓ Screenshot saved: quiz-card-feedback.png');
    });

    test('should disable options after answering', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Scroll to find quiz card
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 800);
            await page.waitForTimeout(500);
        }

        // Find quiz card
        const quizCard = await page.locator('.quiz-container').first();
        await quizCard.scrollIntoViewIfNeeded();

        // Click first option
        const firstOption = await quizCard.locator('.quiz-option').first();
        await firstOption.click();
        await page.waitForTimeout(1000);

        // Verify all options are disabled
        const allOptions = await quizCard.locator('.quiz-option').all();
        for (const option of allOptions) {
            const isDisabled = await option.evaluate(el => el.disabled);
            expect(isDisabled).toBeTruthy();
        }
    });

    test('should award XP for quiz answers', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Get initial XP
        const initialXP = await page.locator('#xpPoints').textContent();
        console.log('Initial XP:', initialXP);

        // Scroll to find quiz card
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 800);
            await page.waitForTimeout(500);
        }

        // Find and answer quiz
        const quizCard = await page.locator('.quiz-container').first();
        await quizCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const option = await quizCard.locator('.quiz-option').first();
        await option.click();
        await page.waitForTimeout(2000);

        // Verify XP increased
        const finalXP = await page.locator('#xpPoints').textContent();
        console.log('Final XP:', finalXP);

        // XP should have increased
        expect(parseInt(finalXP)).toBeGreaterThan(parseInt(initialXP));
    });
});
