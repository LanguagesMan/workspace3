// Duolingo 2025: Quest System Comprehensive Test
const { test, expect } = require('@playwright/test');

test.describe('🎯 Duolingo 2025: Quest System Tests', () => {
    test('Quest Badge: Shows 0/10 quests on initial load', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Verify quest badge is visible
        const questBadge = page.locator('#questBadge');
        await expect(questBadge).toBeVisible();

        // Verify initial count
        const questCount = await page.locator('#questCount').textContent();
        console.log(`✅ Quest badge shows: ${questCount}`);
        expect(questCount).toMatch(/\d+\/\d+/); // Format: "0/10" or similar
    });

    test('Quest Modal: Opens when badge is clicked', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Click quest badge
        await page.locator('#questBadge').click();

        // Verify modal opens
        const modal = page.locator('#questModal');
        await expect(modal).toHaveClass(/active/);

        // Verify modal title
        const title = await page.locator('.quest-modal-title').textContent();
        console.log(`✅ Modal title: ${title}`);
        expect(title).toContain('Daily Quests');

        // Count quest items
        const questItems = await page.locator('.quest-item').count();
        console.log(`✅ Total quests displayed: ${questItems}`);
        expect(questItems).toBe(10); // Duolingo pattern: 10 daily quests
    });

    test('Quest Modal: Shows all 10 quest types with icons and rewards', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        await page.locator('#questBadge').click();

        // Verify each quest has required elements
        const questItems = page.locator('.quest-item');
        const count = await questItems.count();

        for (let i = 0; i < count; i++) {
            const quest = questItems.nth(i);

            // Check icon
            const icon = await quest.locator('.quest-item-icon').textContent();
            expect(icon.trim()).not.toBe('');

            // Check title
            const title = await quest.locator('.quest-item-title').textContent();
            expect(title.trim()).not.toBe('');

            // Check description
            const desc = await quest.locator('.quest-item-desc').textContent();
            expect(desc.trim()).not.toBe('');

            // Check reward or completion check
            const hasReward = await quest.locator('.quest-item-reward').count();
            const hasCheck = await quest.locator('.quest-item-check').count();
            expect(hasReward + hasCheck).toBeGreaterThan(0);

            console.log(`✅ Quest ${i+1}: ${icon.trim()} ${title}`);
        }
    });

    test('Quest Modal: Closes when X button is clicked', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Open modal
        await page.locator('#questBadge').click();
        await expect(page.locator('#questModal')).toHaveClass(/active/);

        // Close modal
        await page.locator('#questCloseBtn').click();
        await expect(page.locator('#questModal')).not.toHaveClass(/active/);

        console.log('✅ Quest modal closes successfully');
    });

    test('Quest Progress: Translating word updates quest count', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Get initial quest count
        const initialCount = await page.locator('#questCount').textContent();
        console.log(`📊 Initial quest count: ${initialCount}`);

        // Click a Spanish word to trigger translation quest
        const firstWord = page.locator('.word-clickable').first();
        await firstWord.click();
        await page.waitForTimeout(500);

        // Open quest modal to verify progress
        await page.locator('#questBadge').click();

        // Find the translate quest
        const translateQuest = page.locator('.quest-item').filter({ hasText: 'Translate' }).first();
        const questDesc = await translateQuest.locator('.quest-item-desc').textContent();

        console.log(`✅ Translate quest progress: ${questDesc}`);
        expect(questDesc).toContain('(1/10)'); // Should show 1 translation completed
    });

    test('Quest Progress: Saving word updates save quest', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Click word to show translation
        const firstWord = page.locator('.word-clickable').first();
        await firstWord.click();
        await page.waitForTimeout(300);

        // Wait for translation popup and click save flashcard button
        await page.waitForSelector('.translation-popup.active', { timeout: 5000 });
        const saveBtn = page.locator('.save-flashcard-btn').first();
        await saveBtn.click();
        await page.waitForTimeout(500);

        // Open quest modal
        await page.locator('#questBadge').click();

        // Find the save quest
        const saveQuest = page.locator('.quest-item').filter({ hasText: 'Save' }).first();
        const questDesc = await saveQuest.locator('.quest-item-desc').textContent();

        console.log(`✅ Save quest progress: ${questDesc}`);
        expect(questDesc).toContain('(1/5)'); // Should show 1 word saved
    });

    test('Quest Progress: Posting comment updates comment quest', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Open comments
        const commentsBtn = page.locator('.interaction-btn').filter({ hasText: 'Comments' }).first();
        await commentsBtn.click();
        await page.waitForTimeout(300);

        // Post a comment
        const commentInput = page.locator('#commentInput');
        await commentInput.fill('¡Excelente video!');
        await commentInput.press('Enter');
        await page.waitForTimeout(500);

        // Close comments drawer
        await page.locator('#commentsDrawer').click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(300);

        // Open quest modal
        await page.locator('#questBadge').click();

        // Find the comment quest
        const commentQuest = page.locator('.quest-item').filter({ hasText: 'comment' }).first();
        const isCompleted = await commentQuest.evaluate(el => el.classList.contains('completed'));

        console.log(`✅ Comment quest completed: ${isCompleted}`);
        expect(isCompleted).toBe(true); // Should be marked as completed
    });

    test('Screenshot: Quest system visual proof', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForLoadState('networkidle');

        // Take screenshot showing quest badge
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/evidence/QUEST-BADGE.png',
            fullPage: false
        });

        // Open quest modal
        await page.locator('#questBadge').click();
        await page.waitForTimeout(500);

        // Take screenshot of quest modal
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/evidence/QUEST-MODAL.png',
            fullPage: false
        });

        console.log('📸 Quest system screenshots saved');
    });
});
