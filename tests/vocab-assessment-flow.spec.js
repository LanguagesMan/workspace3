const { test, expect } = require('@playwright/test');

test.describe('Vocabulary Assessment & Word Tracking', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage to simulate new user
        await page.goto('http://localhost:3001');
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should show vocabulary assessment for new users', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');

        // Wait for assessment modal to appear
        const modal = page.locator('#vocabAssessmentModal');
        await expect(modal).toBeVisible({ timeout: 5000 });

        console.log('✅ Vocabulary assessment modal displayed for new user');
    });

    test('should complete vocabulary assessment', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');

        // Wait for assessment iframe
        const iframe = page.frameLocator('#vocabAssessmentIframe');

        // Wait for first word to load
        await iframe.locator('#wordSpanish').waitFor({ timeout: 10000 });

        // Answer 20 words (clicking "I Know This" or "I Don't Know")
        for (let i = 0; i < 20; i++) {
            const wordText = await iframe.locator('#wordSpanish').textContent();
            console.log(`Word ${i + 1}/20: ${wordText}`);

            // Randomly answer (50% know, 50% don't know)
            const knows = Math.random() > 0.5;
            if (knows) {
                await iframe.locator('.btn-know').click();
            } else {
                await iframe.locator('.btn-dont-know').click();
            }

            await page.waitForTimeout(100);
        }

        // Wait for results page
        await iframe.locator('#resultsSection').waitFor({ visible: true, timeout: 5000 });

        // Get detected level
        const level = await iframe.locator('#detectedLevel').textContent();
        console.log(`✅ Assessment complete! Detected level: ${level}`);

        // Click "Start Learning" button
        await iframe.locator('.btn-start').click();

        // Verify profile was saved to localStorage
        const profile = await page.evaluate(() => {
            return localStorage.getItem('langflix_user_profile');
        });

        expect(profile).toBeTruthy();
        const profileData = JSON.parse(profile);
        expect(profileData.cefrLevel).toBeTruthy();
        expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(profileData.cefrLevel);

        console.log(`✅ User profile saved:`, profileData);
    });

    test('should NOT show assessment for returning users', async ({ page }) => {
        // Set up existing user profile
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.setItem('langflix_user_profile', JSON.stringify({
                cefrLevel: 'B1',
                knownWords: ['hola', 'casa', 'agua'],
                totalKnown: 3,
                assessmentDate: new Date().toISOString()
            }));
        });

        await page.reload();

        // Assessment modal should NOT appear
        const modal = page.locator('#vocabAssessmentModal');
        const isVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);

        expect(isVisible).toBe(false);
        console.log('✅ Returning user bypasses vocabulary assessment');

        // Verify videos load
        await page.locator('.video-card').first().waitFor({ timeout: 10000 });
        console.log('✅ Videos loaded for returning user');
    });

    test('should track word exposures and clicks', async ({ page }) => {
        // Set up user profile
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.setItem('langflix_user_profile', JSON.stringify({
                cefrLevel: 'A2',
                knownWords: ['hola'],
                totalKnown: 1
            }));
        });

        await page.reload();

        // Wait for video to load
        await page.locator('.video-card').first().waitFor({ timeout: 10000 });

        // Wait for subtitles to appear
        await page.waitForTimeout(2000);

        // Click on a Spanish word
        const firstWord = page.locator('.spanish-line .word').first();
        await firstWord.waitFor({ visible: true, timeout: 5000 });
        await firstWord.click();

        // Verify word tooltip appears
        const tooltip = page.locator('#wordTooltip');
        await expect(tooltip).toHaveClass(/show/, { timeout: 3000 });

        console.log('✅ Word translation tooltip displayed');

        // Check word interactions in localStorage
        const interactions = await page.evaluate(() => {
            return localStorage.getItem('word_interactions');
        });

        expect(interactions).toBeTruthy();
        const interactionData = JSON.parse(interactions);
        expect(Object.keys(interactionData).length).toBeGreaterThan(0);

        console.log(`✅ Word interactions tracked:`, Object.keys(interactionData).length, 'words');
    });

    test('should update profile based on interaction patterns', async ({ page }) => {
        // Set up user profile
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.setItem('langflix_user_profile', JSON.stringify({
                cefrLevel: 'A2',
                knownWords: ['hola'],
                totalKnown: 1
            }));

            // Simulate word interactions (some clicked, some just seen)
            localStorage.setItem('word_interactions', JSON.stringify({
                'casa': { exposures: 5, clicks: 0, saves: 0, videos: ['vid1'] },
                'agua': { exposures: 4, clicks: 0, saves: 0, videos: ['vid1'] },
                'perro': { exposures: 2, clicks: 1, saves: 0, videos: ['vid2'] },
                'gato': { exposures: 1, clicks: 0, saves: 1, videos: ['vid2'] }
            }));
        });

        await page.reload();

        // Wait for videos to load
        await page.locator('.video-card').first().waitFor({ timeout: 10000 });

        // Trigger profile update by adding more exposures
        await page.evaluate(() => {
            const interactions = JSON.parse(localStorage.getItem('word_interactions'));
            // Add more exposures to trigger update (total = 20)
            for (let i = 0; i < 8; i++) {
                interactions[`word${i}`] = { exposures: 1, clicks: 0, saves: 0, videos: [] };
            }
            localStorage.setItem('word_interactions', JSON.stringify(interactions));

            // Call update function
            window.updateUserProfileFromInteractions?.(interactions);
        });

        await page.waitForTimeout(1000);

        // Check if profile was updated with known words
        const profile = await page.evaluate(() => {
            return localStorage.getItem('langflix_user_profile');
        });

        const profileData = JSON.parse(profile);
        console.log('✅ Updated profile:', {
            level: profileData.cefrLevel,
            knownWords: profileData.knownWords?.length || 0,
            learningWords: profileData.learningWords?.length || 0
        });

        // Verify known words were added (casa and agua seen 3+ times without clicks)
        expect(profileData.knownWords.length).toBeGreaterThan(1);
    });
});
