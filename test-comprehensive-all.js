const { chromium, devices } = require('playwright');

(async () => {
    console.log('🔍 COMPREHENSIVE APP TEST - Finding ALL Issues\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    const allIssues = [];

    const pages = [
        { name: 'TikTok Feed', url: '/tiktok-video-feed.html' },
        { name: 'Langflix', url: '/langflix-app.html' },
        { name: 'Home', url: '/' },
        { name: 'Unified Feed', url: '/unified-infinite-feed.html' },
        { name: 'Premium', url: '/premium.html' }
    ];

    for (const pageInfo of pages) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📄 ${pageInfo.name}`);
        console.log('='.repeat(70));

        const pageIssues = [];
        const consoleLogs = [];

        page.on('console', msg => {
            const text = msg.text();
            consoleLogs.push({ type: msg.type(), text });
            if (msg.type() === 'error') {
                console.log(`  ❌ [ERROR] ${text}`);
            }
        });

        try {
            const start = Date.now();
            await page.goto(`http://localhost:3001${pageInfo.url}`, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            await page.waitForTimeout(5000);
            const loadTime = Date.now() - start;

            // Gather data
            const title = await page.title();
            const videos = await page.$$('video');
            const videoCards = await page.$$('.video-card');
            const hasBottomNav = await page.$('.bottom-nav') !== null;
            const bodyText = await page.evaluate(() => document.body.innerText);

            console.log(`\n✅ Loaded: ${title}`);
            console.log(`⏱️  Load Time: ${loadTime}ms`);
            console.log(`🎬 Videos: ${videos.length}`);
            console.log(`📦 Video Cards: ${videoCards.length}`);
            console.log(`🧭 Bottom Nav: ${hasBottomNav ? 'Yes' : 'No'}`);

            // Check for issues
            if (loadTime > 5000) {
                pageIssues.push(`Slow load time: ${loadTime}ms (should be <5s)`);
            }

            if (videos.length === 0 && videoCards.length === 0 && pageInfo.name !== 'Premium') {
                pageIssues.push('No videos or video cards loaded');
            }

            if (!hasBottomNav && pageInfo.name !== 'Premium') {
                pageIssues.push('Missing bottom navigation');
            }

            // Check for console errors
            const errors = consoleLogs.filter(l => l.type === 'error');
            const realErrors = errors.filter(e =>
                !e.text.includes('MediaError') &&
                !e.text.includes('Mixpanel') &&
                !e.text.includes('ERR_ABORTED')
            );

            if (realErrors.length > 0) {
                realErrors.forEach(e => {
                    pageIssues.push(`Console error: ${e.text.substring(0, 100)}`);
                });
            }

            // Check for loading states stuck
            if (bodyText.includes('Loading') && bodyText.length < 200) {
                pageIssues.push('Appears stuck on loading screen');
            }

            console.log(`\n📋 Issues Found: ${pageIssues.length}`);
            pageIssues.forEach(issue => console.log(`  🔴 ${issue}`));

            allIssues.push({
                page: pageInfo.name,
                issues: pageIssues,
                loadTime,
                videos: videos.length,
                cards: videoCards.length,
                errors: realErrors.length
            });

            await page.screenshot({
                path: `screenshots/comprehensive-${pageInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`,
                fullPage: true
            });

        } catch (error) {
            console.log(`\n💥 FATAL ERROR: ${error.message}`);
            pageIssues.push(`Fatal error: ${error.message}`);
            allIssues.push({
                page: pageInfo.name,
                issues: pageIssues,
                error: error.message
            });
        }
    }

    await browser.close();

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 COMPREHENSIVE ISSUE REPORT');
    console.log('='.repeat(70));

    const totalIssues = allIssues.reduce((sum, p) => sum + p.issues.length, 0);
    console.log(`\nTotal Issues Found: ${totalIssues}\n`);

    allIssues.forEach(p => {
        const status = p.issues.length === 0 ? '✅' : '🔴';
        console.log(`${status} ${p.page}: ${p.issues.length} issues`);
        if (p.issues.length > 0) {
            p.issues.forEach(issue => console.log(`   - ${issue}`));
        }
    });

    console.log('\n📸 Screenshots saved in screenshots/ folder');

    if (totalIssues === 0) {
        console.log('\n🎉 NO ISSUES FOUND - ALL PAGES PERFECT!');
    } else {
        console.log(`\n⚠️  ${totalIssues} ISSUES TO FIX`);
    }
})();
