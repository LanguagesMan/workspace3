# 🎯 AGENT 9: Level Assessment & Placement Test

**Branch:** `agent-9-adaptive-assessment`  
**Estimated Time:** 3-4 hours  
**Priority:** CRITICAL - Enables true adaptation

---

## 🎯 MISSION

Build an intelligent level assessment system that automatically determines and continuously updates user proficiency. Make the app truly adaptive like Duolingo.

---

## 📋 CRITICAL TASKS

### Task 1: Placement Test UI (1.5 hours)
**File:** `/public/placement-test.html`

Create a beautiful, gamified placement test that feels like a game, not an exam.

**Design Requirements:**
- Modern, minimalist UI
- Progress indicator at top
- Smooth transitions between questions
- Immediate visual feedback (green for correct, red for wrong)
- Celebration screen at end
- Skip option for advanced users

**HTML Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Spanish Placement Test</title>
  <link rel="stylesheet" href="/css/tiktok-theme.css">
  <style>
    .placement-test {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .test-header {
      text-align: center;
      color: white;
      padding: 20px 0;
    }
    
    .progress-container {
      background: rgba(255,255,255,0.2);
      height: 8px;
      border-radius: 4px;
      margin: 20px 0;
    }
    
    .progress-bar {
      background: white;
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .question-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      margin: 20px 0;
    }
    
    .question-type-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    
    .question-text {
      font-size: 24px;
      color: #2d3748;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    
    .options {
      display: grid;
      gap: 12px;
    }
    
    .option-btn {
      padding: 16px 24px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    
    .option-btn:hover {
      border-color: #667eea;
      background: #f0f4ff;
    }
    
    .option-btn.correct {
      background: #48bb78;
      border-color: #48bb78;
      color: white;
    }
    
    .option-btn.incorrect {
      background: #f56565;
      border-color: #f56565;
      color: white;
    }
    
    .results-screen {
      text-align: center;
      color: white;
      padding: 60px 20px;
    }
    
    .level-badge {
      font-size: 72px;
      font-weight: bold;
      margin: 20px 0;
      text-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .skip-link {
      text-align: center;
      margin-top: 20px;
    }
    
    .skip-link a {
      color: white;
      text-decoration: underline;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="placement-test">
    <!-- Header -->
    <div class="test-header">
      <h1>📚 Spanish Placement Test</h1>
      <p>Let's find your perfect starting level</p>
    </div>
    
    <!-- Progress -->
    <div class="progress-container">
      <div class="progress-bar" id="progressBar" style="width: 0%"></div>
    </div>
    <div class="progress-text" style="color: white; text-align: center;">
      Question <span id="currentQ">1</span> of <span id="totalQ">10</span>
    </div>
    
    <!-- Question Card -->
    <div class="question-card" id="questionCard">
      <span class="question-type-badge" id="questionType">Vocabulary</span>
      <div class="question-text" id="questionText">
        What does "hola" mean?
      </div>
      <div class="options" id="options">
        <button class="option-btn" onclick="selectAnswer(0)">Hello</button>
        <button class="option-btn" onclick="selectAnswer(1)">Goodbye</button>
        <button class="option-btn" onclick="selectAnswer(2)">Thank you</button>
        <button class="option-btn" onclick="selectAnswer(3)">Please</button>
      </div>
    </div>
    
    <!-- Results Screen (hidden initially) -->
    <div class="results-screen" id="resultsScreen" style="display: none;">
      <div class="confetti"></div>
      <h1>🎉 Test Complete!</h1>
      <div class="level-badge" id="finalLevel">B1</div>
      <h2 id="levelDescription">Intermediate</h2>
      <p id="levelDetails">
        You can understand the main points of clear standard input on familiar matters.
      </p>
      <div class="stats" style="margin: 40px 0;">
        <div style="font-size: 24px;">
          <span id="correctCount">7</span> / 10 correct
        </div>
        <div style="opacity: 0.8; margin-top: 10px;">
          Vocabulary: <span id="vocabScore">80%</span> | 
          Grammar: <span id="grammarScore">70%</span> | 
          Reading: <span id="readingScore">65%</span>
        </div>
      </div>
      <button class="btn-primary" onclick="startLearning()" 
              style="padding: 16px 48px; font-size: 18px;">
        Start Learning at B1 Level
      </button>
    </div>
    
    <!-- Skip Link -->
    <div class="skip-link">
      <a href="#" onclick="skipTest()">Skip test and choose my level manually</a>
    </div>
  </div>
  
  <script src="/js/placement-test.js"></script>
</body>
</html>
```

**JavaScript Logic** (`/public/js/placement-test.js`):
```javascript
let currentQuestionIndex = 0;
let questions = [];
let answers = [];
let currentLevel = 'A2';  // Start at A2

async function loadQuestions() {
  const response = await fetch('/data/placement-test-questions.json');
  const data = await response.json();
  questions = selectAdaptiveQuestions(data);
}

function selectAdaptiveQuestions(allQuestions) {
  // Start with A2 questions
  // Adapt difficulty based on performance
  return allQuestions.filter(q => q.level === currentLevel).slice(0, 10);
}

function showQuestion(index) {
  const q = questions[index];
  document.getElementById('questionType').textContent = q.type;
  document.getElementById('questionText').textContent = q.question;
  
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';
  
  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => selectAnswer(i);
    optionsContainer.appendChild(btn);
  });
  
  updateProgress();
}

function selectAnswer(answerIndex) {
  const q = questions[currentQuestionIndex];
  const isCorrect = answerIndex === q.correctIndex;
  
  answers.push({
    question: currentQuestionIndex,
    correct: isCorrect,
    type: q.type,
    level: q.level
  });
  
  // Visual feedback
  const buttons = document.querySelectorAll('.option-btn');
  buttons[answerIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
  buttons[q.correctIndex].classList.add('correct');
  
  // Adapt difficulty
  if (currentQuestionIndex === 3 || currentQuestionIndex === 6) {
    adaptDifficulty();
  }
  
  // Next question after delay
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
      showQuestion(currentQuestionIndex);
    } else {
      showResults();
    }
  }, 1500);
}

function adaptDifficulty() {
  const recentCorrect = answers.slice(-3).filter(a => a.correct).length;
  
  if (recentCorrect >= 2) {
    // Increase difficulty
    if (currentLevel === 'A1') currentLevel = 'A2';
    else if (currentLevel === 'A2') currentLevel = 'B1';
    else if (currentLevel === 'B1') currentLevel = 'B2';
    else if (currentLevel === 'B2') currentLevel = 'C1';
  } else if (recentCorrect <= 1) {
    // Decrease difficulty
    if (currentLevel === 'C1') currentLevel = 'B2';
    else if (currentLevel === 'B2') currentLevel = 'B1';
    else if (currentLevel === 'B1') currentLevel = 'A2';
    else if (currentLevel === 'A2') currentLevel = 'A1';
  }
}

async function showResults() {
  // Calculate scores
  const totalCorrect = answers.filter(a => a.correct).length;
  const vocabQuestions = answers.filter(a => a.type === 'vocabulary');
  const grammarQuestions = answers.filter(a => a.type === 'grammar');
  const readingQuestions = answers.filter(a => a.type === 'reading');
  
  const vocabScore = Math.round((vocabQuestions.filter(a => a.correct).length / vocabQuestions.length) * 100);
  const grammarScore = Math.round((grammarQuestions.filter(a => a.correct).length / grammarQuestions.length) * 100);
  const readingScore = Math.round((readingQuestions.filter(a => a.correct).length / readingQuestions.length) * 100);
  
  // Determine final level
  const finalLevel = calculateFinalLevel(totalCorrect, answers);
  
  // Submit to API
  await fetch('/api/assessment/placement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getUserId(),
      answers,
      finalLevel,
      scores: { vocabScore, grammarScore, readingScore }
    })
  });
  
  // Show results
  document.getElementById('questionCard').style.display = 'none';
  document.getElementById('resultsScreen').style.display = 'block';
  document.getElementById('finalLevel').textContent = finalLevel;
  document.getElementById('correctCount').textContent = totalCorrect;
  document.getElementById('vocabScore').textContent = vocabScore + '%';
  document.getElementById('grammarScore').textContent = grammarScore + '%';
  document.getElementById('readingScore').textContent = readingScore + '%';
  
  triggerConfetti();
}

