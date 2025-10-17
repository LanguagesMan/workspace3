const { chromium } = require('playwright');

(async () => {
    console.log('🎨 REAL DESIGN AUDIT - Finding All Problems\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Capture all console messages and errors
    page.on('console', msg => console.log(`[CONSOLE ${msg.type()}]:`, msg.text()));
    page.on('pageerror', error => console.log('💥 ERROR:', error.message));

    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    console.log('⏳ Waiting 5 seconds for page to load...\n');
    await page.waitForTimeout(5000);

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/design-audit-initial.png', fullPage: false });
    console.log('📸 Screenshot 1: Initial load');

    // Wait for video to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/design-audit-after-load.png', fullPage: false });
    console.log('📸 Screenshot 2: After video loads');

    // Check what's actually visible
    const analysis = await page.evaluate(() => {
        const results = {
            topBar: {
                exists: !!document.querySelector('.stats-top-bar'),
                position: window.getComputedStyle(document.querySelector('.stats-top-bar') || document.body).top,
                height: window.getComputedStyle(document.querySelector('.stats-top-bar') || document.body).height,
            },
            leftButtons: [],
            rightButtons: [],
            popups: [],
            overlays: [],
            allVisibleElements: []
        };

        // Find ALL visible elements with position fixed or absolute
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if ((style.position === 'fixed' || style.position === 'absolute') &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0') {

                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    results.allVisibleElements.push({
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        position: style.position,
                        top: style.top,
                        left: style.left,
                        right: style.right,
                        bottom: style.bottom,
                        zIndex: style.zIndex,
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        text: el.textContent?.substring(0, 50) || ''
                    });
                }
            }
        });

        // Check for buttons on left side (x < 100px)
        document.querySelectorAll('button, [role="button"], .button, [class*="btn"]').forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const style = window.getComputedStyle(btn);
            if (style.display !== 'none' && rect.width > 0) {
                const position = {
                    text: btn.textContent?.trim() || btn.getAttribute('aria-label') || 'NO_TEXT',
                    x: Math.round(rect.x),
                    y: Math.round(rect.y),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                    border: style.border,
                    background: style.background,
                    className: btn.className
                };

                if (rect.x < 100) {
                    results.leftButtons.push(position);
                } else if (rect.x > 290) {
                    results.rightButtons.push(position);
                }
            }
        });

        // Check for modals/popups
        document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                results.popups.push({
                    class: el.className,
                    id: el.id,
                    display: style.display,
                    zIndex: style.zIndex
                });
            }
        });

        return results;
    });

    console.log('\n📊 DESIGN ANALYSIS:\n');
    console.log('='.repeat(70));

    console.log('\n🔝 TOP BAR:');
    console.log(`  Position: ${analysis.topBar.position}`);
    console.log(`  Height: ${analysis.topBar.height}`);

    console.log('\n👈 LEFT BUTTONS:');
    if (analysis.leftButtons.length === 0) {
        console.log('  ✅ NONE (Good!)');
    } else {
        analysis.leftButtons.forEach((btn, i) => {
            console.log(`  Button ${i + 1}: "${btn.text}"`);
            console.log(`    Position: x=${btn.x}, y=${btn.y}`);
            console.log(`    Size: ${btn.width}x${btn.height}`);
            console.log(`    Border: ${btn.border}`);
            console.log(`    Background: ${btn.background.substring(0, 50)}`);
        });
    }

    console.log('\n👉 RIGHT BUTTONS:');
    analysis.rightButtons.forEach((btn, i) => {
        console.log(`  Button ${i + 1}: "${btn.text}"`);
        console.log(`    Position: x=${btn.x}, y=${btn.y}`);
        console.log(`    Size: ${btn.width}x${btn.height}`);
    });

    console.log('\n🚨 POPUPS/OVERLAYS:');
    if (analysis.popups.length === 0) {
        console.log('  ✅ NONE (Good!)');
    } else {
        analysis.popups.forEach(popup => {
            console.log(`  ⚠️ ${popup.class || popup.id}`);
            console.log(`    Display: ${popup.display}, Z-Index: ${popup.zIndex}`);
        });
    }

    console.log('\n📍 ALL FIXED/ABSOLUTE ELEMENTS:');
    analysis.allVisibleElements.slice(0, 20).forEach(el => {
        console.log(`  ${el.tag}.${el.class || el.id}`);
        console.log(`    Position: ${el.position}, Top: ${el.top}, Left: ${el.left}, Right: ${el.right}`);
        console.log(`    Size: ${el.width}x${el.height}, Z: ${el.zIndex}`);
        if (el.text.trim()) console.log(`    Text: "${el.text.trim()}"`);
        console.log('');
    });

    console.log('\n' + '='.repeat(70));
    console.log('📸 Screenshots saved:');
    console.log('  - screenshots/design-audit-initial.png');
    console.log('  - screenshots/design-audit-after-load.png');
    console.log('\nPlease review screenshots and report ALL design issues found.');

    await browser.close();
})();
