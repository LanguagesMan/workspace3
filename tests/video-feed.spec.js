const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Video Feed', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForTimeout(2000); // Wait for videos to load
    });

    test('loads video feed with 81 videos', async ({ page }) => {
        // Wait for loading to disappear
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Check that video containers exist
        const videoContainers = await page.locator('.video-container').count();
        expect(videoContainers).toBe(81);

        // Check first video is playing
        const firstVideo = page.locator('video#v0');
        await expect(firstVideo).toBeVisible();

        // Verify video attributes
        const isPaused = await firstVideo.evaluate(v => v.paused);
        expect(isPaused).toBe(false); // Should be autoplaying
    });

    test('displays transcriptions in Spanish and English', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Check Spanish transcription exists
        const spanishText = page.locator('.spanish').first();
        await expect(spanishText).toBeVisible();
        await expect(spanishText).toContainText('¡Hola!');

        // Check English transcription is hidden by default
        const englishText = page.locator('.english').first();
        await expect(englishText).not.toHaveClass(/show/);
    });

    test('toggles English translation on button click', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Click translate button
        await page.locator('.btn').nth(1).click(); // 2nd button is translate

        // Verify English is now visible
        const englishText = page.locator('.english').first();
        await expect(englishText).toHaveClass(/show/);
    });

    test('changes playback speed', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Initial speed should be 1x
        const speedBtn = page.locator('#sp0');
        await expect(speedBtn).toHaveText('1x');

        // Click speed button to change to 0.5x
        await page.locator('.btn').first().click();
        await expect(speedBtn).toHaveText('0.5x');

        // Verify video playback rate changed
        const playbackRate = await page.locator('video#v0').evaluate(v => v.playbackRate);
        expect(playbackRate).toBe(0.5);
    });

    test('shows word translation tooltip on word click', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Click on a word
        const firstWord = page.locator('.word').first();
        await firstWord.click();

        // Verify tooltip appears
        const tooltip = page.locator('#tooltip');
        await expect(tooltip).toHaveClass(/show/);

        // Verify tooltip has content
        const tooltipWord = page.locator('#tooltipWord');
        await expect(tooltipWord).not.toBeEmpty();
    });

    test('saves word to vocabulary', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Click on a word to show tooltip
        await page.locator('.word').first().click();
        await page.waitForSelector('#tooltip.show');

        // Click save button
        await page.locator('.save-btn').click();

        // Verify toast notification appears
        const toast = page.locator('#toast');
        await expect(toast).toHaveClass(/show/);
        await expect(toast).toContainText('saved');
    });

    test('opens quiz modal and completes quiz', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Click quiz button (3rd button)
        await page.locator('.btn').nth(2).click();

        // Verify quiz modal appears
        const quizModal = page.locator('#quiz');
        await expect(quizModal).toHaveClass(/show/);

        // Verify quiz title
        await expect(page.locator('.quiz-title')).toContainText('Quick Quiz');

        // Answer first question
        const firstOption = page.locator('.option').first();
        await firstOption.click();

        // Verify option gets marked
        await expect(firstOption).toHaveClass(/(correct|incorrect)/);

        // Click next button
        await page.locator('#nextBtn').click();

        // Answer second question
        await page.locator('.option').first().click();
        await page.locator('#nextBtn').click();

        // Verify score screen appears
        await expect(page.locator('.quiz-box')).toContainText('Score:');
    });

    test('likes video and shows toast', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Click like button (4th button)
        await page.locator('.btn').nth(3).click();

        // Verify toast appears with like message
        const toast = page.locator('#toast');
        await expect(toast).toHaveClass(/show/);
        await expect(toast).toContainText('Liked');
    });

    test('scrolls to next video using vertical scroll snap', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Get initial video
        const firstVideo = page.locator('video#v0');
        const isFirstPlaying = await firstVideo.evaluate(v => !v.paused);
        expect(isFirstPlaying).toBe(true);

        // Scroll down to next video
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });

        await page.waitForTimeout(500); // Wait for scroll snap

        // Verify second video is now playing
        const secondVideo = page.locator('video#v1');
        const isSecondPlaying = await secondVideo.evaluate(v => !v.paused);
        expect(isSecondPlaying).toBe(true);

        // Verify first video is paused
        const isFirstPaused = await firstVideo.evaluate(v => v.paused);
        expect(isFirstPaused).toBe(true);
    });

    test('displays video metadata (title, likes, saves, level)', async ({ page }) => {
        await page.waitForSelector('#loading', { state: 'hidden' });

        // Check title exists
        const title = page.locator('.title').first();
        await expect(title).toBeVisible();
        await expect(title).not.toBeEmpty();

        // Check meta info (likes, saves, level)
        const meta = page.locator('.meta').first();
        await expect(meta).toContainText('❤️');
        await expect(meta).toContainText('💾');

        // Check level badge
        const badge = page.locator('.badge').first();
        await expect(badge).toBeVisible();
        await expect(badge).toHaveText(/(A1|A2|B1|B2)/);
    });

    test('API endpoint returns correct video data', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/videos');
        expect(response.ok()).toBeTruthy();

        const videos = await response.json();
        expect(videos.length).toBe(81);

        // Verify first video structure
        const firstVideo = videos[0];
        expect(firstVideo).toHaveProperty('id');
        expect(firstVideo).toHaveProperty('videoUrl');
        expect(firstVideo).toHaveProperty('transcription');
        expect(firstVideo).toHaveProperty('quiz');
        expect(firstVideo).toHaveProperty('vocabulary');
        expect(firstVideo.transcription).toHaveProperty('spanish');
        expect(firstVideo.transcription).toHaveProperty('english');
    });

    test('vocabulary save API endpoint works', async ({ request }) => {
        const response = await request.post('http://localhost:3002/api/vocabulary/save', {
            data: {
                word: 'hola',
                translation: 'hello',
                context: 'test video',
                videoId: 'video-0'
            }
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();
        expect(result.success).toBe(true);
    });

    test('user progress API endpoint works', async ({ request }) => {
        const response = await request.post('http://localhost:3002/api/user/progress', {
            data: {
                videoId: 'video-0',
                quizScore: 100,
                wordsLearned: ['hola', 'bienvenidos'],
                timeWatched: 30
            }
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();
        expect(result.success).toBe(true);
        expect(result.xpEarned).toBe(10);
    });

    test('performance: video loads within 2 seconds', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('#loading', { state: 'hidden' });
        await page.waitForSelector('video#v0');

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(2000);
    });
});
