/**
 * CYCLE 2: VOCABULARY REVIEW SYSTEM
 * From MASTER_PLAN.md - "Steal from: Anki, Quizlet"
 *
 * Testing the actual implementation based on research:
 * - Anki SM-2 algorithm (https://apps.ankiweb.net/)
 * - Quizlet flip animations (https://quizlet.com/blog/introducing-our-new-flip-flashcards-mode)
 * - Duolingo quiz patterns (https://blog.duolingo.com/)
 *
 * What We Built:
 * 1. Flashcard grid with flip animation (Quizlet pattern)
 * 2. Spaced repetition SM-2 (Anki pattern)
 * 3. Quiz mode (Duolingo 4-option pattern)
 * 4. Search/filter saved words
 */

const { test, expect } = require('@playwright/test');

test.describe('Cycle 2 - Vocabulary Review System', () => {

  test('should have vocabulary review section in HTML', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Check vocab section exists in DOM (Anki/Quizlet pattern)
    const vocabSection = await page.locator('#vocabReviewSection').count();
    expect(vocabSection).toBe(1);

    console.log('✅ Vocab section found in DOM');

    await page.screenshot({
      path: 'screenshots/cycle2-vocab-section-exists.png',
      fullPage: true
    });
  });

  test('should have Anki-style 4-button review pattern', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Make vocab section visible for testing
    await page.evaluate(() => {
      const section = document.getElementById('vocabReviewSection');
      if (section) section.style.display = 'flex';
    });

    await page.waitForTimeout(500);

    // Check for Anki 4-button pattern: Again, Hard, Good, Easy
    const reviewButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.review-buttons .review-btn'));
      return {
        count: buttons.length,
        buttons: buttons.map(btn => ({
          text: btn.textContent.replace(/\s+/g, ' ').trim(),
          quality: btn.getAttribute('data-quality'),
          class: btn.className
        }))
      };
    });

    console.log('Anki Review Buttons:', reviewButtons);

    // Anki uses 4 buttons: Again (1), Hard (2), Good (4), Easy (5)
    expect(reviewButtons.count).toBe(4);

    await page.screenshot({
      path: 'screenshots/cycle2-anki-review-buttons.png',
      fullPage: true
    });
  });

  test('should have Quizlet-style flashcard with 3D flip animation', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Make vocab section visible
    await page.evaluate(() => {
      const section = document.getElementById('vocabReviewSection');
      if (section) section.style.display = 'flex';
    });

    await page.waitForTimeout(500);

    // Check for Quizlet flashcard structure and CSS
    const flashcardData = await page.evaluate(() => {
      const flashcard = document.querySelector('.flashcard');
      const inner = flashcard ? flashcard.querySelector('.flashcard-inner') : null;

      if (!flashcard || !inner) return null;

      const flashcardStyles = window.getComputedStyle(flashcard);
      const innerStyles = window.getComputedStyle(inner);

      return {
        // Quizlet pattern: perspective: 1000px
        perspective: flashcardStyles.perspective,
        cursor: flashcardStyles.cursor,

        // Quizlet pattern: transform-style: preserve-3d, transition: 0.6s
        transformStyle: innerStyles.transformStyle,
        transition: innerStyles.transition,

        // Card structure: front and back
        hasFront: !!flashcard.querySelector('.flashcard-front'),
        hasBack: !!flashcard.querySelector('.flashcard-back'),

        // Content areas
        hasSpanishLabel: !!flashcard.querySelector('.card-label'),
        hasWordDisplay: !!flashcard.querySelector('.card-word'),
        hasContext: !!flashcard.querySelector('.card-context')
      };
    });

    console.log('Quizlet Flashcard CSS:', flashcardData);

    expect(flashcardData).not.toBeNull();
    expect(flashcardData.perspective).toBe('1000px'); // Quizlet standard
    expect(flashcardData.transformStyle).toBe('preserve-3d');
    expect(flashcardData.hasFront).toBe(true);
    expect(flashcardData.hasBack).toBe(true);

    await page.screenshot({
      path: 'screenshots/cycle2-quizlet-flashcard.png',
      fullPage: true
    });
  });

  test('should have Duolingo-style quiz mode with 4 options', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Make vocab section visible
    await page.evaluate(() => {
      const section = document.getElementById('vocabReviewSection');
      if (section) section.style.display = 'flex';
    });

    await page.waitForTimeout(500);

    // Check for Duolingo quiz pattern: 4-option multiple choice
    const quizData = await page.evaluate(() => {
      const quizContainer = document.getElementById('quizMode');
      if (!quizContainer) return null;

      const options = Array.from(quizContainer.querySelectorAll('.quiz-option'));
      return {
        hasQuizContainer: !!quizContainer,
        optionCount: options.length,
        options: options.map(opt => ({
          hasLetter: !!opt.querySelector('.option-letter'),
          letterText: opt.querySelector('.option-letter')?.textContent
        })),
        hasFeedback: !!quizContainer.querySelector('.quiz-feedback'),
        hasNextButton: !!quizContainer.querySelector('.quiz-next-btn')
      };
    });

    console.log('Duolingo Quiz Pattern:', quizData);

    expect(quizData).not.toBeNull();
    expect(quizData.hasQuizContainer).toBe(true);
    expect(quizData.optionCount).toBe(4); // Duolingo uses 4 options (A/B/C/D)

    await page.screenshot({
      path: 'screenshots/cycle2-duolingo-quiz.png',
      fullPage: true
    });
  });

  test('should have mode selector for Flashcards vs Quiz', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Make vocab section visible
    await page.evaluate(() => {
      const section = document.getElementById('vocabReviewSection');
      if (section) section.style.display = 'flex';
    });

    await page.waitForTimeout(500);

    // Check mode selector (Quizlet has Flashcards, Learn, Test modes)
    const modeSelector = await page.evaluate(() => {
      const selector = document.querySelector('.review-mode-selector');
      if (!selector) return null;

      const modeButtons = Array.from(selector.querySelectorAll('.mode-btn'));
      return {
        exists: true,
        modeCount: modeButtons.length,
        modes: modeButtons.map(btn => ({
          text: btn.textContent.trim().replace(/\s+/g, ' '),
          mode: btn.getAttribute('data-mode'),
          active: btn.classList.contains('active')
        }))
      };
    });

    console.log('Mode Selector (Quizlet pattern):', modeSelector);

    expect(modeSelector).not.toBeNull();
    expect(modeSelector.exists).toBe(true);
    expect(modeSelector.modeCount).toBe(2); // Flashcard & Quiz modes

    await page.screenshot({
      path: 'screenshots/cycle2-mode-selector.png',
      fullPage: true
    });
  });

  test('should have search and filter controls', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Make vocab section visible
    await page.evaluate(() => {
      const section = document.getElementById('vocabReviewSection');
      if (section) section.style.display = 'flex';
    });

    await page.waitForTimeout(500);

    // Check search/filter (Quizlet/Anki pattern)
    const searchFilter = await page.evaluate(() => {
      return {
        hasSearchInput: !!document.getElementById('vocabSearchInput'),
        hasFilterSelect: !!document.getElementById('vocabFilterSelect'),
        filterOptions: Array.from(document.querySelectorAll('#vocabFilterSelect option')).map(opt => opt.value)
      };
    });

    console.log('Search & Filter:', searchFilter);

    expect(searchFilter.hasSearchInput).toBe(true);
    expect(searchFilter.hasFilterSelect).toBe(true);
    expect(searchFilter.filterOptions).toContain('all');
    expect(searchFilter.filterOptions).toContain('due'); // Anki "due for review" pattern

    await page.screenshot({
      path: 'screenshots/cycle2-search-filter.png',
      fullPage: true
    });
  });

  test('should have vocabulary stats display', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Make vocab section visible
    await page.evaluate(() => {
      const section = document.getElementById('vocabReviewSection');
      if (section) section.style.display = 'flex';
    });

    await page.waitForTimeout(500);

    // Check stats (Anki pattern)
    const stats = await page.evaluate(() => {
      return {
        hasVocabCount: !!document.getElementById('vocabCount'),
        hasVocabDue: !!document.getElementById('vocabDue'),
        vocabCountText: document.getElementById('vocabCount')?.textContent,
        vocabDueText: document.getElementById('vocabDue')?.textContent
      };
    });

    console.log('Vocabulary Stats:', stats);

    expect(stats.hasVocabCount).toBe(true);
    expect(stats.hasVocabDue).toBe(true);

    await page.screenshot({
      path: 'screenshots/cycle2-vocab-stats.png',
      fullPage: true
    });
  });

  test('should have empty state for when no words saved', async ({ page }) => {
    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    // Check empty state exists in HTML
    const emptyState = await page.evaluate(() => {
      const empty = document.getElementById('vocabEmpty');
      return {
        exists: !!empty,
        hasIcon: !!empty?.querySelector('.empty-icon'),
        hasTitle: !!empty?.querySelector('h3'),
        hasDescription: !!empty?.querySelector('p'),
        text: empty?.textContent.replace(/\s+/g, ' ').trim()
      };
    });

    console.log('Empty State:', emptyState);

    expect(emptyState.exists).toBe(true);
    expect(emptyState.hasIcon).toBe(true);

    await page.screenshot({
      path: 'screenshots/cycle2-empty-state.png',
      fullPage: true
    });
  });

});
