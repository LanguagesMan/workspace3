/**
 * Quick Top Apps Screenshot Tool
 * Fast capture with minimal waiting for design analysis
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');

const DESKTOP = { width: 1920, height: 1080 };
const MOBILE = { width: 375, height: 667 };

const APPS = [
  { name: 'youtube', url: 'https://www.youtube.com' },
  { name: 'netflix', url: 'https://www.netflix.com' },
  { name: 'spotify', url: 'https://open.spotify.com' },
  { name: 'twitter', url: 'https://x.com' },
  { name: 'tiktok', url: 'https://www.tiktok.com/@tiktok' },
  { name: 'instagram', url: 'https://www.instagram.com/instagram/' }
];

async function capture(browser, app, viewport, type) {
  const page = await browser.newPage({ viewport });

  try {
    await page.goto(app.url, { timeout: 15000 });
    await page.waitForTimeout(3000);

    const path = `/tmp/top-apps-reference/${app.name}/${type}.png`;
    await page.screenshot({ path });

    // Extract colors
    const colors = await page.evaluate(() => {
      const rgbToHex = (rgb) => {
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        return '#' + [match[1], match[2], match[3]]
          .map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
      };

      const body = getComputedStyle(document.body);
      const main = document.querySelector('main, [role="main"], #main');
      const mainStyle = main ? getComputedStyle(main) : null;

      return {
        bodyBg: rgbToHex(body.backgroundColor),
        bodyColor: rgbToHex(body.color),
        mainBg: mainStyle ? rgbToHex(mainStyle.backgroundColor) : null,
        isPureBlack: body.backgroundColor === 'rgb(0, 0, 0)'
      };
    });

    console.log(`✅ ${app.name} ${type}: ${colors.bodyBg} ${colors.isPureBlack ? '🎯 PURE BLACK' : ''}`);

    await page.close();
    return { path, colors };
  } catch (error) {
    console.log(`❌ ${app.name} ${type}: ${error.message}`);
    await page.close();
    return { error: error.message };
  }
}

async function main() {
  console.log('🎨 Quick App Capture\n');

  const browser = await chromium.launch({ headless: true });
  const results = {};

  for (const app of APPS) {
    console.log(`\n📸 ${app.name.toUpperCase()}`);
    results[app.name] = {
      desktop: await capture(browser, app, DESKTOP, 'desktop'),
      mobile: await capture(browser, app, MOBILE, 'mobile')
    };
  }

  await browser.close();

  // Save results
  fs.writeFileSync('/tmp/top-apps-reference/quick-results.json', JSON.stringify(results, null, 2));

  console.log('\n\n📊 SUMMARY\n');
  Object.entries(results).forEach(([name, data]) => {
    if (data.desktop?.colors) {
      console.log(`${name.toUpperCase()}: ${data.desktop.colors.bodyBg} ${data.desktop.colors.isPureBlack ? '🎯 PURE BLACK' : ''}`);
    }
  });

  console.log('\n✅ Done! Screenshots in /tmp/top-apps-reference/');
}

main().catch(console.error);
