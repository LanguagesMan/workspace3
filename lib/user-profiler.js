// 👤 USER PROFILER - AI-Powered User Analysis & Personalization
// Builds comprehensive user profiles from behavior and preferences

class UserProfiler {
    constructor() {
        this.profiles = new Map();
    }

    /**
     * Build or update user profile
     * @param {string} userId - User ID
     * @param {Object} signals - User signals (clicks, watches, etc.)
     * @returns {Object} User profile
     */
    buildProfile(userId, signals = {}) {
        let profile = this.profiles.get(userId) || this.createDefaultProfile(userId);

        // Update profile with new signals
        if (signals.videoWatched) {
            profile = this.updateVideoHistory(profile, signals.videoWatched);
        }

        if (signals.articleRead) {
            profile = this.updateReadingHistory(profile, signals.articleRead);
        }

        if (signals.wordSaved) {
            profile = this.updateVocabulary(profile, signals.wordSaved);
        }

        if (signals.gameCompleted) {
            profile = this.updateGameHistory(profile, signals.gameCompleted);
        }

        // Infer user characteristics
        profile = this.inferCEFRLevel(profile);
        profile = this.inferInterests(profile);
        profile = this.inferLearningStyle(profile);
        profile = this.calculateOptimalDifficulty(profile);
        profile = this.analyzeEngagementPatterns(profile);

        // Save updated profile
        this.profiles.set(userId, profile);
        this.persistProfile(userId, profile);

        return profile;
    }

    /**
     * Create default user profile
     */
    createDefaultProfile(userId) {
        return {
            userId,
            createdAt: Date.now(),
            lastActive: Date.now(),
            
            // Learning level
            cefrLevel: 'A2', // Estimated level
            levelConfidence: 0.3, // How confident we are (0-1)
            
            // Vocabulary
            knownWords: [], // Words they've saved
            estimatedVocabularySize: 0,
            
            // Content history
            videosWatched: [],
            articlesRead: [],
            gamesPlayed: [],
            
            // Interests (topics they engage with) - 7 main categories
            interests: {
                News: 0,
                Sports: 0,
                Entertainment: 0,
                Technology: 0,
                Food: 0,
                Travel: 0,
                Culture: 0
            },
            
            // Interest shift detection
            interestHistory: [],
            lastInterestUpdate: null,
            
            // Learning style (inferred from behavior)
            learningStyle: {
                visual: 0.33, // Videos, images
                auditory: 0.33, // Audio, listening
                kinesthetic: 0.33 // Games, practice
            },
            
            // Optimal difficulty (adaptive)
            optimalDifficulty: 50, // 0-100 scale
            
            // Engagement patterns
            engagement: {
                bestTimeOfDay: null, // Hour (0-23)
                avgSessionLength: 0, // Minutes
                streakDays: 0,
                totalSessions: 0,
                avgVideosPerSession: 0,
                avgArticlesPerSession: 0
            },
            
            // Performance metrics
            performance: {
                quizAccuracy: 0,
                gameScores: [],
                completionRate: 0
            }
        };
    }

    /**
     * Update video watch history
     */
    updateVideoHistory(profile, video) {
        profile.videosWatched.push({
            videoId: video.id,
            timestamp: Date.now(),
            completionRate: video.completionRate || 1.0,
            difficulty: video.difficulty || 50,
            topics: video.topics || []
        });

        // Keep last 100 videos only
        if (profile.videosWatched.length > 100) {
            profile.videosWatched = profile.videosWatched.slice(-100);
        }

        return profile;
    }

    /**
     * Update reading history
     */
    updateReadingHistory(profile, article) {
        profile.articlesRead.push({
            articleId: article.id,
            timestamp: Date.now(),
            timeSpent: article.timeSpent || 0,
            completionRate: article.completionRate || 1.0,
            difficulty: article.difficulty || 50,
            topics: article.topics || []
        });

        if (profile.articlesRead.length > 100) {
            profile.articlesRead = profile.articlesRead.slice(-100);
        }

        return profile;
    }

    /**
     * Update vocabulary
     */
    updateVocabulary(profile, word) {
        if (!profile.knownWords.includes(word)) {
            profile.knownWords.push(word);
        }
        profile.estimatedVocabularySize = profile.knownWords.length;
        return profile;
    }

    /**
     * Update game history
     */
    updateGameHistory(profile, game) {
        profile.gamesPlayed.push({
            gameType: game.type,
            score: game.score,
            timestamp: Date.now()
        });

        if (profile.gamesPlayed.length > 100) {
            profile.gamesPlayed = profile.gamesPlayed.slice(-100);
        }

        return profile;
    }

