/**
 * 🧠 GENIUS ADAPTIVE SYSTEM
 * Real-time difficulty adjustment based on user behavior
 * Implements the "Goldilocks Zone" algorithm for perfect content matching
 */

const frequencyWords = require('./spanish-frequency-words-extended');

class GeniusAdaptiveSystem {
  constructor() {
    this.userProfiles = new Map(); // In-memory cache (use DB in production)
    this.contentDifficultyCache = new Map();
  }

  /**
   * 🎯 SMART INITIAL ASSESSMENT (First 30 seconds)
   * Determines initial level without feeling like a "test"
   */
  async assessInitialLevel(userId, quickTestResults) {
    const { ultraHighFreq, midFreq, knowsBasics } = quickTestResults;
    
    let initialLevel = 'A1';
    let estimatedWordCount = 0;
    
    // Ultra-high frequency test (rank 1-20)
    if (ultraHighFreq >= 5 && midFreq >= 5) {
      // Perfect scores = B2 (advanced)
      initialLevel = 'B2';
      estimatedWordCount = 1500;
    } else if (ultraHighFreq >= 5 && midFreq >= 4) {
      // Very good = B1
      initialLevel = 'B1';
      estimatedWordCount = 900;
    } else if (ultraHighFreq >= 4) {
      // User knows basics, test mid-frequency
      if (midFreq >= 4) {
        initialLevel = 'B1';
        estimatedWordCount = 800;
      } else if (midFreq >= 2) {
        initialLevel = 'A2';
        estimatedWordCount = 400;
      } else {
        initialLevel = 'A2';
        estimatedWordCount = 350;
      }
    } else if (ultraHighFreq >= 2) {
      initialLevel = 'A1';
      estimatedWordCount = 150;
    } else {
      // Absolute beginner
      initialLevel = 'A1';
      estimatedWordCount = 0;
    }
    
    // Initialize user profile (or update if exists)
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        currentLevel: initialLevel,
        knownWordCount: estimatedWordCount,
        knownWords: [],
        clickSpeedAvg: null,
        completionRateAvg: null,
        tooHardClicks: 0,
        tooEasyClicks: 0,
        lastLevelChange: new Date(),
        progressionVelocity: 0, // words per day
        behavioralSignals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      // Update existing profile
      profile.currentLevel = initialLevel;
      profile.updatedAt = new Date();
    }
    
    this.userProfiles.set(userId, profile);
    