function calculateFinalLevel(correct, answers) {
  // Determine level based on performance
  if (correct <= 3) return 'A1';
  if (correct <= 5) return 'A2';
  if (correct <= 7) return 'B1';
  if (correct <= 8) return 'B2';
  return 'C1';
}

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / 10) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
  document.getElementById('currentQ').textContent = currentQuestionIndex + 1;
}

// Initialize
loadQuestions().then(() => showQuestion(0));
```

---

### Task 2: Question Bank (45 minutes)
**File:** `/data/placement-test-questions.json`

Create comprehensive, CEFR-aligned questions.

**Structure:**
```json
{
  "questions": [
    {
      "id": "a1-vocab-1",
      "level": "A1",
      "type": "vocabulary",
      "question": "What does 'hola' mean?",
      "options": ["Hello", "Goodbye", "Thank you", "Please"],
      "correctIndex": 0,
      "explanation": "'Hola' is the most common Spanish greeting."
    },
    {
      "id": "a1-vocab-2",
      "level": "A1",
      "type": "vocabulary",
      "question": "What does 'gracias' mean?",
      "options": ["Hello", "Goodbye", "Thank you", "Sorry"],
      "correctIndex": 2
    },
    {
      "id": "a2-grammar-1",
      "level": "A2",
      "type": "grammar",
      "question": "Complete: Yo ___ un estudiante.",
      "options": ["soy", "es", "está", "son"],
      "correctIndex": 0,
      "explanation": "'Soy' is the first person singular of 'ser'."
    },
    {
      "id": "b1-reading-1",
      "level": "B1",
      "type": "reading",
      "question": "Read: 'María fue al mercado ayer y compró frutas frescas.' When did María go to the market?",
      "options": ["Today", "Yesterday", "Tomorrow", "Last week"],
      "correctIndex": 1
    },
    {
      "id": "b2-grammar-1",
      "level": "B2",
      "type": "grammar",
      "question": "Complete with subjunctive: Espero que tú ___ bien.",
      "options": ["estás", "estés", "estar", "estarás"],
      "correctIndex": 1,
      "explanation": "After 'espero que', use present subjunctive."
    },
    {
      "id": "c1-reading-1",
      "level": "C1",
      "type": "reading",
      "question": "Read: 'A pesar de las adversidades que enfrentó durante su juventud, logró convertirse en un reconocido científico.' What does this imply?",
      "options": [
        "He had an easy life",
        "He succeeded despite challenges",
        "He gave up on science",
        "He was always famous"
      ],
      "correctIndex": 1
    }
  ]
}
```

**Requirements:**
- 20+ questions per level (A1, A2, B1, B2, C1)
- 40% vocabulary, 30% grammar, 30% reading
- Progressively harder within each level
- Include explanations for learning
- Well-vetted, aligned with CEFR

---

### Task 3: Level Assessment Engine (1 hour)
**File:** `/lib/level-assessment-engine.js`

Build the brain that tracks all interactions and determines user level.

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LevelAssessmentEngine {
  
  /**
   * Calculate user's current level based on all interactions
   */
  async calculateLevel(userId) {
    const interactions = await prisma.userInteraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100  // Last 100 interactions
    });
    
    if (interactions.length === 0) {
      return { level: 'A2', confidence: 0 };
    }
    
    // Calculate skill scores
    const vocabScore = this.calculateSkillScore(
      interactions.filter(i => i.type === 'word_click' || i.type === 'quiz_vocab')
    );
    
    const grammarScore = this.calculateSkillScore(
      interactions.filter(i => i.type === 'quiz_grammar' || i.type === 'game')
    );
    
    const readingScore = this.calculateSkillScore(
      interactions.filter(i => i.type === 'article_read' || i.type === 'video_watch')
    );
    
    const listeningScore = this.calculateSkillScore(
      interactions.filter(i => i.type === 'video_watch' || i.type === 'audio_play')
    );
    
    // Weighted average (vocabulary is most important indicator)
    const overallScore = (
      vocabScore * 0.4 +
      grammarScore * 0.25 +
      readingScore * 0.2 +
      listeningScore * 0.15
    );
    
    // Convert score to level
    const level = this.scoreToLevel(overallScore);
    const confidence = this.calculateConfidence(interactions);
    
    // Update database
    await prisma.userAssessment.upsert({
      where: { userId },
      update: {
        vocabScore,
        grammarScore,
        readingScore,
        listeningScore,
        currentLevel: level,
        confidence,
        lastUpdated: new Date()
      },
      create: {
        userId,
        vocabScore,
        grammarScore,
        readingScore,
        listeningScore,
        currentLevel: level,
        confidence
      }
    });
    
    return { level, confidence, scores: { vocabScore, grammarScore, readingScore, listeningScore } };
  }
  
  /**
   * Calculate skill score (0-100) from interactions
   */
  calculateSkillScore(interactions) {
    if (interactions.length === 0) return 50;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    interactions.forEach((interaction, index) => {
      // Recent interactions weighted more
      const recencyWeight = 1 + (index / interactions.length) * 0.5;
      
      // Difficulty affects score
      const difficultyMultiplier = this.difficultyToScore(interaction.difficulty);
      
      // Correct/completion affects score
      const successScore = interaction.correct ? 1 : 0.3;
      
      const score = difficultyMultiplier * successScore * 100;
      totalScore += score * recencyWeight;
      totalWeight += recencyWeight;
    });
    
    return Math.round(totalScore / totalWeight);
  }
  
  /**
   * Convert difficulty level to score multiplier
   */
  difficultyToScore(difficulty) {
    const map = {
      'A1': 0.3,
      'A2': 0.5,
      'B1': 0.7,
      'B2': 0.85,
      'C1': 0.95,
      'C2': 1.0
    };
    return map[difficulty] || 0.5;
  }
  
  /**
   * Convert overall score to CEFR level
   */
  scoreToLevel(score) {
    if (score < 30) return 'A1';
    if (score < 45) return 'A2';
    if (score < 60) return 'B1';
    if (score < 75) return 'B2';
    if (score < 90) return 'C1';
    return 'C2';
  }
  
  /**
   * Calculate confidence in level assessment (0-100)
   */
  calculateConfidence(interactions) {
    // More interactions = higher confidence
    const sampleSize = Math.min(interactions.length / 50, 1);
    
    // Consistent performance = higher confidence
    const recentPerformance = interactions.slice(0, 20).map(i => i.correct ? 1 : 0);
    const variance = this.calculateVariance(recentPerformance);
    const consistency = Math.max(0, 1 - variance);
    
    return Math.round((sampleSize * 0.6 + consistency * 0.4) * 100);
  }
  
  calculateVariance(arr) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squareDiffs = arr.map(value => Math.pow(value - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  /**
   * Track user interaction for assessment
   */
  async trackInteraction(data) {
    const { userId, type, contentId, difficulty, correct, timeSpent } = data;
    
    await prisma.userInteraction.create({
      data: {
        userId,
        type,
        contentId,
        difficulty,
        correct,
        timeSpent,
        createdAt: new Date()
      }
    });
    
    // Recalculate level if enough interactions
    const count = await prisma.userInteraction.count({ where: { userId } });
    if (count % 10 === 0) {
      // Recalculate every 10 interactions
      return await this.calculateLevel(userId);
    }
    
    return null;
  }
  
  /**
   * Check if user should level up
   */
  async checkLevelUp(userId) {
    const assessment = await prisma.userAssessment.findUnique({
      where: { userId }
    });
    
    if (!assessment) return null;
    
    // Level up if confidence >85% and all scores >75
    if (assessment.confidence > 85 &&
        assessment.vocabScore > 75 &&
        assessment.grammarScore > 75 &&
        assessment.readingScore > 75) {
      
      const nextLevel = this.getNextLevel(assessment.currentLevel);
      if (nextLevel !== assessment.currentLevel) {
        return {
          shouldLevelUp: true,
          fromLevel: assessment.currentLevel,
          toLevel: nextLevel
        };
      }
    }
    
    return null;
  }
  
  getNextLevel(current) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const index = levels.indexOf(current);
    return index < levels.length - 1 ? levels[index + 1] : current;
  }
}

module.exports = new LevelAssessmentEngine();
```

