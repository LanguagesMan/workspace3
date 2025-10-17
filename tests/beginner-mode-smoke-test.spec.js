// Beginner Mode Smoke Test
const { test, expect } = require('@playwright/test');

test.describe('Beginner Mode System', () => {
    test('Onboarding page loads successfully', async ({ page }) => {
        await page.goto('http://localhost:3000/beginner-onboarding.html');
        await expect(page).toHaveTitle(/Welcome to Spanish/);
        await expect(page.locator('text=¡Hola!')).toBeVisible();
    });

    test('Beginner dashboard loads successfully', async ({ page }) => {
        await page.goto('http://localhost:3000/beginner-dashboard.html');
        await expect(page).toHaveTitle(/Your Learning Journey/);
        await expect(page.locator('text=Words Known')).toBeVisible();
    });

    test('Beginner API endpoints respond', async ({ request }) => {
        // Test curriculum endpoint
        const curriculum = await request.get('http://localhost:3000/api/beginner/curriculum/1');
        expect(curriculum.ok()).toBeTruthy();
        const curriculumData = await curriculum.json();
        expect(curriculumData.success).toBe(true);
        expect(curriculumData.curriculum.week).toBe(1);

        // Test progress endpoint
        const progress = await request.get('http://localhost:3000/api/beginner/progress/test-user');
        expect(progress.ok()).toBeTruthy();
        const progressData = await progress.json();
        expect(progressData.success).toBe(true);

        // Test next words endpoint
        const nextWords = await request.get('http://localhost:3000/api/beginner/next-words?userId=test-user&count=3');
        expect(nextWords.ok()).toBeTruthy();
        const wordsData = await nextWords.json();
        expect(wordsData.success).toBe(true);
        expect(wordsData.words.length).toBeLessThanOrEqual(3);
    });

    test('Beginner mode integration script loads', async ({ page }) => {
        await page.goto('http://localhost:3000/tiktok-video-feed.html');
        
        // Check if beginner mode integration script loaded
        const scriptLoaded = await page.evaluate(() => {
            return typeof window.beginnerModeIntegration !== 'undefined';
        });
        expect(scriptLoaded).toBeTruthy();
    });

    test('Main feed includes beginner mode script', async ({ page }) => {
        const response = await page.goto('http://localhost:3000/tiktok-video-feed.html');
        expect(response.ok()).toBeTruthy();
        
        const content = await response.text();
        expect(content).toContain('beginner-mode-integration.js');
    });
});

test.describe('Beginner Mode Engine', () => {
    test('Engine detects absolute beginners correctly', async ({ request }) => {
        const response = await request.get('http://localhost:3000/api/beginner/progress/new-user');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.isAbsoluteBeginner).toBe(true);
    });

    test('First 20 words curriculum is available', async ({ request }) => {
        const response = await request.get('http://localhost:3000/api/beginner/curriculum/1');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.curriculum.words.length).toBe(20);
        expect(data.curriculum.title).toContain('First 20');
    });

    test('Graduation check works', async ({ request }) => {
        const response = await request.get('http://localhost:3000/api/beginner/graduate?userId=test-user');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data).toHaveProperty('ready');
        expect(data).toHaveProperty('criteria');
    });
});

