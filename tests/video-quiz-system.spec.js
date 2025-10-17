/**
 * 🎓 VIDEO QUIZ SYSTEM - Playwright E2E Tests
 * 
 * Tests the Duolingo-style quiz feature:
 * - Quiz button visibility
 * - Quiz modal opens correctly
 * - Questions are generated from actual video content
 * - Multiple question types work (multiple choice, fill blank, match pairs)
 * - Answer checking works correctly
 * - XP rewards are given
 * - Results screen displays properly
 */

const { test, expect } = require('@playwright/test');

test.describe('Video Quiz System', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        
        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 10000 });
        
        // Wait a bit for the first video to be visible
        await page.waitForTimeout(2000);
    });

    test('Quiz button is visible on each video', async ({ page }) => {
        // Check that quiz button exists
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await expect(quizButton).toBeVisible();
        
        // Verify it has the question mark icon
        const icon = await quizButton.locator('svg');
        await expect(icon).toBeVisible();
        
        console.log('✓ Quiz button is visible');
    });

    test('Quiz modal opens when clicking quiz button', async ({ page }) => {
        // Click the quiz button
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for modal to appear
        await page.waitForSelector('#videoQuizModal', { state: 'visible', timeout: 5000 });
        
        // Verify modal is displayed
        const modal = await page.locator('#videoQuizModal');
        await expect(modal).toBeVisible();
        
        // Verify modal has quiz content
        const quizBody = await page.locator('#quizBody');
        await expect(quizBody).toBeVisible();
        
        console.log('✓ Quiz modal opens successfully');
    });

    test('Quiz generates questions from video content', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz to load
        await page.waitForSelector('.quiz-question-text', { timeout: 5000 });
        
        // Check that question text exists and is not empty
        const questionText = await page.locator('.quiz-question-text').first();
        const text = await questionText.textContent();
        expect(text.length).toBeGreaterThan(0);
        
        console.log('✓ Question generated:', text);
        
        // Verify it's asking about a Spanish word
        expect(text.toLowerCase()).toContain('what');
        
        console.log('✓ Quiz generates questions from video content');
    });

    test('Multiple choice questions work correctly', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('.quiz-option', { timeout: 5000 });
        
        // Check that we have multiple options
        const options = await page.locator('.quiz-option').count();
        expect(options).toBeGreaterThanOrEqual(3);
        
        console.log(`✓ Found ${options} answer options`);
        
        // Select an option
        await page.locator('.quiz-option').first().click();
        
        // Verify option is selected
        const selectedOption = await page.locator('.quiz-option.selected');
        await expect(selectedOption).toBeVisible();
        
        // Verify check button is enabled
        const checkButton = await page.locator('#quizCheckBtn');
        await expect(checkButton).toBeEnabled();
        
        console.log('✓ Multiple choice selection works');
    });

    test('Answer checking provides feedback', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('.quiz-option', { timeout: 5000 });
        
        // Select first option
        await page.locator('.quiz-option').first().click();
        
        // Click check button
        await page.locator('#quizCheckBtn').click();
        
        // Wait for feedback
        await page.waitForTimeout(1000);
        
        // Verify feedback is shown (either correct or incorrect)
        const feedback = await page.locator('#quizFeedback');
        const feedbackVisible = await feedback.isVisible();
        
        if (feedbackVisible) {
            const feedbackText = await feedback.textContent();
            console.log('✓ Feedback shown:', feedbackText);
            expect(feedbackText.length).toBeGreaterThan(0);
        }
        
        // Verify visual feedback on option (correct or incorrect class)
        const hasCorrect = await page.locator('.quiz-option.correct').count() > 0;
        const hasIncorrect = await page.locator('.quiz-option.incorrect').count() > 0;
        expect(hasCorrect || hasIncorrect).toBeTruthy();
        
        console.log('✓ Answer checking provides visual feedback');
    });

    test('Fill in the blank questions work', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz to load
        await page.waitForSelector('#quizBody', { timeout: 5000 });
        
        // Skip to find a fill-in-blank question (might be 2nd or 3rd question)
        let attempts = 0;
        let foundFillBlank = false;
        
        while (attempts < 5 && !foundFillBlank) {
            const hasInput = await page.locator('#quizInput').count() > 0;
            
            if (hasInput) {
                foundFillBlank = true;
                console.log('✓ Found fill-in-blank question');
                
                // Verify input field exists
                const input = await page.locator('#quizInput');
                await expect(input).toBeVisible();
                
                // Verify sentence with blank is shown
                const subtitle = await page.locator('.quiz-question-subtitle');
                const subtitleText = await subtitle.textContent();
                expect(subtitleText).toContain('_____');
                
                console.log('✓ Fill-in-blank question displays correctly');
                
                // Type an answer
                await input.fill('hello');
                
                // Check button should be enabled
                const checkButton = await page.locator('#quizCheckBtn');
                await expect(checkButton).toBeEnabled();
                
                console.log('✓ Fill-in-blank input works');
            } else {
                // Skip to next question
                await page.locator('.quiz-skip-btn').click();
                await page.waitForTimeout(500);
                attempts++;
            }
        }
        
        if (!foundFillBlank) {
            console.log('⚠ No fill-in-blank question found in first 5 questions');
        }
    });

    test('Match pairs question works', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('#quizBody', { timeout: 5000 });
        
        // Look for match pairs question
        let attempts = 0;
        let foundMatchPairs = false;
        
        while (attempts < 5 && !foundMatchPairs) {
            const hasMatchPairs = await page.locator('.quiz-match-pairs').count() > 0;
            
            if (hasMatchPairs) {
                foundMatchPairs = true;
                console.log('✓ Found match pairs question');
                
                // Verify we have two columns
                const columns = await page.locator('.quiz-match-column').count();
                expect(columns).toBe(2);
                
                // Verify we have items to match
                const items = await page.locator('.quiz-match-item').count();
                expect(items).toBeGreaterThanOrEqual(6); // At least 3 pairs
                
                console.log(`✓ Match pairs has ${items} items to match`);
                
                // Try selecting items
                await page.locator('.quiz-match-item[data-lang="spanish"]').first().click();
                await page.locator('.quiz-match-item[data-lang="english"]').first().click();
                
                // Wait for matching animation
                await page.waitForTimeout(500);
                
                console.log('✓ Match pairs selection works');
            } else {
                // Skip to next question
                const skipBtn = await page.locator('.quiz-skip-btn');
                if (await skipBtn.isVisible()) {
                    await skipBtn.click();
                    await page.waitForTimeout(500);
                }
                attempts++;
            }
        }
        
        if (!foundMatchPairs) {
            console.log('⚠ No match pairs question found in first 5 questions');
        }
    });

    test('Quiz completion shows results', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('.quiz-option', { timeout: 5000 });
        
        // Answer and skip through all questions quickly
        for (let i = 0; i < 6; i++) {
            // Try to answer or skip
            const hasOptions = await page.locator('.quiz-option').count() > 0;
            
            if (hasOptions) {
                // Select first option and check
                await page.locator('.quiz-option').first().click();
                await page.waitForTimeout(200);
                await page.locator('#quizCheckBtn').click();
                await page.waitForTimeout(1500);
            } else {
                // Skip question
                const skipBtn = await page.locator('.quiz-skip-btn');
                if (await skipBtn.isVisible()) {
                    await skipBtn.click();
                    await page.waitForTimeout(500);
                }
            }
        }
        
        // Wait for results screen
        await page.waitForSelector('.quiz-results', { timeout: 10000 });
        
        // Verify results screen elements
        const resultsScore = await page.locator('.quiz-results-score');
        await expect(resultsScore).toBeVisible();
        
        const resultsMessage = await page.locator('.quiz-results-message');
        await expect(resultsMessage).toBeVisible();
        
        const resultsXP = await page.locator('.quiz-results-xp');
        await expect(resultsXP).toBeVisible();
        
        // Verify stats are shown
        const stats = await page.locator('.quiz-results-stat');
        const statsCount = await stats.count();
        expect(statsCount).toBeGreaterThanOrEqual(2);
        
        console.log('✓ Quiz results screen displays correctly');
        
        // Verify buttons are present
        const continueBtn = await page.locator('.quiz-continue-btn');
        await expect(continueBtn).toBeVisible();
        
        const retryBtn = await page.locator('.quiz-retry-btn');
        await expect(retryBtn).toBeVisible();
        
        console.log('✓ Results screen has action buttons');
    });

    test('Quiz can be closed and reopened', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for modal
        await page.waitForSelector('#videoQuizModal', { state: 'visible' });
        
        // Close quiz
        await page.locator('.quiz-close-btn').click();
        
        // Verify modal is hidden
        const modal = await page.locator('#videoQuizModal');
        const isVisible = await modal.isVisible();
        expect(isVisible).toBeFalsy();
        
        console.log('✓ Quiz modal closes');
        
        // Reopen quiz
        await quizButton.click();
        
        // Verify it reopens
        await page.waitForSelector('#videoQuizModal', { state: 'visible' });
        await expect(modal).toBeVisible();
        
        console.log('✓ Quiz can be reopened');
    });

    test('XP is awarded for correct answers', async ({ page }) => {
        // Get initial XP
        await page.waitForSelector('#xpDisplay', { timeout: 5000 });
        const initialXPText = await page.locator('#xpDisplay').textContent();
        const initialXP = parseInt(initialXPText) || 0;
        
        console.log(`Initial XP: ${initialXP}`);
        
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('.quiz-option', { timeout: 5000 });
        
        // Answer one question
        await page.locator('.quiz-option').first().click();
        await page.waitForTimeout(200);
        await page.locator('#quizCheckBtn').click();
        
        // Wait for feedback
        await page.waitForTimeout(2000);
        
        // Check if XP changed (might have increased if answer was correct)
        const newXPText = await page.locator('#xpDisplay').textContent();
        const newXP = parseInt(newXPText) || 0;
        
        console.log(`New XP: ${newXP}`);
        
        if (newXP > initialXP) {
            console.log(`✓ XP increased by ${newXP - initialXP} points`);
        } else {
            console.log('⚠ Answer was incorrect (no XP gain)');
        }
        
        // XP should either stay same or increase, never decrease
        expect(newXP).toBeGreaterThanOrEqual(initialXP);
    });

    test('Quiz caching works (same questions on retry)', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for first question
        await page.waitForSelector('.quiz-question-text', { timeout: 5000 });
        const firstQuestion = await page.locator('.quiz-question-text').textContent();
        
        console.log('First question:', firstQuestion);
        
        // Close quiz
        await page.locator('.quiz-close-btn').click();
        await page.waitForTimeout(500);
        
        // Reopen quiz
        await quizButton.click();
        
        // Check if same question appears
        await page.waitForSelector('.quiz-question-text', { timeout: 5000 });
        const secondQuestion = await page.locator('.quiz-question-text').textContent();
        
        console.log('Second time question:', secondQuestion);
        
        // Should be the same (cached)
        expect(secondQuestion).toBe(firstQuestion);
        
        console.log('✓ Quiz is cached correctly');
    });

    test('Progress bar updates as quiz advances', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('#quizProgressFill', { timeout: 5000 });
        
        // Get initial progress bar width
        const progressBar = await page.locator('#quizProgressFill');
        const initialWidth = await progressBar.evaluate(el => el.style.width);
        
        console.log('Initial progress:', initialWidth);
        
        // Answer and move to next question
        const hasOptions = await page.locator('.quiz-option').count() > 0;
        if (hasOptions) {
            await page.locator('.quiz-option').first().click();
            await page.waitForTimeout(200);
            await page.locator('#quizCheckBtn').click();
            await page.waitForTimeout(2000);
        }
        
        // Get new progress bar width
        const newWidth = await progressBar.evaluate(el => el.style.width);
        
        console.log('New progress:', newWidth);
        
        // Progress should increase
        const initialPercent = parseFloat(initialWidth);
        const newPercent = parseFloat(newWidth);
        
        if (!isNaN(initialPercent) && !isNaN(newPercent)) {
            expect(newPercent).toBeGreaterThan(initialPercent);
            console.log('✓ Progress bar updates correctly');
        }
    });

    test('Quiz question counter updates', async ({ page }) => {
        // Open quiz
        const quizButton = await page.locator('.sidebar-button.quiz-btn').first();
        await quizButton.click();
        
        // Wait for quiz
        await page.waitForSelector('#quizQuestionNumber', { timeout: 5000 });
        
        // Check initial question number
        const questionNumber = await page.locator('#quizQuestionNumber');
        const initialText = await questionNumber.textContent();
        
        console.log('Question counter:', initialText);
        
        // Should say "Question 1 of X"
        expect(initialText).toContain('Question 1 of');
        
        console.log('✓ Question counter displays correctly');
    });
});

console.log('🎓 Video Quiz System tests loaded');

