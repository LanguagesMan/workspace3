const { test, expect } = require('@playwright/test');

test.describe('✨ ENHANCED SAVED WORDS PANEL TEST', () => {

  test('Test enhanced saved words panel with new features', async ({ page }) => {
    console.log('\n✨ TESTING ENHANCED SAVED WORDS PANEL');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Save some words first
    console.log('📝 Saving 3 Spanish words...');
    const words = await page.locator('.spanish-word').all();
    for (let i = 0; i < Math.min(3, words.length); i++) {
      const wordText = await words[i].textContent();
      console.log(`  ${i + 1}. Saving: "${wordText}"`);
      await words[i].click();
      await page.waitForTimeout(2500);
    }

    // Open saved words panel
    console.log('\n🌍 Opening Saved Words panel...');
    const savedWordsBtn = page.locator('.fab').filter({ hasText: '🌍' });
    await savedWordsBtn.click();
    await page.waitForTimeout(1000);

    // Check if panel is open
    const panel = page.locator('#savedWordsPanel');
    const isOpen = await panel.evaluate(el => el.classList.contains('open'));
    console.log(`  Panel open: ${isOpen ? '✅ YES' : '❌ NO'}`);

    // Check saved word items
    const savedItems = await page.locator('.saved-word-item').count();
    console.log(`  Saved word items: ${savedItems}`);

    // Screenshot with panel open
    await page.screenshot({ path: 'screenshots/ENHANCED-saved-words-panel.png', fullPage: true });
    console.log('📸 Screenshot: ENHANCED-saved-words-panel.png');

    // Check for difficulty badges
    const difficultyBadges = await page.locator('span').filter({ hasText: /Beginner|Intermediate|Advanced/ }).count();
    console.log(`  Difficulty badges: ${difficultyBadges}`);

    // Check for pronunciation buttons
    const pronounceButtons = await page.locator('button').filter({ hasText: '🔊' }).count();
    console.log(`  Pronunciation buttons: ${pronounceButtons}`);

    // Check for copy buttons
    const copyButtons = await page.locator('button').filter({ hasText: '📋' }).count();
    console.log(`  Copy buttons: ${copyButtons}`);

    // Test pronunciation button
    if (pronounceButtons > 0) {
      console.log('\n🔊 Testing pronunciation button...');
      const firstPronounceBtn = page.locator('button').filter({ hasText: '🔊' }).first();
      await firstPronounceBtn.click();
      await page.waitForTimeout(500);
      console.log('  ✅ Pronunciation button clicked');
    }

    // Test copy button
    if (copyButtons > 0) {
      console.log('\n📋 Testing copy button...');
      const firstCopyBtn = page.locator('button').filter({ hasText: '📋' }).first();
      await firstCopyBtn.click();
      await page.waitForTimeout(500);
      console.log('  ✅ Copy button clicked');
    }

    // Screenshot after interactions
    await page.screenshot({ path: 'screenshots/ENHANCED-panel-interactions.png', fullPage: true });
    console.log('📸 Screenshot: ENHANCED-panel-interactions.png');

    // Close panel
    console.log('\n❌ Closing panel...');
    const closeBtn = page.locator('.panel-close');
    await closeBtn.click();
    await page.waitForTimeout(500);
    const isClosed = await panel.evaluate(el => !el.classList.contains('open'));
    console.log(`  Panel closed: ${isClosed ? '✅ YES' : '❌ NO'}`);

    // Mobile view
    console.log('\n📱 Testing mobile view...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);

    // Open panel on mobile
    const savedWordsBtnMobile = page.locator('.fab').filter({ hasText: '🌍' });
    await savedWordsBtnMobile.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'screenshots/ENHANCED-mobile-saved-words.png', fullPage: false });
    console.log('📸 Screenshot: ENHANCED-mobile-saved-words.png');

    console.log('\n🎉 ENHANCED FEATURES TEST COMPLETE!');
    console.log('='.repeat(60));
  });

});
