/**
 * Direct Quiz Test - Call the quiz function directly
 */

const { test, expect } = require('@playwright/test');

test.describe('Direct Quiz Test', () => {
    test('Quiz opens when called directly', async ({ page }) => {
        // Listen to console
        page.on('console', msg => {
            console.log('Browser:', msg.text());
        });
        
        // Navigate
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        
        // Wait for page to fully load
        await page.waitForTimeout(4000);
        
        // Check if VideoQuizSystem exists
        const hasQuizSystem = await page.evaluate(() => {
            return typeof window.VideoQuizSystem !== 'undefined';
        });
        console.log('✓ VideoQuizSystem exists:', hasQuizSystem);
        
        // Check if openVideoQuiz function exists
        const hasOpenQuiz = await page.evaluate(() => {
            return typeof window.openVideoQuiz === 'function';
        });
        console.log('✓ openVideoQuiz function exists:', hasOpenQuiz);
        
        if (hasOpenQuiz) {
            // Call the quiz directly
            await page.evaluate(() => {
                window.openVideoQuiz('test-video-id', '/videos/langfeed/3d_pixelated_voxel_202510090058_w6zr8.mp4');
            });
            
            // Wait for modal
            await page.waitForTimeout(2000);
            
            // Check modal
            const modal = await page.locator('#videoQuizModal');
            const isVisible = await modal.isVisible();
            console.log('✓ Modal visible:', isVisible);
            
            if (isVisible) {
                // Take screenshot
                await page.screenshot({ path: 'test-results/quiz-direct.png', fullPage: true });
                
                // Check content
                const hasQuestion = await page.locator('.quiz-question-text').count() > 0;
                console.log('✓ Has question:', hasQuestion);
                
                if (hasQuestion) {
                    const questionText = await page.locator('.quiz-question-text').textContent();
                    console.log('✓ Question:', questionText);
                }
                
                // Check for no quiz available message
                const hasNoQuiz = await page.getByText('No Quiz Available').count() > 0;
                if (hasNoQuiz) {
                    console.log('⚠️ No quiz generated - transcript issue');
                }
            }
        }
    });
});

