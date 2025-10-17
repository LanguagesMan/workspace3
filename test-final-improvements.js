const { chromium } = require('playwright');

(async () => {
    console.log('🎯 TESTING FINAL IMPROVEMENTS\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    // Screenshot 1: Initial state
    await page.screenshot({ path: 'screenshots/final-1-initial.png', fullPage: false });
    console.log('📸 Screenshot 1: Initial load');

    // Check for improvements
    const improvements = await page.evaluate(() => {
        return {
            hasFocusWords: !!document.querySelector('.focus-words'),
            focusWordsCount: document.querySelectorAll('.focus-word').length,
            focusWordsText: Array.from(document.querySelectorAll('.focus-word')).map(el => el.textContent),
            hasDeleteButton: !!document.querySelector('.delete-btn'),
            hasMoreButton: !!document.querySelector('.more-btn'),
            hasTooEasyButton: !!document.querySelector('.too-easy-btn'),
            tooEasyVisible: window.getComputedStyle(document.querySelector('.too-easy-btn') || document.body).display !== 'none',
            hasQuizPrompt: !!document.querySelector('.video-quiz-prompt'),
            transcriptionText: document.querySelector('.spanish-line')?.textContent || 'NONE'
        };
    });

    console.log('\n✅ IMPROVEMENTS CHECK:');
    console.log('═'.repeat(60));
    console.log('Focus Words Feature:');
    console.log('  - Has focus words div:', improvements.hasFocusWords ? '✅' : '❌');
    console.log('  - Focus words count:', improvements.focusWordsCount);
    console.log('  - Words:', improvements.focusWordsText.join(', ') || 'NONE');
    console.log('\nDelete Button:');
    console.log('  - Has delete button (exposed):', improvements.hasDeleteButton ? '✅' : '❌');
    console.log('  - Has 3-dot "More" button (should be removed):', improvements.hasMoreButton ? '❌' : '✅');
    console.log('\nSpam Removed:');
    console.log('  - "Too Easy" button visible:', improvements.tooEasyVisible ? '❌ SPAM!' : '✅ Hidden');
    console.log('  - Has quiz prompt element:', improvements.hasQuizPrompt ? '❌ SPAM!' : '✅ Removed');
    console.log('\nTranscription:', improvements.transcriptionText);
    console.log('═'.repeat(60));

    // Wait for video interaction
    await page.waitForTimeout(5000);

    // Screenshot 2: After interaction
    await page.screenshot({ path: 'screenshots/final-2-interaction.png', fullPage: false });
    console.log('\n📸 Screenshot 2: After 5 seconds');

    // Scroll to next video
    await page.evaluate(() => {
        const cards = document.querySelectorAll('.video-card');
        if (cards[1]) {
            cards[1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    await page.waitForTimeout(3000);

    // Screenshot 3: Second video
    await page.screenshot({ path: 'screenshots/final-3-second-video.png', fullPage: false });
    console.log('📸 Screenshot 3: Second video');

    // Check second video
    const secondVideo = await page.evaluate(() => {
        return {
            focusWordsText: Array.from(document.querySelectorAll('.focus-word')).map(el => el.textContent),
            spanish: document.querySelector('.spanish-line')?.textContent || 'NONE',
            english: document.querySelector('.english-line')?.textContent || 'NONE'
        };
    });

    console.log('\n📹 SECOND VIDEO:');
    console.log('  Focus words:', secondVideo.focusWordsText.join(', '));
    console.log('  Spanish:', secondVideo.spanish);
    console.log('  English:', secondVideo.english);

    console.log('\n═'.repeat(60));
    console.log('✅ TEST COMPLETE');
    console.log('📸 Screenshots saved to screenshots/final-*.png');
    console.log('═'.repeat(60));

    await page.waitForTimeout(3000);
    await browser.close();
})();
