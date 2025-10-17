/**
 * 🎯 ADAPTIVE LEVEL SYSTEM
 * Duolingo-style dynamic difficulty adjustment
 * 
 * Features:
 * - Real-time level assessment
 * - Performance-based progression
 * - Content difficulty matching (70/20/10 rule)
 * - Mastery tracking
 * - Automatic level upgrades/downgrades
 * - Personalized learning paths
 */

const supabase = require('./supabase-client');

class AdaptiveLevelSystem {
    constructor() {
        // CEFR levels
        this.levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        // Performance thresholds for level changes
        this.thresholds = {
            upgrade: 0.85,    // 85% success rate to upgrade
            downgrade: 0.50,  // Below 50% to downgrade
            maintain: 0.70    // 70%+ to maintain
        };

        // Points needed for level mastery
        this.masteryPoints = {
            'A1': 500,
            'A2': 750,
            'B1': 1000,
            'B2': 1500,
            'C1': 2000,
            'C2': 3000
        };
    }

    /**
     * Assess user's current level based on performance
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Level assessment
     */
    async assessLevel(userId) {
        try {
            // Get user profile
            const profile = await this.getUserProfile(userId);
            
            // Get recent performance data
            const performance = await this.getRecentPerformance(userId);
            
            // Calculate current proficiency
            const assessment = {
                currentLevel: profile.proficiency_level || 'A2',
                successRate: performance.successRate,
                completionRate: performance.completionRate,
                averageScore: performance.averageScore,
                totalPoints: profile.total_points || 0,
                levelPoints: profile.level_points || 0,
                masteryProgress: this.calculateMasteryProgress(profile),
                recommendation: this.getRecommendation(profile, performance),
                shouldUpgrade: false,
                shouldDowngrade: false
            };

            // Check if level change is needed
            if (performance.successRate >= this.thresholds.upgrade &&
                assessment.masteryProgress >= 0.9) {
                assessment.shouldUpgrade = true;
                assessment.recommendation = 'upgrade';
            } else if (performance.successRate < this.thresholds.downgrade) {
                assessment.shouldDowngrade = true;
                assessment.recommendation = 'downgrade';
            }

            return assessment;

        } catch (error) {
            console.error('Error assessing level:', error);
            return this.getDefaultAssessment();
        }
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            return data || this.getDefaultProfile(userId);

        } catch (error) {
            console.error('Error getting user profile:', error);
            return this.getDefaultProfile(userId);
        }
    }

    /**
     * Get recent performance metrics
     */
    async getRecentPerformance(userId, days = 7) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);

            const { data: interactions } = await supabase
                .from('user_interactions')
                .select('interaction_type, duration_seconds, metadata')
                .eq('user_id', userId)
                .gte('created_at', since.toISOString());

            if (!interactions || interactions.length === 0) {
                return this.getDefaultPerformance();
            }

            // Calculate metrics
            const completed = interactions.filter(i => 
                i.interaction_type === 'complete'
            ).length;

            const total = interactions.length;

            const scores = interactions
                .filter(i => i.metadata?.score)
                .map(i => i.metadata.score);

            const avgScore = scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : 0;

            return {
                successRate: completed / Math.max(total, 1),
                completionRate: completed / Math.max(total, 1),
                averageScore: avgScore,
                totalInteractions: total,
                completedInteractions: completed
            };

        } catch (error) {
            console.error('Error getting performance:', error);
            return this.getDefaultPerformance();
        }
    }

    /**
     * Calculate mastery progress for current level
     */
    calculateMasteryProgress(profile) {
        const currentLevel = profile.proficiency_level || 'A2';
        const pointsNeeded = this.masteryPoints[currentLevel] || 1000;
        const levelPoints = profile.level_points || 0;

        return Math.min(levelPoints / pointsNeeded, 1.0);
    }

    /**
     * Get recommendation for user
     */
    getRecommendation(profile, performance) {
        if (performance.successRate >= this.thresholds.upgrade) {
            return 'upgrade';
        } else if (performance.successRate < this.thresholds.downgrade) {
            return 'downgrade';
        } else if (performance.successRate >= this.thresholds.maintain) {
            return 'maintain';
        } else {
            return 'practice';
        }
    }

    /**
     * Upgrade user to next level
     */
    async upgradeLevel(userId) {
        try {
            const profile = await this.getUserProfile(userId);
            const currentIndex = this.levels.indexOf(profile.proficiency_level);

            if (currentIndex < this.levels.length - 1) {
                const newLevel = this.levels[currentIndex + 1];

                const { error } = await supabase
                    .from('user_profiles')
                    .update({
                        proficiency_level: newLevel,
                        level_points: 0, // Reset level points
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

                if (error) throw error;

                console.log(`🎉 User upgraded to ${newLevel}`);

                // Track level change
                await this.trackLevelChange(userId, profile.proficiency_level, newLevel, 'upgrade');

                return { success: true, newLevel };
            }

            return { success: false, message: 'Already at max level' };

        } catch (error) {
            console.error('Error upgrading level:', error);
            throw error;
        }
    }

    /**
     * Downgrade user to previous level
     */
    async downgradeLevel(userId) {
        try {
            const profile = await this.getUserProfile(userId);
            const currentIndex = this.levels.indexOf(profile.proficiency_level);

            if (currentIndex > 0) {
                const newLevel = this.levels[currentIndex - 1];

                const { error } = await supabase
                    .from('user_profiles')
                    .update({
                        proficiency_level: newLevel,
                        level_points: this.masteryPoints[newLevel] * 0.5, // Start at 50%
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

                if (error) throw error;

                console.log(`📉 User downgraded to ${newLevel}`);

                // Track level change
                await this.trackLevelChange(userId, profile.proficiency_level, newLevel, 'downgrade');

                return { success: true, newLevel };
            }

            return { success: false, message: 'Already at min level' };

        } catch (error) {
            console.error('Error downgrading level:', error);
            throw error;
        }
    }

    /**
     * Award points to user
     */
    async awardPoints(userId, points, activityType) {
        try {
            const profile = await this.getUserProfile(userId);

            const newTotalPoints = (profile.total_points || 0) + points;
            const newLevelPoints = (profile.level_points || 0) + points;

            const { error } = await supabase
                .from('user_profiles')
                .update({
                    total_points: newTotalPoints,
                    level_points: newLevelPoints,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;

            console.log(`✨ Awarded ${points} points for ${activityType}`);

            // Check if user should level up
            const masteryProgress = newLevelPoints / 
                (this.masteryPoints[profile.proficiency_level] || 1000);

            if (masteryProgress >= 1.0) {
                const assessment = await this.assessLevel(userId);
                if (assessment.shouldUpgrade) {
                    await this.upgradeLevel(userId);
                }
            }

            return { success: true, newTotalPoints, newLevelPoints };

        } catch (error) {
            console.error('Error awarding points:', error);
            throw error;
        }
    }

    /**
     * Get recommended content difficulty for user
     * Uses 70/20/10 rule: 70% at level, 20% easier, 10% harder
     */
    getRecommendedDifficulty(userLevel) {
        const currentIndex = this.levels.indexOf(userLevel);
        
        const recommendations = {
            primary: userLevel,         // 70%
            easier: currentIndex > 0 ? this.levels[currentIndex - 1] : userLevel,  // 20%
            harder: currentIndex < this.levels.length - 1 ? this.levels[currentIndex + 1] : userLevel  // 10%
        };

        return recommendations;
    }

    /**
     * Track level change for analytics
     */
    async trackLevelChange(userId, oldLevel, newLevel, changeType) {
        try {
            await supabase
                .from('level_changes')
                .insert([{
                    user_id: userId,
                    old_level: oldLevel,
                    new_level: newLevel,
                    change_type: changeType,
                    created_at: new Date().toISOString()
                }]);
        } catch (error) {
            console.error('Error tracking level change:', error);
        }
    }

    /**
     * Get learning analytics for user
     */
    async getAnalytics(userId) {
        try {
            const profile = await this.getUserProfile(userId);
            const performance = await this.getRecentPerformance(userId, 30);
            const assessment = await this.assessLevel(userId);

            return {
                currentLevel: profile.proficiency_level,
                totalPoints: profile.total_points,
                levelPoints: profile.level_points,
                masteryProgress: assessment.masteryProgress,
                successRate: performance.successRate,
                completionRate: performance.completionRate,
                averageScore: performance.averageScore,
                recommendation: assessment.recommendation,
                nextLevel: this.getNextLevel(profile.proficiency_level),
                pointsToNextLevel: this.getPointsToNextLevel(profile)
            };

        } catch (error) {
            console.error('Error getting analytics:', error);
            return null;
        }
    }

    /**
     * Get next level
     */
    getNextLevel(currentLevel) {
        const currentIndex = this.levels.indexOf(currentLevel);
        if (currentIndex < this.levels.length - 1) {
            return this.levels[currentIndex + 1];
        }
        return null;
    }

    /**
     * Get points needed to reach next level
     */
    getPointsToNextLevel(profile) {
        const currentLevel = profile.proficiency_level || 'A2';
        const pointsNeeded = this.masteryPoints[currentLevel] || 1000;
        const levelPoints = profile.level_points || 0;

        return Math.max(0, pointsNeeded - levelPoints);
    }

    /**
     * Default profile
     */
    getDefaultProfile(userId) {
        return {
            user_id: userId,
            proficiency_level: 'A2',
            total_points: 0,
            level_points: 0
        };
    }

    /**
     * Default performance
     */
    getDefaultPerformance() {
        return {
            successRate: 0.7,
            completionRate: 0.7,
            averageScore: 70,
            totalInteractions: 0,
            completedInteractions: 0
        };
    }

    /**
     * Default assessment
     */
    getDefaultAssessment() {
        return {
            currentLevel: 'A2',
            successRate: 0.7,
            completionRate: 0.7,
            averageScore: 70,
            totalPoints: 0,
            levelPoints: 0,
            masteryProgress: 0,
            recommendation: 'maintain',
            shouldUpgrade: false,
            shouldDowngrade: false
        };
    }
}

// Export singleton instance
const adaptiveLevelSystem = new AdaptiveLevelSystem();
module.exports = adaptiveLevelSystem;

