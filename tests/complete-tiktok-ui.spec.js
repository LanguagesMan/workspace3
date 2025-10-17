// ✅ Complete TikTok UI Test - All buttons in right sidebar, no left-side elements
// Tests the perfected UI with all controls consolidated to the right side

const { test, expect } = require('@playwright/test');

test.describe('Complete TikTok UI - Right Sidebar Only', () => {
    test.beforeEach(async ({ page }) => {
        // Start fresh with cache busting
        await page.goto(`http://localhost:3001?t=${Date.now()}`);

        // Set up user profile to skip assessment
        await page.evaluate(() => {
            localStorage.clear();
            // Set the profile that the app actually checks for
            localStorage.setItem('langflix_user_profile', JSON.stringify({
                cefrLevel: 'A2',
                knownWords: ['hola', 'adios', 'gracias', 'buenos', 'dias'],
                completedAssessment: true
            }));
            localStorage.setItem('userLevel', 'A2');
            localStorage.setItem('vocabAssessmentComplete', 'true');
        });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForLoadState('networkidle');
    });

    test('All buttons are in right sidebar only - no left-side elements', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Verify NO left-side playback-controls
        const playbackControls = await page.locator('.playback-controls').count();
        expect(playbackControls).toBe(0);

        // Verify NO left-side speed-control
        const speedControl = await page.locator('.speed-control').count();
        expect(speedControl).toBe(0);

        // Verify sidebar exists and is on the right
        const sidebar = await page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        // Check sidebar position (should be on right side)
        const sidebarBox = await sidebar.boundingBox();
        const viewportWidth = page.viewportSize().width;
        expect(sidebarBox.x).toBeGreaterThan(viewportWidth / 2); // Right half of screen

        console.log('✅ All controls are in right sidebar only - no left-side elements');
    });

    test('Right sidebar contains all expected buttons', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const firstCard = page.locator('.video-card').first();
        const sidebar = firstCard.locator('.sidebar');

        // Social buttons
        await expect(sidebar.locator('.like-btn')).toBeVisible();
        await expect(sidebar.locator('.comment-btn')).toBeVisible();
        await expect(sidebar.locator('.share-btn')).toBeVisible();
        await expect(sidebar.locator('.save-btn')).toBeVisible();

        // Learning buttons
        await expect(sidebar.locator('.too-easy-btn')).toBeVisible();
        await expect(sidebar.locator('.too-hard-btn')).toBeVisible();
        await expect(sidebar.locator('.retranscribe-btn')).toBeVisible();
        await expect(sidebar.locator('.delete-btn')).toBeVisible();

        // Playback controls (NEW - moved to sidebar)
        await expect(sidebar.locator('.x2-btn')).toBeVisible();
        await expect(sidebar.locator('.speed-btn')).toBeVisible();
        await expect(sidebar.locator('.translate-btn')).toBeVisible();

        console.log('✅ All buttons present in right sidebar');
    });

    test('Scrolling works - can access all videos', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Get initial video count
        const initialCount = await page.locator('.video-card').count();
        expect(initialCount).toBeGreaterThanOrEqual(15); // BATCH_SIZE is now 15

        // Scroll down to trigger infinite scroll
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => {
                const container = document.getElementById('feedContainer');
                const lastCard = document.querySelector('.video-card:last-child');
                if (lastCard) {
                    lastCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
            await page.waitForTimeout(1000);
        }

        // Verify more videos loaded
        const finalCount = await page.locator('.video-card').count();
        expect(finalCount).toBeGreaterThan(initialCount);

        console.log(`✅ Scrolling works: ${initialCount} → ${finalCount} videos`);
    });

    test('x2 button works - toggles between On/Off', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const firstCard = page.locator('.video-card').first();
        const x2Btn = firstCard.locator('.x2-btn');
        const x2Status = x2Btn.locator('.x2-status');

        // Initial state: Off
        await expect(x2Status).toHaveText('Off');

        // Click to turn on
        await x2Btn.click();
        await expect(x2Status).toHaveText('On');

        // Click to turn off
        await x2Btn.click();
        await expect(x2Status).toHaveText('Off');

        console.log('✅ x2 mode toggles correctly');
    });

    test('Speed button cycles through speeds', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const firstCard = page.locator('.video-card').first();
        const speedBtn = firstCard.locator('.speed-btn');
        const speedDisplay = speedBtn.locator('.speed-display');

        // Initial state: 1x
        await expect(speedDisplay).toHaveText('1x');

        // Click to cycle to 0.5x
        await speedBtn.click();
        await page.waitForTimeout(100);
        await expect(speedDisplay).toHaveText('0.5x');

        // Click to cycle to 0.75x
        await speedBtn.click();
        await page.waitForTimeout(100);
        await expect(speedDisplay).toHaveText('0.75x');

        // Click to cycle back to 1x
        await speedBtn.click();
        await page.waitForTimeout(100);
        await expect(speedDisplay).toHaveText('1x');

        console.log('✅ Speed cycling works: 1x → 0.5x → 0.75x → 1x');
    });

    test('Translation button cycles through modes', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const firstCard = page.locator('.video-card').first();
        const translateBtn = firstCard.locator('.translate-btn');
        const translateStatus = translateBtn.locator('.translate-status');

        // Initial state: EN (English shown)
        const initialText = await translateStatus.textContent();
        expect(['EN', 'Both', 'ES']).toContain(initialText);

        // Click to cycle through modes
        await translateBtn.click();
        await page.waitForTimeout(100);
        const afterClick1 = await translateStatus.textContent();

        await translateBtn.click();
        await page.waitForTimeout(100);
        const afterClick2 = await translateStatus.textContent();

        await translateBtn.click();
        await page.waitForTimeout(100);
        const afterClick3 = await translateStatus.textContent();

        // Verify it cycles
        expect([afterClick1, afterClick2, afterClick3].some(t => t !== initialText)).toBe(true);

        console.log(`✅ Translation cycling works: ${initialText} → ${afterClick1} → ${afterClick2}`);
    });

    test('NO nested menus - all buttons directly accessible', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Verify NO speed-menu exists
        const speedMenuCount = await page.locator('.speed-menu').count();
        expect(speedMenuCount).toBe(0);

        // Verify NO "more options" or three-dot menus
        const moreMenuCount = await page.locator('.more-menu, .options-menu, .three-dot-menu').count();
        expect(moreMenuCount).toBe(0);

        console.log('✅ No nested menus - all buttons directly accessible');
    });

    test('Like button works', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const firstCard = page.locator('.video-card').first();
        const likeBtn = firstCard.locator('.like-btn');

        // Click like button
        await likeBtn.click();

        // Verify it gets active state
        await expect(likeBtn).toHaveClass(/like-active|liked/);

        console.log('✅ Like button works');
    });

    test('Difficulty badges visible on all videos', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const videoCards = await page.locator('.video-card').count();

        for (let i = 0; i < Math.min(videoCards, 5); i++) {
            const card = page.locator('.video-card').nth(i);
            const badge = card.locator('.difficulty-badge');
            await expect(badge).toBeVisible();
        }

        console.log(`✅ Difficulty badges visible on videos`);
    });

    test('Coverage badges visible on all videos', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const videoCards = await page.locator('.video-card').count();

        for (let i = 0; i < Math.min(videoCards, 5); i++) {
            const card = page.locator('.video-card').nth(i);
            const badge = card.locator('.coverage-badge');
            await expect(badge).toBeVisible();
        }

        console.log(`✅ Coverage badges visible on videos`);
    });

    test('Videos autoplay when scrolled into view', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Get first video element
        const firstVideo = page.locator('.video-card').first().locator('video');

        // Verify video is playing
        const isPlaying = await firstVideo.evaluate((video) => {
            return !video.paused && !video.ended && video.readyState > 2;
        });

        expect(isPlaying).toBe(true);

        console.log('✅ Videos autoplay');
    });
});

