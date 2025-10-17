/**
 * 🎯 ENHANCED LEVEL TRACKING SYSTEM
 * 
 * Continuously tracks user's actual Spanish proficiency based on ALL interactions:
 * - Video watch percentage (did they understand?)
 * - Word clicks (which words are unknown?)
 * - Quiz performance (which topics are weak?)
 * - Game scores (how fast/accurate?)
 * - Conversation performance (AI chat scores)
 * 
 * Auto-adjusts user level every 50 interactions with 85%+ confidence
 * Provides skill breakdown: vocabulary, listening, reading, grammar
 */

class EnhancedLevelTracker {
    constructor() {
        // CEFR levels with decimal precision
        this.LEVELS = [];
        const baseLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        baseLevels.forEach(base => {
            for (let i = 0; i <= 9; i++) {
                this.LEVELS.push(`${base}.${i}`);
            }
        });
        
        // Interaction types and their weights
        this.INTERACTION_WEIGHTS = {
            VIDEO_WATCHED: 1.0,
            VIDEO_COMPLETED: 2.0,
            VIDEO_SKIPPED: -0.5,
            WORD_CLICKED: 1.0,
            QUIZ_CORRECT: 3.0,
            QUIZ_WRONG: -1.0,
            GAME_WIN: 2.0,
            GAME_LOSS: 0.5,
            CONVERSATION_SUCCESS: 4.0,
            ARTICLE_READ: 1.5
        };
        
        // Skill categories
        this.SKILLS = {
            VOCABULARY: 'vocabulary',
            LISTENING: 'listening',
            READING: 'reading',
            GRAMMAR: 'grammar',
            SPEAKING: 'speaking'
        };
        
        // Confidence thresholds
        this.MIN_CONFIDENCE = 85; // Need 85% confidence to change level
        this.MIN_INTERACTIONS = 50; // Need at least 50 interactions
    }
    
    /**
     * Track a new user interaction
     */
    async trackInteraction(userId, interaction) {
        const {
            type,                    // 'video_watched', 'quiz_answered', etc.
            contentId,               // ID of video/quiz/game
            contentLevel,            // CEFR level of content (A1-C2)
            success,                 // boolean: did user succeed?
            timeSpent,               // seconds
            metadata                 // additional data specific to interaction type
        } = interaction;
        
        // Calculate interaction score
        const score = this.calculateInteractionScore(interaction);
        
        // Determine which skill(s) this interaction relates to
        const skills = this.mapInteractionToSkills(type, metadata);
        
        // Store interaction in database
        const stored = await this.storeInteraction({
            userId,
            type,
            contentId,
            contentLevel,
            success,
            timeSpent,
            score,
            skills,
            metadata,
            timestamp: new Date()
        });
        
        // Check if we should reassess user level
        const shouldReassess = await this.shouldReassessLevel(userId);
        
        if (shouldReassess) {
            return await this.reassessUserLevel(userId);
        }
        
        return {
            tracked: true,
            score,
            skills,
            levelReassessed: false
        };
    }
    
