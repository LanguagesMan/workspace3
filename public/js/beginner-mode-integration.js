/**
 * BEGINNER MODE INTEGRATION
 * Automatically detects beginners and triggers appropriate onboarding
 */

class BeginnerModeIntegration {
    constructor() {
        this.userId = this.getUserId();
        this.isBeginnerMode = false;
        this.userProgress = null;
    }

    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    async init() {
        // NO REDIRECTS - Just let them watch videos!
        // Check if user is still a beginner
        await this.checkBeginnerStatus();

        if (this.isBeginnerMode) {
            this.activateBeginnerFeatures();

            // DISABLED: Skip welcome modal - let users start watching immediately
            // User complained: "basic things don't work. Even the videos don't load"
            // Root cause: Welcome modal blocks video feed loading
            localStorage.setItem('beginnerWelcomeShown', 'true');
        }
    }

    showWelcomeTip() {
        const tip = document.createElement('div');
        tip.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 30px;
                border-radius: 20px;
                text-align: center;
                z-index: 10000;
                max-width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            ">
                <h2 style="font-size: 2em; margin-bottom: 15px;">👋 Welcome!</h2>
                <p style="font-size: 1.2em; margin-bottom: 20px;">
                    Learn Spanish by watching videos<br>
                    <strong>Tap any word</strong> to see what it means
                </p>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: white;
                    color: black;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 50px;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                ">Start Watching! 🎥</button>
            </div>
        `;
        document.body.appendChild(tip);
    }

    async checkBeginnerStatus() {
        try {
            const response = await fetch(`/api/beginner/progress/${this.userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.userProgress = data.progress;
                this.isBeginnerMode = data.isAbsoluteBeginner;
                localStorage.setItem('beginnerMode', this.isBeginnerMode ? 'true' : 'false');
                
                return this.isBeginnerMode;
            }
        } catch (error) {
            console.error('Error checking beginner status:', error);
            
            // Fallback to local detection
            const wordsLearned = parseInt(localStorage.getItem('wordsLearned') || '0');
            const videosWatched = parseInt(localStorage.getItem('videosWatched') || '0');
            this.isBeginnerMode = wordsLearned < 50 || videosWatched < 10;
            
            return this.isBeginnerMode;
        }
    }

    activateBeginnerFeatures() {
        console.log('🎓 Beginner Mode: ACTIVE');
        
        // Add beginner mode indicator to UI
        this.addBeginnerBadge();
        
        // Set slower default playback speed
        this.setBeginnerPlaybackSpeed();
        
        // Show beginner tips (just one simple tip)
        this.showBeginnerTips();
        
        // Track beginner session
        this.trackBeginnerSession();
        
        // Filter feed for beginner content
        this.filterBeginnerContent();
    }

    addBeginnerBadge() {
        // DISABLED: Spam overlay badge
        return;
    }

    setBeginnerPlaybackSpeed() {
        // Set default playback speed to 0.75x for beginners
        if (!localStorage.getItem('playbackSpeed')) {
            localStorage.setItem('playbackSpeed', '0.75');
        }
        
        // Apply to all video elements
        document.querySelectorAll('video').forEach(video => {
            video.playbackRate = 0.75;
        });
    }

    showBeginnerTips() {
        // DISABLED: Intrusive tooltip that blocks screen
        // Users can discover word-clicking naturally
        return;
    }

    displayTip(tip) {
        // Subtle tip at bottom - doesn't block video
        const tipElement = document.createElement('div');
        tipElement.className = 'beginner-tip';
        tipElement.innerHTML = `
            <div style="
                position: fixed;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 0.95em;
                text-align: center;
                z-index: 100;
                max-width: 85%;
                box-shadow: 0 3px 15px rgba(0,0,0,0.4);
                animation: fadeIn 0.3s ease-in;
            ">
                ${tip.tip}
            </div>
        `;
        document.body.appendChild(tipElement);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (tipElement.parentNode) {
                tipElement.style.opacity = '0';
                tipElement.style.transition = 'opacity 0.3s ease-out';
                setTimeout(() => tipElement.remove(), 300);
            }
        }, tip.duration);
    }

    showEncouragement(message) {
        // Subtle encouragement - small toast at bottom
        const toast = document.createElement('div');
        toast.className = 'encouragement-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(102, 126, 234, 0.9);
            backdrop-filter: blur(10px);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
            z-index: 100;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    trackBeginnerSession() {
        // Track that beginner started a session
        fetch('/api/beginner/micro-win', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: this.userId,
                type: 'started_session',
                data: { timestamp: new Date().toISOString() }
            })
        }).catch(err => console.log('Track session:', err));
    }

    async filterBeginnerContent() {
        // This will be called by the feed system to filter videos
        // Store flag for feed to check
        window.isBeginnerMode = true;
        window.beginnerUserId = this.userId;
    }

    async checkGraduation() {
        try {
            const response = await fetch(`/api/beginner/graduate?userId=${this.userId}`);
            const data = await response.json();
            
            if (data.success && data.ready) {
                this.showGraduationPrompt(data);
            }
        } catch (error) {
            console.error('Error checking graduation:', error);
        }
    }

    showGraduationPrompt(data) {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                ">
                    <h1 style="font-size: 3em; margin-bottom: 20px;">🎓</h1>
                    <h2 style="font-size: 2em; margin-bottom: 15px;">Congratulations!</h2>
                    <p style="font-size: 1.2em; margin-bottom: 20px;">
                        You've graduated from Beginner Mode!
                    </p>
                    <p style="font-size: 1em; margin-bottom: 30px; opacity: 0.9;">
                        You now know ${this.userProgress?.knownWords?.length || 100}+ words!<br>
                        You're now at A2 level 🚀
                    </p>
                    <button onclick="window.beginnerModeIntegration.graduate()" style="
                        background: white;
                        color: #667eea;
                        border: none;
                        padding: 15px 40px;
                        font-size: 1.1em;
                        font-weight: bold;
                        border-radius: 50px;
                        cursor: pointer;
                        margin: 10px;
                    ">Continue to Intermediate →</button>
                    <br>
                    <button onclick="this.closest('div').parentElement.remove()" style="
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        border: 2px solid white;
                        padding: 12px 30px;
                        font-size: 1em;
                        font-weight: bold;
                        border-radius: 50px;
                        cursor: pointer;
                        margin: 10px;
                    ">Stay in Beginner Mode</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async graduate() {
        try {
            const response = await fetch(`/api/beginner/graduate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('beginnerMode', 'false');
                localStorage.setItem('currentLevel', 'A2');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error graduating:', error);
        }
    }
}

// Auto-initialize on page load
window.beginnerModeIntegration = new BeginnerModeIntegration();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.beginnerModeIntegration.init();
    });
} else {
    window.beginnerModeIntegration.init();
}

// Check for graduation every 5 videos
let videoCount = 0;
document.addEventListener('video-completed', () => {
    videoCount++;
    if (videoCount % 5 === 0) {
        window.beginnerModeIntegration.checkGraduation();
    }
});

