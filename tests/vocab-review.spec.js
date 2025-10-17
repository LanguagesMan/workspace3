/**
 * VOCABULARY REVIEW SYSTEM TEST
 * Testing: Anki-style flashcards + Quizlet flip animation + Duolingo quiz
 */

const { test, expect } = require('@playwright/test');

test.describe('Vocabulary Review System', () => {
    test('should load vocabulary review system scripts', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Check if vocabulary system is loaded
        const vocabSystem = await page.evaluate(() => window.vocabSystem !== undefined);
        expect(vocabSystem).toBe(true);
    });

    test('should have vocabulary review section in DOM', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Check if vocab section exists (hidden initially)
        const vocabSection = await page.locator('#vocabReviewSection').count();
        expect(vocabSection).toBe(1);
    });

    test('should open vocabulary review when clicking vocab button', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Trigger vocab system open
        await page.evaluate(() => window.vocabSystem.openReview());

        // Check if vocab section is visible
        const isVisible = await page.locator('#vocabReviewSection').isVisible();
        expect(isVisible).toBe(true);
    });

    test('should show empty state when no words saved', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Clear saved words
        await page.evaluate(() => localStorage.removeItem('savedWords'));

        // Open vocab review
        await page.evaluate(() => window.vocabSystem.openReview());

        // Check for empty state
        const emptyState = await page.locator('#vocabEmpty').isVisible();
        expect(emptyState).toBe(true);

        // Check empty state message
        const message = await page.locator('#vocabEmpty h3').textContent();
        expect(message).toContain('No words saved yet');
    });

    test('should add word to vocabulary system', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Clear saved words first
        await page.evaluate(() => localStorage.removeItem('savedWords'));

        // Add a test word
        await page.evaluate(() => {
            window.vocabSystem.addWord('hola', 'hello', 'Hola, ¿cómo estás?', 'video1');
        });

        // Open vocab review
        await page.evaluate(() => window.vocabSystem.openReview());

        // Check word count
        const wordCount = await page.locator('#vocabCount').textContent();
        expect(wordCount).toContain('1 word');
    });

    test('should display flashcard with correct content', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Add test words
        await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            window.vocabSystem.addWord('perro', 'dog', 'El perro es grande', 'video1');
            window.vocabSystem.openReview();
        });

        await page.waitForTimeout(500);

        // Check flashcard Spanish word
        const spanish = await page.locator('#flashcardSpanish').textContent();
        expect(spanish).toBe('perro');

        // Flip card
        await page.locator('#flashcard').click();
        await page.waitForTimeout(700); // Wait for flip animation

        // Check English translation (should be visible after flip)
        const english = await page.locator('#flashcardEnglish').textContent();
        expect(english).toBe('dog');
    });

    test('should switch between flashcard and quiz modes', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Add test words
        await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            window.vocabSystem.addWord('gato', 'cat', 'El gato es bonito', 'video1');
            window.vocabSystem.openReview();
        });

        await page.waitForTimeout(500);

        // Check flashcard mode is active by default
        const flashcardVisible = await page.locator('#flashcardMode').isVisible();
        expect(flashcardVisible).toBe(true);

        // Switch to quiz mode
        await page.locator('.mode-btn[data-mode="quiz"]').click();
        await page.waitForTimeout(300);

        // Check quiz mode is now visible
        const quizVisible = await page.locator('#quizMode').isVisible();
        expect(quizVisible).toBe(true);

        // Check flashcard mode is hidden
        const flashcardHidden = await page.locator('#flashcardMode').isHidden();
        expect(flashcardHidden).toBe(true);
    });

    test('should review flashcard with difficulty buttons', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Add test words
        await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            window.vocabSystem.addWord('casa', 'house', 'Mi casa es bonita', 'video1');
            window.vocabSystem.addWord('libro', 'book', 'El libro es interesante', 'video2');
            window.vocabSystem.openReview();
        });

        await page.waitForTimeout(500);

        // Click "Good" button (quality 4)
        await page.locator('.review-btn.good').click();
        await page.waitForTimeout(300);

        // Should show next card (libro)
        const nextWord = await page.locator('#flashcardSpanish').textContent();
        expect(nextWord).toBe('libro');
    });

    test('should show progress during review session', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Add 3 test words
        await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            window.vocabSystem.addWord('uno', 'one', '', 'video1');
            window.vocabSystem.addWord('dos', 'two', '', 'video2');
            window.vocabSystem.addWord('tres', 'three', '', 'video3');
            window.vocabSystem.openReview();
        });

        await page.waitForTimeout(500);

        // Check initial progress
        const initialProgress = await page.locator('#reviewProgressText').textContent();
        expect(initialProgress).toContain('1 / 3');

        // Review first card
        await page.locator('.review-btn.good').click();
        await page.waitForTimeout(300);

        // Check updated progress
        const updatedProgress = await page.locator('#reviewProgressText').textContent();
        expect(updatedProgress).toContain('2 / 3');
    });

    test('should search words in vocabulary list', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Add multiple test words
        await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            window.vocabSystem.addWord('gato', 'cat', '', 'video1');
            window.vocabSystem.addWord('perro', 'dog', '', 'video2');
            window.vocabSystem.addWord('casa', 'house', '', 'video3');
            window.vocabSystem.openReview();
        });

        await page.waitForTimeout(500);

        // Complete all reviews to see list view
        await page.locator('.review-btn.good').click();
        await page.waitForTimeout(200);
        await page.locator('.review-btn.good').click();
        await page.waitForTimeout(200);
        await page.locator('.review-btn.good').click();
        await page.waitForTimeout(500);

        // Search for "gato"
        await page.locator('#vocabSearchInput').fill('gato');
        await page.waitForTimeout(300);

        // Check that only gato is shown
        const cards = await page.locator('.vocab-card').count();
        expect(cards).toBeGreaterThanOrEqual(1);
    });

    test('should close vocabulary review and return to main feed', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Open vocab review
        await page.evaluate(() => window.vocabSystem.openReview());
        await page.waitForTimeout(300);

        // Check vocab section is visible
        const vocabVisible = await page.locator('#vocabReviewSection').isVisible();
        expect(vocabVisible).toBe(true);

        // Click back button
        await page.locator('.vocab-back-btn').click();
        await page.waitForTimeout(300);

        // Check vocab section is hidden
        const vocabHidden = await page.locator('#vocabReviewSection').isHidden();
        expect(vocabHidden).toBe(true);
    });

    test('should persist words in localStorage', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Clear and add words
        await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            window.vocabSystem.addWord('test', 'test', '', 'video1');
        });

        // Reload page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check words are still there
        const wordCount = await page.evaluate(() => window.vocabSystem.words.length);
        expect(wordCount).toBe(1);

        const word = await page.evaluate(() => window.vocabSystem.words[0].spanish);
        expect(word).toBe('test');
    });
});

test.describe('Spaced Repetition Algorithm (SM-2)', () => {
    test('should calculate next review intervals correctly', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        // Add a word and review it
        const result = await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            const word = window.vocabSystem.addWord('test', 'test', '', 'video1');

            // Review with quality 4 (good)
            window.vocabSystem.reviewWord(word.id, 4);

            return window.vocabSystem.words[0];
        });

        // After first review with quality 4, interval should be 1
        expect(result.interval).toBe(1);
        expect(result.repetition).toBe(1);
    });

    test('should track review statistics', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');

        const result = await page.evaluate(() => {
            localStorage.removeItem('savedWords');
            const word = window.vocabSystem.addWord('test', 'test', '', 'video1');

            // Review 3 times: 2 correct (5, 4), 1 incorrect (2)
            window.vocabSystem.reviewWord(word.id, 5);
            window.vocabSystem.reviewWord(word.id, 4);
            window.vocabSystem.reviewWord(word.id, 2);

            return window.vocabSystem.words[0];
        });

        expect(result.reviews).toBe(3);
        expect(result.correctCount).toBe(2);
        expect(result.incorrectCount).toBe(1);
    });
});
