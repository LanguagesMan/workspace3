const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots/mobile-audit');
const reportPath = path.join(__dirname, 'MOBILE_UI_UX_AUDIT.md');

// Ensure directory exists
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test on multiple mobile devices
const mobileDevices = [
    devices['iPhone 12'],
    devices['iPhone 12 Pro Max'],
    devices['Pixel 5']
];

const pages = [
    { name: 'Home', url: '/', critical: true },
    { name: 'TikTok Video Feed', url: '/tiktok-video-feed.html', critical: true },
    { name: 'Langflix', url: '/langflix-app.html', critical: true },
    { name: 'Premium', url: '/premium.html', critical: true },
    { name: 'AI Discover', url: '/discover-ai-feed.html', critical: false },
    { name: 'Sign In', url: '/sign-in.html', critical: false },
    { name: 'Sign Up', url: '/sign-up.html', critical: false },
    { name: 'Profile', url: '/profile.html', critical: false }
];

const uiIssues = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    pageIssues: {}
};

// UI/UX checks
async function analyzeUIUX(page, pageName) {
    const issues = [];

    try {
        // Check for horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
        });
        if (hasHorizontalOverflow) {
            issues.push({
                severity: 'high',
                issue: 'Horizontal overflow detected - content wider than viewport',
                fix: 'Add CSS: body { overflow-x: hidden; max-width: 100vw; }'
            });
        }

        // Check for tiny text (iOS minimum 16px)
        const tinyTextElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const tiny = [];
            elements.forEach(el => {
                const fontSize = window.getComputedStyle(el).fontSize;
                const fontSizePx = parseFloat(fontSize);
                if (fontSizePx < 12 && el.textContent.trim().length > 0) {
                    tiny.push({
                        tag: el.tagName,
                        fontSize: fontSize,
                        text: el.textContent.trim().substring(0, 50)
                    });
                }
            });
            return tiny.slice(0, 5); // Limit to 5 examples
        });
        if (tinyTextElements.length > 0) {
            issues.push({
                severity: 'medium',
                issue: `Found ${tinyTextElements.length} elements with text < 12px`,
                fix: 'Increase font-size to minimum 14px for body text, 16px for inputs',
                examples: tinyTextElements
            });
        }

        // Check for clickable elements too small (minimum 44x44px tap target)
        const smallTapTargets = await page.evaluate(() => {
            const clickable = document.querySelectorAll('button, a, input, select, [onclick]');
            const small = [];
            clickable.forEach(el => {
                const rect = el.getBoundingClientRect();
                if ((rect.width < 44 || rect.height < 44) && rect.width > 0) {
                    small.push({
                        tag: el.tagName,
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        text: el.textContent.trim().substring(0, 30) || el.placeholder || ''
                    });
                }
            });
            return small.slice(0, 5);
        });
        if (smallTapTargets.length > 0) {
            issues.push({
                severity: 'high',
                issue: `Found ${smallTapTargets.length} tap targets smaller than 44x44px`,
                fix: 'Increase button/link size to minimum 44x44px with padding',
                examples: smallTapTargets
            });
        }

        // Check for fixed positioning issues
        const fixedElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const fixed = [];
            elements.forEach(el => {
                const pos = window.getComputedStyle(el).position;
                if (pos === 'fixed') {
                    const rect = el.getBoundingClientRect();
                    fixed.push({
                        tag: el.tagName,
                        class: el.className,
                        top: Math.round(rect.top),
                        left: Math.round(rect.left),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    });
                }
            });
            return fixed;
        });
        if (fixedElements.length > 3) {
            issues.push({
                severity: 'medium',
                issue: `${fixedElements.length} fixed position elements may overlap or cover content`,
                fix: 'Review z-index hierarchy and ensure proper spacing',
                examples: fixedElements.slice(0, 5)
            });
        }

        // Check for overlapping elements
        const zIndexIssues = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const issues = [];

            elements.forEach(el1 => {
                const rect1 = el1.getBoundingClientRect();
                const z1 = parseInt(window.getComputedStyle(el1).zIndex) || 0;

                elements.forEach(el2 => {
                    if (el1 === el2) return;
                    const rect2 = el2.getBoundingClientRect();
                    const z2 = parseInt(window.getComputedStyle(el2).zIndex) || 0;

                    // Check if elements overlap
                    const overlap = !(rect1.right < rect2.left ||
                                     rect1.left > rect2.right ||
                                     rect1.bottom < rect2.top ||
                                     rect1.top > rect2.bottom);

                    if (overlap && Math.abs(z1 - z2) > 100) {
                        issues.push({
                            element1: el1.tagName + (el1.className ? '.' + el1.className.split(' ')[0] : ''),
                            element2: el2.tagName + (el2.className ? '.' + el2.className.split(' ')[0] : ''),
                            zIndexDiff: Math.abs(z1 - z2)
                        });
                    }
                });
            });

            return issues.slice(0, 3);
        });
        if (zIndexIssues.length > 0) {
            issues.push({
                severity: 'high',
                issue: `Found ${zIndexIssues.length} z-index conflicts (overlapping elements)`,
                fix: 'Standardize z-index scale (e.g., 1-10, 100-110, 1000-1010)',
                examples: zIndexIssues
            });
        }

        // Check for modals/popups that may block content
        const modals = await page.evaluate(() => {
            const possibleModals = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"], [class*="dialog"]');
            return Array.from(possibleModals).map(el => ({
                tag: el.tagName,
                class: el.className,
                visible: el.offsetParent !== null,
                zIndex: window.getComputedStyle(el).zIndex
            }));
        });
        if (modals.filter(m => m.visible).length > 0) {
            issues.push({
                severity: 'critical',
                issue: `${modals.filter(m => m.visible).length} visible modals/popups detected on page load`,
                fix: 'Modals should be hidden by default, only shown on user action',
                examples: modals.filter(m => m.visible)
            });
        }

        // Check for proper mobile meta tags
        const metaTags = await page.evaluate(() => {
            const viewport = document.querySelector('meta[name="viewport"]');
            const touchIcon = document.querySelector('link[rel*="apple-touch-icon"]');
            return {
                hasViewport: !!viewport,
                viewportContent: viewport?.getAttribute('content') || '',
                hasUserScalable: viewport?.getAttribute('content')?.includes('user-scalable=no'),
                hasTouchIcon: !!touchIcon
            };
        });
        if (!metaTags.hasViewport) {
            issues.push({
                severity: 'critical',
                issue: 'Missing viewport meta tag',
                fix: 'Add: <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            });
        }
        if (metaTags.hasUserScalable) {
            issues.push({
                severity: 'medium',
                issue: 'user-scalable=no prevents accessibility zoom',
                fix: 'Remove user-scalable=no from viewport meta tag'
            });
        }

        // Check for proper touch event handling
        const touchHandling = await page.evaluate(() => {
            const clickHandlers = document.querySelectorAll('[onclick]');
            const touchHandlers = document.querySelectorAll('[ontouchstart], [ontouchend]');
            return {
                clickHandlers: clickHandlers.length,
                touchHandlers: touchHandlers.length,
                ratio: clickHandlers.length > 0 ? touchHandlers.length / clickHandlers.length : 0
            };
        });
        if (touchHandling.clickHandlers > 10 && touchHandling.ratio < 0.5) {
            issues.push({
                severity: 'medium',
                issue: 'Many onclick handlers but few touch handlers',
                fix: 'Use addEventListener with touch events for better mobile UX'
            });
        }

    } catch (error) {
        console.error(`Error analyzing ${pageName}:`, error.message);
        issues.push({
            severity: 'high',
            issue: `Analysis error: ${error.message}`,
            fix: 'Manual review required'
        });
    }

    return issues;
}

