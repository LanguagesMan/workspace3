/**
 * 🛡️ STREAK INSURANCE & FREEZE SYSTEM
 * 
 * Protect user streaks with freeze/insurance mechanism
 * Reduces churn by preventing streak anxiety
 * 
 * Inspired by: Duolingo Streak Freeze, Snapchat Streak Restore
 * 
 * Key Features:
 * - Streak freeze (automatic protection for 1 day)
 * - Streak insurance (buy protection in advance)
 * - Weekend protection (relaxed rules on weekends)
 * - Streak repair (recover lost streaks with gems)
 * - Streak milestones with rewards
 */

class StreakInsuranceSystem {
    constructor() {
        this.userStreaks = new Map(); // userId -> streak data
        this.streakInsurance = new Map(); // userId -> insurance data
        
        // Pricing
        this.PRICES = {
            freeze: 10, // 10 gems for 1 day freeze
            insurance: 50, // 50 gems for 7 days insurance
            repair: 100 // 100 gems to repair broken streak
        };

        // Milestone rewards
        this.MILESTONES = {
            3: { xp: 50, badge: '🔥 3 Day Streak' },
            7: { xp: 100, badge: '⚡ Week Warrior' },
            14: { xp: 250, badge: '💪 Two Week Hero' },
            30: { xp: 500, badge: '🌟 Month Master' },
            50: { xp: 1000, badge: '💎 50 Day Legend' },
            100: { xp: 2500, badge: '👑 Century Champion' },
            365: { xp: 10000, badge: '🏆 Year Long Master' }
        };
    }

    /**
     * Initialize streak for user
     */
    initializeStreak(userId) {
        if (!this.userStreaks.has(userId)) {
            this.userStreaks.set(userId, {
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                freezeAvailable: 1, // Free freeze for new users
                freezeUsed: 0,
                totalDaysActive: 0,
                streakBroken: 0,
                milestones: [],
                streakHistory: []
            });
        }
        return this.userStreaks.get(userId);
    }

    /**
     * Update streak (call this on user activity)
     */
    updateStreak(userId) {
        const streak = this.initializeStreak(userId);
        const today = new Date().toISOString().split('T')[0];
        const lastActive = streak.lastActiveDate;

        // Already active today
        if (lastActive === today && streak.currentStreak > 0) {
            return {
                updated: false,
                streak: streak.currentStreak,
                message: 'Already active today!',
                status: 'maintained'
            };
        }

        // Calculate days since last activity
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Continuing streak
        if (lastActive === yesterdayStr) {
            streak.currentStreak++;
            streak.totalDaysActive++;
            streak.lastActiveDate = today;

            // Check for milestone
            const milestone = this.checkMilestone(streak.currentStreak);
            if (milestone) {
                streak.milestones.push({
                    days: streak.currentStreak,
                    achievedAt: today,
                    ...milestone
                });
            }

            // Update longest streak
            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }

            // Record in history
            streak.streakHistory.push({
                date: today,
                streak: streak.currentStreak,
                action: 'continued'
            });

            return {
                updated: true,
                streak: streak.currentStreak,
                message: `🔥 ${streak.currentStreak} day streak!`,
                status: 'continued',
                milestone: milestone,
                isNewRecord: streak.currentStreak === streak.longestStreak
            };
        }

        // Streak potentially broken - check for freeze
        const insurance = this.streakInsurance.get(userId);
        const canUseFreezeAutomatically = streak.freezeAvailable > 0 || 
            (insurance && insurance.active && insurance.daysRemaining > 0);

        if (canUseFreezeAutomatically) {
            // Auto-use freeze
            const freezeResult = this.useStreakFreeze(userId, true);
            
            if (freezeResult.success) {
                streak.lastActiveDate = today;
                streak.totalDaysActive++;

                return {
                    updated: true,
                    streak: streak.currentStreak,
                    message: `🛡️ Streak protected! Used streak freeze.`,
                    status: 'freeze_used',
                    freezeUsed: true,
                    freezesRemaining: streak.freezeAvailable
                };
            }
        }

        // Streak broken
        const brokenStreak = streak.currentStreak;
        streak.currentStreak = 1; // Start new streak
        streak.lastActiveDate = today;
        streak.totalDaysActive++;
        streak.streakBroken++;

