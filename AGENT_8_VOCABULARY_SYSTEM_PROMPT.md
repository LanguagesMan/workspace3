# 🎯 AGENT 8: Word Tracking Database & Spaced Repetition

**Branch:** `agent-8-vocabulary-system`  
**Estimated Time:** 4-5 hours  
**Priority:** CRITICAL - Core learning feature

---

## 🎯 MISSION

Build a world-class vocabulary tracking and spaced repetition system using the proven Anki SM-2 algorithm. This is THE feature that makes language apps addictive and effective.

---

## 📋 CRITICAL TASKS

### Task 1: Database Schema (30 minutes)
**File:** `/prisma/schema.prisma`

Extend existing Prisma schema with vocabulary tables.

**Add these models:**

```prisma
model UserVocabulary {
  id              String   @id @default(cuid())
  userId          String
  word            String
  translation     String
  context         String?  // Sentence where word appeared
  source          String   // 'video', 'article', 'game'
  sourceId        String?  // ID of video/article
  
  // Interaction tracking
  clickedCount    Int      @default(1)
  saved           Boolean  @default(false)
  
  // Spaced repetition (SM-2)
  masteryLevel    Int      @default(0)  // 0-5 bars
  easeFactor      Float    @default(2.5)
  interval        Int      @default(1)   // days until next review
  repetitions     Int      @default(0)
  lastReviewDate  DateTime?
  nextReviewDate  DateTime?
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  user            User     @relation(fields: [userId], references: [id])
  reviews         ReviewSession[]
  
  @@unique([userId, word])
  @@index([userId, nextReviewDate])
  @@index([userId, saved])
}

model ReviewSession {
  id              String   @id @default(cuid())
  userId          String
  vocabularyId    String
  
  // Review quality (SM-2 scale)
  quality         Int      // 0=total blackout, 1=incorrect, 2=correct but hard, 3=correct, 4=correct easy, 5=perfect
  timeSpent       Int      // seconds
  
  createdAt       DateTime @default(now())
  
  // Relations
  user            User     @relation(fields: [userId], references: [id])
  vocabulary      UserVocabulary @relation(fields: [vocabularyId], references: [id])
  
  @@index([userId, createdAt])
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add_vocabulary_system
```

---

### Task 2: Spaced Repetition Engine (1.5 hours)
**File:** `/lib/spaced-repetition-engine.js`

Implement the SM-2 (SuperMemo 2) algorithm - the proven method used by Anki.

**Core Algorithm:**

```javascript
/**
 * SM-2 Algorithm for Spaced Repetition
 * 
 * EF = Ease Factor (2.5 default, range 1.3-2.5)
 * I = Interval (days until next review)
 * 
 * Based on quality of recall (0-5):
 * 0 = Complete blackout
 * 1 = Incorrect response
 * 2 = Incorrect but remembered upon seeing answer
 * 3 = Correct but difficult
 * 4 = Correct with hesitation
 * 5 = Perfect recall
 */

class SpacedRepetitionEngine {
  
  /**
   * Calculate next review date based on recall quality
   * @param {Object} word - Current word data
   * @param {number} quality - Recall quality (0-5)
   * @returns {Object} Updated word data
   */
  calculateNextReview(word, quality) {
    let { easeFactor, interval, repetitions } = word;
    
    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure EF stays within bounds
    if (easeFactor < 1.3) easeFactor = 1.3;
    if (easeFactor > 2.5) easeFactor = 2.5;
    
    // Calculate new interval
    if (quality < 3) {
      // Incorrect recall - reset to day 1
      repetitions = 0;
      interval = 1;
    } else {
      // Correct recall - increase interval
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    }
    
    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    
    // Calculate mastery level (0-5 bars)
    const masteryLevel = this.calculateMasteryLevel(repetitions, easeFactor);
    
    return {
      easeFactor,
      interval,
      repetitions,
      lastReviewDate: new Date(),
      nextReviewDate,
      masteryLevel
    };
  }
  
  /**
   * Calculate mastery level (0-5 bars in UI)
   */
  calculateMasteryLevel(repetitions, easeFactor) {
    if (repetitions === 0) return 0;
    if (repetitions === 1) return 1;
    if (repetitions <= 3) return 2;
    if (repetitions <= 6 && easeFactor >= 2.0) return 3;
    if (repetitions <= 10 && easeFactor >= 2.3) return 4;
    if (repetitions > 10 && easeFactor >= 2.5) return 5;
    return 3;
  }
  
  /**
   * Get words due for review today
   */
  async getWordsForReview(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await prisma.userVocabulary.findMany({
      where: {
        userId,
        saved: true,
        nextReviewDate: {
          lte: today
        }
      },
      orderBy: {
        nextReviewDate: 'asc'
      },
      take: 20  // Max 20 words per session
    });
  }
  
  /**
   * Get weakest words (low mastery, need practice)
   */
  async getWeakestWords(userId, limit = 10) {
    return await prisma.userVocabulary.findMany({
      where: {
        userId,
        saved: true,
        masteryLevel: {
          lt: 3
        }
      },
      orderBy: [
        { masteryLevel: 'asc' },
        { lastReviewDate: 'asc' }
      ],
      take: limit
    });
  }
  
  /**
   * Get vocabulary statistics
   */
  async getStats(userId) {
    const total = await prisma.userVocabulary.count({
      where: { userId, saved: true }
    });
    
    const mastered = await prisma.userVocabulary.count({
      where: { userId, saved: true, masteryLevel: { gte: 4 } }
    });
    
    const dueToday = await prisma.userVocabulary.count({
      where: {
        userId,
        saved: true,
        nextReviewDate: { lte: new Date() }
      }
    });
    
    return {
      totalWords: total,
      masteredWords: mastered,
      dueForReview: dueToday,
      percentMastered: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  }
}

module.exports = new SpacedRepetitionEngine();
```

