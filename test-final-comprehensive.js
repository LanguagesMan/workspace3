const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots/final-test');
const reportPath = path.join(__dirname, 'FINAL_TEST_REPORT.md');

// Ensure directory exists
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test on iPhone 12 (most common mobile device)
const mobileDevice = devices['iPhone 12'];

const pages = [
    { name: 'TikTok Video Feed', url: '/tiktok-video-feed.html', critical: true },
    { name: 'Langflix', url: '/langflix-app.html', critical: true },
    { name: 'Premium', url: '/premium.html', critical: true },
    { name: 'Home', url: '/', critical: true },
    { name: 'Profile', url: '/profile.html', critical: false }
];

const report = {
    timestamp: new Date().toISOString(),
    pages: [],
    summary: { total: 0, passed: 0, failed: 0, critical_failures: 0 }
};

(async () => {
    console.log('🧪 Starting final comprehensive test...\n');
    console.log(`📱 Device: ${mobileDevice.name || 'iPhone 12'} (${mobileDevice.viewport.width}x${mobileDevice.viewport.height})\n`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(mobileDevice);
    const page = await context.newPage();

    for (const pageInfo of pages) {
        console.log(`📄 Testing: ${pageInfo.name}`);

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
            // Collect console errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
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
            await page.goto(`http://localhost:3001${pageInfo.url}`, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            pageReport.loadTime = Date.now() - startTime;

            // Wait for content
            await page.waitForTimeout(3000);

            // Take screenshot
            const screenshotName = `${pageInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
            const screenshotPath = path.join(screenshotsDir, screenshotName);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            pageReport.screenshot = screenshotName;

            console.log(`  📸 Screenshot: ${screenshotName}`);
            console.log(`  ⏱️  Load time: ${pageReport.loadTime}ms`);

            // Check for critical elements
            const hasBody = await page.$('body') !== null;
            if (!hasBody) {
                pageReport.errors.push('No body element found');
            }

            // Page-specific checks
            if (pageInfo.url === '/tiktok-video-feed.html') {
                const videos = await page.$$('video');
                console.log(`  📹 Video elements: ${videos.length}`);
                if (videos.length === 0) {
                    pageReport.errors.push('No video elements found');
                }
            }

            // Record errors
            pageReport.consoleErrors = consoleErrors.slice(0, 5);
            pageReport.networkErrors = networkErrors.slice(0, 5);

            if (consoleErrors.length > 0) {
                console.log(`  ⚠️  Console errors: ${consoleErrors.length}`);
            }
            if (networkErrors.length > 0) {
                console.log(`  ⚠️  Network errors: ${networkErrors.length}`);
            }

            // Determine status
            const hasErrors = pageReport.errors.length > 0 || consoleErrors.length > 3;
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

        report.pages.push(pageReport);
        report.summary.total++;

        if (pageReport.status === 'passed') report.summary.passed++;
        else if (pageReport.status === 'critical_failure') {
            report.summary.failed++;
            report.summary.critical_failures++;
        } else {
            report.summary.failed++;
        }
    }

    await browser.close();

    // Generate report
    let reportText = `# 🎯 FINAL COMPREHENSIVE TEST REPORT\n\n`;
    reportText += `**Generated**: ${report.timestamp}\n`;
    reportText += `**Device**: iPhone 12 (${mobileDevice.viewport.width}x${mobileDevice.viewport.height})\n`;
    reportText += `**Pages Tested**: ${report.summary.total}\n\n`;

    reportText += `## 📊 Summary\n\n`;
    reportText += `- **✅ Passed**: ${report.summary.passed}/${report.summary.total}\n`;
    reportText += `- **❌ Failed**: ${report.summary.failed}\n`;
    reportText += `- **🚨 Critical Failures**: ${report.summary.critical_failures}\n\n`;

    // Critical failures
    const criticalFailures = report.pages.filter(p => p.status === 'critical_failure');
    if (criticalFailures.length > 0) {
        reportText += `## 🚨 CRITICAL FAILURES\n\n`;
        criticalFailures.forEach(page => {
            reportText += `### ${page.name} - \`${page.url}\`\n`;
            reportText += `- Load Time: ${page.loadTime}ms\n`;
            reportText += `- Screenshot: \`screenshots/final-test/${page.screenshot}\`\n`;
            if (page.errors.length > 0) {
                reportText += `- Errors:\n`;
                page.errors.forEach(err => reportText += `  - ${err}\n`);
            }
            if (page.consoleErrors.length > 0) {
                reportText += `- Console Errors: ${page.consoleErrors.length}\n`;
            }
            reportText += `\n`;
        });
    } else {
        reportText += `## ✅ NO CRITICAL FAILURES!\n\n`;
    }

    // Passed pages
    const passed = report.pages.filter(p => p.status === 'passed');
    if (passed.length > 0) {
        reportText += `## ✅ Passed Pages\n\n`;
        passed.forEach(page => {
            reportText += `- **${page.name}**: ${page.loadTime}ms\n`;
            reportText += `  - Screenshot: \`screenshots/final-test/${page.screenshot}\`\n`;
        });
        reportText += `\n`;
    }

    // Page summaries
    reportText += `## 📄 All Pages\n\n`;
    report.pages.forEach(page => {
        const icon = page.status === 'passed' ? '✅' : page.status === 'critical_failure' ? '🚨' : '❌';
        reportText += `### ${icon} ${page.name}\n`;
        reportText += `- URL: ${page.url}\n`;
        reportText += `- Load Time: ${page.loadTime}ms\n`;
        reportText += `- Status: ${page.status.toUpperCase()}\n`;
        reportText += `- Screenshot: [View](screenshots/final-test/${page.screenshot})\n`;
        if (page.consoleErrors.length > 0) {
            reportText += `- Console Errors: ${page.consoleErrors.length}\n`;
            reportText += `\`\`\`\n${page.consoleErrors.slice(0, 3).join('\n')}\n\`\`\`\n`;
        }
        reportText += `\n`;
    });

    fs.writeFileSync(reportPath, reportText);

    console.log(`\n📄 Report saved: ${reportPath}`);
    console.log(`📸 Screenshots saved: ${screenshotsDir}`);
    console.log(`\n📊 Final Summary:`);
    console.log(`   ✅ Passed: ${report.summary.passed}/${report.summary.total}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   🚨 Critical: ${report.summary.critical_failures}`);

    // Exit with error code if critical failures
    process.exit(report.summary.critical_failures > 0 ? 1 : 0);
})();