(async () => {
    console.log('📱 Starting mobile UI/UX audit...\n');

    const browser = await chromium.launch({ headless: true });

    // Test on iPhone 12 (most common viewport)
    const device = mobileDevices[0];
    console.log(`📱 Testing on: ${device.name || 'iPhone 12'}\n`);

    const context = await browser.newContext(device);
    const page = await context.newPage();

    for (const pageInfo of pages) {
        console.log(`📄 Testing: ${pageInfo.name} (${pageInfo.url})`);

        try {
            // Collect console errors
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Navigate
            const startTime = Date.now();
            await page.goto(`http://localhost:3001${pageInfo.url}`, {
                waitUntil: 'domcontentloaded',
                timeout: 15000
            });
            const loadTime = Date.now() - startTime;

            // Wait for content
            await page.waitForTimeout(2000);

            // Take screenshot
            const screenshotName = `${pageInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-mobile.png`;
            const screenshotPath = path.join(screenshotsDir, screenshotName);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`  📸 Screenshot: ${screenshotName}`);
            console.log(`  ⏱️  Load time: ${loadTime}ms`);

            // Analyze UI/UX
            const issues = await analyzeUIUX(page, pageInfo.name);

            // Count by severity
            const criticalCount = issues.filter(i => i.severity === 'critical').length;
            const highCount = issues.filter(i => i.severity === 'high').length;
            const mediumCount = issues.filter(i => i.severity === 'medium').length;

            uiIssues.total += issues.length;
            uiIssues.critical += criticalCount;
            uiIssues.high += highCount;
            uiIssues.medium += mediumCount;
            uiIssues.pageIssues[pageInfo.name] = {
                url: pageInfo.url,
                loadTime,
                consoleErrors: consoleErrors.slice(0, 5),
                issues,
                screenshot: screenshotName
            };

            if (issues.length === 0) {
                console.log(`  ✅ No UI/UX issues detected\n`);
            } else {
                console.log(`  ⚠️  Found ${issues.length} UI/UX issues:`);
                console.log(`     🚨 Critical: ${criticalCount}`);
                console.log(`     🔴 High: ${highCount}`);
                console.log(`     🟡 Medium: ${mediumCount}\n`);
            }

        } catch (error) {
            console.log(`  💥 ERROR: ${error.message}\n`);
            uiIssues.pageIssues[pageInfo.name] = {
                url: pageInfo.url,
                error: error.message
            };
        }
    }

    await browser.close();

    // Generate detailed report
    let report = `# 📱 Mobile UI/UX Comprehensive Audit\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Device**: iPhone 12 (390x844px)\n`;
    report += `**Pages Tested**: ${pages.length}\n\n`;

    report += `## 📊 Summary\n\n`;
    report += `- **Total Issues**: ${uiIssues.total}\n`;
    report += `- **🚨 Critical**: ${uiIssues.critical}\n`;
    report += `- **🔴 High Priority**: ${uiIssues.high}\n`;
    report += `- **🟡 Medium Priority**: ${uiIssues.medium}\n\n`;

    report += `---\n\n`;

    // Critical issues first
    report += `## 🚨 CRITICAL ISSUES (Fix Immediately)\n\n`;
    let hasCritical = false;
    for (const [pageName, data] of Object.entries(uiIssues.pageIssues)) {
        const criticalIssues = data.issues?.filter(i => i.severity === 'critical') || [];
        if (criticalIssues.length > 0) {
            hasCritical = true;
            report += `### ${pageName} - \`${data.url}\`\n`;
            report += `**Screenshot**: \`screenshots/mobile-audit/${data.screenshot}\`\n\n`;
            criticalIssues.forEach((issue, idx) => {
                report += `#### ${idx + 1}. ${issue.issue}\n`;
                report += `**Fix**: ${issue.fix}\n`;
                if (issue.examples) {
                    report += `**Examples**:\n\`\`\`json\n${JSON.stringify(issue.examples, null, 2)}\n\`\`\`\n`;
                }
                report += `\n`;
            });
        }
    }
    if (!hasCritical) {
        report += `✅ No critical issues found!\n\n`;
    }

    // High priority issues
    report += `## 🔴 HIGH PRIORITY ISSUES\n\n`;
    let hasHigh = false;
    for (const [pageName, data] of Object.entries(uiIssues.pageIssues)) {
        const highIssues = data.issues?.filter(i => i.severity === 'high') || [];
        if (highIssues.length > 0) {
            hasHigh = true;
            report += `### ${pageName} - \`${data.url}\`\n`;
            highIssues.forEach((issue, idx) => {
                report += `${idx + 1}. **${issue.issue}**\n`;
                report += `   - Fix: ${issue.fix}\n`;
                if (issue.examples && issue.examples.length > 0) {
                    report += `   - Examples: ${JSON.stringify(issue.examples.slice(0, 2))}\n`;
                }
            });
            report += `\n`;
        }
    }
    if (!hasHigh) {
        report += `✅ No high priority issues found!\n\n`;
    }

    // Medium priority issues
    report += `## 🟡 MEDIUM PRIORITY ISSUES\n\n`;
    let hasMedium = false;
    for (const [pageName, data] of Object.entries(uiIssues.pageIssues)) {
        const mediumIssues = data.issues?.filter(i => i.severity === 'medium') || [];
        if (mediumIssues.length > 0) {
            hasMedium = true;
            report += `### ${pageName}\n`;
            mediumIssues.forEach((issue, idx) => {
                report += `${idx + 1}. ${issue.issue} → ${issue.fix}\n`;
            });
            report += `\n`;
        }
    }
    if (!hasMedium) {
        report += `✅ No medium priority issues found!\n\n`;
    }

    // Page-by-page summary
    report += `## 📄 Page-by-Page Summary\n\n`;
    for (const [pageName, data] of Object.entries(uiIssues.pageIssues)) {
        const issueCount = data.issues?.length || 0;
        const status = issueCount === 0 ? '✅' : issueCount < 3 ? '⚠️' : '🚨';
        report += `- ${status} **${pageName}**: ${issueCount} issues, ${data.loadTime}ms load time\n`;
        report += `  - Screenshot: \`${data.screenshot}\`\n`;
        if (data.consoleErrors && data.consoleErrors.length > 0) {
            report += `  - Console errors: ${data.consoleErrors.length}\n`;
        }
    }

    report += `\n---\n\n`;
    report += `## 🎨 Design System Recommendations\n\n`;
    report += `Based on this audit, consider implementing:\n\n`;
    report += `1. **Unified Design Tokens**\n`;
    report += `   - Consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px)\n`;
    report += `   - Typography scale (12px, 14px, 16px, 20px, 24px, 32px, 48px)\n`;
    report += `   - Color palette with semantic names\n`;
    report += `   - Z-index scale (1-10, 100-110, 1000-1010)\n\n`;
    report += `2. **Mobile-First CSS Framework**\n`;
    report += `   - Minimum tap target: 44x44px\n`;
    report += `   - Body font size: 16px (prevents iOS zoom)\n`;
    report += `   - No horizontal overflow: max-width: 100vw\n`;
    report += `   - Safe area insets for notched devices\n\n`;
    report += `3. **Component Library**\n`;
    report += `   - Reusable button styles (primary, secondary, ghost)\n`;
    report += `   - Modal/popup templates with proper overlay\n`;
    report += `   - Card component with consistent padding\n`;
    report += `   - Navigation patterns (tab bar, header)\n\n`;

    fs.writeFileSync(reportPath, report);

    console.log(`\n📄 Audit report saved: ${reportPath}`);
    console.log(`📸 Screenshots saved: ${screenshotsDir}`);
    console.log(`\n📊 Final Summary:`);
    console.log(`   Total Issues: ${uiIssues.total}`);
    console.log(`   🚨 Critical: ${uiIssues.critical}`);
    console.log(`   🔴 High: ${uiIssues.high}`);
    console.log(`   🟡 Medium: ${uiIssues.medium}`);
})();