    return {
      level: initialLevel,
      estimatedWordCount,
      confidence: ultraHighFreq >= 4 ? 'high' : 'medium',
      reasoning: this._getInitialLevelReasoning(initialLevel, ultraHighFreq, midFreq)
    };
  }
  
  /**
   * Set known words for user (for testing and actual use)
   */
  setKnownWords(userId, knownWords) {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        currentLevel: 'A1',
        knownWordCount: knownWords.length,
        knownWords: knownWords,
        clickSpeedAvg: null,
        completionRateAvg: null,
        tooHardClicks: 0,
        tooEasyClicks: 0,
        lastLevelChange: new Date(),
        progressionVelocity: 0,
        behavioralSignals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      profile.knownWords = knownWords;
      profile.knownWordCount = knownWords.length;
      profile.updatedAt = new Date();
    }
    
    this.userProfiles.set(userId, profile);
  }

  /**
   * 📊 CALCULATE DYNAMIC LEVEL
   * Continuously adjusts based on behavioral data
   */
  calculateDynamicLevel(userId, behavioralData) {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      // Initialize profile if not exists
      profile = {
        userId,
        currentLevel: 'A1',
        knownWordCount: 0,
        tooHardClicks: 0,
        tooEasyClicks: 0,
        lastLevelChange: new Date(),
        behavioralSignals: []
      };
      this.userProfiles.set(userId, profile);
    }
    
    const {
      knownWords = [],
      clickSpeed = [],
      completionRates = [],
      quizScores = [],
      savedWords = []
    } = behavioralData;
    
    // Base level on known word count
    let baseLevel = frequencyWords.calculateLevelByWordCount(knownWords.length);
    
    // Adjust based on behavioral signals
    let adjustmentFactor = 0;
    
    // 1. Click speed analysis (fast = knows it, slow = struggling)
    if (clickSpeed.length > 0) {
      const avgSpeed = clickSpeed.reduce((a, b) => a + b, 0) / clickSpeed.length;
      if (avgSpeed < 2000) adjustmentFactor += 0.2; // Very fast = bump up
      if (avgSpeed > 5000) adjustmentFactor -= 0.3; // Slow = bump down
    }
    
    // 2. Completion rate analysis
    if (completionRates.length > 0) {
      const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
      if (avgCompletion > 90) adjustmentFactor += 0.2; // Too easy
      if (avgCompletion < 30) adjustmentFactor -= 0.5; // Too hard
    }
    
    // 3. Quiz performance
    if (quizScores.length > 0) {
      const avgQuiz = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
      if (avgQuiz > 80) adjustmentFactor += 0.3; // Increase level
      if (avgQuiz < 50) adjustmentFactor -= 0.4; // Decrease level
    }
    
    // 4. Word save patterns (advanced words = advanced user)
    const advancedWordsSaved = savedWords.filter(w => {
      const wordData = this._findWordInFrequencyList(w);
      return wordData && wordData.rank > 1000;
    }).length;
    
    if (advancedWordsSaved > 5) adjustmentFactor += 0.2;
    
    // 5. "Too Hard" / "Too Easy" button clicks
    adjustmentFactor -= profile.tooHardClicks * 0.5;
    adjustmentFactor += profile.tooEasyClicks * 0.3;
    
    // Apply adjustment
    const adjustedLevel = this._adjustLevel(baseLevel, adjustmentFactor);
    
    // Update profile
    profile.currentLevel = adjustedLevel;
    profile.knownWordCount = knownWords.length;
    profile.updatedAt = new Date();
    
    return {
      level: adjustedLevel,
      previousLevel: baseLevel,
      adjustment: adjustmentFactor,
      confidence: this._calculateConfidence(behavioralData),
      reasoning: this._generateReasoningText(baseLevel, adjustedLevel, adjustmentFactor)
    };
  }

  /**
   * 🎯 THE GOLDILOCKS ZONE ALGORITHM
   * Perfect content = 3-7 new words per video/article
   */
  scoreContentForUser(userId, content) {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return { score: 0, reasoning: 'No profile found' };
    }
    
    const contentWords = this._extractWords(content.text || content.transcription || '');
    const userKnownWords = profile.knownWords || [];
    const knownWordSet = new Set(userKnownWords.map(w => w.toLowerCase()));
    
    // Count unknown words
    const unknownWords = contentWords.filter(word => !knownWordSet.has(word.toLowerCase()));
    const newWordCount = unknownWords.length;
    
    // Goldilocks scoring
    let score = 0;
    let zone = 'unknown';
    
    if (newWordCount >= 3 && newWordCount <= 7) {
      // PERFECT! Goldilocks Zone
      score = 100 - Math.abs(newWordCount - 5) * 5;
      zone = 'goldilocks';
    } else if (newWordCount < 3) {
      // Too easy
      score = 40 + (newWordCount * 10);
      zone = 'too_easy';
    } else if (newWordCount > 7 && newWordCount <= 15) {
      // Challenging but manageable
      score = Math.max(0, 100 - (newWordCount - 7) * 5);
      zone = 'challenging';
    } else {
      // Way too hard
      score = Math.max(0, 20 - (newWordCount - 15) * 2);
      zone = 'too_hard';
    }
    
    // Boost score for beginner protection
    if (profile.knownWordCount < 100 && newWordCount <= 3) {
      score += 20; // Prefer easier content for beginners
    }
    
    return {
      score,
      zone,
      newWordCount,
      unknownWords: unknownWords.slice(0, 10), // Return first 10 for UI
      totalWords: contentWords.length,
      difficulty: this._estimateContentDifficulty(contentWords),
      reasoning: this._getZoneReasoning(zone, newWordCount)
    };
  }

  /**
   * 📚 GET GOLDILOCKS CONTENT
   * Returns content sorted by perfect match score
   */
  getGoldilocksContent(userId, availableContent) {
    const scoredContent = availableContent.map(content => {
      const scoring = this.scoreContentForUser(userId, content);
      return {
        ...content,
        goldilocksScore: scoring.score,
        goldilocksZone: scoring.zone,
        newWords: scoring.unknownWords,
        newWordCount: scoring.newWordCount,
        difficulty: scoring.difficulty
      };
    });
    
    // Sort by score (best matches first)
    const sorted = scoredContent.sort((a, b) => b.goldilocksScore - a.goldilocksScore);
    
    return {
      recommended: sorted.filter(c => c.goldilocksZone === 'goldilocks'),
      challenging: sorted.filter(c => c.goldilocksZone === 'challenging'),
      tooEasy: sorted.filter(c => c.goldilocksZone === 'too_easy'),
      tooHard: sorted.filter(c => c.goldilocksZone === 'too_hard'),
      all: sorted
    };
  }

  /**
   * ⚡ ADJUST DIFFICULTY IN REAL-TIME
   * Responds immediately to user signals
   */
  adjustDifficultyInRealTime(userId, signal) {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return { success: false, message: 'No profile found' };
    }
    
    const oldLevel = profile.currentLevel;
    let newLevel = oldLevel;
    let action = '';
    
    switch (signal.type) {
      case 'too_hard':
        profile.tooHardClicks++;
        newLevel = this._decreaseLevel(oldLevel, 0.5);
        action = 'Decreased difficulty';
        break;
        
      case 'too_easy':
        profile.tooEasyClicks++;
        newLevel = this._increaseLevel(oldLevel, 0.5);
        action = 'Increased difficulty';
        break;
        
      case 'click_speed_fast':
        if (signal.avgSpeed < 2000) {
          newLevel = this._increaseLevel(oldLevel, 0.2);
          action = 'User clicking quickly - increased difficulty';
        }
        break;
        
      case 'completion_low':
        if (signal.percentage < 30) {
          newLevel = this._decreaseLevel(oldLevel, 0.3);
          action = 'Low completion rate - decreased difficulty';
        }
        break;
        
      case 'quiz_success':
        if (signal.score > 80) {
          newLevel = this._increaseLevel(oldLevel, 0.2);
          action = 'Quiz mastery - increased difficulty';
        }
        break;
        
      case 'quiz_struggle':
        if (signal.score < 50) {
          newLevel = this._decreaseLevel(oldLevel, 0.3);
          action = 'Quiz difficulty - decreased difficulty';
        }
        break;
    }
    
    profile.currentLevel = newLevel;
    profile.lastLevelChange = new Date();
    profile.behavioralSignals.push({
      type: signal.type,
      timestamp: new Date(),
      oldLevel,
      newLevel,
      action
    });
    
    return {
      success: true,
      oldLevel,
      newLevel,
      changed: oldLevel !== newLevel,
      action,
      message: this._getLevelChangeMessage(oldLevel, newLevel)
    };
  }

  /**
   * 🔄 SIMPLIFY CONTENT (GPT-4 Integration)
   * Note: This is a placeholder - actual implementation needs OpenAI API
   */
  async simplifyContent(text, targetLevel = 'A2') {
    // In production, call OpenAI GPT-4 API
    // For now, use rule-based simplification
    
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const simplified = sentences.map(sentence => {
      let result = sentence.trim();
      
      // Replace complex words with simpler alternatives
      const replacements = {
        'utilizar': 'usar',
        'efectuar': 'hacer',
        'obtener': 'conseguir',
        'necesitar': 'necesitar',
        'realizar': 'hacer',
        'proporcionar': 'dar',
        'adquirir': 'conseguir',
        'manifestar': 'decir',
        'evidenciar': 'mostrar',
        'posteriormente': 'después',
        'anteriormente': 'antes',
        'actualmente': 'ahora',
        'frecuentemente': 'a menudo',
        'ocasionalmente': 'a veces'
      };
      
      for (const [complex, simple] of Object.entries(replacements)) {
        result = result.replace(new RegExp(complex, 'gi'), simple);
      }
      
      // Shorten long sentences (>15 words)
      const words = result.split(' ');
      if (words.length > 15 && (targetLevel === 'A1' || targetLevel === 'A2')) {
        result = words.slice(0, 12).join(' ') + '.';
      }
      
      return result;
    });
    
    return {
      original: text,
      simplified: simplified.join(' '),
      targetLevel,
      wordsChanged: this._countChanges(text, simplified.join(' ')),
      method: 'rule-based' // Change to 'gpt-4' when API integrated
    };
  }

  /**
   * 🎮 BEGINNER MODE PROTECTION
   * Special handling for users with <100 saved words
   */
  isBeginnerMode(userId) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return true;
    
    return profile.knownWordCount < 100;
  }

  getBeginnerModeSettings(userId) {
    let profile = this.userProfiles.get(userId);
    
    // Initialize profile if needed
    if (!profile) {
      profile = {
        userId,
        currentLevel: 'A1',
        knownWordCount: 0,
        tooHardClicks: 0,
        tooEasyClicks: 0,
        lastLevelChange: new Date(),
        behavioralSignals: []
      };
      this.userProfiles.set(userId, profile);
    }
    
    if (!this.isBeginnerMode(userId)) {
      return { isBeginnerMode: false };
    }
    
    return {
      isBeginnerMode: true,
      maxNewWordsPerItem: 3, // Instead of 7
      frequencyRange: [1, 500], // Only ultra-high frequency
      showExtraHints: true,
      slowerProgression: true,
      encouragementMessages: true,
      milestone: this._getNextMilestone(profile.knownWordCount)
    };
  }

  /**
   * 🎉 MILESTONE CELEBRATIONS
   */
  checkMilestone(userId, newWordCount) {
    const milestones = [10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 1000];
    let profile = this.userProfiles.get(userId);
    
    // Initialize profile if needed
    if (!profile) {
      profile = {
        userId,
        currentLevel: 'A1',
        knownWordCount: 0,
        tooHardClicks: 0,
        tooEasyClicks: 0,
        lastLevelChange: new Date(),
        behavioralSignals: []
      };
      this.userProfiles.set(userId, profile);
    }
    
    const oldCount = profile.knownWordCount;
    
    // Check if this new count crosses a milestone
    for (const milestone of milestones) {
      if (oldCount < milestone && newWordCount >= milestone) {
        // Update profile count
        profile.knownWordCount = newWordCount;
        
        return {
          milestone,
          message: this._getMilestoneMessage(milestone),
          emoji: this._getMilestoneEmoji(milestone),
          reward: this._getMilestoneReward(milestone)
        };
      }
    }
    
    // Update count even if no milestone
    profile.knownWordCount = newWordCount;
    
    return null;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  _getInitialLevelReasoning(level, ultraHighFreq, midFreq) {
    if (level === 'B2') {
      return `Perfect scores! You knew ${ultraHighFreq}/5 ultra-high and ${midFreq}/5 mid-frequency words. Starting at upper-intermediate level.`;
    } else if (level === 'B1') {
      return `You knew ${ultraHighFreq}/5 ultra-high frequency words and ${midFreq}/5 mid-frequency words. Starting at intermediate level.`;
    } else if (level === 'A2' && ultraHighFreq >= 4) {
      return `You knew ${ultraHighFreq}/5 ultra-high frequency words but struggled with mid-frequency. Starting at elementary level.`;
    } else if (level === 'A2') {
      return `You knew ${ultraHighFreq}/5 ultra-high frequency words. Starting at upper beginner level.`;
    } else {
      return `Starting at absolute beginner level. We'll help you learn the most common Spanish words first!`;
    }
  }

  _adjustLevel(baseLevel, adjustmentFactor) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(baseLevel);
    
    if (adjustmentFactor >= 1.0) {
      return levels[Math.min(currentIndex + 2, levels.length - 1)];
    } else if (adjustmentFactor >= 0.5) {
      return levels[Math.min(currentIndex + 1, levels.length - 1)];
    } else if (adjustmentFactor <= -1.0) {
      return levels[Math.max(currentIndex - 2, 0)];
    } else if (adjustmentFactor <= -0.5) {
      return levels[Math.max(currentIndex - 1, 0)];
    }
    
    return baseLevel;
  }

  _decreaseLevel(level, factor) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(level);
    const steps = Math.ceil(factor);
    return levels[Math.max(currentIndex - steps, 0)];
  }

  _increaseLevel(level, factor) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(level);
    const steps = Math.ceil(factor);
    return levels[Math.min(currentIndex + steps, levels.length - 1)];
  }

  _calculateConfidence(behavioralData) {
    const dataPoints = Object.values(behavioralData).filter(d => Array.isArray(d)).reduce((sum, arr) => sum + arr.length, 0);
    
    if (dataPoints > 50) return 'very_high';
    if (dataPoints > 20) return 'high';
    if (dataPoints > 10) return 'medium';
    return 'low';
  }

  _generateReasoningText(baseLevel, adjustedLevel, adjustmentFactor) {
    if (baseLevel === adjustedLevel) {
      return `Your level remains ${adjustedLevel} based on current performance`;
    } else if (adjustedLevel > baseLevel) {
      return `Upgraded from ${baseLevel} to ${adjustedLevel} - you're performing well!`;
    } else {
      return `Adjusted from ${baseLevel} to ${adjustedLevel} to match your current comfort zone`;
    }
  }

  _extractWords(text) {
    return text
      .toLowerCase()
      .replace(/[^\wáéíóúñü\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  _findWordInFrequencyList(word) {
    const allWords = [
      ...frequencyWords.ULTRA_HIGH_FREQUENCY.A1_ULTRA,
      ...frequencyWords.ULTRA_HIGH_FREQUENCY.A1_HIGH,
      ...frequencyWords.ULTRA_HIGH_FREQUENCY.A2_MID,
      ...frequencyWords.MID_FREQUENCY,
      ...frequencyWords.HIGH_FREQUENCY,
      ...frequencyWords.ADVANCED_FREQUENCY,
      ...frequencyWords.EXPERT_FREQUENCY
    ];
    
    return allWords.find(w => w.word.toLowerCase() === word.toLowerCase());
  }

  _estimateContentDifficulty(words) {
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const uniqueWords = new Set(words).size;
    const vocabularyDensity = uniqueWords / words.length;
    
    const score = (avgWordLength * 5) + (vocabularyDensity * 50);
    
    if (score < 30) return 'A1';
    if (score < 45) return 'A2';
    if (score < 60) return 'B1';
    if (score < 75) return 'B2';
    if (score < 90) return 'C1';
    return 'C2';
  }

  _getZoneReasoning(zone, newWordCount) {
    const messages = {
      goldilocks: `Perfect! ${newWordCount} new words - ideal for learning.`,
      too_easy: `Only ${newWordCount} new words - you might find this too easy.`,
      challenging: `${newWordCount} new words - challenging but manageable.`,
      too_hard: `${newWordCount} new words - this might be overwhelming.`
    };
    
    return messages[zone] || 'Unknown difficulty zone';
  }

  _getLevelChangeMessage(oldLevel, newLevel) {
    if (oldLevel === newLevel) {
      return `Level remains ${newLevel}`;
    } else if (newLevel > oldLevel) {
      return `Great progress! Moved from ${oldLevel} to ${newLevel}`;
    } else {
      return `Adjusted to ${newLevel} for better learning`;
    }
  }

  _getNextMilestone(wordCount) {
    const milestones = [10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 1000];
    const next = milestones.find(m => m > wordCount);
    
    if (next) {
      const remaining = next - wordCount;
      return {
        next,
        remaining,
        message: `${remaining} more words to reach ${next} words! 🎯`
      };
    }
    
    return null;
  }

  _getMilestoneMessage(milestone) {
    const messages = {
      10: "Amazing! You've learned your first 10 Spanish words!",
      20: "Fantastic! 20 words - you're building momentum!",
      30: "Incredible! 30 words - you're on fire!",
      50: "Wow! 50 words - you're a fast learner!",
      75: "Outstanding! 75 words - you're making real progress!",
      100: "Congratulations! 100 words - you've reached A1 level!",
      150: "Superb! 150 words - you're halfway to A2!",
      200: "Brilliant! 200 words - you can have basic conversations!",
      300: "Excellent! 300 words - you've reached A2 level!",
      500: "Phenomenal! 500 words - you're becoming fluent!",
      1000: "LEGENDARY! 1000 words - you're a Spanish master!"
    };
    
    return messages[milestone] || `Amazing! You've reached ${milestone} words!`;
  }

  _getMilestoneEmoji(milestone) {
    if (milestone <= 20) return '🌱';
    if (milestone <= 50) return '🌿';
    if (milestone <= 100) return '🌳';
    if (milestone <= 300) return '🎯';
    if (milestone <= 500) return '🚀';
    return '🏆';
  }

  _getMilestoneReward(milestone) {
    if (milestone <= 20) return 'beginner_badge';
    if (milestone <= 100) return 'learner_badge';
    if (milestone <= 300) return 'intermediate_badge';
    if (milestone <= 500) return 'advanced_badge';
    return 'master_badge';
  }

  _countChanges(original, modified) {
    const origWords = original.split(' ');
    const modWords = modified.split(' ');
    let changes = 0;
    
    origWords.forEach((word, i) => {
      if (modWords[i] && word !== modWords[i]) {
        changes++;
      }
    });
    
    return changes;
  }
}

module.exports = new GeniusAdaptiveSystem();