---

### Task 3: Vocabulary API (1.5 hours)
**File:** `/api/vocabulary/index.js`

Create comprehensive REST API for vocabulary management.

**Endpoints:**

```javascript
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const srEngine = require('../../lib/spaced-repetition-engine');

const prisma = new PrismaClient();

// POST /api/vocabulary/click - Track word click
router.post('/click', async (req, res) => {
  try {
    const { userId, word, translation, context, source, sourceId } = req.body;
    
    // Find existing or create new
    const vocabulary = await prisma.userVocabulary.upsert({
      where: {
        userId_word: { userId, word }
      },
      update: {
        clickedCount: { increment: 1 },
        updatedAt: new Date()
      },
      create: {
        userId, word, translation,
        context, source, sourceId,
        clickedCount: 1
      }
    });
    
    res.json({ success: true, vocabulary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vocabulary/save - Save word to review list
router.post('/save', async (req, res) => {
  try {
    const { userId, word } = req.body;
    
    const vocabulary = await prisma.userVocabulary.update({
      where: { userId_word: { userId, word } },
      data: {
        saved: true,
        nextReviewDate: new Date()  // Review today
      }
    });
    
    res.json({ success: true, vocabulary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vocabulary/:userId - Get all user's words
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { saved, source } = req.query;
    
    const where = { userId };
    if (saved) where.saved = saved === 'true';
    if (source) where.source = source;
    
    const words = await prisma.userVocabulary.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ words });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/vocabulary/review - Submit review result
router.post('/review', async (req, res) => {
  try {
    const { userId, vocabularyId, quality, timeSpent } = req.body;
    
    // Get current word data
    const word = await prisma.userVocabulary.findUnique({
      where: { id: vocabularyId }
    });
    
    // Calculate next review with SM-2
    const updates = srEngine.calculateNextReview(word, quality);
    
    // Update word
    await prisma.userVocabulary.update({
      where: { id: vocabularyId },
      data: updates
    });
    
    // Log review session
    await prisma.reviewSession.create({
      data: { userId, vocabularyId, quality, timeSpent }
    });
    
    res.json({ success: true, nextReview: updates.nextReviewDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vocabulary/due/:userId - Words due for review
router.get('/due/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const words = await srEngine.getWordsForReview(userId);
    res.json({ words, count: words.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vocabulary/stats/:userId - Progress stats
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await srEngine.getStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/vocabulary/:wordId - Remove word
router.delete('/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params;
    await prisma.userVocabulary.delete({
      where: { id: wordId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Add to server.js:**
```javascript
app.use('/api/vocabulary', require('./api/vocabulary'));
```

---

### Task 4: Review UI (1 hour)
**File:** `/public/vocabulary-review.html`

Create beautiful flashcard review interface.

**Key Features:**
- Spanish word on front
- Flip to see English translation
- 4 quality buttons: "Again" "Hard" "Good" "Easy"
- Progress indicator
- Smooth animations
- Celebration when session complete

**HTML Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Vocabulary Review</title>
  <link rel="stylesheet" href="/css/tiktok-theme.css">
</head>
<body class="review-page">
  <!-- Progress Bar -->
  <div class="review-progress">
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <div class="progress-text">
      <span id="current">0</span> / <span id="total">0</span> reviewed
    </div>
  </div>
  
  <!-- Flashcard -->
  <div class="flashcard-container">
    <div class="flashcard" id="flashcard">
      <div class="flashcard-front">
        <div class="word-spanish" id="wordSpanish">hola</div>
        <div class="context" id="context">"Hola, ¿cómo estás?"</div>
        <button class="flip-btn" onclick="flipCard()">Show Answer</button>
      </div>
      
      <div class="flashcard-back" style="display: none;">
        <div class="word-spanish" id="wordSpanishBack">hola</div>
        <div class="word-english" id="wordEnglish">hello</div>
        <div class="context" id="contextBack">"Hola, ¿cómo estás?"</div>
        
        <div class="quality-buttons">
          <button class="quality-btn again" onclick="submitReview(0)">
            <span>😵</span>
            Again
            <small>< 1d</small>
          </button>
          <button class="quality-btn hard" onclick="submitReview(2)">
            <span>😅</span>
            Hard
            <small>~3d</small>
          </button>
          <button class="quality-btn good" onclick="submitReview(3)">
            <span>😊</span>
            Good
            <small>~7d</small>
          </button>
          <button class="quality-btn easy" onclick="submitReview(5)">
            <span>😎</span>
            Easy
            <small>~14d</small>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mastery Progress -->
    <div class="mastery-bars">
      <div class="bar" data-level="1"></div>
      <div class="bar" data-level="2"></div>
      <div class="bar" data-level="3"></div>
      <div class="bar" data-level="4"></div>
      <div class="bar" data-level="5"></div>
    </div>
  </div>
  
  <!-- Complete Screen -->
  <div class="review-complete" id="completeScreen" style="display: none;">
    <div class="confetti"></div>
    <h1>🎉 Great Work!</h1>
    <div class="stats">
      <div class="stat">
        <div class="stat-value" id="reviewedCount">0</div>
        <div class="stat-label">Words Reviewed</div>
      </div>
      <div class="stat">
        <div class="stat-value" id="avgQuality">0</div>
        <div class="stat-label">Avg Quality</div>
      </div>
    </div>
    <button class="btn-primary" onclick="window.location.href='/'">
      Back to Feed
    </button>
  </div>
  
  <script src="/js/vocabulary-review.js"></script>
</body>
</html>
```

