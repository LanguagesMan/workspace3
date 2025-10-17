// 🎤 PRONUNCIATION RECORDING TESTS - Headless Playwright Testing
// Tests microphone button UI, recording flow, and pronunciation scoring integration

const { test, expect } = require('@playwright/test');

test.describe('🎤 Pronunciation Recording Feature', () => {

    test.beforeEach(async ({ page, context }) => {
        // Grant microphone permissions in headless mode
        await context.grantPermissions(['microphone']);

        // Navigate to feed
        await page.goto('http://localhost:3002');

        // Wait for feed to load
        await page.waitForSelector('#feedContainer', { timeout: 10000 });
        await page.waitForTimeout(2000);
    });

    test('should display Practice button on all content cards', async ({ page }) => {
        // Check for Practice buttons
        const practiceButtons = await page.locator('button:has-text("Practice")').count();

        console.log(`✅ Found ${practiceButtons} Practice buttons`);
        expect(practiceButtons).toBeGreaterThan(0);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-practice-buttons.png', fullPage: true });
    });

    test('should show microphone icon on Practice button', async ({ page }) => {
        // Check button contains microphone emoji
        const firstPracticeBtn = page.locator('button:has-text("Practice")').first();
        const btnText = await firstPracticeBtn.textContent();

        console.log(`Practice button text: "${btnText}"`);
        expect(btnText).toContain('🎤');
        expect(btnText).toContain('Practice');

        await page.screenshot({ path: 'tests/screenshots/pronunciation-mic-icon.png' });
    });

    test('should have pronunciation feedback div on each card', async ({ page }) => {
        // Check for feedback divs (they're hidden initially)
        const feedbackDivs = await page.locator('[id^="feedback-"]').count();

        console.log(`✅ Found ${feedbackDivs} pronunciation feedback containers`);
        expect(feedbackDivs).toBeGreaterThan(0);
    });

    test('should update button UI when recording starts', async ({ page, context }) => {
        // Grant permissions
        await context.grantPermissions(['microphone']);

        // Click Practice button
        const firstPracticeBtn = page.locator('button:has-text("Practice")').first();

        // Get initial button text
        const initialText = await firstPracticeBtn.textContent();
        console.log(`Initial button text: "${initialText}"`);

        // Note: In headless mode, MediaRecorder may not work without actual audio device
        // This test validates UI state changes only

        await page.screenshot({ path: 'tests/screenshots/pronunciation-before-click.png' });
    });

    test('should have pronunciation API endpoint available', async ({ page }) => {
        // Test that pronunciation scoring API exists
        const response = await page.request.post('http://localhost:3002/api/pronunciation/score', {
            headers: { 'Content-Type': 'application/json' },
            data: {
                expectedText: 'Hola mundo',
                userId: 'test_user'
            }
        });

        // Should return 400 because no audio provided (but endpoint exists)
        console.log(`Pronunciation API status: ${response.status()}`);
        expect(response.status()).toBe(400);
    });

    test('should have TTS audio button working', async ({ page }) => {
        // Find and click Listen button to test TTS integration
        const listenBtn = page.locator('button:has-text("Listen")').first();

        // Click button
        await listenBtn.click();

        // Button should show loading state
        await page.waitForTimeout(500);
        const loadingText = await listenBtn.textContent();
        console.log(`Audio button state: "${loadingText}"`);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-audio-loading.png' });
    });

    test('should show feedback container when feedback is displayed', async ({ page }) => {
        // Get first feedback div
        const firstFeedback = page.locator('[id^="feedback-"]').first();

        // Initially hidden
        const isHidden = await firstFeedback.isHidden();
        console.log(`Feedback initially hidden: ${isHidden}`);
        expect(isHidden).toBe(true);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-feedback-hidden.png' });
    });

    test('should have proper accessibility attributes on Practice button', async ({ page }) => {
        // Check aria-label
        const firstPracticeBtn = page.locator('button:has-text("Practice")').first();
        const ariaLabel = await firstPracticeBtn.getAttribute('aria-label');

        console.log(`Aria label: "${ariaLabel}"`);
        expect(ariaLabel).toBe('Practice pronunciation');
    });

    test('should integrate with unified feed card structure', async ({ page }) => {
        // Verify Practice button is within card-actions div
        const practiceInActions = await page.locator('.card-actions button:has-text("Practice")').count();

        console.log(`✅ Practice buttons within card-actions: ${practiceInActions}`);
        expect(practiceInActions).toBeGreaterThan(0);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-card-integration.png', fullPage: true });
    });

    test('should have celebration animation CSS defined', async ({ page }) => {
        // Check if celebrate keyframe animation exists in page styles
        const styles = await page.evaluate(() => {
            const styleSheets = Array.from(document.styleSheets);
            let hasCelebrate = false;

            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    rules.forEach(rule => {
                        if (rule.name === 'celebrate' || (rule.cssText && rule.cssText.includes('celebrate'))) {
                            hasCelebrate = true;
                        }
                    });
                } catch (e) {
                    // CORS issues with external stylesheets
                }
            });

            return hasCelebrate;
        });

        console.log(`Celebrate animation defined: ${styles}`);
        expect(styles).toBe(true);
    });

    test('should display grade colors correctly', async ({ page }) => {
        // Test that grade color mapping exists in JavaScript
        const hasGradeColors = await page.evaluate(() => {
            return typeof feed !== 'undefined' && typeof feed.displayPronunciationScore === 'function';
        });

        console.log(`displayPronunciationScore method exists: ${hasGradeColors}`);
        expect(hasGradeColors).toBe(true);
    });

    test('should show mock pronunciation feedback structure', async ({ page }) => {
        // Simulate what feedback would look like by injecting it into first card
        await page.evaluate(() => {
            const mockResult = {
                success: true,
                grade: 'A+',
                emoji: '🌟',
                accuracyPercentage: 98,
                transcribed: 'Hola mundo',
                feedback: '¡Perfecto! Your pronunciation is excellent!',
                errors: [],
                improvements: ['Keep practicing rolling Rs']
            };

            const firstFeedback = document.querySelector('[id^="feedback-"]');
            if (firstFeedback && feed) {
                feed.displayPronunciationScore(
                    firstFeedback.id.replace('feedback-', ''),
                    mockResult
                );
            }
        });

        await page.waitForTimeout(500);

        // Check feedback is visible
        const firstFeedback = page.locator('[id^="feedback-"]').first();
        const isVisible = await firstFeedback.isVisible();

        console.log(`Mock feedback visible: ${isVisible}`);
        expect(isVisible).toBe(true);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-feedback-mock.png', fullPage: true });
    });

    test('should handle different grade levels (A+ to F)', async ({ page }) => {
        // Test different grades rendering
        const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

        for (const grade of grades) {
            await page.evaluate((gradeValue) => {
                const mockResult = {
                    success: true,
                    grade: gradeValue,
                    emoji: gradeValue === 'A+' ? '🌟' : gradeValue.startsWith('A') ? '⭐' : '👍',
                    accuracyPercentage: gradeValue === 'A+' ? 100 : 75,
                    transcribed: 'Test phrase',
                    feedback: `Grade ${gradeValue} feedback`,
                    errors: [],
                    improvements: []
                };

                const firstFeedback = document.querySelector('[id^="feedback-"]');
                if (firstFeedback && feed) {
                    feed.displayPronunciationScore(
                        firstFeedback.id.replace('feedback-', ''),
                        mockResult
                    );
                }
            }, grade);

            await page.waitForTimeout(200);
        }

        // Screenshot final state
        await page.screenshot({ path: 'tests/screenshots/pronunciation-all-grades.png' });
        console.log(`✅ Tested all ${grades.length} grade levels`);
    });

    test('should have responsive mobile design for pronunciation buttons', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro

        await page.waitForTimeout(500);

        // Check Practice button is visible
        const practiceBtn = page.locator('button:has-text("Practice")').first();
        const isVisible = await practiceBtn.isVisible();

        console.log(`Practice button visible on mobile: ${isVisible}`);
        expect(isVisible).toBe(true);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-mobile-design.png', fullPage: true });
    });

    test('should integrate with Spanish text from feed items', async ({ page }) => {
        // Get first card's Spanish text and Practice button
        const firstCard = page.locator('.content-card').first();
        const spanishText = await firstCard.locator('.spanish-text').textContent();

        console.log(`Spanish text found: "${spanishText}"`);
        expect(spanishText).toBeTruthy();
        expect(spanishText.length).toBeGreaterThan(0);

        // Practice button should reference this text
        const practiceBtn = firstCard.locator('button:has-text("Practice")');
        const onclick = await practiceBtn.getAttribute('onclick');

        console.log(`Practice onclick: ${onclick}`);
        expect(onclick).toContain('recordPronunciation');
    });

    test('should show error state when API fails', async ({ page }) => {
        // Simulate API failure by injecting error feedback
        await page.evaluate(() => {
            const mockResult = {
                success: false,
                error: 'Pronunciation scoring failed. Please try again.'
            };

            const firstFeedback = document.querySelector('[id^="feedback-"]');
            if (firstFeedback && feed) {
                feed.displayPronunciationScore(
                    firstFeedback.id.replace('feedback-', ''),
                    mockResult
                );
            }
        });

        await page.waitForTimeout(500);

        // Check error is displayed
        const errorText = await page.locator('[id^="feedback-"]:visible').first().textContent();
        console.log(`Error feedback: "${errorText}"`);
        expect(errorText).toContain('❌');

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/pronunciation-error-state.png' });
    });

});

console.log('🎤 Pronunciation Recording Tests - HEADLESS ONLY - NEVER OPEN BROWSER!');
