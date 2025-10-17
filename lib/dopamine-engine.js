/**
 * 🎰 DOPAMINE ENGINE - Variable Reward System
 * 
 * Implements intermittent reinforcement (slot machine psychology)
 * Based on behavioral psychology research and TikTok/Instagram engagement patterns
 * 
 * Key mechanics:
 * - Variable rewards (unpredictable timing & type)
 * - Celebration animations for everything
 * - Social proof & FOMO triggers
 * - Progress milestones
 */

class DopamineEngine {
    constructor() {
        this.userRewardHistory = new Map(); // userId -> reward history
        this.sessionMilestones = new Map(); // userId -> session milestones
        
        // Reward types with probabilities (should add up to 100%)
        this.REWARDS = [
            { type: 'xp_boost', value: '+50 XP 🎉', xpAmount: 50, chance: 30, rarity: 'common' },
            { type: 'streak_freeze', value: '1 Day Streak Freeze ❄️', chance: 20, rarity: 'uncommon' },
            { type: 'unlock_feature', value: 'Unlocked AI Chat! 🤖', chance: 10, rarity: 'rare' },
            { type: 'surprise_content', value: 'Exclusive Video! 🎬', chance: 25, rarity: 'uncommon' },
            { type: 'achievement', value: 'Night Owl Badge 🦉', chance: 15, rarity: 'rare' }
        ];
        
        // Celebration triggers (every N actions)
        this.CELEBRATIONS = {
            word_save: { frequency: 1, message: 'Word Saved! +5 XP', xp: 5, animation: 'flash-green' },
            video_complete: { frequency: 5, message: '🎉 Video Champion!', xp: 10, animation: 'confetti' },
            article_read: { frequency: 1, message: '📚 +3 Reading Streak!', xp: 3, animation: 'pulse' },
            quiz_correct: { frequency: 1, message: '¡Fuego! 🔥', xp: 5, animation: 'fire' },
            session_20min: { frequency: 1, message: '20 minutes! You\'re on fire! 🔥', xp: 50, animation: 'fireworks' }
        };
        
        // Social proof messages (simulated, eventually from real data)
        this.SOCIAL_PROOF_MESSAGES = [
            '🔴 2,847 learners are watching videos right now',
            '💪 Sarah just learned 50 words today — can you beat her?',
            '🌟 Top 5% of learners this week!',
            '⚡ 156 people learned this word today',
            '🎯 You\'re ahead of 78% of learners at your level'
        ];
        
        // FOMO triggers
        this.FOMO_TRIGGERS = [
            '⏰ This exclusive video disappears in 2 hours!',
            '🔥 Trending now: Learn before it\'s gone',
            '⭐ Limited: Only 50 people have seen this',
            '🎁 Special content unlocks at 100 words learned',
            '💎 Reach 30-day streak for premium features'
        ];
        
        console.log('🎰 Dopamine Engine initialized');
    }
    
    /**
     * 🎁 TRIGGER VARIABLE REWARD
     * Called after completing content (video, article, etc.)
     * Random rewards at unpredictable intervals = dopamine spike
     */
    triggerVariableReward(userId, contentType = 'content') {
        if (!this.userRewardHistory.has(userId)) {
            this.userRewardHistory.set(userId, {
                totalRewards: 0,
                lastRewardAt: null,
                rewardStreak: 0,
                recentActions: []
            });
        }
        
        const history = this.userRewardHistory.get(userId);
        history.recentActions.push({
            type: contentType,
            timestamp: Date.now()
        });
        
        // Keep only last 20 actions
        if (history.recentActions.length > 20) {
            history.recentActions.shift();
        }
        
        // Variable reward logic: Random interval between 5-15 items
        const actionsSinceLastReward = history.recentActions.length - 
            (history.lastRewardIndex || 0);
        
        // Random threshold between 5 and 15
        const rewardThreshold = Math.floor(Math.random() * 10) + 5;
        
        if (actionsSinceLastReward >= rewardThreshold) {
            // Trigger reward!
            const reward = this.selectRandomReward();
            history.totalRewards++;
            history.lastRewardAt = Date.now();
            history.lastRewardIndex = history.recentActions.length;
            history.rewardStreak++;
            
            return {
                triggered: true,
                reward,
                totalRewards: history.totalRewards,
                shouldShowAnimation: true
            };
        }
        
        return {
            triggered: false,
            nextRewardIn: rewardThreshold - actionsSinceLastReward
        };
    }
    
    /**
     * 🎲 SELECT RANDOM REWARD
     * Weighted random selection based on rarity
     */
    selectRandomReward() {
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const reward of this.REWARDS) {
            cumulative += reward.chance;
            if (random <= cumulative) {
                return {
                    ...reward,
                    timestamp: Date.now()
                };
            }
        }
        
