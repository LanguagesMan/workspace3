/**
 * Unified Spanish Learning Core System
 * Simplified, effective Spanish learning with progress tracking
 */

export class SpanishLearningCore {
  constructor() {
    this.userProgress = this.loadProgress();
    this.vocabulary = this.initializeVocabulary();
    this.learningSession = {
      wordsLearned: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      startTime: Date.now()
    };
  }

  // Core vocabulary organized by difficulty
  initializeVocabulary() {
    return {
      beginner: [
        { spanish: 'hola', english: 'hello', pronunciation: 'OH-lah' },
        { spanish: 'gracias', english: 'thank you', pronunciation: 'GRAH-see-ahs' },
        { spanish: 'sí', english: 'yes', pronunciation: 'see' },
        { spanish: 'no', english: 'no', pronunciation: 'noh' },
        { spanish: 'agua', english: 'water', pronunciation: 'AH-gwah' },
        { spanish: 'casa', english: 'house', pronunciation: 'KAH-sah' },
        { spanish: 'gato', english: 'cat', pronunciation: 'GAH-toh' },
        { spanish: 'perro', english: 'dog', pronunciation: 'PEH-rroh' },
        { spanish: 'comida', english: 'food', pronunciation: 'koh-MEE-dah' },
        { spanish: 'familia', english: 'family', pronunciation: 'fah-MEE-lee-ah' }
      ],
      intermediate: [
        { spanish: 'importante', english: 'important', pronunciation: 'eem-por-TAHN-teh' },
        { spanish: 'divertido', english: 'fun', pronunciation: 'dee-ver-TEE-doh' },
        { spanish: 'increíble', english: 'incredible', pronunciation: 'een-kreh-EE-bleh' },
        { spanish: 'aprender', english: 'to learn', pronunciation: 'ah-pren-DEHR' },
        { spanish: 'cambiar', english: 'to change', pronunciation: 'kahm-bee-AHR' },
        { spanish: 'mirar', english: 'to look', pronunciation: 'mee-RAHR' },
        { spanish: 'feliz', english: 'happy', pronunciation: 'feh-LEES' },
        { spanish: 'transformación', english: 'transformation', pronunciation: 'trans-for-mah-see-OHN' }
      ],
      advanced: [
        { spanish: 'extraordinario', english: 'extraordinary', pronunciation: 'eks-trah-or-dee-NAH-ree-oh' },
        { spanish: 'responsabilidad', english: 'responsibility', pronunciation: 'res-pon-sah-bee-lee-DAHD' },
        { spanish: 'específicamente', english: 'specifically', pronunciation: 'es-peh-see-fee-kah-MEN-teh' }
      ]
    };
  }

