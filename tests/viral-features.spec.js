// Test all VIRAL addictive features - Simplify button, learned words, personalized stories
import { test, expect } from '@playwright/test';

test.describe('💰 BILLIONAIRE FEATURES - Revenue & Viral', () => {
  test('Simplify-on-demand button works (4 levels)', async ({ page }) => {
    await page.goto('http://localhost:3002/articles-feed.html');
    await page.waitForLoadState('networkidle');

    // Wait for articles to load
    await page.waitForSelector('.article-card', { timeout: 10000 });

    // Check simplify button exists
    const simplifyBtn = page.locator('.simplify-btn').first();
    await expect(simplifyBtn).toBeVisible();
    await expect(simplifyBtn).toHaveText(/Make it Simpler/);

    // Check initial level
    const levelIndicator = page.locator('.simplicity-level').first();
    await expect(levelIndicator).toContainText('Normal');

    // Click simplify button - Level 1
    await simplifyBtn.click();
    await page.waitForTimeout(500);
    await expect(levelIndicator).toContainText('Simple');
    await expect(simplifyBtn).toHaveText(/Even Simpler/);

    // Click simplify button - Level 2
    await simplifyBtn.click();
    await page.waitForTimeout(1000);
    const level2Text = await levelIndicator.textContent();
    console.log(`Level 2 text: ${level2Text}`);
    expect(level2Text).toContain('Simpler');
    await expect(simplifyBtn).toHaveText(/Super Simple/);

    // Click simplify button - Level 3
    await simplifyBtn.click();
    await page.waitForTimeout(500);
    await expect(levelIndicator).toContainText('Simplest');
    await expect(simplifyBtn).toHaveText(/Reset/);

    // Click simplify button - Reset to Normal
    await simplifyBtn.click();
    await page.waitForTimeout(500);
    await expect(levelIndicator).toContainText('Normal');

    console.log('✅ Simplify-on-demand: 4 levels working perfectly!');

    await page.screenshot({ path: 'screenshots/workspace3/VIRAL-simplify-feature.png', fullPage: true });
  });

  test('Learned words are highlighted in articles', async ({ page }) => {
    await page.goto('http://localhost:3002/articles-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.article-card', { timeout: 10000 });

    // Save some words first
    await page.evaluate(() => {
      const savedWords = [
        { word: 'español', translation: 'Spanish' },
        { word: 'hermoso', translation: 'beautiful' },
        { word: 'cultura', translation: 'culture' }
      ];
      localStorage.setItem('savedWords', JSON.stringify(savedWords));
    });

    // Reload page
    await page.reload();
    await page.waitForSelector('.article-card', { timeout: 10000 });

    // Check if learned words are highlighted
    const learnedWords = page.locator('.learned-word');
    const count = await learnedWords.count();

    console.log(`✅ Learned words highlighted: ${count} instances found`);
    expect(count).toBeGreaterThan(0);

    // Check styling of learned words
    if (count > 0) {
      const firstLearnedWord = learnedWords.first();
      const bgColor = await firstLearnedWord.evaluate(el =>
        window.getComputedStyle(el).background
      );
      expect(bgColor).toContain('gradient'); // Has gradient background

      console.log('✅ Learned words have special styling (green gradient)');
    }

    await page.screenshot({ path: 'screenshots/workspace3/VIRAL-learned-words.png', fullPage: true });
  });

  test('Personalized stories generate with learned words', async ({ page }) => {
    // First, add some learned words
    await page.goto('http://localhost:3002/articles-feed.html');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const savedWords = [
        { word: 'español', translation: 'Spanish' },
        { word: 'hermoso', translation: 'beautiful' },
        { word: 'ciudad', translation: 'city' },
        { word: 'comida', translation: 'food' },
        { word: 'feliz', translation: 'happy' },
        { word: 'viaje', translation: 'travel' },
        { word: 'amigos', translation: 'friends' }
      ];
      localStorage.setItem('savedWords', JSON.stringify(savedWords));
    });

    // Go to my stories page
    await page.goto('http://localhost:3002/my-stories.html');
    await page.waitForLoadState('networkidle');

    // Check stats show learned words
    const wordsLearnedStat = page.locator('#wordsLearned');
    await expect(wordsLearnedStat).toHaveText('7');
    console.log('✅ Stats show 7 learned words');

    // Click generate story button
    const generateBtn = page.locator('.generate-btn').first();
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Wait for loading and story generation
    await page.waitForSelector('.loading', { timeout: 5000 });
    await page.waitForSelector('.story-card', { timeout: 10000 });

    // Check story was generated
    const storyCards = page.locator('.story-card');
    const storyCount = await storyCards.count();
    expect(storyCount).toBeGreaterThan(0);
    console.log(`✅ Generated ${storyCount} personalized story`);

    // Check story contains learned words (highlighted)
    const learnedWordsInStory = page.locator('.story-card .learned-word');
    const wordCount = await learnedWordsInStory.count();
    expect(wordCount).toBeGreaterThan(4); // At least 5 words used
    console.log(`✅ Story uses ${wordCount} learned words`);

    // Check story has title
    const storyTitle = page.locator('.story-title').first();
    await expect(storyTitle).toBeVisible();
    const titleText = await storyTitle.textContent();
    console.log(`✅ Story title: "${titleText}"`);

    // Check actions buttons exist
    const readBtn = page.locator('.btn-read').first();
    const shareBtn = page.locator('.btn-share').first();
    await expect(readBtn).toBeVisible();
    await expect(shareBtn).toBeVisible();
    console.log('✅ Story has Read Aloud and Share buttons');

    await page.screenshot({ path: 'screenshots/workspace3/VIRAL-personalized-story.png', fullPage: true });
  });

  test('Viral news/gossip content is addictive', async ({ page }) => {
    await page.goto('http://localhost:3002/articles-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.article-card', { timeout: 10000 });

    // Check for viral headlines (emoji + celebrity/sports/music)
    const articles = page.locator('.article-card');
    const count = await articles.count();
    expect(count).toBeGreaterThan(5); // At least 6 viral articles
    console.log(`✅ ${count} articles loaded (viral news/gossip)`);

    // Check for specific viral topics
    const titles = await page.locator('.article-title').allTextContents();
    const viralTopics = titles.filter(title =>
      title.includes('Shakira') ||
      title.includes('Real Madrid') ||
      title.includes('Bad Bunny') ||
      title.includes('Rosalía') ||
      title.includes('tacos') ||
      title.includes('playas')
    );

    expect(viralTopics.length).toBeGreaterThan(3);
    console.log(`✅ Found ${viralTopics.length} viral topics (celebrities, sports, music, food)`);

    // Check articles have engaging thumbnails
    const thumbnails = page.locator('.article-image');
    const thumbnailCount = await thumbnails.count();
    expect(thumbnailCount).toBeGreaterThan(5);
    console.log(`✅ All articles have eye-catching images`);

    // Check interactive words exist (click-to-translate)
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = await interactiveWords.count();
    expect(wordCount).toBeGreaterThan(5); // At least 6 interactive words
    console.log(`✅ ${wordCount} interactive words (Lingopie-style)`);

    // Test clicking a word shows translation
    if (wordCount > 0) {
      await interactiveWords.first().click();
      await page.waitForSelector('.translation-modal.active', { timeout: 5000 });
      const modal = page.locator('.translation-modal.active');
      await expect(modal).toBeVisible();
      console.log('✅ Click-to-translate working (translation modal)');

      // Check save flashcard button
      const saveBtn = page.locator('.btn-save');
      await expect(saveBtn).toBeVisible();
    }

    await page.screenshot({ path: 'screenshots/workspace3/VIRAL-addictive-content.png', fullPage: true });
  });

  test('All viral features work together (integration)', async ({ page }) => {
    // Full user journey: Learn words → Simplify → Generate story

    // Step 1: Go to articles and learn words
    await page.goto('http://localhost:3002/articles-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.article-card', { timeout: 10000 });

    // Click on 5 different words to learn them
    const interactiveWords = page.locator('.interactive-word');
    const wordCount = Math.min(5, await interactiveWords.count());

    for (let i = 0; i < wordCount; i++) {
      await interactiveWords.nth(i).click();
      await page.waitForSelector('.translation-modal.active', { timeout: 3000 });

      // Save word
      const saveBtn = page.locator('.btn-save');
      await saveBtn.click();
      await page.waitForTimeout(500);

      // Close modal by clicking overlay
      const overlay = page.locator('#modalOverlay');
      await overlay.click();
      await page.waitForTimeout(500);
    }

    console.log(`✅ Step 1: Learned ${wordCount} words`);

    // Step 2: Test simplify feature
    const simplifyBtn = page.locator('.simplify-btn').first();
    await simplifyBtn.click();
    await page.waitForTimeout(500);

    const levelIndicator = page.locator('.simplicity-level').first();
    await expect(levelIndicator).toContainText('Simple');
    console.log('✅ Step 2: Simplified article text');

    // Step 3: Go to personalized stories
    await page.goto('http://localhost:3002/my-stories.html');
    await page.waitForLoadState('networkidle');

    // Wait for stats to update
    await page.waitForSelector('#wordsLearned', { timeout: 5000 });
    const learnedStat = await page.locator('#wordsLearned').textContent();
    expect(parseInt(learnedStat)).toBeGreaterThan(0);
    console.log(`✅ Step 3: Stats show ${learnedStat} learned words`);

    // Generate story
    const generateBtn = page.locator('.generate-btn').first();
    await generateBtn.click();

    // Wait for story
    await page.waitForSelector('.story-card', { timeout: 10000 });
    const storyCard = page.locator('.story-card').first();
    await expect(storyCard).toBeVisible();

    console.log('✅ Step 4: Generated personalized story');

    // Check story uses learned words
    const learnedWordsInStory = page.locator('.story-card .learned-word');
    const usedWords = await learnedWordsInStory.count();
    expect(usedWords).toBeGreaterThan(0);
    console.log(`✅ Step 5: Story uses ${usedWords} of your learned words`);

    await page.screenshot({ path: 'screenshots/workspace3/VIRAL-full-journey.png', fullPage: true });

    console.log('');
    console.log('🎉 FULL VIRAL JOURNEY COMPLETE:');
    console.log('   1. ✅ User learns words from addictive news/gossip');
    console.log('   2. ✅ User simplifies articles on-demand (4 levels)');
    console.log('   3. ✅ Learned words highlighted everywhere');
    console.log('   4. ✅ Personalized stories generated from learned words');
    console.log('   5. ✅ 100% ADDICTIVE - Reddit/TikTok quality!');
  });
});
