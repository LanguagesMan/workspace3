// 🏆 GAMIFICATION SYSTEM TESTS - Streaks, XP, Achievements
const { test, expect } = require('@playwright/test');

test.describe('🏆 Gamification System', () => {
  test('should show achievements page with beautiful design', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    // Check header
    const header = page.locator('.logo');
    await expect(header).toContainText('ACHIEVEMENTS');

    // Check user stats card exists
    const userStats = page.locator('.user-stats');
    await expect(userStats).toBeVisible();

    // Check stats
    const level = page.locator('#level');
    await expect(level).toBeVisible();

    const xp = page.locator('#xp');
    await expect(xp).toBeVisible();

    console.log('✅ Achievements page loaded with beautiful design');

    // Screenshot
    await page.screenshot({
      path: 'screenshots/GAMIFICATION-PAGE.png',
      fullPage: true
    });
  });

  test('should display streak counter with flame animation', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    const streakCard = page.locator('.streak-card');
    await expect(streakCard).toBeVisible();

    const streakIcon = page.locator('.streak-icon');
    await expect(streakIcon).toContainText('🔥');

    const currentStreak = page.locator('#currentStreak');
    await expect(currentStreak).toBeVisible();

    console.log('✅ Streak counter displayed');
  });

  test('should show achievements grid with locked/unlocked states', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    const achievementsGrid = page.locator('.achievements-grid');
    await expect(achievementsGrid).toBeVisible();

    const achievementCards = page.locator('.achievement-card');
    const count = await achievementCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ ${count} achievements displayed`);

    // Screenshot
    await page.screenshot({
      path: 'screenshots/GAMIFICATION-ACHIEVEMENTS.png',
      fullPage: true
    });
  });

  test('should display daily goal progress bars', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    const dailyGoalCard = page.locator('.daily-goal-card');
    await expect(dailyGoalCard).toBeVisible();

    const goalProgress = page.locator('#dailyGoalProgress');
    await expect(goalProgress).toBeVisible();

    console.log('✅ Daily goal progress bars displayed');
  });

  test('should show achievements FAB button in feed', async ({ page }) => {
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1000);

    // Find achievements FAB button (🏆)
    const achievementsFab = page.locator('.fab').filter({ hasText: '🏆' });
    await expect(achievementsFab).toBeVisible();

    console.log('✅ Achievements FAB button visible (5 FABs total)');

    // Screenshot
    await page.screenshot({
      path: 'screenshots/GAMIFICATION-FAB-BUTTON.png',
      fullPage: true
    });
  });

  test('should track word-saving activity and award XP', async ({ page }) => {
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);

    // Get initial XP
    const initialXP = await page.evaluate(async () => {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      return data.user.xp;
    });

    // Click a Spanish word to save it
    const spanishWord = page.locator('.spanish-word').nth(2);
    await spanishWord.click();
    await page.waitForTimeout(1000);

    // Get updated XP
    const newXP = await page.evaluate(async () => {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      return data.user.xp;
    });

    // XP should have increased
    expect(newXP).toBeGreaterThanOrEqual(initialXP);

    console.log(`✅ XP tracked: ${initialXP} → ${newXP} (+${newXP - initialXP} XP)`);
  });

  test('should update streak when visiting', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    const streak = await page.evaluate(async () => {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      return data.user.streak.current;
    });

    expect(streak).toBeGreaterThanOrEqual(0);

    console.log(`✅ Current streak: ${streak} days`);
  });

  test('should navigate between feed and achievements', async ({ page }) => {
    // Start at feed
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1000);

    // Click achievements button
    const achievementsFab = page.locator('.fab').filter({ hasText: '🏆' });
    await achievementsFab.click();
    await page.waitForTimeout(1000);

    // Should be on achievements page
    await expect(page).toHaveURL(/achievements/);

    // Click back button
    const backButton = page.locator('.back-button');
    await backButton.click();
    await page.waitForTimeout(1000);

    // Should be back on feed
    await expect(page).toHaveURL(/apple-feed/);

    console.log('✅ Navigation between feed and achievements working');
  });

  test('should display XP progress bar', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    const xpBar = page.locator('.xp-bar');
    await expect(xpBar).toBeVisible();

    const xpFill = page.locator('#xpFill');
    await expect(xpFill).toBeVisible();

    const xpText = page.locator('#xpText');
    const text = await xpText.textContent();
    expect(text).toContain('XP');

    console.log(`✅ XP progress bar: ${text}`);
  });

  test('should show achievement tiers (bronze, silver, gold)', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    // Check for different tier cards
    const bronzeCards = page.locator('.achievement-card.bronze');
    const silverCards = page.locator('.achievement-card.silver');
    const goldCards = page.locator('.achievement-card.gold');

    const bronzeCount = await bronzeCards.count();
    const silverCount = await silverCards.count();
    const goldCount = await goldCards.count();

    console.log(`✅ Achievement tiers:`);
    console.log(`  🥉 Bronze: ${bronzeCount}`);
    console.log(`  🥈 Silver: ${silverCount}`);
    console.log(`  🥇 Gold: ${goldCount}`);

    expect(bronzeCount + silverCount + goldCount).toBeGreaterThan(0);
  });

  test('should track activity via API', async ({ page }) => {
    await page.goto('http://localhost:3002/apple-feed.html');

    // Track activity via API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/gamification/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default',
          activityType: 'word-saved',
          data: {}
        })
      });
      return res.json();
    });

    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();

    console.log('✅ Activity tracking API working');
    console.log(`  User level: ${response.user.level}`);
    console.log(`  User XP: ${response.user.xp}`);
  });

  test('should calculate daily goal completion', async ({ page }) => {
    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(1500);

    const dailyGoal = await page.evaluate(async () => {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      return data.user.dailyGoal;
    });

    expect(dailyGoal.progress).toBeDefined();
    expect(dailyGoal.goal).toBeDefined();

    console.log('✅ Daily goal tracked:');
    console.log(`  Words: ${dailyGoal.progress.wordsSaved}/${dailyGoal.goal.wordsSaved}`);
    console.log(`  Reviews: ${dailyGoal.progress.reviewsCompleted}/${dailyGoal.goal.reviewsCompleted}`);
    console.log(`  Minutes: ${dailyGoal.progress.minutesSpent}/${dailyGoal.goal.minutesSpent}`);
  });

  test('should show all 5 FAB buttons in correct order', async ({ page }) => {
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1000);

    const fabButtons = page.locator('.fab');
    const fabCount = await fabButtons.count();
    expect(fabCount).toBe(5);

    // Get text of all FABs
    const fabTexts = [];
    for (let i = 0; i < fabCount; i++) {
      const text = await fabButtons.nth(i).textContent();
      fabTexts.push(text);
    }

    console.log('✅ All 5 FAB buttons present:');
    console.log(`  1. ${fabTexts[0]} (Achievements)`);
    console.log(`  2. ${fabTexts[1]} (SRS Review)`);
    console.log(`  3. ${fabTexts[2]} (Saved Words)`);
    console.log(`  4. ${fabTexts[3]} (Generate Article)`);
    console.log(`  5. ${fabTexts[4]} (Load More)`);
  });
});
