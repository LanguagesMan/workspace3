const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotDir = path.join(__dirname, '../test-results/audit-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

test.describe('COMPREHENSIVE AUDIT - All User Profiles', () => {
  test.setTimeout(300000); // 5 minutes per test

  // Test as non-signed-in user (beginner)
  test('Non-signed-in Beginner User - Full Journey', async ({ page }) => {
    console.log('\n🔍 TESTING AS: Non-signed-in Beginner User\n');

    // Clear all storage to simulate fresh user
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Screenshot 1: Initial landing page
    await page.screenshot({ path: path.join(screenshotDir, '01-beginner-landing.png'), fullPage: true });
    console.log('✅ Screenshot: Landing page');

    // Test video autoplay
    const videoAutoplay = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? {
        autoplay: video.autoplay,
        paused: video.paused,
        readyState: video.readyState,
        currentSrc: video.currentSrc ? 'loaded' : 'empty'
      } : null;
    });
    console.log('Video autoplay status:', videoAutoplay);

    // Test subtitle visibility
    const subtitlesVisible = await page.evaluate(() => {
      const transcription = document.querySelector('.transcription-overlay');
      if (!transcription) return { found: false };
      const computedStyle = window.getComputedStyle(transcription);
      return {
        found: true,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        hasContent: transcription.textContent.trim().length > 0
      };
    });
    console.log('Subtitles visibility:', subtitlesVisible);

    // Screenshot 2: Video with subtitles
    await page.screenshot({ path: path.join(screenshotDir, '02-beginner-video-subtitles.png'), fullPage: true });

    // Test ALL sidebar buttons
    const sidebarButtons = await page.evaluate(() => {
      const buttons = [];
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const allButtons = sidebar.querySelectorAll('button');
        allButtons.forEach((btn, idx) => {
          const classes = Array.from(btn.classList);
          const onclick = btn.getAttribute('onclick');
          const hasIcon = btn.querySelector('i') ? true : false;
          const text = btn.textContent.trim();
          buttons.push({
            index: idx,
            classes,
            onclick,
            hasIcon,
            text,
            visible: window.getComputedStyle(btn).display !== 'none'
          });
        });
      }
      return buttons;
    });
    console.log('\n📋 SIDEBAR BUTTONS AUDIT:');
    subtitlesVisible.forEach((btn, idx) => {
      console.log(`  Button ${idx + 1}:`, btn);
    });

    // Click speed button
    const speedButton = page.locator('.sidebar button').filter({ hasText: /\d\.?\d?x/ }).first();
    if (await speedButton.count() > 0) {
      await speedButton.screenshot({ path: path.join(screenshotDir, '03-beginner-speed-button-before.png') });
      await speedButton.click();
      await page.waitForTimeout(500);
      await speedButton.screenshot({ path: path.join(screenshotDir, '04-beginner-speed-button-after.png') });
      console.log('✅ Clicked speed button');
    } else {
      console.log('❌ Speed button not found');
    }

    // Click translation toggle button
    const translateButton = page.locator('.sidebar button').filter({ has: page.locator('.translate-status') }).first();
    if (await translateButton.count() > 0) {
      await translateButton.screenshot({ path: path.join(screenshotDir, '05-beginner-translate-before.png') });
      await translateButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotDir, '06-beginner-translate-after.png'), fullPage: true });
      console.log('✅ Clicked translation toggle');
    } else {
      console.log('❌ Translation toggle not found');
    }

    // Click like button
    const likeButton = page.locator('.sidebar button').filter({ has: page.locator('.fa-heart') }).first();
    if (await likeButton.count() > 0) {
      await likeButton.screenshot({ path: path.join(screenshotDir, '07-beginner-like-before.png') });
      await likeButton.click();
      await page.waitForTimeout(500);
      await likeButton.screenshot({ path: path.join(screenshotDir, '08-beginner-like-after.png') });
      console.log('✅ Clicked like button');
    } else {
      console.log('❌ Like button not found');
    }

    // Click comment button
    const commentButton = page.locator('.sidebar button').filter({ has: page.locator('.fa-comment') }).first();
    if (await commentButton.count() > 0) {
      await commentButton.screenshot({ path: path.join(screenshotDir, '09-beginner-comment-before.png') });
      await commentButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotDir, '10-beginner-comment-modal.png'), fullPage: true });
      console.log('✅ Clicked comment button');

      // Close modal if opened
      const closeButton = page.locator('.modal-close, .close-btn, button:has-text("Close")').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('❌ Comment button not found');
    }

    // Click share button
    const shareButton = page.locator('.sidebar button').filter({ has: page.locator('.fa-share') }).first();
    if (await shareButton.count() > 0) {
      await shareButton.screenshot({ path: path.join(screenshotDir, '11-beginner-share-before.png') });
      await shareButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotDir, '12-beginner-share-modal.png'), fullPage: true });
      console.log('✅ Clicked share button');

      // Close modal if opened
      const closeButton = page.locator('.modal-close, .close-btn, button:has-text("Close")').first();
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log('❌ Share button not found');
    }

    // Test video swiping (scroll to next video)
    await page.evaluate(() => {
      const container = document.querySelector('.video-container');
      if (container) {
        container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, '13-beginner-next-video.png'), fullPage: true });
    console.log('✅ Scrolled to next video');

    // Check if video changed
    const secondVideoInfo = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? {
        currentTime: video.currentTime,
        paused: video.paused,
        src: video.currentSrc ? video.currentSrc.slice(-30) : 'no src'
      } : null;
    });
    console.log('Second video info:', secondVideoInfo);

    // Test bottom navigation
    const navButtons = ['Home', 'Games', 'Quiz', 'Profile'];
    for (const navText of navButtons) {
      const navButton = page.locator(`.bottom-nav button:has-text("${navText}"), .bottom-nav [class*="nav"]:has-text("${navText}")`).first();
      if (await navButton.count() > 0) {
        await navButton.screenshot({ path: path.join(screenshotDir, `14-beginner-nav-${navText.toLowerCase()}.png`) });
        console.log(`✅ Found nav button: ${navText}`);
      } else {
        console.log(`❌ Nav button not found: ${navText}`);
      }
    }

    // Click Games/Quiz button
    const gamesButton = page.locator('.bottom-nav button, .bottom-nav [class*="nav"]').filter({ hasText: /Games|Quiz/ }).first();
    if (await gamesButton.count() > 0) {
      await gamesButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotDir, '15-beginner-games-page.png'), fullPage: true });
      console.log('✅ Navigated to Games/Quiz page');
    } else {
      console.log('❌ Games/Quiz button not found');
    }
  });

  // Test as non-signed-in user (intermediate - has localStorage data)
  test('Non-signed-in Intermediate User - Returning with History', async ({ page }) => {
    console.log('\n🔍 TESTING AS: Non-signed-in Intermediate User (returning)\n');

    // Simulate returning user with localStorage data
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.evaluate(() => {
      localStorage.setItem('watchedVideos', JSON.stringify(['video1', 'video2', 'video3']));
      localStorage.setItem('deletedVideos', JSON.stringify(['video4']));
      localStorage.setItem('userLevel', 'intermediate');
      localStorage.setItem('likedVideos', JSON.stringify(['video5', 'video6']));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(screenshotDir, '20-intermediate-landing.png'), fullPage: true });
    console.log('✅ Screenshot: Intermediate user landing');

    // Verify localStorage filtering works
    const videoCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.video-card');
      return cards.length;
    });
    console.log(`Videos loaded (should exclude watched/deleted): ${videoCount}`);

    // Test speed persistence
    const speedButton = page.locator('.sidebar button').filter({ hasText: /\d\.?\d?x/ }).first();
    if (await speedButton.count() > 0) {
      // Change speed
      await speedButton.click();
      await page.waitForTimeout(500);
      const speedAfterClick = await speedButton.textContent();
      console.log('Speed after click:', speedAfterClick);

      // Scroll to next video
      await page.evaluate(() => {
        const container = document.querySelector('.video-container');
        if (container) container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      });
      await page.waitForTimeout(2000);

      // Check if speed persisted
      const speedButton2 = page.locator('.sidebar button').filter({ hasText: /\d\.?\d?x/ }).first();
      const speedOnNextVideo = await speedButton2.textContent();
      console.log('Speed on next video:', speedOnNextVideo);

      if (speedAfterClick === speedOnNextVideo) {
        console.log('✅ Speed persisted across videos');
      } else {
        console.log('❌ Speed did NOT persist across videos');
      }
    }

    await page.screenshot({ path: path.join(screenshotDir, '21-intermediate-speed-test.png'), fullPage: true });
  });

  // Test all button functionality systematically
  test('Systematic Button Functionality Test', async ({ page }) => {
    console.log('\n🔍 TESTING: All Button Functionality\n');

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get ALL buttons on the page
    const allButtons = await page.evaluate(() => {
      const buttons = [];
      document.querySelectorAll('button').forEach((btn, idx) => {
        const rect = btn.getBoundingClientRect();
        buttons.push({
          index: idx,
          text: btn.textContent.trim().slice(0, 50),
          classes: Array.from(btn.classList).join(' '),
          onclick: btn.getAttribute('onclick'),
          hasClickListener: btn.onclick !== null,
          visible: rect.width > 0 && rect.height > 0,
          position: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        });
      });
      return buttons;
    });

    console.log(`\n📋 FOUND ${allButtons.length} BUTTONS ON PAGE:\n`);
    allButtons.forEach((btn, idx) => {
      console.log(`Button ${idx + 1}:`);
      console.log(`  Text: "${btn.text}"`);
      console.log(`  Classes: ${btn.classes}`);
      console.log(`  Has onclick: ${!!btn.onclick || btn.hasClickListener}`);
      console.log(`  Visible: ${btn.visible}`);
      console.log(`  Position:`, btn.position);
      console.log('');
    });

    // Test each visible button with onclick
    let functionalCount = 0;
    let nonFunctionalCount = 0;

    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      const btnInfo = allButtons[i];
      if (!btnInfo.visible) continue;
      if (!btnInfo.onclick && !btnInfo.hasClickListener) {
        console.log(`⚠️  Button ${i + 1} has no onclick handler`);
        nonFunctionalCount++;
        continue;
      }

      try {
        const button = page.locator('button').nth(i);
        await button.screenshot({ path: path.join(screenshotDir, `btn-${i}-before.png`) });
        await button.click({ timeout: 3000 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(screenshotDir, `btn-${i}-after-click.png`) });
        console.log(`✅ Button ${i + 1} clicked successfully`);
        functionalCount++;
      } catch (err) {
        console.log(`❌ Button ${i + 1} failed to click:`, err.message);
        nonFunctionalCount++;
      }
    }

    console.log(`\n📊 BUTTON FUNCTIONALITY SUMMARY:`);
    console.log(`  ✅ Functional: ${functionalCount}`);
    console.log(`  ❌ Non-functional: ${nonFunctionalCount}`);
    console.log(`  Total tested: ${functionalCount + nonFunctionalCount}\n`);
  });

  // Test UI/UX design audit
  test('Design & UX Audit - TikTok Comparison', async ({ page }) => {
    console.log('\n🔍 TESTING: Design & UX vs TikTok Standards\n');

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Audit button styles
    const buttonStyles = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('button').forEach((btn, idx) => {
        const computed = window.getComputedStyle(btn);
        results.push({
          index: idx,
          text: btn.textContent.trim().slice(0, 30),
          outline: computed.outline,
          outlineStyle: computed.outlineStyle,
          outlineWidth: computed.outlineWidth,
          border: computed.border,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
          backgroundColor: computed.backgroundColor,
          hasCircle: btn.classList.contains('circle') || parseFloat(computed.borderRadius) > 30
        });
      });
      return results;
    });

    console.log(`\n🎨 BUTTON DESIGN AUDIT:\n`);
    buttonStyles.forEach((style, idx) => {
      console.log(`Button ${idx + 1}: "${style.text}"`);
      console.log(`  Outline: ${style.outline}`);
      console.log(`  Border-radius: ${style.borderRadius}`);
      console.log(`  Has circle style: ${style.hasCircle}`);
      if (style.outline !== 'none' && style.outline !== 'rgb(0, 0, 0) none 0px') {
        console.log(`  ❌ ISSUE: Button has visible outline (not TikTok-style)`);
      }
      if (style.hasCircle) {
        console.log(`  ❌ ISSUE: Button appears to be circular (not TikTok-style)`);
      }
      console.log('');
    });

    // Check for focus states
    const focusStyles = await page.evaluate(() => {
      const testBtn = document.querySelector('button');
      if (!testBtn) return null;
      testBtn.focus();
      const focused = window.getComputedStyle(testBtn);
      testBtn.blur();
      return {
        outlineOnFocus: focused.outline,
        boxShadowOnFocus: focused.boxShadow
      };
    });
    console.log('Focus state styles:', focusStyles);

    await page.screenshot({ path: path.join(screenshotDir, '30-design-audit.png'), fullPage: true });
  });

  // Test responsive design
  test('Responsive Design - Mobile/Tablet/Desktop', async ({ page }) => {
    console.log('\n🔍 TESTING: Responsive Design\n');

    const viewports = [
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3001/tiktok-video-feed.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: path.join(screenshotDir, `40-responsive-${viewport.name.toLowerCase().replace(' ', '-')}.png`),
        fullPage: true
      });
      console.log(`✅ Screenshot: ${viewport.name} (${viewport.width}x${viewport.height})`);

      // Check if buttons are visible and clickable
      const buttonsVisible = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar');
        const nav = document.querySelector('.bottom-nav');
        return {
          sidebar: sidebar ? window.getComputedStyle(sidebar).display : 'not found',
          nav: nav ? window.getComputedStyle(nav).display : 'not found'
        };
      });
      console.log(`  Sidebar visible: ${buttonsVisible.sidebar}`);
      console.log(`  Bottom nav visible: ${buttonsVisible.nav}\n`);
    }
  });
});
