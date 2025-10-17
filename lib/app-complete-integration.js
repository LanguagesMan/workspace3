/**
 * 🚀 COMPLETE APP INTEGRATION
 * Integrates all Priority 1 features to bring app from B+ to A+
 * - Achievement System
 * - Onboarding
 * - Progress Indicators
 * - Help System
 * - Video Controls (Speed + Subtitles)
 */

class AppCompleteIntegration {
    constructor() {
        this.achievementSystem = null;
        this.onboardingSystem = null;
        this.sessionStartTime = Date.now();
        this.videosWatchedThisSession = 0;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing complete app integration...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Initialize systems
        this.achievementSystem = new AchievementSystem();
        this.onboardingSystem = new OnboardingSystem();

        // Make globally accessible
        window.achievementSystem = this.achievementSystem;
        window.onboardingSystem = this.onboardingSystem;

        // Add UI elements
        this.addProgressIndicators();
        this.addHelpButton();
        this.addVideoControls();

        // Track daily login
        this.achievementSystem.updateProgress('daily_login');

        // Start onboarding for new users
        setTimeout(() => {
            if (this.onboardingSystem.shouldShowOnboarding()) {
                this.onboardingSystem.start();
            }
        }, 1000);

        // Setup event listeners
        this.setupEventListeners();

        // Start session timer
        this.startSessionTimer();

        console.log('✅ Complete app integration ready');
    }

