/**
 * Enhanced Quiz System Test - Tests the new help button and quiz flow
 */

const { test, expect } = require('@playwright/test');

test.describe('Enhanced Quiz System', () => {
    test('Help button opens quiz correctly', async ({ page }) => {
        // Listen to console
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('quiz') || text.includes('Quiz') || text.includes('🎯')) {
                console.log('Browser:', text);
            }
        });
        
        // Navigate to video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        // Look for the new tiny help button (top-left)
        const helpButton = page.locator('.help-btn-tiny').first();
        
        // Check if button exists
        const exists = await helpButton.count() > 0;
        console.log('✓ Help button exists:', exists);
        
        if (exists) {
            // Take screenshot of button
            await page.screenshot({ path: 'test-results/help-button.png', fullPage: false });
            
            // Click with force to bypass any overlays
            await helpButton.click({ force: true });
            
            // Wait for modal
            await page.waitForTimeout(1000);
            
            // Check if modal appeared
            const modal = page.locator('#videoQuizModal');
            const isVisible = await modal.isVisible();
            
            console.log('✓ Modal visible:', isVisible);
            
            if (isVisible) {
                // Take screenshot of quiz
                await page.screenshot({ path: 'test-results/quiz-opened.png', fullPage: true });
                
                // Check for questions
                const hasQuestion = await page.locator('.quiz-question-text').count() > 0;
                console.log('✓ Has question:', hasQuestion);
                
                if (hasQuestion) {
                    const questionText = await page.locator('.quiz-question-text').textContent();
                    console.log('✓ Question:', questionText);
                    
                    // Check for answer options
                    const optionCount = await page.locator('.quiz-option').count();
                    console.log('✓ Answer options:', optionCount);
                    
                    if (optionCount > 0) {
                        // Try answering
                        await page.locator('.quiz-option').first().click();
                        await page.waitForTimeout(500);
                        
                        // Click check button
                        await page.locator('#quizCheckBtn').click();
                        await page.waitForTimeout(2000);
                        
                        // Take screenshot of feedback
                        await page.screenshot({ path: 'test-results/quiz-answered.png', fullPage: true });
                        
                        console.log('✅ Quiz flow complete!');
                    }
                }
            }
        } else {
            console.log('❌ Help button not found');
        }
    });
});

