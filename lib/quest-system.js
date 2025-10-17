/**
 * 🎯 QUEST & CHALLENGE SYSTEM
 * 
 * Daily/Weekly quests that drive retention and engagement
 * Inspired by: Duolingo Daily Goals, TikTok Challenges, Instagram Reels Trends
 * 
 * Key Features:
 * - Daily quests (reset every 24h)
 * - Weekly challenges (reset every 7 days)
 * - Progressive difficulty
 * - XP rewards with multipliers
 * - Streak bonuses
 * - Social challenges (compete with friends)
 */

class QuestSystem {
    constructor() {
        this.userQuests = new Map(); // userId -> quest state
        this.activeQuests = new Map(); // questId -> quest definition
        this.completedQuests = new Map(); // userId -> completed quests array
        
        this.initializeQuests();
    }

    /**
     * Initialize quest templates
     */
    initializeQuests() {
        // DAILY QUESTS (Reset every 24h)
        this.DAILY_QUESTS = {
            video_watching: {
                id: 'daily_watch_videos',
                name: 'Video Enthusiast',
                description: 'Watch 5 videos today',
                icon: '🎬',
                type: 'daily',
                target: 5,
                xpReward: 100,
                streakBonus: 20,
                action: 'watch_video',
                difficulty: 'easy'
            },
            word_learning: {
                id: 'daily_learn_words',
                name: 'Word Collector',
                description: 'Learn 10 new words',
                icon: '📚',
                type: 'daily',
                target: 10,
                xpReward: 150,
                streakBonus: 30,
                action: 'save_word',
                difficulty: 'easy'
            },
            quiz_master: {
                id: 'daily_complete_quizzes',
                name: 'Quiz Master',
                description: 'Complete 3 quizzes',
                icon: '✅',
                type: 'daily',
                target: 3,
                xpReward: 200,
                streakBonus: 40,
                action: 'complete_quiz',
                difficulty: 'medium'
            },
            ai_conversation: {
                id: 'daily_ai_chat',
                name: 'Conversation Practice',
                description: 'Have a 10-turn AI conversation',
                icon: '💬',
                type: 'daily',
                target: 10,
                xpReward: 250,
                streakBonus: 50,
                action: 'ai_turn',
                difficulty: 'medium'
            },
            perfect_quiz: {
                id: 'daily_perfect_quiz',
                name: 'Perfectionist',
                description: 'Get 100% on any quiz',
                icon: '⭐',
                type: 'daily',
                target: 1,
                xpReward: 300,
                streakBonus: 60,
                action: 'perfect_quiz',
                difficulty: 'hard'
            },
            listening_practice: {
                id: 'daily_listening',
                name: 'Listening Expert',
                description: 'Play the listening game 5 times',
                icon: '🎧',
                type: 'daily',
                target: 5,
                xpReward: 180,
                streakBonus: 35,
                action: 'play_listening_game',
                difficulty: 'easy'
            }
        };

        // WEEKLY CHALLENGES (Reset every Monday)
        this.WEEKLY_CHALLENGES = {
            video_marathon: {
                id: 'weekly_watch_marathon',
                name: 'Video Marathon',
                description: 'Watch 50 videos this week',
                icon: '🎯',
                type: 'weekly',
                target: 50,
                xpReward: 1000,
                badge: '🏆',
                action: 'watch_video',
                difficulty: 'medium'
            },
            vocabulary_builder: {
                id: 'weekly_vocabulary',
                name: 'Vocabulary Builder',
                description: 'Learn 100 new words',
                icon: '📖',
                type: 'weekly',
                target: 100,
                xpReward: 1500,
                badge: '📚',
                action: 'save_word',
                difficulty: 'medium'
            },
            streak_keeper: {
                id: 'weekly_maintain_streak',
                name: 'Streak Keeper',
                description: 'Maintain your streak all week (7 days)',
                icon: '🔥',
                type: 'weekly',
                target: 7,
                xpReward: 2000,
                badge: '⚡',
                action: 'daily_login',
                difficulty: 'hard'
            },
            social_butterfly: {
                id: 'weekly_social_engagement',
                name: 'Social Butterfly',
                description: 'Share 10 achievements or words',
                icon: '🦋',
                type: 'weekly',
                target: 10,
                xpReward: 800,
                badge: '🌟',
                action: 'share_content',
                difficulty: 'easy'
            },
            quiz_champion: {
                id: 'weekly_quiz_champion',
                name: 'Quiz Champion',
                description: 'Complete 20 quizzes with 80%+ accuracy',
                icon: '🏅',
                type: 'weekly',
                target: 20,
                xpReward: 1800,
                badge: '👑',
                action: 'complete_quiz_high_score',
                difficulty: 'hard'
            },
            conversation_king: {
                id: 'weekly_ai_conversations',
                name: 'Conversation King',
                description: 'Have 50 AI conversation turns',
                icon: '👑',
                type: 'weekly',
                target: 50,
                xpReward: 2500,
                badge: '💎',
                action: 'ai_turn',
                difficulty: 'hard'
            },
            topic_deep_dive: {
                id: 'weekly_topic_focus',
                name: 'Topic Expert',
                description: 'Watch 20 videos on a single topic',
                icon: '🎓',
                type: 'weekly',
                target: 20,
                xpReward: 1200,
                badge: '🔬',
                action: 'watch_topic_video',
                difficulty: 'medium'
            }
        };

        // SPECIAL EVENT CHALLENGES
        this.SPECIAL_CHALLENGES = {
            first_week: {
                id: 'challenge_first_week',
                name: 'Welcome Week!',
                description: 'Complete your first week on Langflix',
                icon: '🎉',
                type: 'special',
                target: 7,
                xpReward: 500,
                badge: '🌟',
                action: 'daily_login',
                duration: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
                difficulty: 'easy'
            },
            weekend_warrior: {
                id: 'challenge_weekend',
                name: 'Weekend Warrior',
                description: 'Learn 50 words this weekend',
                icon: '⚔️',
                type: 'special',
                target: 50,
                xpReward: 800,
                badge: '🛡️',
                action: 'save_word',
                startsOn: 'saturday',
                duration: 2 * 24 * 60 * 60 * 1000, // 2 days
                difficulty: 'hard'
            }
        };
    }

