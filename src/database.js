// 🗄️ DATABASE MODULE - Unified in-memory database for vocabulary & progress
// ES Module format for integration with server.js

export class Database {
  constructor() {
    this.users = new Map();
    this.words = new Map();
    this.progress = [];
    this.sessions = [];
  }

  // 👤 GET USER LEVEL
  getUserLevel(userId) {
    const user = this.users.get(userId) || {
      id: userId,
      currentLevel: 'A1',
      streak: 0,
      totalXP: 0,
      wordsCount: 0,
      longestStreak: 0,
      lastActive: new Date().toISOString(),
      dailyGoal: 10, // XP per day
      todayXP: 0
    };

    // Auto-save new user
    if (!this.users.has(userId)) {
      this.users.set(userId, user);
    }

    // Check and update streak
    this.updateStreak(userId);

    return {
      success: true,
      level: user.currentLevel,
      xp: user.totalXP,
      streak: user.streak,
      wordsCount: user.wordsCount
    };
  }

  // 📝 GET USER WORDS
  getUserWords(userId, levelFilter = null) {
    let words = Array.from(this.words.values())
      .filter(w => w.userId === userId);

    if (levelFilter) {
      words = words.filter(w => w.level === levelFilter);
    }

    const byLevel = {
      A1: words.filter(w => w.level === 'A1').length,
      A2: words.filter(w => w.level === 'A2').length,
      B1: words.filter(w => w.level === 'B1').length,
      B2: words.filter(w => w.level === 'B2').length,
      C1: words.filter(w => w.level === 'C1').length,
      C2: words.filter(w => w.level === 'C2').length
    };

    return {
      success: true,
      words: words,
      total: words.length,
      byLevel: byLevel,
      mastered: words.filter(w => w.mastered).length
    };
  }

  // ✅ SAVE WORD LEARNED
  saveWordLearned(userId, word, translation, level = 'A2', context = '') {
    const wordId = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const wordData = {
      id: wordId,
      userId: userId,
      word: word,
      translation: translation,
      level: level,
      context: context,
      savedAt: new Date().toISOString(),
      reviewCount: 0,
      mastered: false
    };

    this.words.set(wordId, wordData);

    // Update user stats
    let user = this.users.get(userId) || {
      id: userId,
      currentLevel: 'A1',
      streak: 0,
      totalXP: 0,
      wordsCount: 0,
      longestStreak: 0
    };

    user.wordsCount = (user.wordsCount || 0) + 1;
    user.totalXP = (user.totalXP || 0) + 10; // 10 XP per word
    user.todayXP = (user.todayXP || 0) + 10; // Track daily XP

    // Update quest progress
    this.updateQuestProgress(userId, 'learn_3_words', 1); // Words learned quest
    this.updateQuestProgress(userId, 'earn_30_xp', 10); // XP quest

    // Level progression
    if (user.totalXP >= 500 && user.currentLevel === 'A1') user.currentLevel = 'A2';
    if (user.totalXP >= 1000 && user.currentLevel === 'A2') user.currentLevel = 'B1';
    if (user.totalXP >= 2000 && user.currentLevel === 'B1') user.currentLevel = 'B2';
    if (user.totalXP >= 4000 && user.currentLevel === 'B2') user.currentLevel = 'C1';
    if (user.totalXP >= 8000 && user.currentLevel === 'C1') user.currentLevel = 'C2';

    this.users.set(userId, user);

    return {
      success: true,
      word: wordData,
      userStats: {
        totalWords: user.wordsCount,
        totalXP: user.totalXP,
        level: user.currentLevel
      }
    };
  }

  // 📊 GET USER STATS
  getUserStats(userId) {
    const user = this.users.get(userId) || {
      id: userId,
      currentLevel: 'A1',
      streak: 0,
      totalXP: 0,
      wordsCount: 0,
      longestStreak: 0
    };

    const words = Array.from(this.words.values())
      .filter(w => w.userId === userId);

    const byLevel = {
      A1: words.filter(w => w.level === 'A1').length,
      A2: words.filter(w => w.level === 'A2').length,
      B1: words.filter(w => w.level === 'B1').length,
      B2: words.filter(w => w.level === 'B2').length,
      C1: words.filter(w => w.level === 'C1').length,
      C2: words.filter(w => w.level === 'C2').length
    };

    // Achievement system
    const achievements = [];
    if (user.wordsCount >= 10) achievements.push({ id: 'first_10', name: 'First 10 Words!', icon: '🎯' });
    if (user.wordsCount >= 50) achievements.push({ id: 'half_century', name: 'Half Century', icon: '🎖️' });
    if (user.wordsCount >= 100) achievements.push({ id: 'centurion', name: 'Centurion', icon: '🏆' });
    if (user.streak >= 7) achievements.push({ id: 'week_streak', name: 'Week Streak!', icon: '🔥' });
    if (user.streak >= 30) achievements.push({ id: 'month_streak', name: 'Month Streak!', icon: '💪' });

    return {
      success: true,
      stats: {
        user: {
          id: userId,
          level: user.currentLevel,
          xp: user.totalXP,
          streak: user.streak,
          longestStreak: user.longestStreak
        },
        vocabulary: {
          total: words.length,
          mastered: words.filter(w => w.mastered).length,
          learning: words.filter(w => !w.mastered).length,
          byLevel: byLevel
        },
        today: {
          wordsLearned: 0, // Would track daily in real DB
          xpEarned: 0,
          timeSpent: 0
        },
        achievements: achievements
      }
    };
  }

