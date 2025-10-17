const { chromium } = require('playwright');

(async () => {
    console.log('🔍 FINDING VISIBLE MODAL\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    const modals = await page.evaluate(() => {
        const allModals = document.querySelectorAll('.modal, [class*="modal"]');
        const results = [];

        allModals.forEach((modal, i) => {
            const style = window.getComputedStyle(modal);
            const isVisible = style.display !== 'none';

            results.push({
                index: i,
                className: modal.className,
                id: modal.id,
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                zIndex: style.zIndex,
                isVisible: isVisible,
                innerHTML: isVisible ? modal.innerHTML.substring(0, 200) : ''
            });
        });

        return results;
    });

    console.log(`Found ${modals.length} total modal elements:\n`);
    modals.forEach(modal => {
        console.log(`Modal ${modal.index}: ${modal.className || modal.id}`);
        console.log(`  Display: ${modal.display}`);
        console.log(`  Visible: ${modal.isVisible ? '✅ YES' : '❌ NO'}`);
        if (modal.isVisible) {
            console.log(`  Content: ${modal.innerHTML}`);
        }
        console.log('');
    });

    await page.screenshot({ path: 'screenshots/modal-debug.png' });
    await browser.close();
})();
