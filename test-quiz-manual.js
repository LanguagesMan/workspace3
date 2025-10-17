const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot of initial page
    await page.screenshot({ path: 'tests/screenshots/initial-page.png', fullPage: true });
    console.log('✓ Screenshot saved: initial-page.png');

    // Check if quiz cards exist in HTML
    const html = await page.content();
    const hasQuizCard = html.includes('type-quiz') || html.includes('quiz-container');
    console.log('Quiz card in HTML:', hasQuizCard);

    // Get console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Scroll down multiple times
    for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1000);
        console.log(`Scrolled ${i + 1} times`);
    }

    // Take another screenshot
    await page.screenshot({ path: 'tests/screenshots/after-scroll.png', fullPage: true });
    console.log('✓ Screenshot saved: after-scroll.png');

    // Check again
    const htmlAfter = await page.content();
    const hasQuizCardAfter = htmlAfter.includes('type-quiz') || htmlAfter.includes('quiz-container');
    console.log('Quiz card after scroll:', hasQuizCardAfter);

    // Count feed items
    const feedItems = await page.locator('.content-card').count();
    console.log('Total feed items:', feedItems);

    // Check types
    const types = await page.locator('.content-type').allTextContents();
    console.log('Content types found:', types);

    await browser.close();
})();