  // Load user progress from localStorage
  loadProgress() {
    try {
      const saved = localStorage.getItem('spanishLearningProgress');
      return saved ? JSON.parse(saved) : {
        level: 'beginner',
        wordsLearned: [],
        streakDays: 0,
        totalWordsLearned: 0,
        accuracy: 0,
        lastStudyDate: null
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      return this.getDefaultProgress();
    }
  }

  // Save progress to localStorage
  saveProgress() {
    try {
      localStorage.setItem('spanishLearningProgress', JSON.stringify(this.userProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  // Get default progress structure
  getDefaultProgress() {
    return {
      level: 'beginner',
      wordsLearned: [],
      streakDays: 0,
      totalWordsLearned: 0,
      accuracy: 0,
      lastStudyDate: null
    };
  }

  // Get user's current level
  getCurrentLevel() {
    const total = this.userProgress.totalWordsLearned;
    if (total >= 50) return 'advanced';
    if (total >= 20) return 'intermediate';
    return 'beginner';
  }

  // Get next word to learn based on user level
  getNextWord() {
    const level = this.getCurrentLevel();
    const levelWords = this.vocabulary[level];
    const unlearnedWords = levelWords.filter(word =>
      !this.userProgress.wordsLearned.includes(word.spanish)
    );

    if (unlearnedWords.length === 0) {
      // User has learned all words at this level, move to next level
      const nextLevel = this.getNextLevel(level);
      if (nextLevel && this.vocabulary[nextLevel]) {
        return this.vocabulary[nextLevel][0];
      }
      // Return a random word for review
      return levelWords[Math.floor(Math.random() * levelWords.length)];
    }

    return unlearnedWords[0];
  }

  // Get the next difficulty level
  getNextLevel(currentLevel) {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[currentIndex + 1] || null;
  }

  // Mark a word as learned
  markWordLearned(spanishWord, correct = true) {
    this.learningSession.totalAttempts++;

    if (correct) {
      this.learningSession.correctAnswers++;

      if (!this.userProgress.wordsLearned.includes(spanishWord)) {
        this.userProgress.wordsLearned.push(spanishWord);
        this.userProgress.totalWordsLearned++;
        this.learningSession.wordsLearned++;
      }
    }

    // Update accuracy
    this.userProgress.accuracy = Math.round(
      (this.learningSession.correctAnswers / this.learningSession.totalAttempts) * 100
    );

    // Update study date and streak
    const today = new Date().toDateString();
    if (this.userProgress.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (this.userProgress.lastStudyDate === yesterday.toDateString()) {
        this.userProgress.streakDays++;
      } else {
        this.userProgress.streakDays = 1;
      }

      this.userProgress.lastStudyDate = today;
    }

    this.saveProgress();
    return this.getSessionStats();
  }

  // Get current session statistics
  getSessionStats() {
    const sessionTime = Math.round((Date.now() - this.learningSession.startTime) / 1000);

    return {
      wordsLearned: this.learningSession.wordsLearned,
      accuracy: this.userProgress.accuracy,
      sessionTime: sessionTime,
      streakDays: this.userProgress.streakDays,
      totalWords: this.userProgress.totalWordsLearned,
      level: this.getCurrentLevel()
    };
  }

  // Generate a simple learning exercise
  generateExercise() {
    const word = this.getNextWord();
    const level = this.getCurrentLevel();
    const otherWords = this.vocabulary[level].filter(w => w.spanish !== word.spanish);

    // Create multiple choice options
    const options = [word.english];
    while (options.length < 4 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (!options.includes(randomWord.english)) {
        options.push(randomWord.english);
      }
      otherWords.splice(otherWords.indexOf(randomWord), 1);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      id: `exercise_${Date.now()}`,
      word: word,
      question: `What does "${word.spanish}" mean?`,
      options: options,
      correctAnswer: word.english,
      pronunciation: word.pronunciation,
      level: level
    };
  }

  // Check if answer is correct
  checkAnswer(exercise, selectedAnswer) {
    const correct = selectedAnswer === exercise.correctAnswer;
    const stats = this.markWordLearned(exercise.word.spanish, correct);

    return {
      correct: correct,
      correctAnswer: exercise.correctAnswer,
      word: exercise.word,
      stats: stats,
      encouragement: this.getEncouragement(correct, stats)
    };
  }

  // Get encouraging message based on performance
  getEncouragement(correct, stats) {
    if (correct) {
      const messages = [
        '¡Excelente! (Excellent!)',
        '¡Muy bien! (Very good!)',
        '¡Perfecto! (Perfect!)',
        '¡Fantástico! (Fantastic!)',
        '¡Increíble! (Incredible!)'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      return '¡No te preocupes! (Don\'t worry!) Try again!';
    }
  }

  // Get learning recommendations
  getRecommendations() {
    const level = this.getCurrentLevel();
    const accuracy = this.userProgress.accuracy;
    const totalWords = this.userProgress.totalWordsLearned;

    const recommendations = [];

    if (accuracy < 70) {
      recommendations.push({
        type: 'practice',
        message: 'Practice more with easier words to build confidence',
        action: 'Review basic vocabulary'
      });
    }

    if (totalWords >= 10 && level === 'beginner') {
      recommendations.push({
        type: 'level_up',
        message: 'You\'re ready for intermediate words!',
        action: 'Try intermediate vocabulary'
      });
    }

    if (this.userProgress.streakDays >= 7) {
      recommendations.push({
        type: 'achievement',
        message: `Amazing! ${this.userProgress.streakDays} day streak!`,
        action: 'Keep up the great work'
      });
    }

    return recommendations;
  }

  // Generate content for Globe Universe integration per vision.md
  generateGlobeContent() {
    const word = this.getNextWord();
    const characters = ['MARCO', 'SOFIA', 'GLOBE'];
    const character = characters[Math.floor(Math.random() * characters.length)];

    // Vision.md: transformation structure with comedy peak + Spanish learning
    const transformationStructure = {
      setup: `${character} starts with normal ${word.english}`,
      transformation: `${word.english} changes dramatically`,
      comedyPeak: this.getHilariousConsequence(word),
      spanishLearning: `"${word.spanish}" (${word.pronunciation})`,
      surpriseEnding: this.getUnexpectedTwist(word, character)
    };

    return {
      character: character,
      word: word,
      transformationStructure: transformationStructure,
      learningFocus: `Learn "${word.spanish}" through visual comedy`,
      difficulty: this.getCurrentLevel(),
      ultraSlowSpanish: this.getUltraSlowSpanish(word.spanish)
    };
  }

  // Vision.md: 1-2 sentences, slow Spanish (25-35 wpm)
  getUltraSlowSpanish(spanish) {
    return {
      text: spanish,
      wpm: 30, // Middle of 25-35 range per vision.md
      pauseDuration: 500, // ms between words
      totalDuration: (spanish.split(' ').length * 2000), // 2 seconds per word
      emphasis: "ultra-slow for beginner accessibility"
    };
  }

  getHilariousConsequence(word) {
    const consequences = {
      "agua": "water starts flowing upward in spirals",
      "casa": "house grows tiny legs and walks away",
      "gato": "cat starts speaking fluent Spanish to GLOBE",
      "café": "coffee cups begin flying around frantically",
      "perro": "dog becomes invisible but keeps barking"
    };
    return consequences[word.spanish] || `${word.english} does something completely unexpected`;
  }

  getUnexpectedTwist(word, character) {
    return `${character} realizes the ${word.english} was actually teaching THEM Spanish all along!`;
  }

  // Export progress for analytics
  exportProgress() {
    return {
      ...this.userProgress,
      sessionStats: this.getSessionStats(),
      recommendations: this.getRecommendations(),
      timestamp: new Date().toISOString()
    };
  }

  // Reset progress (for testing or user request)
  resetProgress() {
    this.userProgress = this.getDefaultProgress();
    this.learningSession = {
      wordsLearned: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      startTime: Date.now()
    };
    this.saveProgress();
  }
}

export default SpanishLearningCore;