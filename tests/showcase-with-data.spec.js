const { test, expect } = require('@playwright/test');

test.describe('🎨 WORKSPACE3 SHOWCASE WITH DATA', () => {

  test('Create sample data and showcase all features', async ({ page }) => {
    console.log('\n🎬 CREATING SAMPLE DATA FOR SHOWCASE');
    console.log('='.repeat(60));

    // 1. Go to main feed and save some words
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    console.log('📝 Saving 5 Spanish words...');
    const words = await page.locator('.spanish-word').all();
    for (let i = 0; i < Math.min(5, words.length); i++) {
      const wordText = await words[i].textContent();
      console.log(`  ${i + 1}. Clicking "${wordText}"`);
      await words[i].click();
      await page.waitForTimeout(2500); // Wait for save animation
    }

    await page.screenshot({ path: 'screenshots/SHOWCASE-feed-with-saved-words.png', fullPage: true });
    console.log('📸 Screenshot: SHOWCASE-feed-with-saved-words.png');

    // 2. Check SRS now has cards
    const srsData = await page.evaluate(async () => {
      const res = await fetch('/api/srs/all-cards?userId=default');
      return await res.json();
    });
    console.log(`\n✅ SRS System now has ${srsData.count || 0} cards`);

    // 3. Go to SRS Review page
    console.log('\n🧠 Opening SRS Review page...');
    await page.goto('http://localhost:3002/srs-review.html');
    await page.waitForTimeout(2000);

    // Check if review card is now showing
    const hasReviewCard = await page.locator('.review-card').count() > 0;
    const hasEmptyState = await page.locator('.empty-state').count() > 0;

    console.log(`  Review card visible: ${hasReviewCard ? '✅ YES' : '❌ NO'}`);
    console.log(`  Empty state showing: ${hasEmptyState ? 'YES' : 'NO'}`);

    await page.screenshot({ path: 'screenshots/SHOWCASE-srs-review-with-cards.png', fullPage: true });
    console.log('📸 Screenshot: SHOWCASE-srs-review-with-cards.png');

    // 4. Go to Achievements page
    console.log('\n🏆 Opening Achievements page...');
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(2000);

    const gamificationData = await page.evaluate(async () => {
      const res = await fetch('/api/gamification/stats?userId=default');
      return await res.json();
    });

    console.log(`  Level: ${gamificationData.user?.level || '?'}`);
    console.log(`  XP: ${gamificationData.user?.xp || 0}`);
    console.log(`  Streak: ${gamificationData.user?.streak?.current || 0} days`);
    console.log(`  Achievements Unlocked: ${gamificationData.user?.achievementCount || 0}/${gamificationData.totalAchievements || 13}`);

    await page.screenshot({ path: 'screenshots/SHOWCASE-achievements-with-progress.png', fullPage: true });
    console.log('📸 Screenshot: SHOWCASE-achievements-with-progress.png');

    // 5. Mobile showcase
    console.log('\n📱 Creating mobile showcase...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/SHOWCASE-mobile-complete.png', fullPage: false });
    console.log('📸 Screenshot: SHOWCASE-mobile-complete.png');

    console.log('\n🎉 SHOWCASE COMPLETE!');
    console.log('='.repeat(60));
  });

});