    /**
     * Calculate score for this interaction
     */
    calculateInteractionScore(interaction) {
        const { type, success, contentLevel, timeSpent, metadata } = interaction;
        
        let baseScore = 0;
        
        switch (type) {
            case 'video_watched':
                // Score based on watch completion %
                const watchPercent = metadata?.watchPercent || 0;
                if (watchPercent >= 90) {
                    baseScore = this.INTERACTION_WEIGHTS.VIDEO_COMPLETED;
                } else if (watchPercent >= 50) {
                    baseScore = this.INTERACTION_WEIGHTS.VIDEO_WATCHED;
                } else {
                    baseScore = this.INTERACTION_WEIGHTS.VIDEO_SKIPPED;
                }
                break;
                
            case 'word_clicked':
                // Clicking word = didn't know it
                baseScore = this.INTERACTION_WEIGHTS.WORD_CLICKED;
                break;
                
            case 'quiz_answered':
                baseScore = success 
                    ? this.INTERACTION_WEIGHTS.QUIZ_CORRECT 
                    : this.INTERACTION_WEIGHTS.QUIZ_WRONG;
                
                // Bonus for fast correct answers
                if (success && timeSpent < 5) {
                    baseScore *= 1.2;
                }
                break;
                
            case 'game_completed':
                const gameScore = metadata?.score || 0;
                baseScore = success 
                    ? this.INTERACTION_WEIGHTS.GAME_WIN 
                    : this.INTERACTION_WEIGHTS.GAME_LOSS;
                
                // Bonus for high game scores
                if (gameScore >= 90) {
                    baseScore *= 1.5;
                }
                break;
                
            case 'conversation_turn':
                // AI conversation practice
                const comprehensibility = metadata?.comprehensibility || 0;
                baseScore = comprehensibility > 0.9 
                    ? this.INTERACTION_WEIGHTS.CONVERSATION_SUCCESS 
                    : this.INTERACTION_WEIGHTS.CONVERSATION_SUCCESS * 0.5;
                break;
                
            case 'article_read':
                const readPercent = metadata?.readPercent || 0;
                baseScore = readPercent >= 80 
                    ? this.INTERACTION_WEIGHTS.ARTICLE_READ 
                    : this.INTERACTION_WEIGHTS.ARTICLE_READ * 0.5;
                break;
                
            default:
                baseScore = 1.0;
        }
        
        // Adjust score based on content difficulty vs user level
        // If content was harder and they succeeded = more points
        // If content was easier and they failed = more penalty
        const levelDifficultyMultiplier = this.calculateDifficultyMultiplier(
            contentLevel, 
            metadata?.userLevel || 'A2'
        );
        
        return baseScore * levelDifficultyMultiplier;
    }
    
    /**
     * Calculate multiplier based on content difficulty vs user level
     */
    calculateDifficultyMultiplier(contentLevel, userLevel) {
        if (!contentLevel || !userLevel) return 1.0;
        
        const contentIndex = this.LEVELS.indexOf(contentLevel);
        const userIndex = this.LEVELS.indexOf(userLevel);
        
        if (contentIndex === -1 || userIndex === -1) return 1.0;
        
        const diff = contentIndex - userIndex;
        
        // Content is much harder (+2 levels)
        if (diff >= 20) return 1.5;
        // Content is slightly harder (optimal challenge)
        if (diff >= 5) return 1.2;
        // Content is at user level
        if (Math.abs(diff) < 5) return 1.0;
        // Content is easier
        if (diff <= -5) return 0.8;
        // Content is much easier
        if (diff <= -20) return 0.5;
        
        return 1.0;
    }
    
    /**
     * Map interaction type to relevant skills
     */
    mapInteractionToSkills(type, metadata) {
        const skills = [];
        
        switch (type) {
            case 'video_watched':
                skills.push(this.SKILLS.LISTENING);
                if (metadata?.hadSubtitles) {
                    skills.push(this.SKILLS.READING);
                }
                break;
                
            case 'word_clicked':
                skills.push(this.SKILLS.VOCABULARY);
                break;
                
            case 'quiz_answered':
                const quizType = metadata?.quizType;
                if (quizType === 'vocabulary') {
                    skills.push(this.SKILLS.VOCABULARY);
                } else if (quizType === 'grammar') {
                    skills.push(this.SKILLS.GRAMMAR);
                } else if (quizType === 'listening') {
                    skills.push(this.SKILLS.LISTENING);
                } else if (quizType === 'reading') {
                    skills.push(this.SKILLS.READING);
                } else {
                    skills.push(this.SKILLS.VOCABULARY); // default
                }
                break;
                
            case 'game_completed':
                skills.push(this.SKILLS.VOCABULARY);
                break;
                
            case 'conversation_turn':
                skills.push(this.SKILLS.SPEAKING, this.SKILLS.LISTENING);
                break;
                
            case 'article_read':
                skills.push(this.SKILLS.READING, this.SKILLS.VOCABULARY);
                break;
                
            default:
                skills.push(this.SKILLS.VOCABULARY);
        }
        
        return skills;
    }
    
    /**
     * Store interaction in database (mock for now)
     */
    async storeInteraction(interaction) {
        // In production, this would be a database insert
        // For now, we'll just return success
        console.log(`📊 Tracked interaction:`, {
            user: interaction.userId,
            type: interaction.type,
            level: interaction.contentLevel,
            score: interaction.score,
            skills: interaction.skills
        });
        
        return true;
    }
    