    /**
     * Infer CEFR level from behavior
     */
    inferCEFRLevel(profile) {
        const vocab = profile.knownWords.length;
        const avgDifficulty = this.calculateAverageDifficulty(profile);
        
        // Simple heuristic (can be enhanced with ML)
        let level = 'A1';
        let confidence = 0.5;

        if (vocab < 100) {
            level = 'A1';
        } else if (vocab < 300) {
            level = 'A2';
        } else if (vocab < 800) {
            level = 'B1';
        } else if (vocab < 2000) {
            level = 'B2';
        } else if (vocab < 5000) {
            level = 'C1';
        } else {
            level = 'C2';
        }

        // Adjust based on content difficulty they consume
        if (avgDifficulty) {
            if (avgDifficulty < 30) level = this.adjustLevel(level, -1);
            if (avgDifficulty > 70) level = this.adjustLevel(level, +1);
            confidence = Math.min(0.9, confidence + (profile.videosWatched.length / 100) * 0.4);
        }

        profile.cefrLevel = level;
        profile.levelConfidence = confidence;

        return profile;
    }

    /**
     * Infer user interests from content consumed (Enhanced with time weighting)
     */
    inferInterests(profile) {
        const categories = ['News', 'Sports', 'Entertainment', 'Technology', 'Food', 'Travel', 'Culture'];
        const categoryScores = {};
        const now = Date.now();
        
        // Initialize scores
        categories.forEach(cat => categoryScores[cat] = 0);
        
        // Weight recent content more heavily (exponential decay)
        const getTimeWeight = (timestamp) => {
            const daysSince = (now - timestamp) / (1000 * 60 * 60 * 24);
            return Math.exp(-daysSince / 7); // Half-life of 1 week
        };
        
        // Count topics from videos (with time decay)
        profile.videosWatched.forEach(video => {
            const timeWeight = getTimeWeight(video.timestamp);
            const timeSpent = (video.completionRate || 0) * 100; // Assume 100s average video
            
            (video.topics || []).forEach(topic => {
                const category = this.mapTopicToCategory(topic);
                if (categories.includes(category)) {
                    categoryScores[category] += timeWeight * timeSpent;
                }
            });
        });

        // Count topics from articles (weighted by time spent)
        profile.articlesRead.forEach(article => {
            const timeWeight = getTimeWeight(article.timestamp);
            const timeSpent = article.timeSpent || 60; // Default 60 seconds
            
            (article.topics || []).forEach(topic => {
                const category = this.mapTopicToCategory(topic);
                if (categories.includes(category)) {
                    categoryScores[category] += timeWeight * timeSpent * 1.5; // Articles weighted higher
                }
            });
        });

        // Normalize to 0-10 scale (weights for recommendation)
        const maxScore = Math.max(...Object.values(categoryScores), 1);
        categories.forEach(category => {
            profile.interests[category] = (categoryScores[category] / maxScore) * 10;
        });

        // Check if weekly update is needed
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        if (!profile.lastInterestUpdate || (now - profile.lastInterestUpdate) > weekInMs) {
            profile = this.detectInterestShifts(profile);
            profile.lastInterestUpdate = now;
        }

        return profile;
    }
    
    /**
     * Map topic to main category
     */
    mapTopicToCategory(topic) {
        const topicLower = topic.toLowerCase();
        
        // News keywords
        if (['news', 'politics', 'current', 'events', 'breaking'].some(k => topicLower.includes(k))) {
            return 'News';
        }
        
        // Sports keywords
        if (['sport', 'football', 'soccer', 'basketball', 'tennis', 'athlete', 'game', 'team'].some(k => topicLower.includes(k))) {
            return 'Sports';
        }
        
        // Entertainment keywords
        if (['music', 'movie', 'celebrity', 'entertainment', 'film', 'show', 'series', 'actor'].some(k => topicLower.includes(k))) {
            return 'Entertainment';
        }
        
        // Technology keywords
        if (['tech', 'computer', 'software', 'ai', 'digital', 'internet', 'app', 'smartphone'].some(k => topicLower.includes(k))) {
            return 'Technology';
        }
        
        // Food keywords
        if (['food', 'cooking', 'recipe', 'restaurant', 'cuisine', 'chef', 'meal', 'dish'].some(k => topicLower.includes(k))) {
            return 'Food';
        }
        
        // Travel keywords
        if (['travel', 'destination', 'vacation', 'tourism', 'trip', 'adventure', 'explore'].some(k => topicLower.includes(k))) {
            return 'Travel';
        }
        
        // Culture keywords
        if (['culture', 'tradition', 'history', 'art', 'museum', 'heritage', 'festival'].some(k => topicLower.includes(k))) {
            return 'Culture';
        }
        
        // Default to Culture if no match
        return 'Culture';
    }
    