        // Fallback
        return this.REWARDS[0];
    }
    
    /**
     * 🎉 TRIGGER MICRO-CELEBRATION
     * Called for every small action (word save, quiz answer, etc.)
     * Minimum 1 celebration every 30 seconds = constant dopamine drip
     */
    triggerCelebration(userId, actionType, metadata = {}) {
        const celebration = this.CELEBRATIONS[actionType];
        
        if (!celebration) {
            return { triggered: false };
        }
        
        // Check if we should celebrate this action
        const userHistory = this.sessionMilestones.get(userId) || {
            actionCounts: {},
            lastCelebrationAt: 0
        };
        
        const actionCount = (userHistory.actionCounts[actionType] || 0) + 1;
        userHistory.actionCounts[actionType] = actionCount;
        
        // Should we celebrate?
        const shouldCelebrate = actionCount % celebration.frequency === 0;
        
        if (shouldCelebrate) {
            userHistory.lastCelebrationAt = Date.now();
            this.sessionMilestones.set(userId, userHistory);
            
            return {
                triggered: true,
                message: celebration.message,
                xp: celebration.xp,
                animation: celebration.animation,
                actionType,
                actionCount
            };
        }
        
        return { triggered: false };
    }
    
    /**
     * 👥 GET SOCIAL PROOF MESSAGE
     * Returns a random social proof message
     * Creates FOMO and social pressure to continue
     */
    getSocialProofMessage() {
        const random = Math.floor(Math.random() * this.SOCIAL_PROOF_MESSAGES.length);
        return {
            message: this.SOCIAL_PROOF_MESSAGES[random],
            type: 'social_proof',
            shouldShow: Math.random() > 0.7 // Show 30% of the time
        };
    }
    
    /**
     * ⏰ GET FOMO TRIGGER
     * Returns a random FOMO message
     * Creates urgency and fear of missing out
     */
    getFOMOTrigger() {
        const random = Math.floor(Math.random() * this.FOMO_TRIGGERS.length);
        return {
            message: this.FOMO_TRIGGERS[random],
            type: 'fomo',
            shouldShow: Math.random() > 0.85 // Show 15% of the time (rare)
        };
    }
    
    /**
     * 📊 TRACK SESSION MILESTONE
     * Called periodically (every minute) to check for milestones
     * e.g., "20 minutes of learning!", "10 videos watched!"
     */
    checkSessionMilestone(userId, sessionStats) {
        const {
            sessionDuration, // in minutes
            videosWatched = 0,
            articlesRead = 0,
            wordsSaved = 0,
            quizzesCompleted = 0
        } = sessionStats;
        
        const milestones = [];
        
        // Time-based milestones
        if (sessionDuration === 10) {
            milestones.push({
                type: 'time',
                message: '10 minutes! Keep going! 🚀',
                xp: 25
            });
        } else if (sessionDuration === 20) {
            milestones.push({
                type: 'time',
                message: '20 minutes! You\'re on fire! 🔥',
                xp: 50,
                animation: 'fireworks'
            });
        } else if (sessionDuration === 30) {
            milestones.push({
                type: 'time',
                message: '30 minutes! Language master! 🏆',
                xp: 100,
                animation: 'trophy'
            });
        }
        
        // Content-based milestones
        if (videosWatched > 0 && videosWatched % 10 === 0) {
            milestones.push({
                type: 'videos',
                message: `${videosWatched} videos! Unstoppable! 💪`,
                xp: 30
            });
        }
        
        if (articlesRead > 0 && articlesRead % 5 === 0) {
            milestones.push({
                type: 'articles',
                message: `${articlesRead} articles read! 📚`,
                xp: 25
            });
        }
        
        if (wordsSaved > 0 && wordsSaved % 20 === 0) {
            milestones.push({
                type: 'words',
                message: `${wordsSaved} words saved! Vocabulary boss! ⭐`,
                xp: 50
            });
        }
        
        return milestones;
    }
    
    /**
     * 🎯 CALCULATE ADDICTION SCORE
     * Measures how "hooked" a user is (0-100)
     * Used to optimize engagement strategies
     */
    calculateAddictionScore(userId, analytics) {
        const {
            avgSessionTime = 0,      // in minutes
            dailyReturnRate = 0,     // 0-1
            avgWatchCompletion = 0,  // 0-1
            wordSavesPerVideo = 0    // average
        } = analytics;
        
        const score = 
            (avgSessionTime * 2) +
            (dailyReturnRate * 100 * 3) +
            (avgWatchCompletion * 100 * 1.5) +
            (wordSavesPerVideo * 10);
        
        // Normalize to 0-100
        const normalized = Math.min(100, Math.max(0, score));
        
        let category;
        if (normalized >= 80) category = 'highly_engaged';
        else if (normalized >= 60) category = 'engaged';
        else if (normalized >= 40) category = 'moderate';
        else if (normalized >= 20) category = 'casual';
        else category = 'at_risk';
        
        return {
            score: Math.round(normalized),
            category,
            metrics: {
                avgSessionTime,
                dailyReturnRate,
                avgWatchCompletion,
                wordSavesPerVideo
            }
        };
    }
    
    /**
     * 🎨 GET CELEBRATION ANIMATION CONFIG
     * Returns animation configuration for different celebration types
     */
    getCelebrationAnimation(animationType) {
        const animations = {
            'flash-green': {
                type: 'flash',
                color: '#10b981',
                duration: 300
            },
            'confetti': {
                type: 'confetti',
                particleCount: 50,
                duration: 2000
            },
            'pulse': {
                type: 'pulse',
                scale: 1.2,
                duration: 500
            },
            'fire': {
                type: 'emoji-burst',
                emoji: '🔥',
                count: 5,
                duration: 1000
            },
            'fireworks': {
                type: 'confetti',
                particleCount: 100,
                duration: 3000,
                spread: 360
            },
            'trophy': {
                type: 'emoji-burst',
                emoji: '🏆',
                count: 10,
                duration: 2000
            }
        };
        
        return animations[animationType] || animations['pulse'];
    }
    
    /**
     * 📈 GET USER REWARD STATS
     * Returns reward history for analytics
     */
    getRewardStats(userId) {
        const history = this.userRewardHistory.get(userId);
        
        if (!history) {
            return {
                totalRewards: 0,
                rewardStreak: 0,
                lastRewardAt: null
            };
        }
        
        return {
            totalRewards: history.totalRewards,
            rewardStreak: history.rewardStreak,
            lastRewardAt: history.lastRewardAt,
            recentActions: history.recentActions.length
        };
    }
}

// Export singleton
const dopamineEngine = new DopamineEngine();
module.exports = dopamineEngine;