  // 📈 GET USER PROGRESS
  getUserProgress(userId) {
    const stats = this.getUserStats(userId);
    const user = this.users.get(userId) || { currentLevel: 'A1', totalXP: 0 };

    // XP needed for next level
    const xpThresholds = { A1: 500, A2: 1000, B1: 2000, B2: 4000, C1: 8000, C2: 16000 };
    const currentThreshold = xpThresholds[user.currentLevel] || 16000;
    const nextLevel = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'Master' }[user.currentLevel];

    return {
      success: true,
      progress: {
        currentLevel: user.currentLevel,
        nextLevel: nextLevel,
        xpCurrent: user.totalXP,
        xpNeeded: currentThreshold,
        percentToNext: Math.min(100, Math.round((user.totalXP / currentThreshold) * 100)),
        wordsCount: stats.stats.vocabulary.total,
        streak: user.streak
      }
    };
  }

  // 🔥 UPDATE STREAK (60% engagement increase from competitive intel)
  updateStreak(userId) {
    const user = this.users.get(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    const lastActive = new Date(user.lastActive);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day - no streak update needed
      return;
    } else if (daysDiff === 1) {
      // Exactly 1 day - maintain streak
      user.streak = (user.streak || 0) + 1;
      user.longestStreak = Math.max(user.longestStreak || 0, user.streak);
    } else {
      // More than 1 day - streak broken, reset to 1 (user is active now)
      user.streak = 1;
    }

    // Reset daily XP and quests for new day
    user.todayXP = 0;
    user.lastActive = new Date().toISOString();
    user.dailyQuests = this.generateDailyQuests(user.currentLevel);
    user.questsCompleted = 0;

    this.users.set(userId, user);
  }

  // 🎯 GENERATE DAILY QUESTS (25% DAU increase from competitive intel)
  generateDailyQuests(userLevel) {
    const quests = [
      { id: 'learn_3_words', name: 'Learn 3 New Words', target: 3, current: 0, reward: 15, completed: false },
      { id: 'earn_30_xp', name: 'Earn 30 XP Today', target: 30, current: 0, reward: 20, completed: false },
      { id: 'practice_5_min', name: 'Practice for 5 Minutes', target: 300, current: 0, reward: 10, completed: false }
    ];

    // Add level-specific quest
    if (userLevel === 'A1' || userLevel === 'A2') {
      quests.push({ id: 'beginner_focus', name: 'Review 5 Basic Words', target: 5, current: 0, reward: 10, completed: false });
    } else {
      quests.push({ id: 'advanced_focus', name: 'Master 2 Complex Phrases', target: 2, current: 0, reward: 25, completed: false });
    }

    return quests;
  }

  // ✅ UPDATE QUEST PROGRESS
  updateQuestProgress(userId, questId, increment = 1) {
    const user = this.users.get(userId);
    if (!user || !user.dailyQuests) return;

    const quest = user.dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    quest.current = Math.min(quest.current + increment, quest.target);

    if (quest.current >= quest.target && !quest.completed) {
      quest.completed = true;
      user.totalXP = (user.totalXP || 0) + quest.reward;
      user.questsCompleted = (user.questsCompleted || 0) + 1;
    }

    this.users.set(userId, user);
  }

  // 📊 GET DAILY QUESTS
  getDailyQuests(userId) {
    const user = this.users.get(userId);
    if (!user) return { success: false, quests: [] };

    if (!user.dailyQuests) {
      user.dailyQuests = this.generateDailyQuests(user.currentLevel);
      user.questsCompleted = 0;
      this.users.set(userId, user);
    }

    return {
      success: true,
      quests: user.dailyQuests,
      completed: user.questsCompleted || 0,
      total: user.dailyQuests.length
    };
  }
}

// Export singleton instance
export const db = new Database();
