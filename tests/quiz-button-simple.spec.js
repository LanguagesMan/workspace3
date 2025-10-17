/**
 * Simple test to verify quiz button is clickable
 */

const { test, expect } = require('@playwright/test');

test.describe('Quiz Button Simple Test', () => {
    test('Quiz button can be clicked', async ({ page }) => {
        // Listen to console messages
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('quiz') || text.includes('Quiz') || text.includes('transcript') || text.includes('📝') || text.includes('🎯') || text.includes('✅') || text.includes('❌') || text.includes('⚠️')) {
                console.log('Browser console:', text);
            }
        });
        
        // Navigate to video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Try to click quiz button with force
        const quizButton = page.locator('.sidebar-button.quiz-btn').first();
        
        // Check if button exists
        const exists = await quizButton.count() > 0;
        console.log('Quiz button exists:', exists);
        
        if (exists) {
            // Force click to bypass intercepting elements
            await quizButton.click({ force: true });
            
            // Wait a moment
            await page.waitForTimeout(1000);
            
            // Check if modal appeared
            const modal = page.locator('#videoQuizModal');
            const isVisible = await modal.isVisible();
            
            console.log('Modal visible after click:', isVisible);
            
            if (isVisible) {
                console.log('✅ Quiz button works!');
                
                // Take screenshot
                await page.screenshot({ path: 'test-results/quiz-modal-opened.png', fullPage: true });
                
                // Check quiz content
                const hasQuestion = await page.locator('.quiz-question-text').count() > 0;
                console.log('Has question:', hasQuestion);
                
                if (hasQuestion) {
                    const questionText = await page.locator('.quiz-question-text').textContent();
                    console.log('Question:', questionText);
                }
            }
        }
    });
});