    /**
     * Check if we should reassess user's level
     */
    async shouldReassessLevel(userId) {
        // Get user's interaction count since last level assessment
        const interactionCount = await this.getInteractionCountSinceLastAssessment(userId);
        
        return interactionCount >= this.MIN_INTERACTIONS;
    }
    
    /**
     * Reassess user's level based on recent interactions
     */
    async reassessUserLevel(userId) {
        console.log(`🔄 Reassessing level for user ${userId}...`);
        
        // Get recent interactions (last 100)
        const recentInteractions = await this.getRecentInteractions(userId, 100);
        
        if (recentInteractions.length < this.MIN_INTERACTIONS) {
            return { reassessed: false, reason: 'Not enough data' };
        }
        
        // Calculate performance by level
        const levelPerformance = this.calculateLevelPerformance(recentInteractions);
        
        // Determine optimal level
        const { recommendedLevel, confidence } = this.determineOptimalLevel(levelPerformance);
        
        if (confidence < this.MIN_CONFIDENCE) {
            return { 
                reassessed: false, 
                reason: 'Not enough confidence', 
                confidence 
            };
        }
        
        // Get current level
        const currentLevel = await this.getCurrentLevel(userId);
        
        if (recommendedLevel === currentLevel) {
            return { 
                reassessed: false, 
                reason: 'Level unchanged', 
                currentLevel,
                confidence 
            };
        }
        
        // Calculate skill breakdown
        const skillBreakdown = this.calculateSkillBreakdown(recentInteractions);
        
        // Update user level in database
        await this.updateUserLevel(userId, recommendedLevel, {
            oldLevel: currentLevel,
            confidence,
            skillBreakdown,
            reason: 'Automatic reassessment based on performance'
        });
        
        return {
            reassessed: true,
            oldLevel: currentLevel,
            newLevel: recommendedLevel,
            confidence,
            skillBreakdown,
            message: this.getLevelChangeMessage(currentLevel, recommendedLevel)
        };
    }
    
    /**
     * Calculate performance at each level
     */
    calculateLevelPerformance(interactions) {
        const performance = {};
        
        // Initialize all levels
        this.LEVELS.forEach(level => {
            performance[level] = {
                totalScore: 0,
                count: 0,
                successRate: 0
            };
        });
        
        // Aggregate scores by content level
        interactions.forEach(interaction => {
            const level = interaction.contentLevel;
            if (level && performance[level]) {
                performance[level].totalScore += interaction.score;
                performance[level].count += 1;
                if (interaction.success) {
                    performance[level].successRate += 1;
                }
            }
        });
        
        // Calculate average scores and success rates
        Object.keys(performance).forEach(level => {
            if (performance[level].count > 0) {
                performance[level].avgScore = performance[level].totalScore / performance[level].count;
                performance[level].successRate = performance[level].successRate / performance[level].count;
            } else {
                performance[level].avgScore = 0;
                performance[level].successRate = 0;
            }
        });
        
        return performance;
    }
    
    /**
     * Determine optimal level based on performance
     * Goal: Find level where user has 90-95% success rate (i+1 sweet spot)
     */
    determineOptimalLevel(levelPerformance) {
        let bestLevel = 'A2.0';
        let bestScore = 0;
        let confidence = 0;
        
        Object.entries(levelPerformance).forEach(([level, perf]) => {
            if (perf.count < 5) return; // Need enough data points
            
            // Optimal success rate: 90-95%
            const successRate = perf.successRate;
            let score = 0;
            
            if (successRate >= 0.90 && successRate <= 0.95) {
                // Perfect zone!
                score = 100;
            } else if (successRate >= 0.85 && successRate < 0.90) {
                // Slightly too easy
                score = 80;
            } else if (successRate > 0.95) {
                // Too easy
                score = 60;
            } else if (successRate >= 0.70 && successRate < 0.85) {
                // Challenging but manageable
                score = 70;
            } else {
                // Too hard
                score = 40;
            }
            
            // Weight by number of interactions
            score = score * Math.min(perf.count / 20, 1);
            
            if (score > bestScore) {
                bestScore = score;
                bestLevel = level;
                confidence = Math.min(score, 100);
            }
        });
        
        return { recommendedLevel: bestLevel, confidence };
    }
    
