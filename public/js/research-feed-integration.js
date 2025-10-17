/**
 * 🧠 RESEARCH-BACKED FEED INTEGRATION
 * 
 * Integrates all research algorithms into the main video feed:
 * - TikTok 5-point engagement tracking
 * - Duolingo HLR spaced repetition
 * - Krashen i+1 adaptive difficulty
 * - Gamification (XP, streaks, variable rewards)
 */

class ResearchFeedIntegration {
    constructor(userId) {
        this.userId = userId || 'user_' + Math.random().toString(36).substr(2, 9);
        this.currentVideoIndex = 0;
        this.videos = [];
        this.interactions = [];
        this.sessionStartTime = Date.now();
        
        console.log('🧠 Research Feed Integration initialized for:', this.userId);
    }
    
    /**
     * Load personalized feed using research algorithms
     */
    async loadPersonalizedFeed(count = 20) {
        try {
            console.log(`📊 Loading personalized feed (count: ${count})`);
            
            const response = await fetch(`/api/research/feed/research/${this.userId}?type=videos&count=${count}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('Feed loading failed');
            }
            
            this.videos = data.feed || [];
            
            console.log('✅ Feed loaded:', {
                videos: this.videos.length,
                stage: data.userProfile?.personalizationStage,
                dueWords: data.dueWords?.length || 0
            });
            
            // Show personalization stage
            this.displayPersonalizationStage(data.userProfile);
            
            // Show due words notification
            if (data.dueWords && data.dueWords.length > 0) {
                this.showDueWordsNotification(data.dueWords);
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Feed loading error:', error);
            
            // Fallback to old API
            console.log('📡 Falling back to legacy API');
            const response = await fetch('/api/videos');
            this.videos = await response.json();
            
            return { feed: this.videos, userProfile: {}, dueWords: [] };
        }
    }
    
    /**
     * Track interaction (TikTok 5-point system)
     */
    async trackInteraction(video, interactionData) {
        const interaction = {
            contentId: video.id || video.videoUrl,
            contentType: 'video',
            timestamp: Date.now(),
            ...interactionData
        };
        
        this.interactions.push(interaction);
        
        console.log('📊 Tracking:', interactionData.action, 'for', video.id);
        
        try {
            const response = await fetch(`/api/research/track/${this.userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interaction)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show XP animation if awarded
                if (result.xp && result.xp.xpAwarded > 0) {
                    this.showXPAnimation(result.xp);
                }
                
                // Update streak display
                if (result.streak) {
                    this.updateStreakDisplay(result.streak);
                }
                
                // Show level up if occurred
                if (result.xp && result.xp.levelUp) {
                    this.showLevelUpAnimation(result.xp);
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ Tracking error:', error);
            return null;
        }
    }
    
    /**
     * Track video view (TikTok: 5 points for rewatch)
     */
    async trackVideoView(video, isRewatch = false) {
        return this.trackInteraction(video, {
            action: isRewatch ? 'rewatch' : 'view',
            watchTime: 0
        });
    }
    
    /**
     * Track video completion (TikTok: 4 points)
     */
    async trackVideoComplete(video, watchTime, duration) {
        return this.trackInteraction(video, {
            action: 'complete',
            watchTime: watchTime,
            videoDuration: duration,
            completed: true
        });
    }
    
    /**
     * Track like (TikTok: 1 point)
     */
    async trackLike(video) {
        return this.trackInteraction(video, {
            action: 'like'
        });
    }
    
    /**
     * Track share (TikTok: 3 points)
     */
    async trackShare(video) {
        return this.trackInteraction(video, {
            action: 'share'
        });
    }
    
    /**
     * Track comment (TikTok: 2 points)
     */
    async trackComment(video, comment) {
        return this.trackInteraction(video, {
            action: 'comment',
            comment: comment
        });
    }
    
    /**
     * Track word click (HLR memory update)
     */
    async trackWordClick(video, word, correct) {
        return this.trackInteraction(video, {
            action: 'wordClick',
            words: [{
                word: word,
                correct: correct,
                frequency: 100 // Will be calculated by backend
            }]
        });
    }
    
    /**
     * Show XP animation with variable rewards
     */
    showXPAnimation(xpData) {
        const { xpAwarded, bonusAwarded, reason } = xpData;
        
        // Create XP popup
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 24px 32px;
            border-radius: 20px;
            font-size: 32px;
            font-weight: 800;
            z-index: 10000;
            box-shadow: 0 20px 60px rgba(255, 215, 0, 0.5);
            text-align: center;
            animation: xpPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        `;
        
        // Add bonus indicator if applicable
        if (bonusAwarded) {
            popup.innerHTML = `
                <div style="font-size: 48px;">🎉</div>
                <div>+${xpAwarded} XP</div>
                <div style="font-size: 18px; opacity: 0.9; margin-top: 8px;">BONUS! ${reason || ''}</div>
            `;
        } else {
            popup.innerHTML = `
                <div style="font-size: 48px;">⭐</div>
                <div>+${xpAwarded} XP</div>
                <div style="font-size: 14px; opacity: 0.8; margin-top: 4px;">${reason || ''}</div>
            `;
        }
        
        document.body.appendChild(popup);
        
        // Remove after animation
        setTimeout(() => {
            popup.style.animation = 'xpFade 0.3s ease-out forwards';
            setTimeout(() => popup.remove(), 300);
        }, 2000);
        
        // Add CSS animation if not exists
        if (!document.getElementById('xp-animations')) {
            const style = document.createElement('style');
            style.id = 'xp-animations';
            style.textContent = `
                @keyframes xpPop {
                    0% { transform: translate(-50%, -50%) scale(0); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes xpFade {
                    to { opacity: 0; transform: translate(-50%, -60%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Show level up animation
     */
    showLevelUpAnimation(xpData) {
        const { level } = xpData;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);">
                <div style="font-size: 120px;">🎊</div>
                <div style="font-size: 48px; font-weight: 800; color: #FFD700; margin: 20px 0;">
                    LEVEL UP!
                </div>
                <div style="font-size: 32px; color: #fff;">
                    Level ${level}
                </div>
                <div style="margin-top: 32px; color: #aaa; font-size: 18px;">
                    Tap to continue
                </div>
            </div>
        `;
        
        overlay.onclick = () => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        };
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Update streak display in UI
     */
    updateStreakDisplay(streakData) {
        const { streakDays, atRisk } = streakData;
        
        // Update existing streak element or create one
        let streakElement = document.getElementById('streak-display');
        
        if (!streakElement) {
            streakElement = document.createElement('div');
            streakElement.id = 'streak-display';
            streakElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${atRisk ? '#FF3B5C' : '#58CC02'};
                color: white;
                padding: 12px 20px;
                border-radius: 30px;
                font-weight: 700;
                font-size: 16px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            document.body.appendChild(streakElement);
        }
        
        streakElement.innerHTML = `
            <span style="font-size: 20px;">${atRisk ? '⚠️' : '🔥'}</span>
            <span>${streakDays} day${streakDays !== 1 ? 's' : ''}</span>
        `;
        
        streakElement.style.background = atRisk ? '#FF3B5C' : '#58CC02';
    }
    
    /**
     * Display personalization stage
     */
    displayPersonalizationStage(userProfile) {
        if (!userProfile) return;
        
        const { personalizationStage } = userProfile;
        
        const stageMessages = {
            'cold_start': '🆕 Learning your preferences...',
            'learning': '📊 Building your profile...',
            'robust': '✅ Feed personalized!',
            'stable': '⭐ Optimized feed!'
        };
        
        const message = stageMessages[personalizationStage] || '';
        
        if (message) {
            console.log('📊 Personalization:', message);
            
            // Could show as toast notification
            // this.showToast(message);
        }
    }
    
    /**
     * Show due words notification
     */
    showDueWordsNotification(dueWords) {
        if (dueWords.length === 0) return;
        
        console.log(`📚 ${dueWords.length} words due for review`);
        
        // Create notification badge
        const badge = document.createElement('div');
        badge.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: #007AFF;
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
            cursor: pointer;
        `;
        
        badge.textContent = `📚 ${dueWords.length} words ready to practice`;
        
        badge.onclick = () => {
            // Navigate to practice view
            if (typeof switchTab === 'function') {
                switchTab('practice');
            }
            badge.remove();
        };
        
        document.body.appendChild(badge);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (badge.parentNode) {
                badge.style.transition = 'opacity 0.3s';
                badge.style.opacity = '0';
                setTimeout(() => badge.remove(), 300);
            }
        }, 5000);
    }
    
    /**
     * Get dashboard data
     */
    async getDashboard() {
        try {
            const response = await fetch(`/api/research/dashboard/${this.userId}`);
            const data = await response.json();
            
            if (data.success) {
                console.log('📊 Dashboard:', data.dashboard);
                return data.dashboard;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Dashboard error:', error);
            return null;
        }
    }
    
    /**
     * Get practice session
     */
    async getPracticeSession(duration = 10) {
        try {
            const response = await fetch(`/api/research/practice/${this.userId}?duration=${duration}`);
            const data = await response.json();
            
            if (data.success) {
                console.log('📚 Practice session:', data.session);
                return data.session;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Practice error:', error);
            return null;
        }
    }
}

// Global instance
window.researchFeed = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
    
    window.researchFeed = new ResearchFeedIntegration(userId);
    console.log('✅ Research Feed Integration ready');
});
