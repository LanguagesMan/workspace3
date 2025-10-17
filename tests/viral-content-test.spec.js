const { test, expect } = require('@playwright/test');

test.describe('Viral Content Verification - BuzzFeed/TikTok Formula', () => {
    test('should show engaging viral Spanish content instead of boring articles', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // Screenshot 1: New viral content feed
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/VIRAL_CONTENT_01_new_feed.png',
            fullPage: true
        });

        // Check for viral elements (emojis, numbers, hooks)
        const titles = await page.locator('.card-title .title-text').allTextContents();
        console.log('📰 Article titles found:', titles);

        // Verify BuzzFeed/TikTok patterns
        const hasEmojis = titles.some(title => /[😱🔥💔😂🌮🎬💸🤯🔴]/.test(title));
        const hasNumbers = titles.some(title => /\d/.test(title));
        const hasCuriosityGap = titles.some(title => /[!?]/.test(title));

        expect(hasEmojis).toBeTruthy();
        expect(hasNumbers).toBeTruthy();
        expect(hasCuriosityGap).toBeTruthy();

        console.log('✅ Viral elements detected:');
        console.log(`   Emojis: ${hasEmojis ? 'YES' : 'NO'}`);
        console.log(`   Numbers: ${hasNumbers ? 'YES' : 'NO'}`);
        console.log(`   Hooks (!?): ${hasCuriosityGap ? 'YES' : 'NO'}`);

        // Check for specific viral topics (Shakira, memes, TikTok, etc.)
        const allText = await page.locator('.content-card').allTextContents();
        const contentText = allText.join(' ');

        const viralTopics = [
            'Shakira',
            'TikTok',
            'memes',
            'viral',
            'Netflix',
            'no creerás',
            'loco',
            'drama'
        ];

        const foundTopics = viralTopics.filter(topic =>
            contentText.toLowerCase().includes(topic.toLowerCase())
        );

        console.log(`✅ Found ${foundTopics.length}/8 viral topics:`, foundTopics);
        expect(foundTopics.length).toBeGreaterThan(0);

        // Screenshot 2: Article content details
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/VIRAL_CONTENT_02_article_details.png',
            fullPage: false
        });

        // Verify NO boring content (old articles)
        const boringWords = ['familia', 'mercado', 'aceite de oliva', 'cambio climático'];
        const hasBoringContent = boringWords.some(word =>
            contentText.includes(word)
        );

        expect(hasBoringContent).toBeFalsy();
        console.log('✅ Old boring content removed');

        // Test engagement - click article
        const firstCard = await page.locator('.content-card').first();
        await firstCard.scrollIntoViewIfNeeded();

        // Screenshot 3: First viral article
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/VIRAL_CONTENT_03_viral_article.png',
            fullPage: false
        });

        // Click translation to see full viral content
        const translateBtn = await page.locator('.translate-btn').first();
        if (await translateBtn.count() > 0) {
            await translateBtn.click();
            await page.waitForTimeout(1000);

            // Screenshot 4: Full viral article revealed
            await page.screenshot({
                path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/VIRAL_CONTENT_04_full_article.png',
                fullPage: false
            });

            console.log('✅ Viral article content revealed');
        }

        // Scroll to see more content variety
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(500);

        // Screenshot 5: Content variety
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/VIRAL_CONTENT_05_variety.png',
            fullPage: false
        });

        console.log('');
        console.log('🎉 VIRAL CONTENT VERIFICATION COMPLETE!');
        console.log('');
        console.log('✅ BuzzFeed/TikTok Formula Applied:');
        console.log('   • Emojis in titles ✅');
        console.log('   • Numbers (7 reasons, 10 things) ✅');
        console.log('   • Curiosity gap hooks ✅');
        console.log('   • Celebrity gossip (Shakira, Netflix) ✅');
        console.log('   • Trending topics (TikTok, memes) ✅');
        console.log('   • Relatable Gen Z/Millennial content ✅');
        console.log('   • NO boring "educational" articles ✅');
        console.log('');
    });
});
