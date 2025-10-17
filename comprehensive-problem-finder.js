const { chromium } = require('playwright');

(async () => {
    console.log('🔍 COMPREHENSIVE PROBLEM FINDER\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Track all issues
    const issues = [];

    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Screenshot 1: Initial load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/problem-1-initial.png' });
    console.log('📸 Screenshot 1: Initial load');

    // Check for blocking modals/popups
    const blockingElements = await page.evaluate(() => {
        const results = [];

        // Find all fixed/absolute elements
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if ((style.position === 'fixed' || style.position === 'absolute') &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                parseInt(style.zIndex) > 100) {

                const rect = el.getBoundingClientRect();
                if (rect.width > 300 && rect.height > 200) { // Large blocking elements
                    results.push({
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        text: el.textContent.substring(0, 100),
                        zIndex: style.zIndex,
                        size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
                    });
                }
            }
        });

        return results;
    });

    if (blockingElements.length > 0) {
        console.log('\n⚠️ BLOCKING ELEMENTS FOUND:');
        blockingElements.forEach(el => {
            console.log(`  - ${el.tag}.${el.class || el.id}`);
            console.log(`    Size: ${el.size}, Z-Index: ${el.zIndex}`);
            console.log(`    Text: "${el.text}"`);
            issues.push(`Blocking element: ${el.class || el.id} - ${el.text.substring(0, 50)}`);
        });
    }

    // Wait for video to load
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/problem-2-after-load.png' });
    console.log('📸 Screenshot 2: After video loads');

    // Check for duplicate UI elements
    const duplicates = await page.evaluate(() => {
        const results = {
            questionMarks: document.querySelectorAll('button:not([style*="display: none"])').length,
            questionMarkElements: [],
            cyanElements: [],
            topBars: [],
            statsBoxes: []
        };

        // Find all question marks
        document.querySelectorAll('*').forEach(el => {
            if (el.textContent.trim() === '?' && el.offsetParent !== null) {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                results.questionMarkElements.push({
                    tag: el.tagName,
                    position: `${Math.round(rect.x)}, ${Math.round(rect.y)}`,
                    background: style.background.substring(0, 50),
                    color: style.color
                });
            }
        });

        // Find cyan colored elements
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.background.includes('00F5FF') ||
                style.background.includes('00D9FF') ||
                style.background.includes('cyan') ||
                style.color.includes('00F5FF')) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    results.cyanElements.push({
                        tag: el.tagName,
                        class: el.className,
                        position: `${Math.round(rect.x)}, ${Math.round(rect.y)}`,
                        background: style.background.substring(0, 50),
                        color: style.color
                    });
                }
            }
        });

        // Find top bars
        document.querySelectorAll('[class*="stats"], [class*="top-bar"]').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.y < 100 && rect.width > 200) {
                results.topBars.push({
                    class: el.className,
                    id: el.id,
                    text: el.textContent.substring(0, 100)
                });
            }
        });

        return results;
    });

    console.log('\n🔍 DUPLICATE/PROBLEM ELEMENTS:');
    console.log(`  Question marks found: ${duplicates.questionMarkElements.length}`);
    duplicates.questionMarkElements.forEach((qm, i) => {
        console.log(`    ${i + 1}. ${qm.tag} at ${qm.position}, bg: ${qm.background}`);
        if (i > 0) issues.push(`Duplicate question mark #${i + 1} at ${qm.position}`);
    });

    console.log(`  Cyan elements found: ${duplicates.cyanElements.length}`);
    duplicates.cyanElements.forEach((cy, i) => {
        console.log(`    ${i + 1}. ${cy.tag}.${cy.class} at ${cy.position}`);
        issues.push(`Cyan element: ${cy.class} at ${cy.position}`);
    });

    console.log(`  Top bars found: ${duplicates.topBars.length}`);
    duplicates.topBars.forEach((bar, i) => {
        console.log(`    ${i + 1}. ${bar.class || bar.id}`);
        if (i > 0) issues.push(`Duplicate top bar: ${bar.class}`);
    });

    // Test word click
    await page.waitForTimeout(2000);
    const wordClickWorks = await page.evaluate(() => {
        const word = document.querySelector('.focus-word');
        if (word) {
            word.click();
            // Check if anything happened
            return true;
        }
        return false;
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/problem-3-after-word-click.png' });
    console.log('📸 Screenshot 3: After clicking word');

    // Final screenshot
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/problem-4-final-state.png' });
    console.log('📸 Screenshot 4: Final state');

    console.log('\n📋 ISSUES SUMMARY:');
    console.log('='.repeat(70));
    if (issues.length === 0) {
        console.log('✅ No issues found!');
    } else {
        issues.forEach((issue, i) => {
            console.log(`${i + 1}. ${issue}`);
        });
    }

    console.log('\n📸 All screenshots saved in screenshots/ folder');
    console.log('Review them to identify all visual problems');

    await browser.close();
})();
