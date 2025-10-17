const { chromium } = require('playwright');

(async () => {
    console.log('🔍 ULTRA-COMPREHENSIVE SPAM DETECTOR\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    const spam = [];

    // Capture everything
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('error') || text.includes('Error') || text.includes('❌')) {
            console.log('⚠️', text);
        }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Screenshot 1: Initial
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/spam-1-initial.png' });
    console.log('📸 1: Initial load');

    // Find ALL visible elements
    const allElements = await page.evaluate(() => {
        const results = {
            topElements: [],
            bottomElements: [],
            centerElements: [],
            overlays: [],
            modals: [],
            tooltips: [],
            badges: [],
            statsBoxes: [],
            buttons: []
        };

        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();

            if (style.display === 'none' || style.visibility === 'hidden' ||
                rect.width === 0 || rect.height === 0) {
                return;
            }

            const info = {
                tag: el.tagName,
                class: el.className,
                id: el.id,
                text: el.textContent?.substring(0, 50).trim(),
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
                position: style.position,
                zIndex: style.zIndex,
                background: style.background.substring(0, 50)
            };

            // Top area (y < 150)
            if (rect.y < 150 && rect.width > 100 && el.tagName !== 'VIDEO') {
                results.topElements.push(info);
            }

            // Center overlays
            if ((style.position === 'fixed' || style.position === 'absolute') &&
                rect.width > 200 && rect.height > 100 &&
                parseInt(style.zIndex) > 10) {
                results.overlays.push(info);
            }

            // Modal/popup indicators
            if (el.className.includes('modal') || el.className.includes('popup') ||
                el.className.includes('overlay') || el.className.includes('toast')) {
                results.modals.push(info);
            }

            // Tooltips
            if (el.className.includes('tooltip') || el.className.includes('tip') ||
                el.className.includes('hint')) {
                results.tooltips.push(info);
            }

            // Badges/indicators
            if (el.className.includes('badge') || el.className.includes('indicator')) {
                results.badges.push(info);
            }

            // Stats boxes
            if ((el.className.includes('stat') || el.className.includes('progress') ||
                 el.className.includes('achievement')) && rect.width > 50) {
                results.statsBoxes.push(info);
            }

            // All visible buttons
            if (el.tagName === 'BUTTON' && rect.width > 20) {
                results.buttons.push(info);
            }
        });

        return results;
    });

    console.log('\n📊 SPAM ANALYSIS:');
    console.log('='.repeat(70));

    console.log(`\n🔝 TOP ELEMENTS (${allElements.topElements.length}):`);
    allElements.topElements.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.tag}.${el.class || el.id} at (${el.x}, ${el.y})`);
        console.log(`     Size: ${el.w}x${el.h}, Text: "${el.text}"`);
        if (i > 0 && el.text.includes('streak') || el.text.includes('XP')) {
            spam.push(`Duplicate stat: ${el.text}`);
        }
    });

    console.log(`\n📦 OVERLAYS (${allElements.overlays.length}):`);
    allElements.overlays.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.tag}.${el.class || el.id}`);
        console.log(`     Position: ${el.position}, Z: ${el.zIndex}`);
        console.log(`     Size: ${el.w}x${el.h}, Text: "${el.text}"`);
        if (el.w > 300 && el.h > 300) {
            spam.push(`Blocking overlay: ${el.class}`);
        }
    });

    console.log(`\n🚨 MODALS/POPUPS (${allElements.modals.length}):`);
    allElements.modals.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.class || el.id}`);
        spam.push(`Modal/Popup: ${el.class}`);
    });

    console.log(`\n💬 TOOLTIPS (${allElements.tooltips.length}):`);
    allElements.tooltips.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.class || el.id} - "${el.text}"`);
        spam.push(`Tooltip: ${el.text}`);
    });

    console.log(`\n🏷️ BADGES (${allElements.badges.length}):`);
    allElements.badges.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.class || el.id} - "${el.text}"`);
    });

    console.log(`\n📈 STATS BOXES (${allElements.statsBoxes.length}):`);
    allElements.statsBoxes.forEach((el, i) => {
        console.log(`  ${i+1}. ${el.class || el.id} - "${el.text}"`);
        if (i > 5) spam.push(`Too many stats: ${el.text}`);
    });

    console.log(`\n🔘 BUTTONS (${allElements.buttons.length}):`);
    console.log(`  Total: ${allElements.buttons.length} buttons`);
    const buttonPositions = {};
    allElements.buttons.forEach(btn => {
        const pos = `${btn.x},${btn.y}`;
        buttonPositions[pos] = (buttonPositions[pos] || 0) + 1;
        if (buttonPositions[pos] > 1) {
            spam.push(`Duplicate button at ${pos}: ${btn.text}`);
        }
    });

    // Screenshot 2: After 5 seconds
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/spam-2-after-5sec.png' });
    console.log('\n📸 2: After 5 seconds');

    // Interact with page
    await page.mouse.click(195, 400); // Click video
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/spam-3-after-click.png' });
    console.log('📸 3: After clicking video');

    // Scroll down
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/spam-4-after-scroll.png' });
    console.log('📸 4: After scrolling');

    // Final screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/spam-5-final.png' });
    console.log('📸 5: Final state');

    console.log('\n' + '='.repeat(70));
    console.log('🚨 SPAM ISSUES FOUND:');
    console.log('='.repeat(70));

    if (spam.length === 0) {
        console.log('✅ NO SPAM DETECTED!');
    } else {
        spam.forEach((issue, i) => {
            console.log(`${i+1}. ${issue}`);
        });
    }

    console.log('\n📸 All screenshots saved! Review them for visual spam.');

    await browser.close();
})();
