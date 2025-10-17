/**
 * 🎭 GUEST USER MANAGER
 * 
 * Manages guest users who browse without signing up.
 * Tracks their level, vocabulary, and progress in localStorage.
 * Seamlessly converts guest data to real account when they sign up.
 * 
 * Features:
 * - Guest user ID generation
 * - Progress tracking in localStorage
 * - Level detection from behavior
 * - Seamless migration to real account
 * - Privacy-first (no backend tracking until signup)
 */

class GuestUserManager {
    constructor() {
        this.STORAGE_KEYS = {
            GUEST_ID: 'langflix_guest_id',
            LEVEL: 'langflix_user_level',
            SAVED_WORDS: 'langflix_saved_words',
            WATCHED_VIDEOS: 'langflix_watched_videos',
            INTERACTIONS: 'langflix_interactions',
            ONBOARDING_COMPLETE: 'langflix_onboarding_complete',
            IS_GUEST: 'langflix_is_guest',
            USER_TOKEN: 'langflix_user_token',
            PREFERENCES: 'langflix_preferences'
        };
    }

    /**
     * Get or create guest user ID
     */
    getGuestId() {
        let guestId = localStorage.getItem(this.STORAGE_KEYS.GUEST_ID);
        
        if (!guestId) {
            guestId = this.generateGuestId();
            localStorage.setItem(this.STORAGE_KEYS.GUEST_ID, guestId);
            localStorage.setItem(this.STORAGE_KEYS.IS_GUEST, 'true');
        }
        
        return guestId;
    }

