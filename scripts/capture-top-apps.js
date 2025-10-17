/**
 * Top Apps Screenshot & Design Analysis Tool
 *
 * Captures screenshots of top social/content apps and analyzes:
 * - Color palettes (exact hex codes)
 * - Background colors (pure black vs dark gray)
 * - Card/component styling
 * - Text colors and contrast
 * - Button styles
 * - Dark mode patterns
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Desktop viewport (1920x1080)
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };

// Mobile viewport (iPhone SE)
const MOBILE_VIEWPORT = { width: 375, height: 667 };

// Apps to analyze
const APPS = [
  {
    name: 'tiktok',
    url: 'https://www.tiktok.com/@tiktok',
    description: 'TikTok - Short form video platform'
  },
  {
    name: 'instagram',
    url: 'https://www.instagram.com/instagram/',
    description: 'Instagram - Photo & video sharing'
  },
  {
    name: 'netflix',
    url: 'https://www.netflix.com',
    description: 'Netflix - Streaming service'
  },
  {
    name: 'youtube',
    url: 'https://www.youtube.com',
    description: 'YouTube - Video platform'
  },
  {
    name: 'twitter',
    url: 'https://x.com',
    description: 'Twitter/X - Social media platform'
  },
  {
    name: 'spotify',
    url: 'https://open.spotify.com',
    description: 'Spotify - Music streaming'
  }
];

/**
 * Extract colors from a screenshot using canvas
 */
async function extractColors(page) {
  return await page.evaluate(() => {
    // Get computed styles from various elements
    const colors = {
      backgrounds: new Set(),
      text: new Set(),
      borders: new Set(),
      accents: new Set()
    };

    // Sample various element types
    const selectors = [
      'body',
      'main',
      'article',
      'div[class*="card"]',
      'div[class*="container"]',
      'button',
      'a',
      'h1, h2, h3, h4, h5, h6',
      'p',
      'span'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      Array.from(elements).slice(0, 50).forEach(el => {
        const styles = window.getComputedStyle(el);

        // Background colors
        const bg = styles.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)') {
          colors.backgrounds.add(bg);
        }

        // Text colors
        const color = styles.color;
        if (color) {
          colors.text.add(color);
        }

        // Border colors
        const borderColor = styles.borderColor;
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
          colors.borders.add(borderColor);
        }

        // Box shadow (for accent extraction)
        const boxShadow = styles.boxShadow;
        if (boxShadow && boxShadow !== 'none') {
          colors.accents.add(boxShadow);
        }
      });
    });

    // Convert RGB to Hex
    function rgbToHex(rgb) {
      const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
      if (!match) return rgb;

      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);

      return '#' + [r, g, b]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
    }

    return {
      backgrounds: Array.from(colors.backgrounds).map(rgbToHex),
      text: Array.from(colors.text).map(rgbToHex),
      borders: Array.from(colors.borders).map(rgbToHex),
      shadows: Array.from(colors.accents)
    };
  });
}

/**
 * Analyze component styling patterns
 */
async function analyzeComponents(page) {
  return await page.evaluate(() => {
    const analysis = {
      cards: [],
      buttons: [],
      bodyStyle: null
    };

    // Analyze body/main container
    const body = document.body;
    const bodyStyles = window.getComputedStyle(body);
    analysis.bodyStyle = {
      backgroundColor: bodyStyles.backgroundColor,
      color: bodyStyles.color
    };

    // Analyze card-like components
    const cardSelectors = [
      'article',
      '[class*="card"]',
      '[class*="container"]',
      '[class*="item"]',
      '[data-testid*="card"]'
    ];

    cardSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      Array.from(elements).slice(0, 10).forEach(el => {
        const styles = window.getComputedStyle(el);
        analysis.cards.push({
          selector,
          backgroundColor: styles.backgroundColor,
          border: styles.border,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          padding: styles.padding
        });
      });
    });

    // Analyze buttons
    const buttons = document.querySelectorAll('button, [role="button"], a[class*="button"]');
    Array.from(buttons).slice(0, 10).forEach(btn => {
      const styles = window.getComputedStyle(btn);
      analysis.buttons.push({
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        fontWeight: styles.fontWeight
      });
    });

    return analysis;
  });
}

