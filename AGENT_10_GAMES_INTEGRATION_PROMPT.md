# 🎯 AGENT 10: Games & Quizzes Integration

**Branch:** `agent-10-games-integration`  
**Estimated Time:** 2-3 hours  
**Priority:** HIGH - Make games actually useful for learning

---

## 🎯 MISSION

Connect all games and quizzes to user vocabulary and make them truly personalized learning tools. Transform generic games into adaptive practice sessions that reinforce what users are actually learning.

---

## 📋 CRITICAL TASKS

### Task 1: Quiz Generation Engine (1 hour)
**File:** `/lib/quiz-generator.js`

Build intelligent quiz generator that creates questions from user's vocabulary.

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class QuizGenerator {
  
  /**
   * Generate personalized quiz for user
   */
  async generateQuiz(userId, options = {}) {
    const {
      count = 10,
      difficulty = null,
      type = 'mixed',
      focusOnWeak = true
    } = options;
    
    // Get user's words
    let words = await this.getUserWords(userId, focusOnWeak);
    
    // Filter by difficulty if specified
    if (difficulty) {
      words = words.filter(w => w.difficulty === difficulty);
    }
    
    // Generate questions
    const questions = [];
    const questionTypes = this.getQuestionTypes(type);
    
    for (let i = 0; i < count && words.length > 0; i++) {
      const questionType = questionTypes[i % questionTypes.length];
      const word = words[i % words.length];
      
      const question = await this.generateQuestion(word, questionType, userId);
      questions.push(question);
    }
    
    return questions;
  }
  
  /**
   * Get user's vocabulary, prioritizing weak words
   */
  async getUserWords(userId, focusOnWeak = true) {
    const where = {
      userId,
      saved: true
    };
    
    if (focusOnWeak) {
      where.masteryLevel = { lt: 3 };
    }
    
    return await prisma.userVocabulary.findMany({
      where,
      orderBy: focusOnWeak 
        ? [{ masteryLevel: 'asc' }, { lastReviewDate: 'asc' }]
        : { createdAt: 'desc' },
      take: 50
    });
  }
  
  /**
   * Generate a single question
   */
  async generateQuestion(word, type, userId) {
    switch (type) {
      case 'multiple_choice':
        return await this.generateMultipleChoice(word, userId);
      case 'fill_blank':
        return await this.generateFillBlank(word);
      case 'match_pairs':
        return await this.generateMatchPairs(word, userId);
      case 'true_false':
        return await this.generateTrueFalse(word);
      case 'audio':
        return await this.generateAudioQuestion(word);
      default:
        return await this.generateMultipleChoice(word, userId);
    }
  }
  
  /**
   * Multiple choice: Spanish → English
   */
  async generateMultipleChoice(word, userId) {
    // Get 3 wrong answers from similar difficulty words
    const wrongAnswers = await prisma.userVocabulary.findMany({
      where: {
        userId,
        word: { not: word.word },
        saved: true
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    
    const options = [
      word.translation,
      ...wrongAnswers.map(w => w.translation)
    ];
    
    // Shuffle options
    const shuffled = this.shuffle(options);
    
    return {
      id: `mc_${word.id}`,
      type: 'multiple_choice',
      question: `What does "${word.word}" mean?`,
      options: shuffled,
      correctIndex: shuffled.indexOf(word.translation),
      wordId: word.id,
      difficulty: word.difficulty || 'B1',
      context: word.context
    };
  }
  
  /**
   * Fill in the blank: Use word in context
   */
  generateFillBlank(word) {
    // Use the original context if available
    let sentence = word.context || `Me gusta mucho ${word.word}.`;
    
    // Replace word with blank
    const blanked = sentence.replace(word.word, '____');
    
    return {
      id: `fb_${word.id}`,
      type: 'fill_blank',
      question: `Complete the sentence:`,
      sentence: blanked,
      correctAnswer: word.word,
      wordId: word.id,
      difficulty: word.difficulty || 'B1',
      hint: word.translation
    };
  }
  
  /**
   * Match pairs: Match 5 Spanish words to English
   */
  async generateMatchPairs(word, userId) {
    const words = await prisma.userVocabulary.findMany({
      where: { userId, saved: true },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      id: `mp_${word.id}`,
      type: 'match_pairs',
      question: 'Match the Spanish words to their English translations',
      pairs: words.map(w => ({
        spanish: w.word,
        english: w.translation,
        wordId: w.id
      })),
      difficulty: 'B1'
    };
  }
  
  /**
   * True/False: Test word knowledge
   */
  generateTrueFalse(word) {
    // 50% chance correct, 50% wrong translation
    const isCorrect = Math.random() > 0.5;
    const displayTranslation = isCorrect ? word.translation : this.getRandomWrongTranslation();
    
    return {
      id: `tf_${word.id}`,
      type: 'true_false',
      question: `"${word.word}" means "${displayTranslation}"`,
      correctAnswer: isCorrect,
      wordId: word.id,
      difficulty: word.difficulty || 'B1'
    };
  }
  
  /**
   * Audio recognition: Listen and select word
   */
  generateAudioQuestion(word) {
    return {
      id: `audio_${word.id}`,
      type: 'audio',
      question: 'Listen and select what you hear',
      audioText: word.word,
      audioUrl: `/api/tts?text=${encodeURIComponent(word.word)}`,
      options: [word.word, /* + 3 similar sounding words */],
      correctIndex: 0,
      wordId: word.id,
      difficulty: word.difficulty || 'B1'
    };
  }
  
  getQuestionTypes(type) {
    if (type === 'mixed') {
      return ['multiple_choice', 'fill_blank', 'true_false', 'multiple_choice', 'fill_blank'];
    }
    return [type];
  }
  
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  getRandomWrongTranslation() {
    const wrong = ['car', 'house', 'tree', 'book', 'water', 'food'];
    return wrong[Math.floor(Math.random() * wrong.length)];
  }
}

module.exports = new QuizGenerator();
```

---

### Task 2: Games API (30 minutes)
**File:** `/api/games/index.js`

```javascript
const express = require('express');
const router = express.Router();
const quizGenerator = require('../../lib/quiz-generator');
const srEngine = require('../../lib/spaced-repetition-engine');

// GET /api/games/quiz - Generate personalized quiz
router.get('/quiz', async (req, res) => {
  try {
    const { userId, count, difficulty, type } = req.query;
    
    const questions = await quizGenerator.generateQuiz(userId, {
      count: parseInt(count) || 10,
      difficulty,
      type,
      focusOnWeak: true
    });
    
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/games/score - Submit game/quiz results
router.post('/score', async (req, res) => {
  try {
    const { userId, gameType, score, answers, timeSpent } = req.body;
    
    // Update vocabulary mastery for each word
    for (const answer of answers) {
      if (answer.wordId) {
        // Get current word data
        const word = await prisma.userVocabulary.findUnique({
          where: { id: answer.wordId }
        });
        
        // Update with spaced repetition
        const quality = answer.correct ? 4 : 1;
        const updates = srEngine.calculateNextReview(word, quality);
        
        await prisma.userVocabulary.update({
          where: { id: answer.wordId },
          data: updates
        });
      }
    }
    
    // Track interaction for assessment
    await fetch('/api/assessment/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type: `game_${gameType}`,
        contentId: gameType,
        difficulty: 'B1',
        correct: score > 70,
        timeSpent
      })
    });
    
    res.json({ 
      success: true, 
      wordsUpdated: answers.length,
      message: score > 80 ? "Excellent work!" : "Keep practicing!"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/games/vocabulary/:userId - Get words for games
router.get('/vocabulary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { count, difficulty } = req.query;
    
    const words = await prisma.userVocabulary.findMany({
      where: {
        userId,
        saved: true,
        ...(difficulty && { difficulty })
      },
      orderBy: { masteryLevel: 'asc' },
      take: parseInt(count) || 20
    });
    
    res.json({ words });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

### Task 3: Update Word Match Game (20 minutes)
**File:** `/public/word-match-game.html`

**Changes to make:**
```javascript
// OLD: Random words
const words = ['hola', 'adiós', 'gracias', 'por favor'];

// NEW: User's vocabulary
async function loadWords() {
  const response = await fetch(`/api/games/vocabulary/${userId}?count=10`);
  const data = await response.json();
  return data.words;
}

// Track results
async function submitResults(matches) {
  const answers = matches.map(m => ({
    wordId: m.wordId,
    correct: m.matched,
    timeSpent: m.timeToMatch
  }));
  
  await fetch('/api/games/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getUserId(),
      gameType: 'word_match',
      score: calculateScore(matches),
      answers,
      timeSpent: totalTime
    })
  });
}
```

---

### Task 4: Update Sentence Builder Game (20 minutes)
**File:** `/public/sentence-builder-game.html`

**Make sentences from user's words:**
```javascript
async function generateSentence() {
  // Get 3-5 words user is learning
  const response = await fetch(`/api/games/vocabulary/${userId}?count=5`);
  const data = await response.json();
  
  // Build sentence using these words
  const sentence = constructSentence(data.words);
  
  // Scramble words
  const scrambled = scrambleWords(sentence);
  
  return { sentence, scrambled, words: data.words };
}

function constructSentence(words) {
  // Use actual grammar rules to build valid sentence
  // Example: "Me gusta [word1] y [word2]"
  return `Me gusta ${words[0].word} y ${words[1].word}.`;
}
```

---

### Task 5: Update Listening Challenge (20 minutes)
**File:** `/public/listening-challenge.html`

**Use user's words with audio:**
```javascript
async function loadChallenge() {
  const response = await fetch(`/api/games/vocabulary/${userId}?count=10`);
  const data = await response.json();
  
  // Generate audio for each word
  const challenges = data.words.map(word => ({
    word: word.word,
    translation: word.translation,
    audioUrl: `/api/tts?text=${encodeURIComponent(word.word)}`,
    wordId: word.id
  }));
  
  return challenges;
}
```

---

### Task 6: Update Quiz UI (30 minutes)
**File:** `/public/quiz-gamification-ui.html`

**Add personalization indicators:**
```html
<div class="quiz-header">
  <h2>📚 Your Personal Quiz</h2>
  <p>Testing your Spanish knowledge from videos you've watched</p>
  <div class="difficulty-indicator">
    <span class="badge badge-b1">Focusing on B1 words</span>
    <span class="weak-words-badge">Practicing your weakest words</span>
  </div>
</div>

<div class="question-card" data-word-id="${question.wordId}">
  <div class="question-meta">
    <span class="difficulty-badge ${question.difficulty}">${question.difficulty}</span>
    <span class="question-number">${currentQ} / ${total}</span>
  </div>
  
  <div class="question-text">${question.question}</div>
  
  <!-- Context hint -->
  <div class="context-hint" style="display: none;">
    💡 You saw this in: "${question.context}"
  </div>
  
  <div class="options">
    <!-- Options here -->
  </div>
</div>

<!-- Results with improvement tracking -->
<div class="quiz-results">
  <h2>Great job! 🎉</h2>
  <div class="score">8 / 10 correct</div>
  
  <div class="improvement-stats">
    <h3>Your Progress</h3>
    <div class="stat">
      <span class="stat-label">Average mastery before:</span>
      <span class="stat-value">67%</span>
    </div>
    <div class="stat">
      <span class="stat-label">Average mastery after:</span>
      <span class="stat-value">75% 📈</span>
    </div>
    <p class="improvement-message">
      You've improved on 6 words! Keep it up!
    </p>
  </div>
  
  <button onclick="takeAnotherQuiz()">Practice More</button>
</div>
```

**JavaScript updates:**
```javascript
async function loadQuiz() {
  // Load personalized quiz
  const response = await fetch(`/api/games/quiz?userId=${userId}&count=10&type=mixed`);
  const data = await response.json();
  questions = data.questions;
  showQuestion(0);
}

async function submitQuiz(answers) {
  const response = await fetch('/api/games/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getUserId(),
      gameType: 'quiz',
      score: calculateScore(answers),
      answers: answers.map(a => ({
        wordId: a.wordId,
        correct: a.correct,
        timeSpent: a.timeSpent
      })),
      timeSpent: totalQuizTime
    })
  });
  
  const result = await response.json();
  showResults(result);
}
```

---

### Task 7: Playwright Tests (20 minutes)
**File:** `/tests/games-personalized.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Personalized Games & Quizzes', () => {
  
  test('Quiz loads user vocabulary', async ({ page }) => {
    await page.goto('http://localhost:3001/quiz-gamification-ui.html');
    
    // Verify personalized header
    await expect(page.locator('h2')).toContainText('Your Personal Quiz');
    
    // Verify questions load
    await expect(page.locator('.question-card')).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/personalized-quiz.png', fullPage: true });
  });
  
  test('Word match game uses user words', async ({ page }) => {
    await page.goto('http://localhost:3001/word-match-game.html');
    
    // Verify words load from API
    await page.waitForSelector('.word-card');
    const wordCount = await page.locator('.word-card').count();
    expect(wordCount).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'screenshots/word-match-personalized.png' });
  });
  
  test('Game results update vocabulary mastery', async ({ page }) => {
    await page.goto('http://localhost:3001/quiz-gamification-ui.html');
    
    // Complete quiz
    for (let i = 0; i < 10; i++) {
      await page.click('.option-btn:first-child');
      await page.waitForTimeout(500);
    }
    
    // Verify improvement stats shown
    await expect(page.locator('.improvement-stats')).toBeVisible();
    await page.screenshot({ path: 'screenshots/quiz-results-improvement.png', fullPage: true });
  });
  
  test('Sentence builder uses learned words', async ({ page }) => {
    await page.goto('http://localhost:3001/sentence-builder-game.html');
    
    await expect(page.locator('.word-tile')).toHaveCount.greaterThan(0);
    await page.screenshot({ path: 'screenshots/sentence-builder-personalized.png' });
  });
  
  test('Listening challenge uses user vocabulary', async ({ page }) => {
    await page.goto('http://localhost:3001/listening-challenge.html');
    
    // Verify audio player and user words
    await expect(page.locator('.audio-player')).toBeVisible();
    await page.screenshot({ path: 'screenshots/listening-challenge-personalized.png' });
  });
});
```

---

## 📁 FILES TO CREATE

```
/lib/quiz-generator.js                     (NEW - 400 lines)
/api/games/index.js                        (NEW - 200 lines)
/tests/games-personalized.spec.js          (NEW - 150 lines)
```

## 📁 FILES TO MODIFY

```
/public/word-match-game.html               (UPDATE - use API)
/public/sentence-builder-game.html         (UPDATE - use API)
/public/listening-challenge.html           (UPDATE - use API)
/public/quiz-gamification-ui.html          (MAJOR UPDATE - personalization)
/server.js                                 (UPDATE - add games route)
```

---

## 🎯 SUCCESS CRITERIA

- ✅ All games use user's saved vocabulary
- ✅ Quiz generator creates diverse question types
- ✅ Game results update vocabulary mastery
- ✅ Weak words prioritized in practice
- ✅ Improvement stats displayed after games
- ✅ All Playwright tests pass
- ✅ Users see "You've mastered X words!" messages

**GO MAKE GAMES ACTUALLY EDUCATIONAL! 🚀**