    /**
     * Generate unique guest ID
     */
    generateGuestId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `guest_${timestamp}_${random}`;
    }

    /**
     * Check if user is guest
     */
    isGuest() {
        return localStorage.getItem(this.STORAGE_KEYS.IS_GUEST) === 'true';
    }

    /**
     * Get user level (guest or authenticated)
     */
    getUserLevel() {
        return localStorage.getItem(this.STORAGE_KEYS.LEVEL) || 'B1';
    }

    /**
     * Set user level
     */
    setUserLevel(level) {
        localStorage.setItem(this.STORAGE_KEYS.LEVEL, level);
        
        // Track level change
        this.trackInteraction('level_set', { level });
    }

    /**
     * Save word to guest vocabulary
     */
    saveWord(word, translation, level, context = null) {
        const savedWords = this.getSavedWords();
        
        const wordData = {
            word: word.toLowerCase().trim(),
            translation,
            level,
            context,
            savedAt: new Date().toISOString(),
            reviewCount: 0,
            masteryLevel: 0,
            nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
        };
        
        // Check if word already exists
        const existingIndex = savedWords.findIndex(w => w.word === wordData.word);
        
        if (existingIndex >= 0) {
            // Update existing word
            savedWords[existingIndex] = { ...savedWords[existingIndex], ...wordData };
        } else {
            // Add new word
            savedWords.push(wordData);
        }
        
        localStorage.setItem(this.STORAGE_KEYS.SAVED_WORDS, JSON.stringify(savedWords));
        
        // Track interaction
        this.trackInteraction('word_saved', { word, level });
        
        return wordData;
    }

    /**
     * Get all saved words
     */
    getSavedWords() {
        const saved = localStorage.getItem(this.STORAGE_KEYS.SAVED_WORDS);
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Get words due for review
     */
    getWordsDueForReview() {
        const savedWords = this.getSavedWords();
        const now = new Date();
        
        return savedWords.filter(word => {
            const nextReview = new Date(word.nextReview);
            return nextReview <= now;
        });
    }

    /**
     * Update word review (spaced repetition)
     */
    updateWordReview(word, correct) {
        const savedWords = this.getSavedWords();
        const wordIndex = savedWords.findIndex(w => w.word === word);
        
        if (wordIndex < 0) return null;
        
        const wordData = savedWords[wordIndex];
        wordData.reviewCount++;
        
        // SM-2 Spaced Repetition Algorithm
        if (correct) {
            wordData.masteryLevel = Math.min(5, wordData.masteryLevel + 1);
            const intervals = [1, 3, 7, 14, 30, 60]; // days
            const daysToAdd = intervals[wordData.masteryLevel];
            wordData.nextReview = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
        } else {
            wordData.masteryLevel = Math.max(0, wordData.masteryLevel - 1);
            wordData.nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
        }
        
        savedWords[wordIndex] = wordData;
        localStorage.setItem(this.STORAGE_KEYS.SAVED_WORDS, JSON.stringify(savedWords));
        
        return wordData;
    }

    /**
     * Track video watched
     */
    trackVideoWatched(videoId, level, percentWatched) {
        const watched = this.getWatchedVideos();
        
        watched.push({
            videoId,
            level,
            percentWatched,
            watchedAt: new Date().toISOString()
        });
        
        // Keep last 100 videos
        const trimmed = watched.slice(-100);
        localStorage.setItem(this.STORAGE_KEYS.WATCHED_VIDEOS, JSON.stringify(trimmed));
        
        // Update user level based on watch patterns
        this.detectLevelFromBehavior();
        
        return trimmed;
    }

    /**
     * Get watched videos
     */
    getWatchedVideos() {
        const watched = localStorage.getItem(this.STORAGE_KEYS.WATCHED_VIDEOS);
        return watched ? JSON.parse(watched) : [];
    }

    /**
     * Detect user level from behavior
     */
    detectLevelFromBehavior() {
        const watched = this.getWatchedVideos();
        const savedWords = this.getSavedWords();
        
        if (watched.length < 5) return; // Not enough data
        
        // Analyze recent videos (last 10)
        const recent = watched.slice(-10);
        const highCompletionVideos = recent.filter(v => v.percentWatched > 70);
        
        if (highCompletionVideos.length === 0) return;
        
        // Find most common level in completed videos
        const levelCounts = {};
        highCompletionVideos.forEach(v => {
            levelCounts[v.level] = (levelCounts[v.level] || 0) + 1;
        });
        
        const mostCommonLevel = Object.entries(levelCounts)
            .sort((a, b) => b[1] - a[1])[0][0];
        
        // Update level if different from current
        const currentLevel = this.getUserLevel();
        if (mostCommonLevel !== currentLevel) {
            console.log(`📊 Level updated from behavior: ${currentLevel} → ${mostCommonLevel}`);
            this.setUserLevel(mostCommonLevel);
        }
    }

    /**
     * Track user interaction
     */
    trackInteraction(type, data = {}) {
        const interactions = this.getInteractions();
        
        interactions.push({
            type,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Keep last 200 interactions
        const trimmed = interactions.slice(-200);
        localStorage.setItem(this.STORAGE_KEYS.INTERACTIONS, JSON.stringify(trimmed));
        
        return trimmed;
    }

    /**
     * Get all interactions
     */
    getInteractions() {
        const interactions = localStorage.getItem(this.STORAGE_KEYS.INTERACTIONS);
        return interactions ? JSON.parse(interactions) : [];
    }

    /**
     * Get user preferences
     */
    getPreferences() {
        const prefs = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
        return prefs ? JSON.parse(prefs) : {
            topics: [],
            learningGoals: [],
            dailyGoal: 10, // minutes
            notificationsEnabled: false
        };
    }

    /**
     * Set user preferences
     */
    setPreferences(preferences) {
        localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    }

    /**
     * Get user stats
     */
    getUserStats() {
        const savedWords = this.getSavedWords();
        const watched = this.getWatchedVideos();
        const interactions = this.getInteractions();
        
        // Calculate streaks
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        const hasActivityToday = interactions.some(i => 
            new Date(i.timestamp).toDateString() === today
        );
        const hasActivityYesterday = interactions.some(i => 
            new Date(i.timestamp).toDateString() === yesterday
        );
        
        return {
            level: this.getUserLevel(),
            savedWords: savedWords.length,
            videosWatched: watched.length,
            wordsToReview: this.getWordsDueForReview().length,
            streak: hasActivityToday ? (hasActivityYesterday ? 2 : 1) : 0,
            lastActive: interactions.length > 0 ? interactions[interactions.length - 1].timestamp : null
        };
    }

    /**
     * Migrate guest data to real account
     */
    async migrateToAccount(userId, authToken) {
        const guestData = {
            guestId: this.getGuestId(),
            level: this.getUserLevel(),
            savedWords: this.getSavedWords(),
            watchedVideos: this.getWatchedVideos(),
            interactions: this.getInteractions(),
            preferences: this.getPreferences()
        };
        
        try {
            // Send migration request to backend
            const response = await fetch('/api/auth/migrate-guest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    userId,
                    guestData
                })
            });
            
            if (response.ok) {
                // Migration successful - update local storage
                localStorage.setItem(this.STORAGE_KEYS.IS_GUEST, 'false');
                localStorage.setItem(this.STORAGE_KEYS.USER_TOKEN, authToken);
                
                console.log('✅ Guest data migrated to account successfully');
                return { success: true };
            } else {
                console.error('❌ Guest migration failed');
                return { success: false, error: 'Migration failed' };
            }
        } catch (error) {
            console.error('❌ Guest migration error:', error);
            
            // Keep guest data locally even if migration fails
            return { success: false, error: error.message };
        }
    }

    /**
     * Clear all guest data (logout)
     */
    clearGuestData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('🧹 Guest data cleared');
    }

    /**
     * Export guest data (for debugging or manual migration)
     */
    exportGuestData() {
        return {
            guestId: this.getGuestId(),
            level: this.getUserLevel(),
            savedWords: this.getSavedWords(),
            watchedVideos: this.getWatchedVideos(),
            interactions: this.getInteractions(),
            preferences: this.getPreferences(),
            stats: this.getUserStats()
        };
    }
}

// Singleton instance
const guestUserManager = new GuestUserManager();

module.exports = guestUserManager;