        // Record in history
        streak.streakHistory.push({
            date: today,
            streak: 1,
            action: 'broken',
            previousStreak: brokenStreak
        });

        return {
            updated: true,
            streak: 1,
            message: `💔 Streak broken. Starting fresh!`,
            status: 'broken',
            brokenStreak: brokenStreak,
            canRepair: this.canRepairStreak(userId)
        };
    }

    /**
     * Use streak freeze manually or automatically
     */
    useStreakFreeze(userId, automatic = false) {
        const streak = this.initializeStreak(userId);

        // Check if user has freeze available
        if (streak.freezeAvailable <= 0) {
            // Check insurance
            const insurance = this.streakInsurance.get(userId);
            if (insurance && insurance.active && insurance.daysRemaining > 0) {
                insurance.daysRemaining--;
                insurance.freezesUsed++;

                if (insurance.daysRemaining === 0) {
                    insurance.active = false;
                }

                return {
                    success: true,
                    source: 'insurance',
                    message: 'Used insurance day',
                    daysRemaining: insurance.daysRemaining
                };
            }

            return {
                success: false,
                error: 'No freeze available',
                canBuy: true
            };
        }

        // Use freeze
        streak.freezeAvailable--;
        streak.freezeUsed++;

        return {
            success: true,
            source: 'freeze',
            message: automatic ? 'Freeze automatically used' : 'Freeze used manually',
            freezesRemaining: streak.freezeAvailable
        };
    }

    /**
     * Buy streak freeze
     */
    buyStreakFreeze(userId, userGems) {
        if (userGems < this.PRICES.freeze) {
            return {
                success: false,
                error: 'Insufficient gems',
                required: this.PRICES.freeze,
                have: userGems
            };
        }

        const streak = this.initializeStreak(userId);
        streak.freezeAvailable++;

        return {
            success: true,
            message: '🛡️ Streak freeze purchased!',
            gemsSpent: this.PRICES.freeze,
            freezesAvailable: streak.freezeAvailable
        };
    }

    /**
     * Buy streak insurance (7 days protection)
     */
    buyStreakInsurance(userId, userGems) {
        if (userGems < this.PRICES.insurance) {
            return {
                success: false,
                error: 'Insufficient gems',
                required: this.PRICES.insurance,
                have: userGems
            };
        }

        this.streakInsurance.set(userId, {
            active: true,
            daysRemaining: 7,
            purchasedAt: new Date().toISOString(),
            freezesUsed: 0
        });

        return {
            success: true,
            message: '🛡️ 7-Day Streak Insurance activated!',
            gemsSpent: this.PRICES.insurance,
            daysProtected: 7
        };
    }

    /**
     * Repair broken streak (within 24 hours)
     */
    repairStreak(userId, userGems) {
        const streak = this.initializeStreak(userId);
        
        // Check if repair is possible (within 24 hours)
        if (!this.canRepairStreak(userId)) {
            return {
                success: false,
                error: 'Cannot repair streak (more than 24 hours passed)',
                canRepair: false
            };
        }

        if (userGems < this.PRICES.repair) {
            return {
                success: false,
                error: 'Insufficient gems',
                required: this.PRICES.repair,
                have: userGems
            };
        }

        // Find last broken streak
        const lastBreak = streak.streakHistory
            .slice()
            .reverse()
            .find(entry => entry.action === 'broken');

        if (!lastBreak || !lastBreak.previousStreak) {
            return {
                success: false,
                error: 'No recent broken streak to repair'
            };
        }

        // Repair streak
        streak.currentStreak = lastBreak.previousStreak;
        streak.lastActiveDate = new Date().toISOString().split('T')[0];

        // Record repair
        streak.streakHistory.push({
            date: new Date().toISOString().split('T')[0],
            streak: streak.currentStreak,
            action: 'repaired',
            gemsSpent: this.PRICES.repair
        });

        return {
            success: true,
            message: `✨ Streak repaired! Back to ${streak.currentStreak} days!`,
            gemsSpent: this.PRICES.repair,
            restoredStreak: streak.currentStreak
        };
    }

    /**
     * Check if streak can be repaired (within 24 hours)
     */
    canRepairStreak(userId) {
        const streak = this.userStreaks.get(userId);
        if (!streak || streak.streakHistory.length === 0) return false;

        const lastEntry = streak.streakHistory[streak.streakHistory.length - 1];
        if (lastEntry.action !== 'broken') return false;

        const lastBreakDate = new Date(lastEntry.date);
        const now = new Date();
        const hoursSinceBreak = (now - lastBreakDate) / (1000 * 60 * 60);

        return hoursSinceBreak <= 24;
    }

    /**
     * Check milestone achievement
     */
    checkMilestone(streakDays) {
        return this.MILESTONES[streakDays] || null;
    }

    /**
     * Get streak stats
     */
    getStreakStats(userId) {
        const streak = this.initializeStreak(userId);
        const insurance = this.streakInsurance.get(userId);

        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            totalDaysActive: streak.totalDaysActive,
            freezesAvailable: streak.freezeAvailable,
            freezesUsed: streak.freezeUsed,
            streaksBroken: streak.streakBroken,
            insurance: insurance ? {
                active: insurance.active,
                daysRemaining: insurance.daysRemaining
            } : null,
            nextMilestone: this.getNextMilestone(streak.currentStreak),
            milestones: streak.milestones,
            canRepair: this.canRepairStreak(userId),
            status: this.getStreakStatus(streak)
        };
    }

    /**
     * Get next milestone
     */
    getNextMilestone(currentStreak) {
        const milestones = Object.keys(this.MILESTONES).map(Number).sort((a, b) => a - b);
        const next = milestones.find(m => m > currentStreak);
        
        if (!next) return null;

        return {
            days: next,
            daysToGo: next - currentStreak,
            reward: this.MILESTONES[next]
        };
    }

    /**
     * Get streak status
     */
    getStreakStatus(streak) {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = streak.lastActiveDate;

        if (lastActive === today) {
            return {
                status: 'safe',
                message: '✅ Active today! Streak safe.',
                emoji: '✅'
            };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
            return {
                status: 'at_risk',
                message: '⚠️ Haven\'t learned today yet! Streak at risk.',
                emoji: '⚠️'
            };
        }

        return {
            status: 'broken',
            message: '💔 Streak broken. Start a new one!',
            emoji: '💔'
        };
    }

    /**
     * Get streak leaderboard
     */
    getStreakLeaderboard(limit = 50) {
        const allStreaks = Array.from(this.userStreaks.entries())
            .map(([userId, streak]) => ({
                userId,
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak
            }))
            .filter(s => s.currentStreak > 0)
            .sort((a, b) => b.currentStreak - a.currentStreak);

        return allStreaks.slice(0, limit).map((entry, index) => ({
            rank: index + 1,
            ...entry,
            badge: this.getStreakBadge(entry.currentStreak)
        }));
    }

    /**
     * Get badge for streak length
     */
    getStreakBadge(streakDays) {
        if (streakDays >= 365) return '🏆 Legendary';
        if (streakDays >= 100) return '👑 Champion';
        if (streakDays >= 50) return '💎 Diamond';
        if (streakDays >= 30) return '🌟 Master';
        if (streakDays >= 14) return '💪 Strong';
        if (streakDays >= 7) return '⚡ Committed';
        if (streakDays >= 3) return '🔥 On Fire';
        return '🌱 Starting';
    }

    /**
     * Get pricing info
     */
    getPricing() {
        return {
            freeze: {
                price: this.PRICES.freeze,
                currency: 'gems',
                description: 'Protect your streak for 1 day',
                icon: '🛡️'
            },
            insurance: {
                price: this.PRICES.insurance,
                currency: 'gems',
                description: 'Auto-protect your streak for 7 days',
                icon: '🛡️'
            },
            repair: {
                price: this.PRICES.repair,
                currency: 'gems',
                description: 'Repair broken streak (within 24h)',
                icon: '✨'
            }
        };
    }

    /**
     * Get user's streak history
     */
    getStreakHistory(userId, limit = 30) {
        const streak = this.userStreaks.get(userId);
        if (!streak) return [];

        return streak.streakHistory.slice(-limit).reverse();
    }
}

// Export singleton
const streakInsuranceSystem = new StreakInsuranceSystem();
module.exports = streakInsuranceSystem;