    /**
     * Get user's active quests
     */
    getUserQuests(userId) {
        if (!this.userQuests.has(userId)) {
            this.initializeUserQuests(userId);
        }
        
        const userQuestState = this.userQuests.get(userId);
        
        // Check if quests need reset
        this.checkQuestResets(userId);
        
        return {
            daily: this.getDailyQuestsWithProgress(userId, userQuestState.daily),
            weekly: this.getWeeklyQuestsWithProgress(userId, userQuestState.weekly),
            special: this.getSpecialChallengesWithProgress(userId, userQuestState.special),
            summary: {
                dailyCompleted: Object.values(userQuestState.daily).filter(q => q.completed).length,
                dailyTotal: Object.keys(this.DAILY_QUESTS).length,
                weeklyCompleted: Object.values(userQuestState.weekly).filter(q => q.completed).length,
                weeklyTotal: Object.keys(this.WEEKLY_CHALLENGES).length
            }
        };
    }

    /**
     * Initialize quests for new user
     */
    initializeUserQuests(userId) {
        const now = new Date();
        
        const questState = {
            daily: {},
            weekly: {},
            special: {},
            lastDailyReset: now.toISOString(),
            lastWeeklyReset: now.toISOString(),
            totalQuestsCompleted: 0,
            currentStreak: 0
        };

        // Initialize daily quests
        for (const [key, quest] of Object.entries(this.DAILY_QUESTS)) {
            questState.daily[quest.id] = {
                progress: 0,
                target: quest.target,
                completed: false,
                startedAt: now.toISOString()
            };
        }

        // Initialize weekly challenges
        for (const [key, quest] of Object.entries(this.WEEKLY_CHALLENGES)) {
            questState.weekly[quest.id] = {
                progress: 0,
                target: quest.target,
                completed: false,
                startedAt: now.toISOString()
            };
        }

        this.userQuests.set(userId, questState);
        return questState;
    }