---

### Task 4: Assessment API (30 minutes)
**File:** `/api/assessment/index.js`

```javascript
const express = require('express');
const router = express.Router();
const assessmentEngine = require('../../lib/level-assessment-engine');

// POST /api/assessment/placement - Submit placement test results
router.post('/placement', async (req, res) => {
  try {
    const { userId, answers, finalLevel, scores } = req.body;
    
    // Save placement test results
    await prisma.userAssessment.create({
      data: {
        userId,
        currentLevel: finalLevel,
        vocabScore: scores.vocabScore,
        grammarScore: scores.grammarScore,
        readingScore: scores.readingScore,
        confidence: 85,  // High confidence from placement test
        lastUpdated: new Date()
      }
    });
    
    // Save individual answers for analysis
    for (const answer of answers) {
      await prisma.userInteraction.create({
        data: {
          userId,
          type: `quiz_${answer.type}`,
          contentId: `placement_test`,
          difficulty: answer.level,
          correct: answer.correct,
          timeSpent: 30,
          createdAt: new Date()
        }
      });
    }
    
    res.json({ success: true, level: finalLevel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assessment/track - Track user interaction
router.post('/track', async (req, res) => {
  try {
    const result = await assessmentEngine.trackInteraction(req.body);
    res.json({ success: true, levelUpdate: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assessment/level/:userId - Get current level
router.get('/level/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await assessmentEngine.calculateLevel(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assessment/progress/:userId - Get skill breakdown
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const assessment = await prisma.userAssessment.findUnique({
      where: { userId }
    });
    res.json(assessment || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assessment/check-level-up/:userId - Check if ready for level up
router.get('/check-level-up/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await assessmentEngine.checkLevelUp(userId);
    res.json(result || { shouldLevelUp: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

### Task 5: Database Schema (15 minutes)

**Add to `/prisma/schema.prisma`:**
```prisma
model UserAssessment {
  id              String   @id @default(cuid())
  userId          String   @unique
  
  vocabScore      Int      @default(50)
  grammarScore    Int      @default(50)
  readingScore    Int      @default(50)
  listeningScore  Int      @default(50)
  
  currentLevel    String   @default("A2")
  confidence      Int      @default(0)
  
  lastUpdated     DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
}