    /**
     * Calculate skill breakdown percentages
     */
    calculateSkillBreakdown(interactions) {
        const skillScores = {};
        
        Object.values(this.SKILLS).forEach(skill => {
            skillScores[skill] = {
                total: 0,
                correct: 0,
                count: 0
            };
        });
        
        interactions.forEach(interaction => {
            interaction.skills?.forEach(skill => {
                if (skillScores[skill]) {
                    skillScores[skill].count += 1;
                    skillScores[skill].total += interaction.score;
                    if (interaction.success) {
                        skillScores[skill].correct += 1;
                    }
                }
            });
        });
        
        const breakdown = {};
        Object.entries(skillScores).forEach(([skill, scores]) => {
            if (scores.count > 0) {
                breakdown[skill] = Math.round((scores.correct / scores.count) * 100);
            } else {
                breakdown[skill] = 0;
            }
        });
        
        return breakdown;
    }
    
    /**
     * Get level change message
     */
    getLevelChangeMessage(oldLevel, newLevel) {
        const oldIndex = this.LEVELS.indexOf(oldLevel);
        const newIndex = this.LEVELS.indexOf(newLevel);
        
        if (newIndex > oldIndex) {
            return `🎉 Congratulations! You've improved to ${newLevel}! Keep up the great work!`;
        } else {
            return `📊 Your level has been adjusted to ${newLevel} to ensure optimal learning.`;
        }
    }
    
    // ===== Mock Database Functions (Replace with real DB in production) =====
    
    async getInteractionCountSinceLastAssessment(userId) {
        // Mock: return random number for demo
        return Math.floor(Math.random() * 60) + 40; // 40-100
    }
    
    async getRecentInteractions(userId, limit) {
        // Mock: return fake interactions for demo
        const types = ['video_watched', 'quiz_answered', 'word_clicked', 'game_completed'];
        const levels = ['A2.0', 'A2.5', 'B1.0', 'B1.5'];
        
        const interactions = [];
        for (let i = 0; i < limit; i++) {
            interactions.push({
                userId,
                type: types[Math.floor(Math.random() * types.length)],
                contentLevel: levels[Math.floor(Math.random() * levels.length)],
                success: Math.random() > 0.2, // 80% success rate
                score: Math.random() * 3,
                skills: [this.SKILLS.VOCABULARY],
                timestamp: new Date(Date.now() - i * 3600000)
            });
        }
        
        return interactions;
    }
    
    async getCurrentLevel(userId) {
        // Mock: return default level
        return 'A2.5';
    }
    
    async updateUserLevel(userId, newLevel, metadata) {
        // Mock: log the update
        console.log(`✅ Updated user ${userId} level to ${newLevel}`, metadata);
        return true;
    }
    
    /**
     * Get user's current proficiency profile
     */
    async getUserProfile(userId) {
        const recentInteractions = await this.getRecentInteractions(userId, 100);
        const currentLevel = await this.getCurrentLevel(userId);
        const skillBreakdown = this.calculateSkillBreakdown(recentInteractions);
        
        // Calculate learning velocity (words per week)
        const wordClickInteractions = recentInteractions.filter(i => i.type === 'word_clicked');
        const daysOfData = 7; // Last week
        const wordsPerWeek = (wordClickInteractions.length / daysOfData) * 7;
        
        return {
            userId,
            currentLevel,
            levelIndex: this.LEVELS.indexOf(currentLevel),
            skillBreakdown,
            totalInteractions: recentInteractions.length,
            learningVelocity: {
                wordsPerWeek: Math.round(wordsPerWeek),
                averageSessionTime: 15, // minutes
                weeklyEngagement: 5 // days per week
            },
            strengths: this.identifyStrengths(skillBreakdown),
            weaknesses: this.identifyWeaknesses(skillBreakdown)
        };
    }
    
    identifyStrengths(skillBreakdown) {
        return Object.entries(skillBreakdown)
            .filter(([skill, score]) => score >= 80)
            .map(([skill, score]) => skill);
    }
    
    identifyWeaknesses(skillBreakdown) {
        return Object.entries(skillBreakdown)
            .filter(([skill, score]) => score < 60 && score > 0)
            .map(([skill, score]) => ({ skill, score }));
    }
}

module.exports = EnhancedLevelTracker;