    /**
     * Track action and update quest progress
     */
    trackAction(userId, action, metadata = {}) {
        const questState = this.getUserQuests(userId);
        const updates = [];
        const completions = [];

        // Update daily quests
        for (const [questId, state] of Object.entries(questState.daily)) {
            const questDef = Object.values(this.DAILY_QUESTS).find(q => q.id === questId);
            
            if (!questDef || state.completed) continue;
            
            // Check if action matches quest requirement
            if (this.matchesQuestAction(action, questDef.action, metadata)) {
                state.progress++;
                updates.push({ questId, type: 'daily', progress: state.progress, target: state.target });
                
                // Check completion
                if (state.progress >= state.target && !state.completed) {
                    state.completed = true;
                    const reward = this.completeQuest(userId, questDef, 'daily');
                    completions.push({ quest: questDef, reward, type: 'daily' });
                }
            }
        }

        // Update weekly challenges
        for (const [questId, state] of Object.entries(questState.weekly)) {
            const questDef = Object.values(this.WEEKLY_CHALLENGES).find(q => q.id === questId);
            
            if (!questDef || state.completed) continue;
            
            if (this.matchesQuestAction(action, questDef.action, metadata)) {
                state.progress++;
                updates.push({ questId, type: 'weekly', progress: state.progress, target: state.target });
                
                if (state.progress >= state.target && !state.completed) {
                    state.completed = true;
                    const reward = this.completeQuest(userId, questDef, 'weekly');
                    completions.push({ quest: questDef, reward, type: 'weekly' });
                }
            }
        }

        return {
            updates,
            completions,
            showCelebration: completions.length > 0
        };
    }

    /**
     * Check if action matches quest requirement
     */
    matchesQuestAction(action, questAction, metadata) {
        if (action === questAction) return true;
        
        // Special cases
        if (questAction === 'complete_quiz_high_score') {
            return action === 'complete_quiz' && metadata.score >= 80;
        }
        
        if (questAction === 'watch_topic_video') {
            return action === 'watch_video' && metadata.topic;
        }
        
        return false;
    }

    /**
     * Complete quest and award rewards
     */
    completeQuest(userId, questDef, type) {
        const questState = this.userQuests.get(userId);
        questState.totalQuestsCompleted++;

        // Calculate rewards
        let xp = questDef.xpReward;
        let bonusXp = 0;
        
        // Add streak bonus for daily quests
        if (type === 'daily' && questState.currentStreak > 0) {
            bonusXp = questDef.streakBonus || 0;
            xp += bonusXp;
        }

        // Track completion
        if (!this.completedQuests.has(userId)) {
            this.completedQuests.set(userId, []);
        }
        
        this.completedQuests.get(userId).push({
            questId: questDef.id,
            questName: questDef.name,
            type,
            completedAt: new Date().toISOString(),
            xpAwarded: xp
        });

        return {
            xp,
            bonusXp,
            badge: questDef.badge,
            achievement: {
                id: `quest_${questDef.id}`,
                name: questDef.name,
                description: questDef.description,
                icon: questDef.icon
            }
        };
    }

    /**
     * Get daily quests with progress
     */
    getDailyQuestsWithProgress(userId, dailyState) {
        return Object.entries(this.DAILY_QUESTS).map(([key, quest]) => {
            const state = dailyState[quest.id] || { progress: 0, completed: false };
            return {
                ...quest,
                progress: state.progress,
                completed: state.completed,
                progressPercent: Math.min((state.progress / quest.target) * 100, 100)
            };
        });
    }

    /**
     * Get weekly challenges with progress
     */
    getWeeklyQuestsWithProgress(userId, weeklyState) {
        return Object.entries(this.WEEKLY_CHALLENGES).map(([key, quest]) => {
            const state = weeklyState[quest.id] || { progress: 0, completed: false };
            return {
                ...quest,
                progress: state.progress,
                completed: state.completed,
                progressPercent: Math.min((state.progress / quest.target) * 100, 100)
            };
        });
    }