model UserInteraction {
  id              String   @id @default(cuid())
  userId          String
  
  type            String   // word_click, article_read, video_watch, quiz_vocab, quiz_grammar, game
  contentId       String   // ID of content interacted with
  difficulty      String   // A1-C2
  correct         Boolean  // Success/completion
  timeSpent       Int      // seconds
  
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([userId, type])
}
```

---

### Task 6: Frontend Integration (30 minutes)

**Update `/public/profile.html` - Show skill bars:**
```html
<div class="skills-section">
  <h3>Your Spanish Skills</h3>
  <div class="skill-bar">
    <div class="skill-label">
      <span>Vocabulary</span>
      <span id="vocabScore">85%</span>
    </div>
    <div class="skill-progress">
      <div class="skill-fill" style="width: 85%"></div>
    </div>
  </div>
  <div class="skill-bar">
    <div class="skill-label">
      <span>Grammar</span>
      <span id="grammarScore">72%</span>
    </div>
    <div class="skill-progress">
      <div class="skill-fill" style="width: 72%"></div>
    </div>
  </div>
  <!-- Reading and Listening similar -->
</div>
```

**Track interactions everywhere:**
```javascript
// In video player
async function trackVideoCompletion(videoId, difficulty) {
  await fetch('/api/assessment/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getUserId(),
      type: 'video_watch',
      contentId: videoId,
      difficulty,
      correct: true,  // Watched to completion
      timeSpent: videoDuration
    })
  });
}

