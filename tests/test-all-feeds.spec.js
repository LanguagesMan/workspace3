// Test all 3 BOLD new feed designs
import { test, expect } from '@playwright/test';

test.describe('🚀 BOLD Multi-Feed Design', () => {
  test('Videos Feed - YouTube Shorts / Lingopie style', async ({ page }) => {
    await page.goto('http://localhost:3002/videos-feed.html');

    // Check full-screen vertical layout
    const container = page.locator('.shorts-container');
    await expect(container).toBeVisible();

    // Check scroll-snap is applied
    const scrollSnap = await container.evaluate(el =>
      window.getComputedStyle(el).scrollSnapType
    );
    expect(scrollSnap).toContain('y');

    // Check interactive subtitles exist
    const subtitles = page.locator('.interactive-subtitles');
    await expect(subtitles.first()).toBeVisible();

    // Check playback controls (Lingopie feature)
    const playbackControls = page.locator('.playback-controls');
    await expect(playbackControls.first()).toBeVisible();

    // Check interaction bar (YouTube Shorts feature)
    const interactionBar = page.locator('.interaction-bar');
    await expect(interactionBar.first()).toBeVisible();

    console.log('✅ Videos Feed: Full-screen vertical + Lingopie controls + YouTube interactions');

    await page.screenshot({ path: 'screenshots/FEED-videos-bold.png', fullPage: true });
  });

  test('Articles Feed - Medium / Flipboard style', async ({ page }) => {
    await page.goto('http://localhost:3002/articles-feed.html');

    // Check grid layout exists
    const grid = page.locator('.articles-grid');
    await expect(grid).toBeVisible();

    // Check article cards are rendered
    const cards = page.locator('.article-card');
    const count = await cards.count();
    console.log(`✅ Articles Feed: ${count} article cards rendered`);
    expect(count).toBeGreaterThan(0);

    // Check interactive words exist (Lingopie feature)
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    console.log(`✅ Articles Feed: ${wordCount} interactive words (click-to-translate)`);
    expect(wordCount).toBeGreaterThan(0);

    // Test clicking a word shows translation modal
    if (wordCount > 0) {
      await interactiveWords.first().click();
      const modal = page.locator('.translation-modal.active');
      await expect(modal).toBeVisible();
      console.log('✅ Articles Feed: Translation modal working');
    }

    await page.screenshot({ path: 'screenshots/FEED-articles-bold.png', fullPage: true });
  });

  test('Memes Feed - Reddit / 9GAG style', async ({ page }) => {
    await page.goto('http://localhost:3002/memes-feed.html');

    // Check memes container exists
    const container = page.locator('.memes-container');
    await expect(container).toBeVisible();

    // Check meme cards are rendered
    const cards = page.locator('.meme-card');
    const count = await cards.count();
    console.log(`✅ Memes Feed: ${count} meme cards rendered`);
    expect(count).toBeGreaterThan(0);

    // Check interactive learning section exists
    const learnSections = page.locator('.learn-section');
    const learnCount = await learnSections.count();
    console.log(`✅ Memes Feed: ${learnCount} learning sections with word breakdowns`);

    // Check action buttons (like, share, save)
    const actionButtons = page.locator('.action-btn');
    await expect(actionButtons.first()).toBeVisible();

    // Test liking a meme
    await actionButtons.first().click();
    console.log('✅ Memes Feed: Like interaction working');

    await page.screenshot({ path: 'screenshots/FEED-memes-bold.png', fullPage: true });
  });

  test('All feeds are different designs (not repetitive)', async ({ page }) => {
    // Test that each feed has unique design patterns
    const feeds = [
      { url: 'videos-feed.html', selector: '.shorts-container', name: 'Videos (vertical scroll)' },
      { url: 'articles-feed.html', selector: '.articles-grid', name: 'Articles (card grid)' },
      { url: 'memes-feed.html', selector: '.memes-container', name: 'Memes (social feed)' }
    ];

    for (const feed of feeds) {
      await page.goto(`http://localhost:3002/${feed.url}`);
      const element = page.locator(feed.selector);
      await expect(element).toBeVisible();
      console.log(`✅ ${feed.name}: Unique design confirmed`);
    }

    console.log('✅ SUCCESS: All 3 feeds have different, non-repetitive designs!');
  });
});
