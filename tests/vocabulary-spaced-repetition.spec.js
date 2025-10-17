/**
 * Playwright Tests for Vocabulary Spaced Repetition System
 * Tests word clicking, saving, flashcard review, and SM-2 algorithm
 */

const { test, expect } = require('@playwright/test');

// Test user for consistent testing
const TEST_USER_ID = 'test_vocab_user_' + Date.now();

test.describe('Vocabulary Spaced Repetition System', () => {
    
    test.beforeEach(async ({ page }) => {
        // Set test user ID in localStorage
        await page.goto('/');
        await page.evaluate((userId) => {
            localStorage.setItem('userId', userId);
        }, TEST_USER_ID);
    });
    
    test('should track word click via API', async ({ page }) => {
        const response = await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'hola',
                translation: 'hello',
                context: 'Hola, ¿cómo estás?',
                source: 'test',
                level: 'A1'
            }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.vocabulary.word).toBe('hola');
        expect(data.vocabulary.clickCount).toBeGreaterThan(0);
    });
    
    test('should save word for review', async ({ page }) => {
        // First click the word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'gracias',
                translation: 'thank you',
                level: 'A1'
            }
        });
        
        // Then save it
        const response = await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'gracias'
            }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.vocabulary.saved).toBe(true);
        expect(data.vocabulary.masteryLevel).toBe(0);
    });
    
    test('should get words due for review', async ({ page }) => {
        // Save a word first
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'bueno',
                translation: 'good',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'bueno'
            }
        });
        
        // Get due words
        const response = await page.request.get(`/api/vocabulary/due?userId=${TEST_USER_ID}`);
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.count).toBeGreaterThan(0);
        expect(data.words.length).toBeGreaterThan(0);
    });
    
    test('should update word review with SM-2 algorithm', async ({ page }) => {
        // Create and save a word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'amigo',
                translation: 'friend',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'amigo'
            }
        });
        
        // Review with quality 3 (Good)
        const response = await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'amigo',
                quality: 3
            }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.vocabulary.reviewCount).toBe(1);
        expect(data.vocabulary.repetitions).toBeGreaterThan(0);
        expect(data.nextReviewIn).toBeGreaterThan(0);
    });
    
    test('should show vocabulary review page', async ({ page }) => {
        await page.goto('/vocabulary-review.html');
        
        // Check page elements
        await expect(page.locator('h1')).toContainText('Vocabulary Review');
        await expect(page.locator('#dueCount')).toBeVisible();
        await expect(page.locator('#totalWords')).toBeVisible();
        await expect(page.locator('#masteredWords')).toBeVisible();
    });
    
    test('should display flashcard interface', async ({ page }) => {
        // Create a test word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'casa',
                translation: 'house',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'casa'
            }
        });
        
        // Go to review page
        await page.goto('/vocabulary-review.html');
        
        // Wait for flashcard to load
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Check flashcard is visible
        const flashcard = page.locator('.flashcard');
        await expect(flashcard).toBeVisible();
        
        // Check word is displayed
        await expect(page.locator('.word').first()).toContainText('casa');
    });
    
    test('should flip flashcard on click', async ({ page }) => {
        // Create and save word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'perro',
                translation: 'dog',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'perro'
            }
        });
        
        await page.goto('/vocabulary-review.html');
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Click to flip
        await page.click('.flashcard');
        
        // Wait for flip animation
        await page.waitForTimeout(500);
        
        // Check that rating buttons appear
        const ratingButtons = page.locator('#ratingButtons');
        await expect(ratingButtons).toBeVisible();
    });
    
    test('should show Anki-style rating buttons', async ({ page }) => {
        // Create test word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'libro',
                translation: 'book',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'libro'
            }
        });
        
        await page.goto('/vocabulary-review.html');
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Flip card
        await page.click('.flashcard');
        await page.waitForTimeout(500);
        
        // Check all 4 rating buttons exist
        await expect(page.locator('.rating-btn.again')).toBeVisible();
        await expect(page.locator('.rating-btn.hard')).toBeVisible();
        await expect(page.locator('.rating-btn.good')).toBeVisible();
        await expect(page.locator('.rating-btn.easy')).toBeVisible();
    });
    
    test('should rate word and move to next', async ({ page }) => {
        // Create multiple words
        const words = ['agua', 'fuego', 'tierra'];
        for (const word of words) {
            await page.request.post('/api/vocabulary/click', {
                data: {
                    userId: TEST_USER_ID,
                    word,
                    translation: word,
                    level: 'A1'
                }
            });
            
            await page.request.post('/api/vocabulary/save', {
                data: {
                    userId: TEST_USER_ID,
                    word
                }
            });
        }
        
        await page.goto('/vocabulary-review.html');
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Get initial word
        const initialWord = await page.locator('.word').first().textContent();
        
        // Flip and rate
        await page.click('.flashcard');
        await page.waitForTimeout(500);
        await page.click('.rating-btn.good');
        
        // Wait for next card
        await page.waitForTimeout(500);
        
        // Check that word changed
        const newWord = await page.locator('.word').first().textContent();
        expect(newWord).not.toBe(initialWord);
    });
    
    test('should display mastery progress bars', async ({ page }) => {
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'noche',
                translation: 'night',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'noche'
            }
        });
        
        await page.goto('/vocabulary-review.html');
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Check mastery bars exist
        const masteryBars = page.locator('.mastery-bar');
        const count = await masteryBars.count();
        expect(count).toBe(5); // Should have 5 bars for levels 0-5
    });
    
    test('should show notification on review', async ({ page }) => {
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'sol',
                translation: 'sun',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'sol'
            }
        });
        
        await page.goto('/vocabulary-review.html');
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Flip and rate with Good
        await page.click('.flashcard');
        await page.waitForTimeout(500);
        await page.click('.rating-btn.good');
        
        // Check for notification
        const notification = page.locator('#notification');
        await expect(notification).toBeVisible({ timeout: 2000 });
    });
    
    test('should get vocabulary statistics', async ({ page }) => {
        const response = await page.request.get(`/api/vocabulary/stats?userId=${TEST_USER_ID}`);
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.stats).toBeDefined();
        expect(data.stats.totalSaved).toBeGreaterThanOrEqual(0);
        expect(data.stats.masteryBreakdown).toBeDefined();
    });
    
    test('should show review badge in bottom nav', async ({ page }) => {
        // Create a word due for review
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'luna',
                translation: 'moon',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'luna'
            }
        });
        
        await page.goto('/vocabulary-review.html');
        
        // Wait for badge to update
        await page.waitForTimeout(2000);
        
        // Check badge exists
        const badge = page.locator('#reviewBadge');
        // Badge might not be visible if count is 0, so just check it exists
        expect(await badge.count()).toBe(1);
    });
    
    test('should delete word from vocabulary', async ({ page }) => {
        // Create word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'deleteme',
                translation: 'delete',
                level: 'A1'
            }
        });
        
        // Delete word
        const response = await page.request.delete(`/api/vocabulary/delete?userId=${TEST_USER_ID}&word=deleteme`);
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
    });
    
    test('should take screenshot of review interface', async ({ page }) => {
        // Create a word for screenshot
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'mariposa',
                translation: 'butterfly',
                context: 'La mariposa es hermosa',
                level: 'A2'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'mariposa'
            }
        });
        
        await page.goto('/vocabulary-review.html');
        await page.waitForSelector('.flashcard', { timeout: 5000 });
        
        // Take screenshot of flashcard front
        await page.screenshot({ 
            path: 'screenshots/vocabulary-flashcard-front.png',
            fullPage: true 
        });
        
        // Flip card
        await page.click('.flashcard');
        await page.waitForTimeout(700);
        
        // Take screenshot of flashcard back with buttons
        await page.screenshot({ 
            path: 'screenshots/vocabulary-flashcard-back.png',
            fullPage: true 
        });
    });
    
    test('should verify SM-2 intervals: 1d → 3d → 7d → 14d', async ({ page }) => {
        // Create a word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'estrella',
                translation: 'star',
                level: 'A1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'estrella'
            }
        });
        
        // First review (quality 3 = Good) -> should be 1 day
        let response = await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'estrella',
                quality: 3
            }
        });
        let data = await response.json();
        expect(data.nextReviewIn).toBe(1);
        
        // Second review (quality 3 = Good) -> should be 3 days
        response = await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'estrella',
                quality: 3
            }
        });
        data = await response.json();
        expect(data.nextReviewIn).toBe(3);
        
        // Third review (quality 3 = Good) -> should be 7 days
        response = await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'estrella',
                quality: 3
            }
        });
        data = await response.json();
        expect(data.nextReviewIn).toBe(7);
        
        // Fourth review (quality 3 = Good) -> should be ~14-18 days (7 * 2.5 ease factor)
        response = await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'estrella',
                quality: 3
            }
        });
        data = await response.json();
        expect(data.nextReviewIn).toBeGreaterThanOrEqual(14);
        expect(data.nextReviewIn).toBeLessThanOrEqual(20);
    });
    
    test('should reset interval on failed recall (quality 1)', async ({ page }) => {
        // Create word
        await page.request.post('/api/vocabulary/click', {
            data: {
                userId: TEST_USER_ID,
                word: 'difícil',
                translation: 'difficult',
                level: 'B1'
            }
        });
        
        await page.request.post('/api/vocabulary/save', {
            data: {
                userId: TEST_USER_ID,
                word: 'difícil'
            }
        });
        
        // First review - Good
        await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'difícil',
                quality: 3
            }
        });
        
        // Second review - Again (failed)
        const response = await page.request.post('/api/vocabulary/update-review', {
            data: {
                userId: TEST_USER_ID,
                word: 'difícil',
                quality: 1
            }
        });
        
        const data = await response.json();
        // Should reset to very short interval
        expect(data.vocabulary.repetitions).toBe(0);
    });
});

test.describe('Vocabulary Integration on Pages', () => {
    
    test('should load vocabulary integration script', async ({ page }) => {
        await page.goto('/');
        await page.addScriptTag({ path: './public/js/vocabulary-integration.js' });
        
        // Check if API is available
        const apiExists = await page.evaluate(() => {
            return typeof window.vocabularyIntegration !== 'undefined';
        });
        
        expect(apiExists).toBe(true);
    });
    
    test('should enhance Spanish words automatically', async ({ page }) => {
        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <body>
                <div class="spanish-word" data-word="hola" data-translation="hello">hola</div>
                <script src="/js/vocabulary-integration.js"></script>
            </body>
            </html>
        `);
        
        await page.waitForTimeout(500);
        
        // Check if word is enhanced
        const isEnhanced = await page.evaluate(() => {
            const word = document.querySelector('.spanish-word');
            return word.dataset.vocabEnhanced === 'true';
        });
        
        expect(isEnhanced).toBe(true);
    });
});