    /**
     * Detect significant interest shifts
     */
    detectInterestShifts(profile) {
        // Save current interests to history
        profile.interestHistory.push({
            timestamp: Date.now(),
            interests: { ...profile.interests }
        });
        
        // Keep only last 4 weeks of history
        if (profile.interestHistory.length > 4) {
            profile.interestHistory = profile.interestHistory.slice(-4);
        }
        
        // Detect shifts if we have enough history
        if (profile.interestHistory.length >= 2) {
            const current = profile.interests;
            const previous = profile.interestHistory[profile.interestHistory.length - 2].interests;
            
            Object.keys(current).forEach(category => {
                const change = current[category] - previous[category];
                if (Math.abs(change) > 3) {
                    console.log(`Interest shift detected: ${category} changed by ${change.toFixed(1)}`);
                }
            });
        }
        
        return profile;
    }

    /**
     * Infer learning style from behavior
     */
    inferLearningStyle(profile) {
        const totalVideos = profile.videosWatched.length;
        const totalArticles = profile.articlesRead.length;
        const totalGames = profile.gamesPlayed.length;
        const total = totalVideos + totalArticles + totalGames || 1;

        profile.learningStyle = {
            visual: totalVideos / total,
            auditory: totalArticles / total, // Articles with audio
            kinesthetic: totalGames / total
        };

        return profile;
    }

    /**
     * Calculate optimal difficulty for this user
     */
    calculateOptimalDifficulty(profile) {
        const avgDifficulty = this.calculateAverageDifficulty(profile);
        const avgCompletion = this.calculateAverageCompletion(profile);

        // If they're completing content easily, increase difficulty
        // If they're struggling, decrease difficulty
        if (avgCompletion > 0.9) {
            profile.optimalDifficulty = Math.min(100, avgDifficulty + 10);
        } else if (avgCompletion < 0.6) {
            profile.optimalDifficulty = Math.max(0, avgDifficulty - 10);
        } else {
            profile.optimalDifficulty = avgDifficulty;
        }

        return profile;
    }

    /**
     * Analyze engagement patterns
     */
    analyzeEngagementPatterns(profile) {
        // Find best time of day
        const hourCounts = new Array(24).fill(0);
        [...profile.videosWatched, ...profile.articlesRead].forEach(item => {
            const hour = new Date(item.timestamp).getHours();
            hourCounts[hour]++;
        });
        profile.engagement.bestTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts));

        // Calculate avg session length (simplified)
        profile.engagement.totalSessions = Math.ceil(
            (profile.videosWatched.length + profile.articlesRead.length) / 10
        );

        // Avg content per session
        if (profile.engagement.totalSessions > 0) {
            profile.engagement.avgVideosPerSession = 
                profile.videosWatched.length / profile.engagement.totalSessions;
            profile.engagement.avgArticlesPerSession = 
                profile.articlesRead.length / profile.engagement.totalSessions;
        }

        return profile;
    }

    /**
     * Helper: Calculate average difficulty of consumed content
     */
    calculateAverageDifficulty(profile) {
        const allContent = [...profile.videosWatched, ...profile.articlesRead];
        if (allContent.length === 0) return 50; // Default

        const total = allContent.reduce((sum, item) => sum + (item.difficulty || 50), 0);
        return total / allContent.length;
    }

    /**
     * Helper: Calculate average completion rate
     */
    calculateAverageCompletion(profile) {
        const allContent = [...profile.videosWatched, ...profile.articlesRead];
        if (allContent.length === 0) return 1.0; // Default

        const total = allContent.reduce((sum, item) => sum + (item.completionRate || 1.0), 0);
        return total / allContent.length;
    }

    /**
     * Helper: Adjust CEFR level up or down
     */
    adjustLevel(level, direction) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        const newIndex = Math.max(0, Math.min(levels.length - 1, index + direction));
        return levels[newIndex];
    }

    /**
     * Persist profile to localStorage (client) or database (server)
     */
    persistProfile(userId, profile) {
        // In browser: localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profile));
        }
        
        // In server: could save to database
        // For now, just keep in memory
    }

    /**
     * Load profile from storage
     */
    loadProfile(userId) {
        // Try memory first
        if (this.profiles.has(userId)) {
            return this.profiles.get(userId);
        }

        // Try localStorage
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(`userProfile_${userId}`);
            if (stored) {
                const profile = JSON.parse(stored);
                this.profiles.set(userId, profile);
                return profile;
            }
        }

        // Create new profile
        return this.createDefaultProfile(userId);
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfiler;
}
