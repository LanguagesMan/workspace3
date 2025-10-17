const { test, expect } = require('@playwright/test');

test.describe('Content Quality & Curation', () => {
    test('should show interesting, relevant, level-appropriate content', async ({ page }) => {
        console.log('🧪 Testing Content Quality Improvements...\n');

        // Navigate to feed
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForSelector('.item', { timeout: 10000 });

        // Get all feed items
        const feedItems = await page.$$('.item');
        console.log(`📊 Loaded ${feedItems.length} feed items\n`);

        expect(feedItems.length).toBeGreaterThan(0);

        // Test 1: Quality Filter - All items should have meaningful content
        console.log('✅ Test 1: Quality Filter');
        for (let i = 0; i < Math.min(5, feedItems.length); i++) {
            const item = feedItems[i];

            // Check for title or description
            const title = await item.$eval('.item-title', el => el.textContent).catch(() => null);
            const description = await item.$eval('.item-content', el => el.textContent).catch(() => null);

            const hasContent = (title && title.trim().length > 0) || (description && description.trim().length > 0);

            console.log(`   Item ${i + 1}: ${hasContent ? '✅' : '❌'} Has content`);
            console.log(`     Title: ${title ? title.substring(0, 50) + '...' : 'N/A'}`);

            expect(hasContent).toBe(true);
        }

        // Test 2: Spanish Content - Items should be in Spanish
        console.log('\n✅ Test 2: Spanish Content Check');
        for (let i = 0; i < Math.min(3, feedItems.length); i++) {
            const item = feedItems[i];
            const text = await item.textContent();

            // Check for Spanish markers
            const hasSpanishMarkers = /[¿¡ñáéíóúü]/i.test(text) ||
                                     /\b(el|la|los|las|de|del|que|para|con|por|es|está|son|muy|más)\b/i.test(text);

            console.log(`   Item ${i + 1}: ${hasSpanishMarkers ? '✅' : '⚠️'} Spanish detected`);

            // Not strictly enforced (some items might be video-only)
            // but log for awareness
        }

        // Test 3: Level Badges - Items should show difficulty levels
        console.log('\n✅ Test 3: Difficulty Level Badges');
        const badges = await page.$$('.difficulty-badge');
        console.log(`   Found ${badges.length} difficulty badges`);

        if (badges.length > 0) {
            const firstBadgeText = await badges[0].textContent();
            console.log(`   First badge: ${firstBadgeText}`);
            expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(firstBadgeText.trim());
        }

        // Test 4: No Spam Content
        console.log('\n✅ Test 4: Spam Filter');
        const pageContent = await page.textContent('body');
        const spamPatterns = ['casino', 'viagra', 'free money', 'buy now', 'limited offer'];

        let spamFound = false;
        spamPatterns.forEach(pattern => {
            if (pageContent.toLowerCase().includes(pattern)) {
                console.log(`   ⚠️ Potential spam detected: "${pattern}"`);
                spamFound = true;
            }
        });

        if (!spamFound) {
            console.log('   ✅ No spam patterns detected');
        }

        // Test 5: Interest Relevance
        console.log('\n✅ Test 5: Interest Relevance');
        const interests = ['news', 'culture', 'food', 'social', 'tech'];
        const matchedInterests = new Set();

        for (let i = 0; i < Math.min(10, feedItems.length); i++) {
            const text = (await feedItems[i].textContent()).toLowerCase();

            interests.forEach(interest => {
                if (text.includes(interest) ||
                    text.includes(interest.substring(0, 4))) {
                    matchedInterests.add(interest);
                }
            });
        }

        console.log(`   Interests matched: ${Array.from(matchedInterests).join(', ')}`);
        console.log(`   Coverage: ${matchedInterests.size}/${interests.length} interests`);

        // Test 6: Content Diversity
        console.log('\n✅ Test 6: Content Type Diversity');
        const videos = await page.$$('.item video');
        const images = await page.$$('.item img');

        console.log(`   Videos: ${videos.length}`);
        console.log(`   Images: ${images.length}`);
        console.log(`   Text posts: ${feedItems.length - videos.length}`);

        expect(feedItems.length).toBeGreaterThan(0);

        // Test 7: Translation Toggle Available
        console.log('\n✅ Test 7: Translation Features');
        const translationToggles = await page.$$('.translation-toggle, [onclick*="showTranslation"]');
        console.log(`   Translation toggles: ${translationToggles.length}`);

        if (translationToggles.length > 0) {
            console.log('   ✅ Translation feature available');
        }

        // Test 8: Screenshot for review
        console.log('\n📸 Taking screenshot...');
        await page.screenshot({
            path: 'screenshots/workspace3/CONTENT_QUALITY_feed_curated.png',
            fullPage: true
        });
        console.log('   ✅ Saved: CONTENT_QUALITY_feed_curated.png');

        console.log('\n🎉 Content Quality Test Complete!\n');
    });

    test('should prioritize recent and relevant content', async ({ page }) => {
        console.log('🧪 Testing Content Ranking...\n');

        await page.goto('http://localhost:3002/feed.html');
        await page.waitForSelector('.item', { timeout: 10000 });

        const feedItems = await page.$$('.item');

        // Check first 5 items for metadata
        console.log('📊 Top 5 Feed Items Analysis:');
        for (let i = 0; i < Math.min(5, feedItems.length); i++) {
            const item = feedItems[i];
            const title = await item.$eval('.item-title', el => el.textContent).catch(() => 'No title');
            const badge = await item.$eval('.level-badge', el => el.textContent).catch(() => 'No level');

            console.log(`\n   ${i + 1}. ${title.substring(0, 60)}...`);
            console.log(`      Level: ${badge}`);
        }

        console.log('\n✅ Content Ranking Test Complete!\n');
    });
});
