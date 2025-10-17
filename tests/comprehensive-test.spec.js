const { test, expect } = require('@playwright/test');

test.describe('🧪 COMPREHENSIVE WORKSPACE3 TEST SUITE', () => {

  test('1. TEST MAIN FEED - apple-feed.html', async ({ page }) => {
    console.log('\n📍 TESTING: Main Feed (apple-feed.html)');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Header
    const header = await page.locator('.header').count();
    console.log(`✓ Header present: ${header > 0 ? 'YES' : 'NO'}`);

    // Stats bar
    const statsBar = await page.locator('.stats-bar').count();
    console.log(`✓ Stats bar: ${statsBar > 0 ? 'YES' : 'NO'}`);

    const wordsCount = await page.locator('#wordsLearned').textContent();
    const streakCount = await page.locator('#streakDays').textContent();
    console.log(`  - Words: ${wordsCount}`);
    console.log(`  - Streak: ${streakCount} days`);

    // Cards
    const cards = await page.locator('.card').count();
    console.log(`✓ Feed cards loaded: ${cards}`);

    // TTS Players
    const audioPlayers = await page.locator('.audio-player').count();
    console.log(`✓ TTS audio players: ${audioPlayers}`);

    // Spanish words clickable
    const spanishWords = await page.locator('.spanish-word').count();
    console.log(`✓ Clickable Spanish words: ${spanishWords}`);

    // FAB buttons
    const fabButtons = await page.locator('.fab').count();
    console.log(`✓ FAB buttons: ${fabButtons}`);

    // Screenshot
    await page.screenshot({ path: 'screenshots/TEST-main-feed.png', fullPage: true });
    console.log('📸 Screenshot: TEST-main-feed.png');
  });

  test('2. TEST WORD CLICKING & SAVING', async ({ page }) => {
    console.log('\n📍 TESTING: Word Click & Save Functionality');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Get initial word count
    const initialCount = await page.locator('#wordsLearned').textContent();
    console.log(`✓ Initial word count: ${initialCount}`);

    // Click a Spanish word
    const firstWord = page.locator('.spanish-word').first();
    const wordText = await firstWord.textContent();
    console.log(`✓ Clicking word: "${wordText}"`);

    await firstWord.click();
    await page.waitForTimeout(2500); // Wait for animations

    // Check if word was marked as saved
    const hasSavedClass = await firstWord.evaluate(el => el.classList.contains('saved'));
    console.log(`${hasSavedClass ? '✅' : '❌'} Word marked as saved: ${hasSavedClass ? 'YES' : 'NO'}`);

    // Check if word count increased
    const newCount = await page.locator('#wordsLearned').textContent();
    console.log(`✓ New word count: ${newCount}`);

    // Screenshot after click
    await page.screenshot({ path: 'screenshots/TEST-word-saved.png' });
    console.log('📸 Screenshot: TEST-word-saved.png');
  });

  test('3. TEST SRS REVIEW PAGE', async ({ page }) => {
    console.log('\n📍 TESTING: SRS Review (srs-review.html)');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/srs-review.html');
    await page.waitForTimeout(2000);

    // Check page elements
    const header = await page.locator('.header').count();
    console.log(`✓ Header: ${header > 0 ? 'YES' : 'NO'}`);

    const reviewCard = await page.locator('#reviewCard').count();
    console.log(`✓ Review card: ${reviewCard > 0 ? 'YES' : 'NO'}`);

    // Check for quality buttons
    const qualityButtons = await page.locator('.quality-btn').count();
    console.log(`✓ Quality rating buttons: ${qualityButtons}`);

    // Check stats
    const statsDisplay = await page.locator('.stats-display').count();
    console.log(`✓ Stats display: ${statsDisplay > 0 ? 'YES' : 'NO'}`);

    // Screenshot
    await page.screenshot({ path: 'screenshots/TEST-srs-review.png', fullPage: true });
    console.log('📸 Screenshot: TEST-srs-review.png');
  });

  test('4. TEST ACHIEVEMENTS PAGE', async ({ page }) => {
    console.log('\n📍 TESTING: Achievements (achievements.html)');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/achievements.html');
    await page.waitForTimeout(2000);

    // Check XP/Level display
    const levelDisplay = await page.locator('.level-display').count();
    console.log(`✓ Level display: ${levelDisplay > 0 ? 'YES' : 'NO'}`);

    // Check streak
    const streakSection = await page.locator('.streak-section').count();
    console.log(`✓ Streak section: ${streakSection > 0 ? 'YES' : 'NO'}`);

    // Check achievements grid
    const achievementCards = await page.locator('.achievement-card').count();
    console.log(`✓ Achievement cards: ${achievementCards}`);

    // Check daily goals
    const dailyGoals = await page.locator('.daily-goal').count();
    console.log(`✓ Daily goals: ${dailyGoals}`);

    // Screenshot
    await page.screenshot({ path: 'screenshots/TEST-achievements.png', fullPage: true });
    console.log('📸 Screenshot: TEST-achievements.png');
  });

  test('5. TEST FAB BUTTONS NAVIGATION', async ({ page }) => {
    console.log('\n📍 TESTING: FAB Button Navigation');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Test Achievements FAB (🏆)
    console.log('Testing 🏆 Achievements button...');
    const achievementsBtn = page.locator('.fab').filter({ hasText: '🏆' });
    const achievementsBtnExists = await achievementsBtn.count() > 0;
    console.log(`${achievementsBtnExists ? '✅' : '❌'} Achievements FAB: ${achievementsBtnExists ? 'FOUND' : 'MISSING'}`);

    if (achievementsBtnExists) {
      await achievementsBtn.click();
      await page.waitForTimeout(1500);
      const currentUrl = page.url();
      console.log(`  → Navigated to: ${currentUrl.includes('achievements') ? '✅ achievements.html' : '❌ WRONG PAGE'}`);
      await page.goBack();
      await page.waitForTimeout(1000);
    }

    // Test SRS FAB (🧠)
    console.log('Testing 🧠 SRS Review button...');
    const srsBtn = page.locator('.fab').filter({ hasText: '🧠' });
    const srsBtnExists = await srsBtn.count() > 0;
    console.log(`${srsBtnExists ? '✅' : '❌'} SRS FAB: ${srsBtnExists ? 'FOUND' : 'MISSING'}`);

    // Test Saved Words FAB (🌍)
    console.log('Testing 🌍 Saved Words button...');
    const savedWordsBtn = page.locator('.fab').filter({ hasText: '🌍' });
    const savedWordsBtnExists = await savedWordsBtn.count() > 0;
    console.log(`${savedWordsBtnExists ? '✅' : '❌'} Saved Words FAB: ${savedWordsBtnExists ? 'FOUND' : 'MISSING'}`);

    // Screenshot
    await page.screenshot({ path: 'screenshots/TEST-fab-buttons.png' });
    console.log('📸 Screenshot: TEST-fab-buttons.png');
  });

  test('6. TEST API ENDPOINTS', async ({ page }) => {
    console.log('\n📍 TESTING: API Endpoints');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');

    // Test Spanish Frequency API
    const frequencyData = await page.evaluate(async () => {
      const res = await fetch('/api/spanish/frequency');
      return await res.json();
    });
    console.log(`${frequencyData.success ? '✅' : '❌'} Spanish Frequency API: ${frequencyData.count || 0} words`);

    // Test Spanish Gossip API
    const gossipData = await page.evaluate(async () => {
      const res = await fetch('/api/spanish/gossip');
      return await res.json();
    });
    console.log(`${gossipData.success ? '✅' : '❌'} Spanish Gossip API: ${gossipData.count || 0} items`);

    // Test Gamification API
    const gamificationData = await page.evaluate(async () => {
      const res = await fetch('/api/gamification/stats?userId=default');
      return await res.json();
    });
    console.log(`${gamificationData.success ? '✅' : '❌'} Gamification API: Level ${gamificationData.user?.level || '?'}, ${gamificationData.user?.xp || 0} XP`);

    // Test SRS API
    const srsData = await page.evaluate(async () => {
      const res = await fetch('/api/srs/stats?userId=default');
      return await res.json();
    });
    console.log(`${srsData.success ? '✅' : '❌'} SRS API: ${srsData.totalCards || 0} cards`);
  });

  test('7. TEST RESPONSIVE DESIGN', async ({ page }) => {
    console.log('\n📍 TESTING: Responsive Design');
    console.log('='.repeat(60));

    // Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/TEST-mobile-responsive.png', fullPage: false });
    console.log('✅ Mobile (390x844) - Screenshot captured');

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/TEST-tablet-responsive.png', fullPage: false });
    console.log('✅ Tablet (768x1024) - Screenshot captured');

    // Desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/TEST-desktop-responsive.png', fullPage: false });
    console.log('✅ Desktop (1200x800) - Screenshot captured');
  });

});
