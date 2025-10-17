/**
 * Global User State Manager
 * Manages user state across all pages
 * Integrates: Assessment, Vocabulary, Recommendations, Navigation
 */

class UserStateManager {
    constructor() {
        this.API_BASE = window.location.origin + '/api';
        this.userId = null;
        this.profile = null;
        this.listeners = [];
    }
    
    /**
     * Initialize user - call on every page load
     */
    async init() {
        // Get or create user ID
        this.userId = localStorage.getItem('userId');
        
        if (!this.userId) {
            this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', this.userId);
        }
        
        // Initialize user in database
        try {
            const response = await fetch(`${this.API_BASE}/user/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    username: localStorage.getItem('username') || `user_${Date.now()}`
                })
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('✅ User initialized:', this.userId);
            }
        } catch (error) {
            console.error('Error initializing user:', error);
        }
        
        // Load profile
        await this.loadProfile();
        
        // Update UI
        this.updateGlobalUI();
        
        return this;
    }
    
    /**
     * Load complete user profile
     */
    async loadProfile() {
        try {
            const response = await fetch(`${this.API_BASE}/user/profile?userId=${this.userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.profile = data.profile;
                this.notifyListeners();
                return this.profile;
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
        
        return null;
    }
    
    /**
     * Get current user level
     */
    getUserLevel() {
        return this.profile?.user?.currentLevel || localStorage.getItem('userLevel') || 'A2';
    }
    
    /**
     * Update user level (from assessment or continuous learning)
     */
    async updateLevel(newLevel, reason = 'manual') {
        try {
            const response = await fetch(`${this.API_BASE}/assessment/update-level`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    newLevel,
                    reason
                })
            });
            
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('userLevel', newLevel);
                await this.loadProfile(); // Refresh profile
                this.updateGlobalUI();
                console.log(`✅ Level updated to ${newLevel}`);
                return true;
            }
        } catch (error) {
            console.error('Error updating level:', error);
        }
        
        return false;
    }
    
    /**
     * Get vocabulary stats
     */
    getVocabularyStats() {
        return this.profile?.vocabulary || {
            total: 0,
            saved: 0,
            mastered: 0,
            due: 0
        };
    }
    
    /**
     * Get assessment data
     */
    getAssessment() {
        return this.profile?.assessment || null;
    }
    
    /**
     * Get activity stats
     */
    getActivity() {
        return this.profile?.activity || {
            recentInteractions: 0,
            streak: 0
        };
    }
    
    /**
     * Track interaction (called by various features)
     */
    async trackInteraction(type, data = {}) {
        try {
            const interactionData = {
                userId: this.userId,
                type,
                ...data,
                timestamp: new Date().toISOString()
            };
            
            // Send to backend (use appropriate endpoint based on type)
            if (type === 'word_click') {
                await fetch(`${this.API_BASE}/vocabulary/click`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(interactionData)
                });
            }
            
            // Refresh profile periodically
            if (Math.random() < 0.1) { // 10% of interactions
                await this.loadProfile();
            }
        } catch (error) {
            console.error('Error tracking interaction:', error);
        }
    }
    
    /**
     * Update global UI elements (nav badges, stats, etc.)
     */
    updateGlobalUI() {
        if (!this.profile) return;
        
        const vocab = this.getVocabularyStats();
        const activity = this.getActivity();
        
        // Update due words badge (if element exists)
        const dueBadge = document.getElementById('dueWordsBadge');
        if (dueBadge && vocab.due > 0) {
            dueBadge.textContent = vocab.due;
            dueBadge.style.display = 'flex';
        }
        
        // Update streak display
        const streakEl = document.getElementById('streakDisplay');
        if (streakEl && activity.streak > 0) {
            streakEl.textContent = `🔥 ${activity.streak} day${activity.streak > 1 ? 's' : ''}`;
        }
        
        // Update level badge
        const levelEl = document.getElementById('userLevelBadge');
        if (levelEl) {
            levelEl.textContent = this.getUserLevel();
        }
        
        console.log('📊 UI Updated:', { vocab, activity });
    }
    
    /**
     * Subscribe to profile updates
     */
    onChange(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * Notify all listeners of state change
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.profile);
            } catch (error) {
                console.error('Error in listener:', error);
            }
        });
    }
    
    /**
     * Get recommended content based on level
     */
    async getRecommendations(limit = 10) {
        try {
            const response = await fetch(
                `${this.API_BASE}/recommendations/articles?userId=${this.userId}&limit=${limit}`
            );
            const data = await response.json();
            
            if (data.success) {
                return data.articles;
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
        }
        
        return [];
    }
    
    /**
     * Check if user should take assessment
     */
    shouldTakeAssessment() {
        const assessment = this.getAssessment();
        
        // No assessment yet
        if (!assessment) return true;
        
        // Assessment older than 30 days
        const lastAssessed = new Date(assessment.lastAssessed);
        const daysSince = (Date.now() - lastAssessed.getTime()) / (1000 * 60 * 60 * 24);
        
        return daysSince > 30;
    }
    
    /**
     * Get level recommendation based on performance
     */
    async getLevelRecommendation() {
        try {
            const response = await fetch(
                `${this.API_BASE}/assessment/recommend-level?userId=${this.userId}`
            );
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
        } catch (error) {
            console.error('Error getting level recommendation:', error);
        }
        
        return null;
    }
}

// Create global instance
window.userState = new UserStateManager();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.userState.init();
    });
} else {
    window.userState.init();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserStateManager;
}