    /**
     * Get special challenges with progress
     */
    getSpecialChallengesWithProgress(userId, specialState) {
        return Object.entries(this.SPECIAL_CHALLENGES).map(([key, quest]) => {
            const state = specialState[quest.id] || { progress: 0, completed: false };
            return {
                ...quest,
                progress: state.progress,
                completed: state.completed,
                progressPercent: Math.min((state.progress / quest.target) * 100, 100)
            };
        });
    }

    /**
     * Check if quests need reset
     */
    checkQuestResets(userId) {
        const questState = this.userQuests.get(userId);
        const now = new Date();
        
        // Check daily reset (midnight)
        const lastDaily = new Date(questState.lastDailyReset);
        if (now.getDate() !== lastDaily.getDate()) {
            this.resetDailyQuests(userId);
        }

        // Check weekly reset (Monday)
        const lastWeekly = new Date(questState.lastWeeklyReset);
        const daysSinceWeeklyReset = Math.floor((now - lastWeekly) / (1000 * 60 * 60 * 24));
        if (daysSinceWeeklyReset >= 7 || (now.getDay() === 1 && lastWeekly.getDay() !== 1)) {
            this.resetWeeklyQuests(userId);
        }
    }

    /**
     * Reset daily quests
     */
    resetDailyQuests(userId) {
        const questState = this.userQuests.get(userId);
        
        // Check if all quests were completed
        const allCompleted = Object.values(questState.daily).every(q => q.completed);
        if (allCompleted) {
            questState.currentStreak++;
        } else {
            questState.currentStreak = 0;
        }

        // Reset daily quests
        for (const [key, quest] of Object.entries(this.DAILY_QUESTS)) {
            questState.daily[quest.id] = {
                progress: 0,
                target: quest.target,
                completed: false,
                startedAt: new Date().toISOString()
            };
        }

        questState.lastDailyReset = new Date().toISOString();
    }

    /**
     * Reset weekly quests
     */
    resetWeeklyQuests(userId) {
        const questState = this.userQuests.get(userId);

        for (const [key, quest] of Object.entries(this.WEEKLY_CHALLENGES)) {
            questState.weekly[quest.id] = {
                progress: 0,
                target: quest.target,
                completed: false,
                startedAt: new Date().toISOString()
            };
        }

        questState.lastWeeklyReset = new Date().toISOString();
    }

    /**
     * Get quest completion history
     */
    getQuestHistory(userId, limit = 50) {
        const history = this.completedQuests.get(userId) || [];
        return history.slice(-limit).reverse();
    }

    /**
     * Get quest stats
     */
    getQuestStats(userId) {
        const questState = this.userQuests.get(userId);
        const history = this.completedQuests.get(userId) || [];

        const dailyCompleted = Object.values(questState.daily).filter(q => q.completed).length;
        const weeklyCompleted = Object.values(questState.weekly).filter(q => q.completed).length;

        const totalXpFromQuests = history.reduce((sum, quest) => sum + quest.xpAwarded, 0);

        return {
            totalQuestsCompleted: questState.totalQuestsCompleted,
            currentDailyStreak: questState.currentStreak,
            dailyQuestsToday: {
                completed: dailyCompleted,
                total: Object.keys(this.DAILY_QUESTS).length,
                percentage: Math.round((dailyCompleted / Object.keys(this.DAILY_QUESTS).length) * 100)
            },
            weeklyQuestsThisWeek: {
                completed: weeklyCompleted,
                total: Object.keys(this.WEEKLY_CHALLENGES).length,
                percentage: Math.round((weeklyCompleted / Object.keys(this.WEEKLY_CHALLENGES).length) * 100)
            },
            totalXpEarned: totalXpFromQuests,
            recentCompletions: history.slice(-5).reverse()
        };
    }
}

// Export singleton
const questSystem = new QuestSystem();
module.exports = questSystem;


