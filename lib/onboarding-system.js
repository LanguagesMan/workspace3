/**
 * 🎓 INTERACTIVE ONBOARDING SYSTEM
 * Based on TikTok's first-time UX (reduces 60%+ bounce rate)
 * 30-second tutorial for new users
 */

class OnboardingSystem {
    constructor() {
        this.steps = this.defineSteps();
        this.currentStep = 0;
        this.completed = this.isOnboardingCompleted();
    }

    defineSteps() {
        return [
            {
                id: 'welcome',
                title: 'Welcome to Langflix! 🎬',
                message: 'Learn Spanish through viral videos',
                image: '🇪🇸',
                action: 'Start Learning',
                highlight: null
            },
            {
                id: 'swipe',
                title: 'Swipe Up for Next Video',
                message: 'Just like TikTok - swipe up to discover new content',
                image: '⬆️',
                action: 'Got it!',
                highlight: '.feed-container',
                gesture: 'swipe-up'
            },
            {
                id: 'difficulty',
                title: 'Adjust Difficulty',
                message: 'Tap "Too Easy" or "Too Hard" to get better matches',
                image: '🎯',
                action: 'Makes sense',
                highlight: '.difficulty-controls',
                pointer: true
            },
            {
                id: 'streak',
                title: 'Build Your Streak 🔥',
                message: 'Come back daily to maintain your streak and unlock achievements',
                image: '🏆',
                action: 'Let\'s go!',
                highlight: '.streak-indicator'
            }
        ];
    }

    isOnboardingCompleted() {
        return localStorage.getItem('onboarding_completed') === 'true';
    }

    shouldShowOnboarding() {
        return !this.completed;
    }

    start() {
        if (!this.shouldShowOnboarding()) {
            return;
        }

        this.currentStep = 0;
        this.showStep(0);
    }

    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[index];
        this.currentStep = index;

        // Create overlay
        const overlay = this.createOverlay(step, index);
        document.body.appendChild(overlay);

        // Highlight element if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }

        // Show gesture animation if specified
        if (step.gesture) {
            this.showGestureAnimation(step.gesture);
        }
    }

    createOverlay(step, index) {
        const overlay = document.createElement('div');
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <div class="onboarding-backdrop"></div>
            <div class="onboarding-content">
                <div class="onboarding-progress">
                    ${this.steps.map((_, i) => `
                        <div class="progress-dot ${i === index ? 'active' : i < index ? 'completed' : ''}"></div>
                    `).join('')}
                </div>

                <div class="onboarding-image">${step.image}</div>
                <h2 class="onboarding-title">${step.title}</h2>
                <p class="onboarding-message">${step.message}</p>

                <button class="onboarding-action" onclick="window.onboardingSystem.next()">
                    ${step.action}
                </button>

                <button class="onboarding-skip" onclick="window.onboardingSystem.skip()">
                    Skip tutorial
                </button>
            </div>
        `;

        return overlay;
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        // Add highlight class
        element.classList.add('onboarding-highlight');

        // Create spotlight effect
        const spotlight = document.createElement('div');
        spotlight.className = 'onboarding-spotlight';

        const rect = element.getBoundingClientRect();
        spotlight.style.top = `${rect.top}px`;
        spotlight.style.left = `${rect.left}px`;
        spotlight.style.width = `${rect.width}px`;
        spotlight.style.height = `${rect.height}px`;

        document.body.appendChild(spotlight);
    }

    showGestureAnimation(gesture) {
        const animation = document.createElement('div');
        animation.className = `gesture-animation gesture-${gesture}`;

        if (gesture === 'swipe-up') {
            animation.innerHTML = `
                <div class="gesture-hand">👆</div>
                <div class="gesture-arrow">⬆️</div>
            `;
        }

        document.body.appendChild(animation);
    }

    clearHighlights() {
        // Remove all highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });

        // Remove spotlights
        document.querySelectorAll('.onboarding-spotlight').forEach(el => {
            el.remove();
        });

        // Remove gesture animations
        document.querySelectorAll('.gesture-animation').forEach(el => {
            el.remove();
        });
    }

    next() {
        // Remove current overlay
        this.clearHighlights();
        document.querySelector('.onboarding-overlay')?.remove();

        // Show next step
        this.showStep(this.currentStep + 1);
    }

    skip() {
        this.complete();
    }

    complete() {
        // Clean up
        this.clearHighlights();
        document.querySelector('.onboarding-overlay')?.remove();

        // Mark as completed
        localStorage.setItem('onboarding_completed', 'true');
        this.completed = true;

        // Show success message
        this.showWelcomeMessage();

        console.log('✅ Onboarding completed');
    }

    showWelcomeMessage() {
        const message = document.createElement('div');
        message.className = 'welcome-message';
        message.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">🎉</div>
                <h3>You're all set!</h3>
                <p>Start watching to unlock achievements</p>
            </div>
        `;

        document.body.appendChild(message);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 500);
        }, 3000);
    }

    reset() {
        localStorage.removeItem('onboarding_completed');
        this.completed = false;
        this.currentStep = 0;
    }
}

// Make globally accessible
if (typeof window !== 'undefined') {
    window.OnboardingSystem = OnboardingSystem;
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingSystem;
}