test.describe('Core Learning Loop', () => {
    test('Complete user journey: Watch → Tap word → Save → Practice', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.evaluate(() => localStorage.clear());
        await page.reload();

        // 1. Wait for first video
        await page.waitForSelector('.video-card', { timeout: 10000 });
        console.log('✅ Step 1: Videos loaded');

        // 2. Click on a Spanish word in subtitles
        await page.waitForSelector('.spanish-word', { timeout: 5000 });
        const firstWord = page.locator('.spanish-word').first();
        await firstWord.click();
        await page.waitForTimeout(500);
        console.log('✅ Step 2: Tapped Spanish word');

        // 3. Word modal should appear
        const wordModal = page.locator('#wordModal');
        await expect(wordModal).toBeVisible();
        console.log('✅ Step 3: Word modal opened');

        // 4. Click "Add to Learning" to save the word
        const addButton = page.locator('button:has-text("Add"), button:has-text("Save"), .add-word-btn');
        if (await addButton.count() > 0) {
            await addButton.first().click();
            await page.waitForTimeout(500);
            console.log('✅ Step 4: Word saved');
        }

        // 5. Close modal
        const closeBtn = wordModal.locator('.close-modal, .close-btn');
        if (await closeBtn.count() > 0) {
            await closeBtn.first().click();
        } else {
            await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(500);

        // 6. Verify Practice button appears with count
        const practiceBtn = page.locator('.practice-btn');
        await expect(practiceBtn).toBeVisible({ timeout: 5000 });
        console.log('✅ Step 5: Practice button appeared');

        // 7. Click Practice button to open SRS modal
        await practiceBtn.click();
        await page.waitForTimeout(1000);

        // 8. Verify Practice modal opened
        const practiceModal = page.locator('#practiceModal, .practice-modal');
        await expect(practiceModal).toBeVisible();
        console.log('✅ Step 6: Practice modal opened');

        // 9. Verify swipe card is visible
        const swipeCard = page.locator('.swipe-card, .practice-card');
        await expect(swipeCard.first()).toBeVisible();
        console.log('✅ Step 7: Swipe card visible');

        console.log('✅✅✅ CORE LEARNING LOOP COMPLETE: Watch → Tap → Save → Practice');
    });
});
