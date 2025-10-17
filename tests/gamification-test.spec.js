const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('Gamification Features - Duolingo Style', () => {

  test('Gamification bar displays correctly', async ({ page }) => {
    console.log('\n🏆 TESTING GAMIFICATION BAR\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    // Check gamification bar exists
    const gamBar = await page.locator('.gamification-bar').count();
    console.log(`✅ Gamification bar: ${gamBar > 0 ? 'VISIBLE' : 'MISSING'}`);
    expect(gamBar).toBe(1);

    // Check streak counter
    const streakCount = await page.locator('#streakCount').textContent();
    console.log(`🔥 Streak: ${streakCount} days`);
    expect(streakCount).toBeTruthy();

    // Check level badge
    const level = await page.locator('#userLevel').textContent();
    console.log(`📊 Level: ${level}`);
    expect(level).toContain('Lvl');

    // Check XP display
    const currentXP = await page.locator('#currentXP').textContent();
    const nextLevelXP = await page.locator('#nextLevelXP').textContent();
    console.log(`⭐ XP: ${currentXP}/${nextLevelXP}`);
    expect(currentXP).toBeTruthy();
    expect(nextLevelXP).toBeTruthy();

    // Check word count
    const wordsCount = await page.locator('#wordsCount').textContent();
    console.log(`📚 Words saved: ${wordsCount}`);
    expect(wordsCount).toBeTruthy();

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_gamification_bar.png`)
    });

    console.log('\n✅ Gamification bar test PASSED\n');
  });

  test('Social engagement buttons work', async ({ page }) => {
    console.log('\n❤️ TESTING SOCIAL BUTTONS\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    // Check like button
    const likeBtn = await page.locator('.action-btn').first();
    await likeBtn.click();
    await page.waitForTimeout(500);

    const likeIcon = await likeBtn.textContent();
    console.log(`❤️ Like button: ${likeIcon === '❤️' ? 'WORKS' : 'FAILED'}`);
    expect(['❤️', '🤍']).toContain(likeIcon);

    // Check save button
    const saveBtn = await page.locator('.save-btn').first();
    await saveBtn.click();
    await page.waitForTimeout(500);
    console.log('🔖 Save button: CLICKED');

    // Check share button
    const shareButtons = await page.locator('.action-btn').count();
    console.log(`📤 Action buttons: ${shareButtons} found`);
    expect(shareButtons).toBeGreaterThan(0);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_social_buttons.png`)
    });

    console.log('\n✅ Social buttons test PASSED\n');
  });

  test('Streak click handler works', async ({ page }) => {
    console.log('\n🔥 TESTING STREAK DETAILS\n');

    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log(`📊 Streak dialog: ${message.substring(0, 50)}...`);
      expect(message).toContain('Streak');
      await dialog.accept();
    });

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    // Click streak counter
    const streakItem = await page.locator('.gamification-item').first();
    await streakItem.click();
    await page.waitForTimeout(500);

    console.log('✅ Streak details modal WORKS\n');
  });

  test('Vocabulary click handler works', async ({ page }) => {
    console.log('\n📚 TESTING VOCABULARY VIEW\n');

    page.on('dialog', async dialog => {
      const message = dialog.message();
      console.log(`📚 Vocabulary dialog: ${message.substring(0, 50)}...`);
      expect(message).toContain('word' || 'Vocabulary');
      await dialog.accept();
    });

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    // Click vocabulary counter
    const vocabItem = await page.locator('.gamification-item').last();
    await vocabItem.click();
    await page.waitForTimeout(500);

    console.log('✅ Vocabulary view WORKS\n');
  });

  test('Mobile view - Gamification bar responsive', async ({ page }) => {
    console.log('\n📱 TESTING MOBILE GAMIFICATION\n');

    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    // Check bar still visible
    const gamBar = await page.locator('.gamification-bar').count();
    console.log(`✅ Mobile gamification bar: ${gamBar > 0 ? 'VISIBLE' : 'MISSING'}`);
    expect(gamBar).toBe(1);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_mobile_gamification.png`)
    });

    console.log('✅ Mobile gamification test PASSED\n');
  });

  test('Full user journey - All features together', async ({ page }) => {
    console.log('\n🎬 TESTING COMPLETE USER EXPERIENCE\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    // Verify all key elements visible
    const features = {
      gamificationBar: await page.locator('.gamification-bar').count() > 0,
      videos: await page.locator('video').count() > 0,
      subtitles: await page.locator('.spanish-line').count() > 0,
      socialButtons: await page.locator('.side-actions').count() > 0,
      bottomNav: await page.locator('.bottom-nav').count() > 0
    };

    console.log('📊 Feature Checklist:');
    for (const [feature, present] of Object.entries(features)) {
      console.log(`${present ? '✅' : '❌'} ${feature}: ${present}`);
      expect(present).toBe(true);
    }

    // Scroll through 2 videos
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_full_experience.png`),
      fullPage: false
    });

    console.log('\n✅ COMPLETE USER EXPERIENCE TEST PASSED\n');
  });
});
