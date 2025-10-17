const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🌍 Testing Globe AI Character System...');

    // Navigate to demo
    await page.goto('http://localhost:3001/globe-ai-demo.html');
    await page.waitForTimeout(1500);

    // Screenshot 1: Initial state
    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/globe-ai-character/01-initial-character-moods.png',
        fullPage: false
    });
    console.log('✅ Screenshot 1: Initial character moods');

    // Click "Learn Word" button multiple times to test 30% trigger rate
    await page.click('button:has-text("Learn Word")');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/globe-ai-character/02-first-celebration.png',
        fullPage: false
    });
    console.log('✅ Screenshot 2: First celebration (maybe)');

    // Click more times
    for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("Learn Word")');
        await page.waitForTimeout(300);
    }

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/globe-ai-character/03-multiple-interactions.png',
        fullPage: false
    });
    console.log('✅ Screenshot 3: After multiple interactions');

    // Test streak milestone
    await page.click('button:has-text("Streak Milestone")');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/globe-ai-character/04-streak-celebration.png',
        fullPage: false
    });
    console.log('✅ Screenshot 4: Streak celebration');

    // Test level up (always celebrates)
    await page.click('button:has-text("Level Up")');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/globe-ai-character/05-level-up-celebration.png',
        fullPage: false
    });
    console.log('✅ Screenshot 5: Level up celebration');

    // Get stats
    const stats = await page.evaluate(() => {
        return {
            totalInteractions: document.getElementById('totalInteractions').textContent,
            celebrationCount: document.getElementById('celebrationCount').textContent,
            triggerRate: document.getElementById('triggerRate').textContent
        };
    });

    console.log('\n📊 GLOBE AI STATISTICS:');
    console.log(`   Total Interactions: ${stats.totalInteractions}`);
    console.log(`   Celebrations Triggered: ${stats.celebrationCount}`);
    console.log(`   Actual Trigger Rate: ${stats.triggerRate} (Target: 30%)`);

    // Final screenshot with stats
    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/globe-ai-character/06-final-stats.png',
        fullPage: false
    });
    console.log('✅ Screenshot 6: Final statistics');

    await browser.close();
    console.log('\n✅ Globe AI testing complete!');
    console.log('📸 Screenshots saved to: /Users/mindful/_projects/workspace3/screenshots/globe-ai-character/');
})();