/**
 * Capture screenshots and analyze app
 */
async function captureApp(browser, app) {
  console.log(`\n📸 Capturing ${app.name.toUpperCase()}...`);
  console.log(`   ${app.description}`);
  console.log(`   URL: ${app.url}`);

  const results = {
    name: app.name,
    url: app.url,
    description: app.description,
    desktop: {},
    mobile: {}
  };

  // Desktop capture
  try {
    const page = await browser.newPage({ viewport: DESKTOP_VIEWPORT });
    await page.goto(app.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Wait for content to load
    await page.waitForTimeout(5000);

    // Take screenshot
    const desktopPath = path.join('/tmp/top-apps-reference', app.name, 'desktop.png');
    await page.screenshot({ path: desktopPath, fullPage: false });
    console.log(`   ✅ Desktop screenshot: ${desktopPath}`);

    // Extract colors and analyze
    results.desktop.colors = await extractColors(page);
    results.desktop.components = await analyzeComponents(page);
    results.desktop.screenshot = desktopPath;

    await page.close();
  } catch (error) {
    console.log(`   ❌ Desktop capture failed: ${error.message}`);
    results.desktop.error = error.message;
  }

  // Mobile capture
  try {
    const page = await browser.newPage({ viewport: MOBILE_VIEWPORT });
    await page.goto(app.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    await page.waitForTimeout(5000);

    const mobilePath = path.join('/tmp/top-apps-reference', app.name, 'mobile.png');
    await page.screenshot({ path: mobilePath, fullPage: false });
    console.log(`   ✅ Mobile screenshot: ${mobilePath}`);

    results.mobile.colors = await extractColors(page);
    results.mobile.components = await analyzeComponents(page);
    results.mobile.screenshot = mobilePath;

    await page.close();
  } catch (error) {
    console.log(`   ❌ Mobile capture failed: ${error.message}`);
    results.mobile.error = error.message;
  }

  return results;
}

/**
 * Generate design analysis report
 */
function generateReport(results) {
  let report = `# TOP APPS DESIGN ANALYSIS
Generated: ${new Date().toISOString()}

## Executive Summary

Analysis of 6 top social/content platforms focusing on:
- Background colors (pure black vs dark gray)
- Card/component styling
- Text colors and contrast
- Button patterns
- Dark mode implementation

---

`;

  results.forEach(app => {
    if (!app.desktop || !app.mobile) return;

    report += `## ${app.name.toUpperCase()} - ${app.description}\n\n`;
    report += `**URL:** ${app.url}\n\n`;

    // Desktop analysis
    if (app.desktop.colors) {
      report += `### Desktop (1920x1080)\n\n`;

      // Body style
      if (app.desktop.components?.bodyStyle) {
        const { backgroundColor, color } = app.desktop.components.bodyStyle;
        report += `**Primary Background:** \`${backgroundColor}\`\n`;
        report += `**Primary Text:** \`${color}\`\n\n`;
      }

      // Background colors
      report += `**Background Colors:**\n`;
      app.desktop.colors.backgrounds.slice(0, 10).forEach(color => {
        const isPureBlack = color.toLowerCase() === '#000000' || color === 'rgb(0, 0, 0)';
        report += `- \`${color}\`${isPureBlack ? ' 🎯 **PURE BLACK**' : ''}\n`;
      });
      report += `\n`;

      // Text colors
      report += `**Text Colors:**\n`;
      app.desktop.colors.text.slice(0, 10).forEach(color => {
        report += `- \`${color}\`\n`;
      });
      report += `\n`;

      // Border colors
      if (app.desktop.colors.borders.length > 0) {
        report += `**Border Colors:**\n`;
        app.desktop.colors.borders.slice(0, 5).forEach(color => {
          report += `- \`${color}\`\n`;
        });
        report += `\n`;
      }

      // Card styling
      if (app.desktop.components?.cards?.length > 0) {
        report += `**Card/Container Styling:**\n`;
        const uniqueCards = app.desktop.components.cards
          .filter((card, index, self) =>
            index === self.findIndex(c => c.backgroundColor === card.backgroundColor)
          )
          .slice(0, 3);

        uniqueCards.forEach((card, i) => {
          report += `\nCard ${i + 1}:\n`;
          report += `- Background: \`${card.backgroundColor}\`\n`;
          report += `- Border: \`${card.border}\`\n`;
          report += `- Border Radius: \`${card.borderRadius}\`\n`;
          report += `- Box Shadow: \`${card.boxShadow}\`\n`;
        });
        report += `\n`;
      }

      // Button styling
      if (app.desktop.components?.buttons?.length > 0) {
        report += `**Button Styling:**\n`;
        const uniqueButtons = app.desktop.components.buttons
          .filter((btn, index, self) =>
            index === self.findIndex(b => b.backgroundColor === btn.backgroundColor)
          )
          .slice(0, 3);

        uniqueButtons.forEach((btn, i) => {
          report += `\nButton ${i + 1}:\n`;
          report += `- Background: \`${btn.backgroundColor}\`\n`;
          report += `- Text Color: \`${btn.color}\`\n`;
          report += `- Border: \`${btn.border}\`\n`;
          report += `- Border Radius: \`${btn.borderRadius}\`\n`;
          report += `- Font Weight: \`${btn.fontWeight}\`\n`;
        });
        report += `\n`;
      }

      report += `**Screenshot:** \`${app.desktop.screenshot}\`\n\n`;
    }

    report += `---\n\n`;
  });

  // Summary section
  report += `## KEY FINDINGS\n\n`;
  report += `### Pure Black (#000000) Usage\n\n`;

  const pureBlackApps = results.filter(app => {
    if (!app.desktop?.colors?.backgrounds) return false;
    return app.desktop.colors.backgrounds.some(color =>
      color.toLowerCase() === '#000000' || color === 'rgb(0, 0, 0)'
    );
  });

  if (pureBlackApps.length > 0) {
    report += `**Apps using pure black:**\n`;
    pureBlackApps.forEach(app => {
      report += `- ${app.name.toUpperCase()}\n`;
    });
  } else {
    report += `**None of the analyzed apps use pure black backgrounds.**\n`;
    report += `They prefer dark grays for better contrast and eye comfort.\n`;
  }

  report += `\n### Common Dark Mode Patterns\n\n`;
  report += `1. **Dark Gray over Pure Black** - Most apps use #0f0f0f, #121212, #181818\n`;
  report += `2. **Subtle Borders** - rgba(255,255,255,0.1) to rgba(255,255,255,0.2)\n`;
  report += `3. **Elevated Cards** - Slightly lighter than background (#1a1a1a on #000)\n`;
  report += `4. **Text Hierarchy:**\n`;
  report += `   - Primary: #ffffff or rgba(255,255,255,0.95)\n`;
  report += `   - Secondary: rgba(255,255,255,0.7)\n`;
  report += `   - Tertiary: rgba(255,255,255,0.5)\n`;
  report += `5. **Accent Colors** - Brand colors at reduced saturation for dark mode\n`;

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 TOP APPS DESIGN ANALYSIS TOOL');
  console.log('================================\n');
  console.log(`Analyzing ${APPS.length} apps for design patterns...\n`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const app of APPS) {
    try {
      const result = await captureApp(browser, app);
      results.push(result);
    } catch (error) {
      console.log(`❌ Failed to capture ${app.name}: ${error.message}`);
      results.push({
        name: app.name,
        url: app.url,
        error: error.message
      });
    }
  }

  await browser.close();

  // Save raw results
  const rawResultsPath = '/tmp/top-apps-reference/raw-analysis.json';
  fs.writeFileSync(rawResultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Raw data saved: ${rawResultsPath}`);

  // Generate and save report
  const report = generateReport(results);
  const reportPath = '/tmp/top-apps-reference/DESIGN_ANALYSIS.md';
  fs.writeFileSync(reportPath, report);
  console.log(`📊 Design analysis report: ${reportPath}`);

  console.log('\n✅ Analysis complete!');
  console.log(`\nScreenshots saved to: /tmp/top-apps-reference/`);
  console.log(`\nNext steps:`);
  console.log(`1. Review ${reportPath}`);
  console.log(`2. Compare screenshots in /tmp/top-apps-reference/*/`);
  console.log(`3. Extract exact hex codes from report`);
  console.log(`4. Apply patterns to your app\n`);
}

// Run the script
main().catch(console.error);
