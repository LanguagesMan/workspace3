const { chromium } = require('playwright');

const pages = [
  { name: 'tiktok-video-feed', url: 'http://localhost:3001/tiktok-video-feed.html' },
  { name: 'profile', url: 'http://localhost:3001/profile.html' },
  { name: 'dashboard', url: 'http://localhost:3001/dashboard.html' },
  { name: 'leaderboard', url: 'http://localhost:3001/leaderboard.html' },
  { name: 'discover-ai', url: 'http://localhost:3001/discover-ai.html' },
  { name: 'discover-articles', url: 'http://localhost:3001/discover-articles.html' },
  { name: 'stories', url: 'http://localhost:3001/stories.html' },
  { name: 'review-queue', url: 'http://localhost:3001/review-queue.html' },
  { name: 'games-hub', url: 'http://localhost:3001/games-hub.html' },
  { name: 'music-player', url: 'http://localhost:3001/music-player.html' }
];

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const colorAnalysis = {};

  for (const pageInfo of pages) {
    try {
      console.log(`\n🎨 Analyzing: ${pageInfo.name}`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(500);

      // Extract colors from page
      const colors = await page.evaluate(() => {
        const results = {
          bodyBackground: null,
          mainBackground: null,
          cardBackgrounds: [],
          textColors: [],
          buttonColors: [],
          headerBackground: null,
          navBackground: null
        };

        // Body background
        const bodyStyle = window.getComputedStyle(document.body);
        results.bodyBackground = bodyStyle.backgroundColor;

        // Main/app container background
        const mainContainer = document.querySelector('main, .app-container, #app, .container');
        if (mainContainer) {
          results.mainBackground = window.getComputedStyle(mainContainer).backgroundColor;
        }

        // Header background
        const header = document.querySelector('header, .header');
        if (header) {
          results.headerBackground = window.getComputedStyle(header).backgroundColor;
        }

        // Nav background
        const nav = document.querySelector('nav, .nav, .navigation');
        if (nav) {
          results.navBackground = window.getComputedStyle(nav).backgroundColor;
        }

        // Card backgrounds
        const cards = document.querySelectorAll('.card, .feed-card, .story-card, .video-card, .game-card, .article-card, [class*="card"]');
        cards.forEach(card => {
          const bg = window.getComputedStyle(card).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && !results.cardBackgrounds.includes(bg)) {
            results.cardBackgrounds.push(bg);
          }
        });

        // Text colors
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a');
        const seenTextColors = new Set();
        textElements.forEach(el => {
          const color = window.getComputedStyle(el).color;
          if (color && !seenTextColors.has(color)) {
            seenTextColors.add(color);
            results.textColors.push(color);
          }
        });

        // Button colors
        const buttons = document.querySelectorAll('button, .btn, [class*="button"]');
        buttons.forEach(btn => {
          const bg = window.getComputedStyle(btn).backgroundColor;
          const color = window.getComputedStyle(btn).color;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && !results.buttonColors.find(b => b.bg === bg)) {
            results.buttonColors.push({ bg, color });
          }
        });

        return results;
      });

      // Convert RGB to hex
      const parseRgb = (rgb) => {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return null;
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          return rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
        return rgb;
      };

      colorAnalysis[pageInfo.name] = {
        bodyBackground: parseRgb(colors.bodyBackground),
        mainBackground: parseRgb(colors.mainBackground),
        headerBackground: parseRgb(colors.headerBackground),
        navBackground: parseRgb(colors.navBackground),
        cardBackgrounds: colors.cardBackgrounds.map(parseRgb).filter(Boolean).slice(0, 5),
        textColors: colors.textColors.map(parseRgb).filter(Boolean).slice(0, 5),
        buttonColors: colors.buttonColors.map(b => ({
          bg: parseRgb(b.bg),
          color: parseRgb(b.color)
        })).slice(0, 5)
      };

      console.log(`  ✓ Background: ${colorAnalysis[pageInfo.name].bodyBackground}`);
      console.log(`  ✓ Cards: ${colorAnalysis[pageInfo.name].cardBackgrounds.join(', ')}`);

    } catch (error) {
      console.error(`  ✗ Failed: ${pageInfo.name} - ${error.message}`);
      colorAnalysis[pageInfo.name] = { error: error.message };
    }
  }

  // Write results to file
  const fs = require('fs');
  fs.writeFileSync('/tmp/color-analysis.json', JSON.stringify(colorAnalysis, null, 2));

  console.log('\n\n=== COLOR ANALYSIS COMPLETE ===');
  console.log('Full report saved to: /tmp/color-analysis.json');

  await browser.close();
})();
