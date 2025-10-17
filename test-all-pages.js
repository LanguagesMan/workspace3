const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots/comprehensive-test');
const reportPath = path.join(__dirname, 'COMPREHENSIVE_TEST_REPORT.md');

// Ensure directories exist
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

const pages = [
    { name: 'Home', url: '/', critical: true },
    { name: 'TikTok Video Feed', url: '/tiktok-video-feed.html', critical: true },
    { name: 'Langflix', url: '/langflix-app.html', critical: true },
    { name: 'Premium', url: '/premium.html', critical: true },
    { name: 'AI Discover', url: '/discover-ai-feed.html', critical: false },
    { name: 'Sign In', url: '/sign-in.html', critical: false },
    { name: 'Sign Up', url: '/sign-up.html', critical: false },
    { name: 'Test Re-encoded Video', url: '/test-reencoded-video.html', critical: true }
];

const globalReport = {
    timestamp: new Date().toISOString(),
    pages: [],
    summary: { total: 0, passed: 0, failed: 0, critical_failures: 0 }
};

(async () => {
    console.log('🧪 Starting comprehensive app test...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    for (const pageInfo of pages) {
        const pageReport = {
            name: pageInfo.name,
            url: pageInfo.url,
            critical: pageInfo.critical,
            status: 'unknown',
            errors: [],
            consoleErrors: [],
            networkErrors: [],
            loadTime: 0,
            screenshot: null
        };

        try {
            console.log(`📄 Testing: ${pageInfo.name} (${pageInfo.url})`);

            // Collect console messages
            const consoleMessages = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleMessages.push(msg.text());
                }
            });

            // Collect network errors
            const networkErrors = [];
            page.on('requestfailed', request => {
                networkErrors.push({
                    url: request.url(),
                    failure: request.failure()?.errorText || 'Unknown'
                });
            });

            // Navigate
            const startTime = Date.now();
            try {
                await page.goto(`http://localhost:3001${pageInfo.url}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000
                });
                pageReport.loadTime = Date.now() - startTime;
                console.log(`  ⏱️  Load time: ${pageReport.loadTime}ms`);
            } catch (navError) {
                pageReport.errors.push(`Navigation failed: ${navError.message}`);
                throw navError;
            }

            // Wait for content
            await page.waitForTimeout(3000);

            // Take screenshot
            const screenshotName = `${pageInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
            const screenshotPath = path.join(screenshotsDir, screenshotName);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            pageReport.screenshot = screenshotName;
            console.log(`  📸 Screenshot: ${screenshotName}`);

            // Check for body element
            const hasBody = await page.$('body') !== null;
            if (!hasBody) {
                pageReport.errors.push('No body element found');
            }

            // Page-specific tests
            if (pageInfo.url === '/tiktok-video-feed.html') {
                const videoCards = await page.$$('.video-card');
                const videos = await page.$$('video');
                console.log(`  📹 Video cards: ${videoCards.length}, Video elements: ${videos.length}`);

                if (videos.length === 0) {
                    pageReport.errors.push('No video elements found');
                }

                // Check for video errors
                for (let i = 0; i < Math.min(videos.length, 3); i++) {
                    const errorCode = await videos[i].evaluate(v => v.error?.code);
                    const errorMessage = await videos[i].evaluate(v => v.error?.message);
                    if (errorCode) {
                        pageReport.errors.push(`Video ${i}: Error ${errorCode} - ${errorMessage}`);
                    }
                }
            }

            if (pageInfo.url === '/test-reencoded-video.html') {
                await page.waitForTimeout(2000);
                const status = await page.textContent('#status');
                console.log(`  🎬 Re-encoded video status: ${status}`);

                if (status && status.includes('RE-ENCODED VIDEO WORKS')) {
                    console.log(`  ✅ Re-encoded video playback confirmed`);
                } else if (status && status.includes('FAILED')) {
                    pageReport.errors.push('Re-encoded video failed to load');
                }
            }

            // Record errors
            pageReport.consoleErrors = consoleMessages.slice(0, 10); // Limit to 10
            pageReport.networkErrors = networkErrors.slice(0, 10); // Limit to 10

            if (consoleMessages.length > 0) {
                console.log(`  ⚠️  Console errors: ${consoleMessages.length}`);
            }
            if (networkErrors.length > 0) {
                console.log(`  ⚠️  Network errors: ${networkErrors.length}`);
            }

            // Determine status
            const hasErrors = pageReport.errors.length > 0 || consoleMessages.length > 0;
            if (!hasErrors) {
                pageReport.status = 'passed';
                console.log(`  ✅ PASSED\n`);
            } else if (pageInfo.critical) {
                pageReport.status = 'critical_failure';
                console.log(`  🚨 CRITICAL FAILURE\n`);
            } else {
                pageReport.status = 'failed';
                console.log(`  ❌ FAILED\n`);
            }

        } catch (error) {
            pageReport.status = 'error';
            pageReport.errors.push(error.message);
            console.log(`  💥 ERROR: ${error.message}\n`);
        }

        globalReport.pages.push(pageReport);
        globalReport.summary.total++;

        if (pageReport.status === 'passed') globalReport.summary.passed++;
        else if (pageReport.status === 'critical_failure') {
            globalReport.summary.failed++;
            globalReport.summary.critical_failures++;
        } else {
            globalReport.summary.failed++;
        }
    }

    await browser.close();

    // Generate report
    let report = `# 🧪 Comprehensive App Test Report\n\n`;
    report += `**Generated**: ${globalReport.timestamp}\n\n`;
    report += `## 📊 Summary\n\n`;
    report += `- **Total Pages**: ${globalReport.summary.total}\n`;
    report += `- **Passed**: ✅ ${globalReport.summary.passed}\n`;
    report += `- **Failed**: ❌ ${globalReport.summary.failed}\n`;
    report += `- **Critical Failures**: 🚨 ${globalReport.summary.critical_failures}\n\n`;

    // Critical failures
    const criticalFailures = globalReport.pages.filter(p => p.status === 'critical_failure');
    if (criticalFailures.length > 0) {
        report += `## 🚨 CRITICAL FAILURES (Must Fix Immediately)\n\n`;
        for (const page of criticalFailures) {
            report += `### ${page.name} - \`${page.url}\`\n`;
            report += `- **Load Time**: ${page.loadTime}ms\n`;
            report += `- **Screenshot**: \`screenshots/comprehensive-test/${page.screenshot}\`\n\n`;

            if (page.errors.length > 0) {
                report += `**Errors**:\n`;
                page.errors.forEach(err => report += `- ❌ ${err}\n`);
                report += `\n`;
            }

            if (page.consoleErrors.length > 0) {
                report += `**Console Errors**:\n\`\`\`\n`;
                page.consoleErrors.slice(0, 5).forEach(err => report += `${err}\n`);
                if (page.consoleErrors.length > 5) report += `... and ${page.consoleErrors.length - 5} more\n`;
                report += `\`\`\`\n\n`;
            }

            if (page.networkErrors.length > 0) {
                report += `**Network Errors**:\n`;
                page.networkErrors.slice(0, 5).forEach(err => {
                    report += `- ${err.url.substring(0, 80)}: ${err.failure}\n`;
                });
                if (page.networkErrors.length > 5) report += `- ... and ${page.networkErrors.length - 5} more\n`;
                report += `\n`;
            }
        }
    }

    // Other failures
    const otherFailures = globalReport.pages.filter(p => p.status === 'failed' || p.status === 'error');
    if (otherFailures.length > 0) {
        report += `## ❌ Other Failures\n\n`;
        for (const page of otherFailures) {
            report += `### ${page.name}\n`;
            report += `- **URL**: ${page.url}\n`;
            report += `- **Errors**: ${page.errors.length} console, ${page.consoleErrors.length} network\n`;
            report += `- **Screenshot**: \`screenshots/comprehensive-test/${page.screenshot}\`\n\n`;
        }
    }

    // Passed pages
    const passed = globalReport.pages.filter(p => p.status === 'passed');
    if (passed.length > 0) {
        report += `## ✅ Passed Pages\n\n`;
        passed.forEach(page => report += `- **${page.name}** (${page.loadTime}ms)\n`);
        report += `\n`;
    }

    // Performance
    report += `## ⏱️  Performance Analysis\n\n`;
    const slowPages = globalReport.pages.filter(p => p.loadTime > 3000).sort((a, b) => b.loadTime - a.loadTime);
    if (slowPages.length > 0) {
        report += `**Slow Pages** (>3s):\n`;
        slowPages.forEach(page => report += `- ${page.name}: ${page.loadTime}ms\n`);
    } else {
        report += `All pages load in <3s ✅\n`;
    }

    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved: ${reportPath}`);
    console.log(`📸 Screenshots saved: ${screenshotsDir}`);
    console.log(`\n📊 Final Summary:`);
    console.log(`   ✅ Passed: ${globalReport.summary.passed}/${globalReport.summary.total}`);
    console.log(`   ❌ Failed: ${globalReport.summary.failed}`);
    console.log(`   🚨 Critical: ${globalReport.summary.critical_failures}`);
})();
