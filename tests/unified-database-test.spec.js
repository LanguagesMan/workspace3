const { test, expect } = require('@playwright/test');

test.describe('🔥 UNIFIED DATABASE - Killer Feature Test', () => {
    test('Should save word from TikTok reel to unified database', async ({ page }) => {
        // Navigate to workspace3
        await page.goto('http://localhost:3002');
        
        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 10000 });
        
        // Find a clickable Spanish word
        const clickableWord = page.locator('.word-clickable').first();
        await expect(clickableWord).toBeVisible();
        
        const wordText = await clickableWord.textContent();
        console.log(`\n🎯 Testing word: "${wordText}"`);
        
        // Click the word to show translation popup
        await clickableWord.click();
        
        // Wait for translation popup to appear
        await page.waitForSelector('.translation-popup.active', { timeout: 5000 });

        // Verify popup shows word and translation (select from the ACTIVE popup only)
        const activePopup = page.locator('.translation-popup.active');
        const translationWord = await activePopup.locator('.translation-word').textContent();
        const translationMeaning = await activePopup.locator('.translation-meaning').textContent();
        
        console.log(`✅ Translation popup appeared:`);
        console.log(`   Word: ${translationWord}`);
        console.log(`   Meaning: ${translationMeaning}`);
        
        expect(translationWord).toBe(wordText);
        expect(translationMeaning).toContain('=');
        
        // Click "Save as Flashcard" button
        await page.click('.save-flashcard-btn');
        
        // Wait for success feedback
        await page.waitForTimeout(1000);

        // Check if it shows "Saved to all apps!" (from the ACTIVE popup)
        const feedbackText = await activePopup.locator('.translation-meaning').textContent();
        console.log(`✅ Feedback: ${feedbackText}`);

        expect(feedbackText).toContain('Saved');
        
        // Verify word was saved to database via API
        const response = await page.request.get('http://localhost:3002/api/user/words/demo-user');
        const data = await response.json();
        
        console.log(`\n📊 Database check:`);
        console.log(`   Total words saved: ${data.total}`);
        console.log(`   Words in database:`, data.words.map(w => w.word));
        
        expect(data.success).toBe(true);
        expect(data.total).toBeGreaterThan(0);
        
        // Verify the specific word exists in database
        const savedWords = data.words.map(w => w.word);
        expect(savedWords).toContain(wordText);
        
        console.log(`\n🎉 SUCCESS: Word "${wordText}" is now in unified database!`);
        console.log(`✅ This word will now sync to ALL apps: langame, chatbot, rpg-claude, languide`);
    });
});