// In article reader
async function trackArticleRead(articleId, difficulty, completionPercent) {
  await fetch('/api/assessment/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getUserId(),
      type: 'article_read',
      contentId: articleId,
      difficulty,
      correct: completionPercent > 80,
      timeSpent: readingTime
    })
  });
}
```

---

### Task 7: Playwright Tests (30 minutes)
**File:** `/tests/placement-test-complete.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Placement Test & Level Assessment', () => {
  
  test('Placement test loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/placement-test.html');
    
    await expect(page.locator('h1')).toContainText('Placement Test');
    await expect(page.locator('.question-card')).toBeVisible();
    await expect(page.locator('.progress-bar')).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/placement-test-start.png', fullPage: true });
  });
  
  test('Can complete placement test', async ({ page }) => {
    await page.goto('http://localhost:3001/placement-test.html');
    
    // Answer 10 questions
    for (let i = 0; i < 10; i++) {
      await page.click('.option-btn:first-child');
      await page.waitForTimeout(1600);
      
      if (i === 4) {
        await page.screenshot({ path: 'screenshots/placement-test-midway.png', fullPage: true });
      }
    }
    
    // Verify results screen
    await expect(page.locator('.results-screen')).toBeVisible();
    await expect(page.locator('.level-badge')).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/placement-test-results.png', fullPage: true });
  });
  
  test('Adaptive difficulty works', async ({ page }) => {
    // Test that difficulty adjusts based on performance
    // (Requires checking question levels)
  });
  
  test('Level-up celebration triggers', async ({ page }) => {
    // Simulate user reaching level-up threshold
    // Verify celebration modal appears
  });
  
  test('Skill bars display in profile', async ({ page }) => {
    await page.goto('http://localhost:3001/profile.html');
    
    await expect(page.locator('.skill-bar')).toHaveCount(4);
    await page.screenshot({ path: 'screenshots/profile-skill-bars.png', fullPage: true });
  });
});
```

---

## 🎯 SUCCESS CRITERIA

- ✅ Placement test is beautiful and engaging
- ✅ Adaptive difficulty adjusts correctly
- ✅ All interactions tracked to database
- ✅ Level calculation accurate (±1 level)
- ✅ Skill bars update in real-time
- ✅ Level-up celebrations trigger correctly
- ✅ All Playwright tests pass

**GO BUILD THE SMARTEST ASSESSMENT SYSTEM! 🚀**