    addProgressIndicators() {
        const summary = this.achievementSystem.getProgressSummary();

        const progressHTML = `
            <div class="progress-summary">
                <div class="progress-card streak-indicator">
                    <span class="progress-icon streak-flame">🔥</span>
                    <div>
                        <div class="progress-value">${summary.current_streak}</div>
                        <div class="progress-label">day streak</div>
                    </div>
                </div>

                <div class="progress-card">
                    <span class="progress-icon">⭐</span>
                    <div>
                        <div class="progress-value">${summary.total_xp}</div>
                        <div class="progress-label">XP</div>
                    </div>
                </div>

                <div class="progress-card">
                    <span class="progress-icon">🎬</span>
                    <div>
                        <div class="progress-value">${summary.videos_watched}</div>
                        <div class="progress-label">videos</div>
                    </div>
                </div>

                <div class="progress-card">
                    <span class="progress-icon">🏆</span>
                    <div>
                        <div class="progress-value">${summary.achievements_unlocked}/${summary.achievements_total}</div>
                        <div class="progress-label">badges</div>
                    </div>
                </div>
            </div>

            <div class="daily-goal-bar">
                <div class="daily-goal-progress" style="width: ${Math.min(100, (summary.minutes_today / summary.daily_goal) * 100)}%"></div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = progressHTML;
        document.body.appendChild(container.firstElementChild);
        document.body.appendChild(container.lastElementChild);
    }

    addHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'help-button';
        helpButton.innerHTML = '?';
        helpButton.onclick = () => this.showHelp();
        document.body.appendChild(helpButton);
    }

    showHelp() {
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">💡</div>
                <h2 class="achievement-title">How to Use Langflix</h2>
                <div style="text-align: left; margin: 20px 0;">
                    <p style="margin-bottom: 15px;"><strong>⬆️ Swipe Up</strong>: Next video</p>
                    <p style="margin-bottom: 15px;"><strong>🎯 Too Easy/Hard</strong>: Adjust difficulty</p>
                    <p style="margin-bottom: 15px;"><strong>⏩ Speed</strong>: Change playback speed</p>
                    <p style="margin-bottom: 15px;"><strong>CC</strong>: Toggle subtitles</p>
                    <p style="margin-bottom: 15px;"><strong>🔥 Streak</strong>: Come back daily</p>
                    <p><strong>🏆 Achievements</strong>: Watch videos to unlock</p>
                </div>
                <button class="achievement-close" onclick="this.closest('.achievement-modal').remove()">
                    Got it!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addVideoControls() {
        // This will be injected into each video card dynamically
        // Listen for video card renders
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('video-card')) {
                        this.enhanceVideoCard(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceVideoCard(videoCard) {
        const video = videoCard.querySelector('video');
        if (!video) return;

        // Add speed control
        const speedControl = this.createSpeedControl(video);

        // Add subtitle toggle
        const subtitleControl = this.createSubtitleControl(videoCard);

        // Find or create controls container
        let controlsContainer = videoCard.querySelector('.video-controls');
        if (!controlsContainer) {
            controlsContainer = document.createElement('div');
            controlsContainer.className = 'video-controls-enhanced';
            controlsContainer.style.cssText = `
                position: absolute;
                bottom: 100px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 10;
            `;
            videoCard.appendChild(controlsContainer);
        }

        controlsContainer.appendChild(speedControl);
        controlsContainer.appendChild(subtitleControl);
    }

    createSpeedControl(video) {
        const button = document.createElement('button');
        button.className = 'speed-control-btn';
        button.innerHTML = '1x';
        button.style.cssText = `
            width: 48px;
            height: 48px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(0, 245, 255, 0.5);
            border-radius: 50%;
            color: #00F5FF;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            backdrop-filter: blur(10px);
        `;

        const speeds = [0.75, 1, 1.25, 1.5];
        let currentSpeedIndex = 1;

        button.onclick = () => {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            const newSpeed = speeds[currentSpeedIndex];
            video.playbackRate = newSpeed;
            button.innerHTML = `${newSpeed}x`;

            // Show feedback
            this.showXPPopup(`Speed: ${newSpeed}x`, button);
        };

        return button;
    }

    createSubtitleControl(videoCard) {
        const button = document.createElement('button');
        button.className = 'subtitle-control-btn';
        button.innerHTML = 'CC';
        button.style.cssText = `
            width: 48px;
            height: 48px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(0, 245, 255, 0.5);
            border-radius: 50%;
            color: #00F5FF;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            backdrop-filter: blur(10px);
        `;

        const modes = ['OFF', 'ES', 'EN', 'BOTH'];
        let currentMode = 3; // Start with BOTH

        button.onclick = () => {
            currentMode = (currentMode + 1) % modes.length;
            const mode = modes[currentMode];
            button.innerHTML = mode === 'OFF' ? 'CC' : mode;

            // Toggle subtitle visibility
            const spanishSub = videoCard.querySelector('.spanish-subtitle');
            const englishSub = videoCard.querySelector('.english-subtitle');

            if (spanishSub && englishSub) {
                switch (mode) {
                    case 'OFF':
                        spanishSub.style.display = 'none';
                        englishSub.style.display = 'none';
                        button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        button.style.color = '#999';
                        break;
                    case 'ES':
                        spanishSub.style.display = 'block';
                        englishSub.style.display = 'none';
                        button.style.borderColor = 'rgba(0, 245, 255, 0.5)';
                        button.style.color = '#00F5FF';
                        break;
                    case 'EN':
                        spanishSub.style.display = 'none';
                        englishSub.style.display = 'block';
                        button.style.borderColor = 'rgba(0, 245, 255, 0.5)';
                        button.style.color = '#00F5FF';
                        break;
                    case 'BOTH':
                        spanishSub.style.display = 'block';
                        englishSub.style.display = 'block';
                        button.style.borderColor = 'rgba(0, 245, 255, 0.8)';
                        button.style.color = '#00F5FF';
                        break;
                }
            }

            this.showXPPopup(`Subtitles: ${mode}`, button);
        };

        return button;
    }

    setupEventListeners() {
        // Track video completions
        document.addEventListener('video-completed', (e) => {
            this.onVideoCompleted(e.detail);
        });

        // Track video views
        document.addEventListener('video-viewed', (e) => {
            this.onVideoViewed(e.detail);
        });

        // Track word clicks
        document.addEventListener('word-clicked', (e) => {
            this.onWordLearned(e.detail);
        });

        // Listen for native video ended events
        document.addEventListener('ended', (e) => {
            if (e.target.tagName === 'VIDEO') {
                this.onVideoCompleted({ videoId: e.target.dataset.videoId });
            }
        }, true);
    }

    onVideoCompleted(data) {
        console.log('📺 Video completed:', data);

        // Update achievement progress
        const newAchievements = this.achievementSystem.updateProgress('video_completed');

        // Award XP
        this.awardXP(10, 'Video Completed');

        // Update UI
        this.refreshProgressIndicators();

        // Increment session counter
        this.videosWatchedThisSession++;

        // Check for session milestones
        if (this.videosWatchedThisSession === 5) {
            this.awardXP(25, 'Watched 5 videos in one session!');
        }
    }

    onVideoViewed(data) {
        console.log('👁️ Video viewed:', data);
        // Could track analytics here
    }

    onWordLearned(data) {
        console.log('📝 Word learned:', data);
        this.achievementSystem.updateProgress('word_learned');
        this.awardXP(5, 'New Word');
        this.refreshProgressIndicators();
    }

    awardXP(amount, reason) {
        // Show XP popup
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.innerHTML = `+${amount} XP`;
        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 1500);

        console.log(`⭐ +${amount} XP: ${reason}`);
    }

    showXPPopup(text, nearElement) {
        const popup = document.createElement('div');
        popup.className = 'tooltip';
        popup.innerHTML = text;

        // Position near the element
        const rect = nearElement.getBoundingClientRect();
        popup.style.position = 'fixed';
        popup.style.top = `${rect.top - 50}px`;
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.transform = 'translateX(-50%)';

        document.body.appendChild(popup);

        setTimeout(() => popup.remove(), 2000);
    }

    startSessionTimer() {
        // Update time spent every minute
        setInterval(() => {
            const minutes = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            this.achievementSystem.updateProgress('time_spent', 1);
            this.refreshProgressIndicators();
        }, 60000); // Every minute
    }

    refreshProgressIndicators() {
        const summary = this.achievementSystem.getProgressSummary();

        // Update streak
        const streakEl = document.querySelector('.streak-indicator .progress-value');
        if (streakEl) streakEl.textContent = summary.current_streak;

        // Update XP
        const xpEl = document.querySelectorAll('.progress-card')[1]?.querySelector('.progress-value');
        if (xpEl) xpEl.textContent = summary.total_xp;

        // Update videos
        const videosEl = document.querySelectorAll('.progress-card')[2]?.querySelector('.progress-value');
        if (videosEl) videosEl.textContent = summary.videos_watched;

        // Update achievements
        const achievementsEl = document.querySelectorAll('.progress-card')[3]?.querySelector('.progress-value');
        if (achievementsEl) achievementsEl.textContent = `${summary.achievements_unlocked}/${summary.achievements_total}`;

        // Update daily goal progress
        const progressBar = document.querySelector('.daily-goal-progress');
        if (progressBar) {
            const percentage = Math.min(100, (summary.minutes_today / summary.daily_goal) * 100);
            progressBar.style.width = `${percentage}%`;
        }
    }

    // Manually trigger video completion (for testing or integration)
    triggerVideoCompletion(videoId) {
        this.onVideoCompleted({ videoId });
    }

    // Manually trigger word learned (for integration with word click handlers)
    triggerWordLearned(word) {
        this.onWordLearned({ word });
    }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.AppCompleteIntegration = AppCompleteIntegration;

    // Auto-start after a brief delay to ensure other scripts load
    setTimeout(() => {
        window.appIntegration = new AppCompleteIntegration();
    }, 500);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppCompleteIntegration;
}
