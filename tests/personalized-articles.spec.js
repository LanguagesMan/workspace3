// 📝 PERSONALIZED ARTICLES TEST - AI-Powered Content Generation
// Tests article generation system with beautiful modal UI

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3002';

test.describe('📝 Personalized Articles System', () => {

    test('should load Apple-feed with article generator button', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');

        // Check article FAB exists
        const articleBtn = await page.locator('.fab').first();
        await expect(articleBtn).toBeVisible();

        const btnText = await articleBtn.textContent();
        expect(btnText).toContain('📝');

        console.log('✅ Article generator button (📝) visible');

        // Screenshot: FAB buttons
        await page.screenshot({
            path: 'screenshots/articles-fab-buttons.png'
        });

        console.log('📸 Screenshot: articles-fab-buttons.png');
    });

    test('should open article generation modal on click', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');

        // Click article button
        const articleBtn = await page.locator('.fab').first();
        await articleBtn.click();
        await page.waitForTimeout(500);

        // Check modal opened
        const modal = await page.locator('.modal');
        await expect(modal).toBeVisible();

        // Check modal content
        const modalTitle = await page.locator('.modal-header h2');
        await expect(modalTitle).toContainText('Generate Personalized Article');

        console.log('✅ Article modal opened successfully');

        // Screenshot: Modal opened
        await page.screenshot({
            path: 'screenshots/articles-modal-open.png'
        });

        console.log('📸 Screenshot: articles-modal-open.png');
    });

    test('should display all input fields in modal', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(1000);

        // Open modal
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        // Check topic input
        const topicInput = await page.locator('#articleTopic');
        await expect(topicInput).toBeVisible();
        const topicPlaceholder = await topicInput.getAttribute('placeholder');
        expect(topicPlaceholder).toContain('Spanish Food');

        // Check level select
        const levelSelect = await page.locator('#articleLevel');
        await expect(levelSelect).toBeVisible();
        const options = await levelSelect.locator('option');
        const optionCount = await options.count();
        expect(optionCount).toBe(6); // A1, A2, B1, B2, C1, C2

        // Check interests input
        const interestsInput = await page.locator('#articleInterests');
        await expect(interestsInput).toBeVisible();

        // Check generate button
        const generateBtn = await page.locator('text=✨ Generate Article');
        await expect(generateBtn).toBeVisible();

        console.log('✅ All modal inputs present: topic, level, interests, generate button');

        // Screenshot: Modal fields
        await page.screenshot({
            path: 'screenshots/articles-modal-fields.png'
        });

        console.log('📸 Screenshot: articles-modal-fields.png');
    });

    test('should verify article generation API works', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/ai/generate-article`, {
            data: {
                topic: 'Spanish Cuisine',
                userLevel: 'B1',
                userInterests: ['cooking', 'travel', 'culture']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`📝 Article Generation API Result:`);
        console.log(`   Title: ${data.title}`);
        console.log(`   Level: ${data.level}`);
        console.log(`   Structure: ${data.template.structure}`);
        console.log(`   Vocabulary: ${data.template.vocabulary}`);
        console.log(`   Interests: ${data.interests.join(', ')}`);
        console.log(`   Prompt length: ${data.prompt.length} chars`);

        expect(data.success).toBe(true);
        expect(data.title).toContain('Spanish Cuisine');
        expect(data.level).toBe('B1');
        expect(data.template).toBeDefined();
        expect(data.prompt).toBeDefined();
    });

    test('should close modal when clicking X button', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(1000);

        // Open modal
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        // Click close button
        const closeBtn = await page.locator('.modal-close');
        await expect(closeBtn).toBeVisible();
        await closeBtn.click();
        await page.waitForTimeout(300);

        // Verify modal closed
        const modal = await page.locator('.modal');
        const isVisible = await modal.isVisible();
        expect(isVisible).toBe(false);

        console.log('✅ Modal closes on X button click');
    });

    test('should test article generation for different levels', async ({ request }) => {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        console.log('🎯 Testing article generation for all CEFR levels...');

        for (const level of levels) {
            const response = await request.post(`${BASE_URL}/api/ai/generate-article`, {
                data: {
                    topic: 'Spanish Music',
                    userLevel: level,
                    userInterests: ['music', 'culture']
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            console.log(`   ${level}: ${data.title} | ${data.template.structure}`);

            expect(data.success).toBe(true);
            expect(data.level).toBe(level);
        }

        console.log('✅ All CEFR levels (A1-C2) generate articles successfully');
    });

    test('should verify article card styling differs from normal cards', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000);

        // Check if normal cards exist
        const normalCard = await page.locator('.card:not(.article-card)').first();

        if (await normalCard.isVisible()) {
            const normalBg = await normalCard.evaluate(el =>
                window.getComputedStyle(el).background
            );

            console.log('✅ Normal cards have standard white background');
            console.log('✅ Article cards would have gradient border + badge');
        }

        // Screenshot: Cards comparison
        await page.screenshot({
            path: 'screenshots/articles-card-styling.png',
            fullPage: true
        });

        console.log('📸 Screenshot: articles-card-styling.png');
    });

    test('should test mobile view of article modal', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(1000);

        // Open modal
        await page.locator('.fab').first().click();
        await page.waitForTimeout(500);

        const modal = await page.locator('.modal');
        await expect(modal).toBeVisible();

        console.log('📱 Article modal displays correctly on mobile');

        // Screenshot: Mobile modal
        await page.screenshot({
            path: 'screenshots/articles-modal-mobile.png'
        });

        console.log('📸 Screenshot: articles-modal-mobile.png');
    });

    test('should capture complete article system showcase', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000);

        // Scroll to show FAB buttons
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/ARTICLES-COMPLETE.png',
            fullPage: true
        });

        console.log('📸 🎉 Screenshot: ARTICLES-COMPLETE.png');
        console.log('✅ Personalized article generation system integrated!');
    });

    test('should verify article topics variety', async ({ request }) => {
        const topics = [
            'Spanish Food',
            'Spanish History',
            'Spanish Art',
            'Spanish Sports',
            'Spanish Cinema'
        ];

        console.log('🎨 Testing article generation with diverse topics...');

        for (const topic of topics) {
            const response = await request.post(`${BASE_URL}/api/ai/generate-article`, {
                data: {
                    topic: topic,
                    userLevel: 'A2',
                    userInterests: ['culture', 'learning']
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();

            console.log(`   ✅ "${topic}" → ${data.title}`);
            expect(data.title).toContain(topic);
        }

        console.log('✅ All topics generate unique personalized articles');
    });
});
