const { test, expect } = require('@playwright/test');

test.describe('🔥 UNIFIED DATABASE - End-to-End Killer Feature', () => {
    test('Full flow: Save word → View in Saved Words page → Verify persistence', async ({ page }) => {
        console.log('\n🎯 TESTING UNIFIED DATABASE KILLER FEATURE');
        console.log('This is what destroys competitors - words sync across ALL apps!\n');

        // STEP 1: Go to TikTok reels and save a word
        console.log('📱 STEP 1: Opening TikTok reels...');
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Find and click a Spanish word
        const clickableWord = page.locator('.word-clickable').first();
        await expect(clickableWord).toBeVisible();
        const wordText = await clickableWord.textContent();
        console.log(`   Found word: "${wordText}"`);

        await clickableWord.click();
        await page.waitForSelector('.translation-popup.active', { timeout: 5000 });

        const activePopup = page.locator('.translation-popup.active');
        const translation = await activePopup.locator('.translation-meaning').textContent();
        console.log(`   Translation: ${translation}`);

        // Save the word to unified database
        console.log(`\n💾 STEP 2: Saving "${wordText}" to unified database...`);
        await page.click('.save-flashcard-btn');
        await page.waitForTimeout(1000);

        const feedbackText = await activePopup.locator('.translation-meaning').textContent();
        console.log(`   ${feedbackText}`);
        expect(feedbackText).toContain('Saved to all apps');

        // STEP 2: Navigate to Saved Words page
        console.log(`\n📖 STEP 3: Opening Saved Words page...`);
        await page.click('a[href="/saved-words.html"]');
        await page.waitForURL('**/saved-words.html');
        await page.waitForSelector('.words-grid', { timeout: 5000 });

        // Verify word appears in Saved Words page
        const savedWordCards = page.locator('.word-card');
        const count = await savedWordCards.count();
        console.log(`   Found ${count} saved word(s)`);
        expect(count).toBeGreaterThan(0);

        const firstCard = savedWordCards.first();
        const cardWord = await firstCard.locator('.word-spanish').textContent();
        const cardTranslation = await firstCard.locator('.word-translation').textContent();

        console.log(`   Word in database: "${cardWord}"`);
        console.log(`   Translation: ${cardTranslation}`);

        expect(cardWord).toBe(wordText);

        // STEP 3: Verify via API that word persists
        console.log(`\n🔍 STEP 4: Verifying word persists in database via API...`);
        const response = await page.request.get('http://localhost:3002/api/user/words/demo-user');
        const data = await response.json();

        console.log(`   Database status: ${data.success ? 'Connected ✅' : 'Error ❌'}`);
        console.log(`   Total words: ${data.total}`);
        console.log(`   Words by level:`, data.byLevel);
        console.log(`   Mastered: ${data.mastered}`);

        expect(data.success).toBe(true);
        expect(data.total).toBeGreaterThan(0);

        const savedWords = data.words.map(w => w.word);
        expect(savedWords).toContain(wordText);

        console.log(`\n🎉 SUCCESS! UNIFIED DATABASE WORKING!`);
        console.log(`✅ Word "${wordText}" saved from TikTok reel`);
        console.log(`✅ Word appears in Saved Words page`);
        console.log(`✅ Word persists in unified database`);
        console.log(`\n🔥 KILLER FEATURE: This word now syncs to:`);
        console.log(`   • langame (story learning)`);
        console.log(`   • chatbot (AI conversations)`);
        console.log(`   • rpg-claude (vocabulary games)`);
        console.log(`   • languide (article reading)`);
        console.log(`   • Future: Chrome extension (save from ANY website)`);
    });
});
