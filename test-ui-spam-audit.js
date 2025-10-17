const { chromium } = require('playwright');

(async () => {
    console.log('🔍 UI SPAM AUDIT - Finding all design problems\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ ERROR:', msg.text());
        }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    console.log('⏳ Waiting 2 seconds for initial load...');
    await page.waitForTimeout(2000);

    // Screenshot 1: Initial load
    await page.screenshot({ path: 'screenshots/spam-audit-1-initial.png', fullPage: false });
    console.log('📸 Screenshot 1: Initial load state');

    // Check for all visible UI elements
    const uiElements = await page.evaluate(() => {
        const getVisibleElements = (selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }).map(el => ({
                selector: selector,
                text: el.innerText?.substring(0, 100) || '',
                zIndex: window.getComputedStyle(el).zIndex,
                position: {
                    top: el.getBoundingClientRect().top,
                    left: el.getBoundingClientRect().left,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                }
            }));
        };

        return {
            modals: getVisibleElements('.modal, .popup, [class*="modal"], [class*="popup"]'),
            badges: getVisibleElements('.badge, [class*="badge"]'),
            notifications: getVisibleElements('.notification, .toast, [class*="notification"]'),
            levelUps: getVisibleElements('[class*="level"], [class*="achievement"]'),
            buttons: getVisibleElements('button:not(.bottom-nav button)'),
            overlays: getVisibleElements('.overlay, [class*="overlay"]'),
            allVisibleText: document.body.innerText.substring(0, 1000)
        };
    });

    console.log('\n🔍 VISIBLE UI ELEMENTS:');
    console.log('═'.repeat(70));
    console.log('Modals/Popups:', uiElements.modals.length);
    uiElements.modals.forEach((el, i) => {
        console.log(`  ${i + 1}. ${el.text} (z-index: ${el.zIndex})`);
    });
    console.log('Badges:', uiElements.badges.length);
    console.log('Notifications:', uiElements.notifications.length);
    console.log('Level-up elements:', uiElements.levelUps.length);
    console.log('Buttons (non-nav):', uiElements.buttons.length);
    console.log('Overlays:', uiElements.overlays.length);

    // Wait and see if any popups appear
    console.log('\n⏳ Waiting 5 seconds to see if popups appear...');
    await page.waitForTimeout(5000);

    // Screenshot 2: After waiting
    await page.screenshot({ path: 'screenshots/spam-audit-2-after-wait.png', fullPage: false });
    console.log('📸 Screenshot 2: After 5 seconds (checking for popups)');

    // Check what appeared
    const afterWait = await page.evaluate(() => {
        const isVisible = (el) => {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        };

        return {
            hasGoalCompletePopup: Array.from(document.querySelectorAll('*')).some(el =>
                el.innerText?.includes('Goal Complete') && isVisible(el)
            ),
            hasLevelUpPopup: Array.from(document.querySelectorAll('*')).some(el =>
                el.innerText?.includes('Level Up') && isVisible(el)
            ),
            hasTestYourselfPopup: Array.from(document.querySelectorAll('*')).some(el =>
                (el.innerText?.includes('Test yourself') || el.innerText?.includes('Quiz')) && isVisible(el)
            ),
            hasMilestonePopup: Array.from(document.querySelectorAll('*')).some(el =>
                el.innerText?.includes('Milestone') && isVisible(el)
            ),
            bodyText: document.body.innerText.substring(0, 1500)
        };
    });

    console.log('\n⚠️  SPAM POPUPS DETECTED:');
    console.log('═'.repeat(70));
    if (afterWait.hasGoalCompletePopup) console.log('❌ "Goal Complete" popup found');
    if (afterWait.hasLevelUpPopup) console.log('❌ "Level Up" popup found');
    if (afterWait.hasTestYourselfPopup) console.log('❌ "Test yourself" popup found');
    if (afterWait.hasMilestonePopup) console.log('❌ "Milestone" popup found');

    // Try to play video and interact
    await page.evaluate(() => {
        const video = document.querySelector('video');
        if (video && video.readyState >= 2) {
            video.currentTime = 2;
            video.play().catch(() => {});
        }
    });

    console.log('\n⏳ Playing video for 8 seconds...');
    await page.waitForTimeout(8000);

    // Screenshot 3: After video playback
    await page.screenshot({ path: 'screenshots/spam-audit-3-after-video.png', fullPage: false });
    console.log('📸 Screenshot 3: After video playback');

    // Check for more popups
    const afterVideo = await page.evaluate(() => {
        const visiblePopups = [];
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                if (el.innerText?.includes('Test yourself') ||
                    el.innerText?.includes('Quiz') ||
                    el.innerText?.includes('Level Up') ||
                    el.innerText?.includes('Goal Complete') ||
                    el.innerText?.includes('Milestone')) {
                    visiblePopups.push({
                        text: el.innerText.substring(0, 100),
                        className: el.className,
                        zIndex: style.zIndex
                    });
                }
            }
        });

        // Check for button overlaps
        const buttons = Array.from(document.querySelectorAll('button:not(.bottom-nav button)'));
        const overlaps = [];
        for (let i = 0; i < buttons.length; i++) {
            for (let j = i + 1; j < buttons.length; j++) {
                const rect1 = buttons[i].getBoundingClientRect();
                const rect2 = buttons[j].getBoundingClientRect();
                const overlap = !(rect1.right < rect2.left ||
                                rect1.left > rect2.right ||
                                rect1.bottom < rect2.top ||
                                rect1.top > rect2.bottom);
                if (overlap) {
                    overlaps.push({
                        button1: buttons[i].innerText?.substring(0, 30),
                        button2: buttons[j].innerText?.substring(0, 30),
                        rect1: { top: rect1.top, left: rect1.left },
                        rect2: { top: rect2.top, left: rect2.left }
                    });
                }
            }
        }

        return {
            visiblePopups,
            overlappingButtons: overlaps,
            transcriptionText: document.querySelector('.spanish-line')?.textContent || 'NONE',
            englishText: document.querySelector('.english-line')?.textContent || 'NONE'
        };
    });

    console.log('\n📊 AFTER VIDEO PLAYBACK:');
    console.log('═'.repeat(70));
    console.log('Visible popups:', afterVideo.visiblePopups.length);
    afterVideo.visiblePopups.forEach((popup, i) => {
        console.log(`  ${i + 1}. "${popup.text}" (z-index: ${popup.zIndex})`);
    });
    console.log('\nOverlapping buttons:', afterVideo.overlappingButtons.length);
    afterVideo.overlappingButtons.forEach((overlap, i) => {
        console.log(`  ${i + 1}. "${overlap.button1}" overlaps "${overlap.button2}"`);
    });
    console.log('\nTranscription:');
    console.log('  Spanish:', afterVideo.transcriptionText);
    console.log('  English:', afterVideo.englishText);

    // Scroll to next video
    await page.evaluate(() => {
        const cards = document.querySelectorAll('.video-card');
        if (cards[1]) {
            cards[1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    await page.waitForTimeout(3000);

    // Screenshot 4: Second video
    await page.screenshot({ path: 'screenshots/spam-audit-4-second-video.png', fullPage: false });
    console.log('📸 Screenshot 4: Second video');

    console.log('\n═'.repeat(70));
    console.log('✅ SPAM AUDIT COMPLETE');
    console.log('📸 Screenshots saved to screenshots/spam-audit-*.png');
    console.log('═'.repeat(70));

    await page.waitForTimeout(3000);
    await browser.close();
})();
