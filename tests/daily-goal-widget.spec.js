const { test, expect } = require('@playwright/test');

test.describe('🎯 DAILY GOAL WIDGET TEST', () => {

  test('Test daily goal widget with progress tracking', async ({ page }) => {
    console.log('\n🎯 TESTING DAILY GOAL WIDGET');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(2000);

    // Check if daily goal widget exists
    const widget = page.locator('#dailyGoalWidget');
    const widgetExists = await widget.count() > 0;
    console.log(`✓ Daily Goal Widget: ${widgetExists ? '✅ EXISTS' : '❌ MISSING'}`);

    // Check initial state
    const initialText = await page.locator('#goalProgressText').textContent();
    console.log(`✓ Initial progress: ${initialText}`);

    const initialEmoji = await page.locator('#goalEmoji').textContent();
    console.log(`✓ Initial emoji: ${initialEmoji}`);

    // Screenshot initial state
    await page.screenshot({ path: 'screenshots/DAILY-GOAL-initial.png', fullPage: true });
    console.log('📸 Screenshot: DAILY-GOAL-initial.png');

    // Save some words to update progress
    console.log('\n📝 Saving words to update goal progress...');
    const words = await page.locator('.spanish-word').all();

    for (let i = 0; i < Math.min(5, words.length); i++) {
      const wordText = await words[i].textContent();
      console.log(`  ${i + 1}. Saving: "${wordText}"`);

      await words[i].click();
      await page.waitForTimeout(2500);

      // Check progress update
      const progressText = await page.locator('#goalProgressText').textContent();
      const emoji = await page.locator('#goalEmoji').textContent();
      console.log(`     → Progress: ${progressText}, Emoji: ${emoji}`);
    }

    // Screenshot after saving words
    await page.screenshot({ path: 'screenshots/DAILY-GOAL-progress.png', fullPage: true });
    console.log('\n📸 Screenshot: DAILY-GOAL-progress.png');

    // Check progress bar width
    const progressBarWidth = await page.locator('#goalProgressBar').evaluate(el => {
      return el.style.width;
    });
    console.log(`\n✓ Progress bar width: ${progressBarWidth}`);

    // Mobile view
    console.log('\n📱 Testing mobile view...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3002/apple-feed.html');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: 'screenshots/DAILY-GOAL-mobile.png', fullPage: false });
    console.log('📸 Screenshot: DAILY-GOAL-mobile.png');

    console.log('\n🎉 DAILY GOAL WIDGET TEST COMPLETE!');
    console.log('='.repeat(60));
  });

});