**JavaScript** (`/public/js/vocabulary-review.js`):
- Load words due for review
- Manage flashcard state
- Handle flip animations
- Submit review quality
- Update progress
- Show celebration on complete

---

### Task 5: Frontend Integration (45 minutes)

**Update word-click handlers in all pages:**

```javascript
// Replace localStorage with API calls
async function handleWordClick(word, translation, context, source) {
  try {
    // Track click
    const response = await fetch('/api/vocabulary/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: getCurrentUserId(),
        word,
        translation,
        context,
        source,
        sourceId: getCurrentContentId()
      })
    });
    
    const data = await response.json();
    
    // Show translation popup with save button
    showTranslationPopup(word, translation, data.vocabulary.id);
    
  } catch (error) {
    console.error('Failed to track word:', error);
  }
}

async function saveWord(vocabularyId) {
  await fetch('/api/vocabulary/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getCurrentUserId(),
      vocabularyId
    })
  });
  
  // Update badge count
  updateReviewBadge();
}
```

**Update bottom nav** (`/public/components/bottom-nav.html`):
```html
<nav class="bottom-nav">
  <a href="/" class="nav-item active">
    <i class="icon-home"></i>
    <span>Feed</span>
  </a>
  <a href="/discover-ai.html" class="nav-item">
    <i class="icon-discover"></i>
    <span>Discover</span>
  </a>
  <a href="/vocabulary-review.html" class="nav-item">
    <i class="icon-review"></i>
    <span>Review</span>
    <span class="badge" id="reviewBadge">0</span>
  </a>
  <a href="/games-hub.html" class="nav-item">
    <i class="icon-games"></i>
    <span>Games</span>
  </a>
  <a href="/profile.html" class="nav-item">
    <i class="icon-profile"></i>
    <span>Profile</span>
  </a>
</nav>
```

