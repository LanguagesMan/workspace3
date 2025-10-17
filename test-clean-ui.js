const { chromium } = require('playwright');

(async () => {
    console.log('🎯 TESTING CLEAN UI - NO SPAM\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    // Screenshot 1: Initial clean state
    await page.screenshot({ path: 'screenshots/clean-ui-1-initial.png', fullPage: false });
    console.log('📸 Screenshot 1: Initial clean state');

    // Check for spam and improvements
    const uiCheck = await page.evaluate(() => {
        return {
            // Spam check
            hasMilestoneModal: !!document.querySelector('.milestone-modal'),
            hasQuizPrompt: !!document.querySelector('.video-quiz-prompt'),
            tooEasyVisible: window.getComputedStyle(document.querySelector('.too-easy-btn') || document.body).display !== 'none',

            // Stats bar check
            statsBar: {
                hasLevel: !!document.querySelector('#levelBadge'),
                hasStreak: !!document.querySelector('#streakDisplay'),
                hasXP: !!document.querySelector('#xpDisplay'),
                hasVideos: !!document.querySelector('#videosDisplay'),
                levelText: document.querySelector('#levelBadge')?.textContent,
                streakText: document.querySelector('#streakDisplay')?.textContent,
                xpText: document.querySelector('#xpDisplay')?.textContent,
                videosText: document.querySelector('#videosDisplay')?.textContent
            },

            // Focus words check
            focusWords: {
                count: document.querySelectorAll('.focus-word').length,
                words: Array.from(document.querySelectorAll('.focus-word')).map(el => el.textContent),
                hasClickHandler: !!document.querySelector('.focus-word')?.onclick
            },

            // Delete button check
            hasDeleteButton: !!document.querySelector('.delete-btn'),
            hasMoreButton: !!document.querySelector('.more-btn')
        };
    });

    console.log('\n✅ UI CHECK RESULTS:');
    console.log('═'.repeat(60));
    console.log('SPAM REMOVAL:');
    console.log('  - Milestone modal:', uiCheck.hasMilestoneModal ? '❌ STILL THERE' : '✅ Removed');
    console.log('  - Quiz prompt:', uiCheck.hasQuizPrompt ? '❌ STILL THERE' : '✅ Removed');
    console.log('  - Too Easy button:', uiCheck.tooEasyVisible ? '❌ VISIBLE' : '✅ Hidden');

    console.log('\nSTATS BAR (Top):');
    console.log('  - Level badge:', uiCheck.statsBar.hasLevel ? `✅ ${uiCheck.statsBar.levelText}` : '❌ Missing');
    console.log('  - Streak:', uiCheck.statsBar.hasStreak ? `✅ 🔥${uiCheck.statsBar.streakText}` : '❌ Missing');
    console.log('  - XP:', uiCheck.statsBar.hasXP ? `✅ ⭐${uiCheck.statsBar.xpText}` : '❌ Missing');
    console.log('  - Videos:', uiCheck.statsBar.hasVideos ? `✅ 📹${uiCheck.statsBar.videosText}` : '❌ Missing');

    console.log('\nFOCUS WORDS (Bottom):');
    console.log('  - Count:', uiCheck.focusWords.count);
    console.log('  - Words:', uiCheck.focusWords.words.join(', '));
    console.log('  - Clickable:', uiCheck.focusWords.hasClickHandler ? '✅ Yes' : '❌ No');

    console.log('\nBUTTONS:');
    console.log('  - Delete exposed:', uiCheck.hasDeleteButton ? '✅ Yes' : '❌ No');
    console.log('  - More button (should be removed):', uiCheck.hasMoreButton ? '❌ Still there' : '✅ Removed');
    console.log('═'.repeat(60));

    // Try clicking a focus word
    await page.waitForTimeout(3000);
    console.log('\n🖱️  Clicking first focus word...');

    try {
        await page.click('.focus-word');
        await page.waitForTimeout(3500); // Wait for translation to show and reset

        await page.screenshot({ path: 'screenshots/clean-ui-2-word-clicked.png', fullPage: false });
        console.log('📸 Screenshot 2: After clicking focus word');
    } catch (e) {
        console.log('⚠️  Could not click focus word:', e.message);
    }

    // Wait for potential spam popups
    console.log('\n⏳ Waiting 8 seconds to see if any spam appears...');
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'screenshots/clean-ui-3-no-spam.png', fullPage: false });
    console.log('📸 Screenshot 3: After 8 seconds (checking for spam)');

    // Check if any modals appeared
    const finalCheck = await page.evaluate(() => {
        const visibleModals = [];
        document.querySelectorAll('.modal, .milestone-modal, [class*="celebration"]').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                visibleModals.push({
                    className: el.className,
                    text: el.innerText?.substring(0, 100)
                });
            }
        });
        return { visibleModals };
    });

    if (finalCheck.visibleModals.length > 0) {
        console.log('\n❌ SPAM DETECTED:');
        finalCheck.visibleModals.forEach(modal => {
            console.log(`  - ${modal.className}: "${modal.text}"`);
        });
    } else {
        console.log('\n✅ NO SPAM DETECTED - UI IS CLEAN!');
    }

    console.log('\n═'.repeat(60));
    console.log('✅ TEST COMPLETE');
    console.log('📸 Screenshots: screenshots/clean-ui-*.png');
    console.log('═'.repeat(60));

    await page.waitForTimeout(3000);
    await browser.close();
})();
