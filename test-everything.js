const { chromium, devices } = require('playwright');

(async () => {
    console.log('🔍 COMPREHENSIVE TEST - ALL PAGES\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    const results = [];

    const tests = [
        {
            name: 'TikTok Feed (Instant Load)',
            url: '/tiktok-video-feed.html',
            checks: {
                hasSkeletons: '.video-skeleton',
                hasBottomNav: '.bottom-nav',
                hasVideoContainer: '.video-container'
            }
        },
        {
            name: 'Langflix',
            url: '/langflix-app.html',
            checks: {
                hasBottomNav: '.bottom-nav',
                hasFeedContainer: '.feed-container'
            }
        },
        {
            name: 'Home',
            url: '/',
            checks: {
                hasBottomNav: '.bottom-nav',
                hasVideos: 'video'
            }
        }
    ];

    for (const test of tests) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📄 ${test.name}`);
        console.log('='.repeat(70));

        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        try {
            const start = Date.now();
            await page.goto(`http://localhost:3001${test.url}`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });

            // Wait a bit for JS to execute
            await page.waitForTimeout(2000);

            const loadTime = Date.now() - start;
            const title = await page.title();

            console.log(`\n✅ Loaded: ${title}`);
            console.log(`⏱️  Load Time: ${loadTime}ms`);

            // Run checks
            const checkResults = {};
            for (const [checkName, selector] of Object.entries(test.checks)) {
                const elements = await page.$$(selector);
                checkResults[checkName] = elements.length;
                const status = elements.length > 0 ? '✅' : '❌';
                console.log(`${status} ${checkName}: ${elements.length}`);
            }

            // Check for critical errors
            const criticalErrors = errors.filter(e =>
                !e.includes('MediaError') &&
                !e.includes('Mixpanel') &&
                !e.includes('ERR_ABORTED')
            );

            console.log(`\n📊 Errors: ${errors.length} (${criticalErrors.length} critical)`);
            if (criticalErrors.length > 0) {
                criticalErrors.slice(0, 3).forEach(e => {
                    console.log(`  ❌ ${e.substring(0, 100)}`);
                });
            }

            // Screenshot
            await page.screenshot({
                path: `screenshots/final-check-${test.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`,
                fullPage: false
            });

            results.push({
                name: test.name,
                loadTime,
                checks: checkResults,
                criticalErrors: criticalErrors.length,
                status: criticalErrors.length === 0 ? 'PASS' : 'FAIL'
            });

        } catch (error) {
            console.log(`\n💥 FATAL: ${error.message}`);
            results.push({
                name: test.name,
                status: 'ERROR',
                error: error.message
            });
        }
    }

    await browser.close();

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(70));

    results.forEach(r => {
        const emoji = r.status === 'PASS' ? '✅' : '❌';
        console.log(`\n${emoji} ${r.name}: ${r.status}`);
        if (r.checks) {
            Object.entries(r.checks).forEach(([check, count]) => {
                console.log(`   ${count > 0 ? '✅' : '❌'} ${check}: ${count}`);
            });
        }
        if (r.error) {
            console.log(`   ❌ Error: ${r.error}`);
        }
    });

    const passing = results.filter(r => r.status === 'PASS').length;
    console.log(`\n🎯 RESULT: ${passing}/${results.length} tests passing`);

    if (passing === results.length) {
        console.log('\n🎉 ALL TESTS PASSING!');
    } else {
        console.log('\n⚠️  Some tests need attention');
    }
})();