**Update badge count:**
```javascript
async function updateReviewBadge() {
  const response = await fetch(`/api/vocabulary/due/${userId}`);
  const data = await response.json();
  document.getElementById('reviewBadge').textContent = data.count;
}
```

---

### Task 6: Playwright Visual Tests (45 minutes)
**File:** `/tests/vocabulary-spaced-repetition.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Vocabulary & Spaced Repetition System', () => {
  
  test('Word clicking tracks to database', async ({ page }) => {
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    
    // Click a subtitle word
    await page.click('.subtitle-word');
    
    // Verify translation popup
    await expect(page.locator('.translation-popup')).toBeVisible();
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/word-click-translation.png' });
  });
  
  test('Saving word adds to review list', async ({ page }) => {
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.click('.subtitle-word');
    await page.click('.save-word-btn');
    
    // Verify badge updates
    const badge = await page.locator('#reviewBadge').textContent();
    expect(parseInt(badge)).toBeGreaterThan(0);
  });
  
  test('Review interface loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/vocabulary-review.html');
    
    // Verify flashcard visible
    await expect(page.locator('.flashcard')).toBeVisible();
    await expect(page.locator('.word-spanish')).toBeVisible();
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/review-flashcard-front.png', fullPage: true });
  });
  
  test('Flashcard flip works', async ({ page }) => {
    await page.goto('http://localhost:3001/vocabulary-review.html');
    
    // Click flip button
    await page.click('.flip-btn');
    
    // Verify back side visible
    await expect(page.locator('.flashcard-back')).toBeVisible();
    await expect(page.locator('.quality-buttons')).toBeVisible();
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/review-flashcard-back.png', fullPage: true });
  });
  
  test('Quality rating updates spaced repetition', async ({ page }) => {
    await page.goto('http://localhost:3001/vocabulary-review.html');
    await page.click('.flip-btn');
    await page.click('.quality-btn.good');
    
    // Verify next card loads
    await expect(page.locator('.flashcard-front')).toBeVisible();
    
    // Verify progress updates
    const progress = await page.locator('#current').textContent();
    expect(parseInt(progress)).toBeGreaterThan(0);
  });
  
  test('Review session completion shows celebration', async ({ page }) => {
    // Complete all reviews
    // Verify celebration screen
    await expect(page.locator('.review-complete')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Great Work');
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/review-complete.png', fullPage: true });
  });
  
  test('Vocabulary stats API works', async ({ page }) => {
    const response = await page.request.get('/api/vocabulary/stats/test-user');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('totalWords');
    expect(data).toHaveProperty('masteredWords');
    expect(data).toHaveProperty('dueForReview');
  });
  
  test('SM-2 algorithm calculates intervals correctly', async () => {
    // Test interval progression
    // Quality 5: 1d → 6d → 15d → 37d
    // Quality 3: 1d → 6d → 12d → 24d
    // Quality 1: Reset to 1d
  });
});
```

---

## 📁 FILES TO CREATE

```
/prisma/schema.prisma                      (UPDATE - add models)
/lib/spaced-repetition-engine.js           (NEW - 400 lines)
/api/vocabulary/index.js                   (NEW - 300 lines)
/public/vocabulary-review.html             (NEW - 200 lines)
/public/js/vocabulary-review.js            (NEW - 300 lines)
/public/css/vocabulary-review.css          (NEW - 150 lines)
/tests/vocabulary-spaced-repetition.spec.js (NEW - 250 lines)
```

## 📁 FILES TO MODIFY

```
/server.js                                 (UPDATE - add route)
/public/components/bottom-nav.html         (UPDATE - add badge)
/public/tiktok-video-feed.html            (UPDATE - API calls)
/public/discover-ai.html                   (UPDATE - API calls)
All game files                             (UPDATE - use vocabulary)
```

---

## 🎯 SUCCESS CRITERIA

- ✅ SM-2 algorithm implemented correctly
- ✅ Words track clicks and saves to database
- ✅ Review interface beautiful and smooth
- ✅ Badge count updates in real-time
- ✅ Intervals progress correctly (1d→6d→15d...)
- ✅ Mastery bars show visually
- ✅ All Playwright tests pass with screenshots
- ✅ No localStorage - everything in database

---

**GO BUILD THE BEST VOCABULARY SYSTEM! 🚀**

