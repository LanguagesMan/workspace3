/**
 * 🎨 ENGAGEMENT ANIMATIONS
 * Duolingo/TikTok-style celebrations and visual feedback
 * Every action triggers dopamine through visual rewards
 */

class EngagementAnimations {
    constructor() {
        this.isAnimating = false;
        this.confettiCanvas = null;
        this.confettiCtx = null;
        this.confettiParticles = [];
        
        // Haptic feedback (iOS only)
        this.hasHaptics = 'vibrate' in navigator;
        
        console.log('🎨 Engagement Animations initialized');
        this.initializeCanvas();
    }
    
    /**
     * Initialize confetti canvas
     */
    initializeCanvas() {
        // Create canvas for confetti
        this.confettiCanvas = document.createElement('canvas');
        this.confettiCanvas.id = 'confetti-canvas';
        this.confettiCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
        
        document.body.appendChild(this.confettiCanvas);
        
        // Resize listener
        window.addEventListener('resize', () => {
            this.confettiCanvas.width = window.innerWidth;
            this.confettiCanvas.height = window.innerHeight;
        });
    }
    
    /**
     * 💚 FLASH GREEN (Word save)
     * Quick green flash + haptic
     */
    flashGreen(element = null) {
        const targetElement = element || document.body;
        
        // Visual feedback
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(16, 185, 129, 0.2);
            pointer-events: none;
            z-index: 9998;
            animation: flashFade 0.3s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 300);
        
        // Haptic feedback
        this.haptic('light');
        
        // Sound effect (optional)
        this.playSound('word-save');
    }
    
    /**
     * 🎉 CONFETTI ANIMATION
     * Full confetti burst (video complete, milestone)
     */
    showConfetti(options = {}) {
        const {
            particleCount = 50,
            duration = 2000,
            spread = 90,
            originX = 0.5,
            originY = 0.5
        } = options;
        
        // Create particles
        const particles = [];
        const startX = window.innerWidth * originX;
        const startY = window.innerHeight * originY;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: startX,
                y: startY,
                vx: (Math.random() - 0.5) * 10,
                vy: -Math.random() * 15 - 5,
                color: this.randomColor(),
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        this.confettiParticles.push(...particles);
        
        // Animate
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed > duration) {
                this.confettiParticles = [];
                this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
                return;
            }
            
            this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
            
            this.confettiParticles.forEach(p => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5; // Gravity
                p.rotation += p.rotationSpeed;
                
                // Draw particle
                this.confettiCtx.save();
                this.confettiCtx.translate(p.x, p.y);
                this.confettiCtx.rotate(p.rotation * Math.PI / 180);
                this.confettiCtx.fillStyle = p.color;
                this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                this.confettiCtx.restore();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Haptic feedback
        this.haptic('medium');
        
        // Sound effect
        this.playSound('celebration');
    }
    
    /**
     * 📈 PULSE ANIMATION
     * Scale up/down (article read, quiz correct)
     */
    pulseElement(element, options = {}) {
        const {
            scale = 1.2,
            duration = 500
        } = options;
        
        if (!element) return;
        
        const originalTransform = element.style.transform || '';
        
        element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        element.style.transform = `${originalTransform} scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = originalTransform;
        }, duration / 2);
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
        
        this.haptic('light');
    }
    
    /**
     * 🔥 EMOJI BURST
     * Burst of emojis (fire, trophy, etc.)
     */
    showEmojiBurst(emoji = '🔥', options = {}) {
        const {
            count = 5,
            duration = 1000,
            originX = 0.5,
            originY = 0.5
        } = options;
        
        const startX = window.innerWidth * originX;
        const startY = window.innerHeight * originY;
        
        for (let i = 0; i < count; i++) {
            const emojiEl = document.createElement('div');
            emojiEl.textContent = emoji;
            emojiEl.style.cssText = `
                position: fixed;
                left: ${startX}px;
                top: ${startY}px;
                font-size: 48px;
                pointer-events: none;
                z-index: 9999;
                animation: emojiBurst ${duration}ms ease-out forwards;
                animation-delay: ${i * 50}ms;
            `;
            
            document.body.appendChild(emojiEl);
            
            // Random direction
            const angle = (Math.random() * 360) * Math.PI / 180;
            const distance = Math.random() * 200 + 100;
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            emojiEl.style.setProperty('--end-x', `${endX}px`);
            emojiEl.style.setProperty('--end-y', `${endY}px`);
            
            setTimeout(() => emojiEl.remove(), duration + i * 50);
        }
        
        this.haptic('medium');
        this.playSound('emoji-burst');
    }
    
    /**
     * 💫 SHOW XP POPUP
     * "+5 XP" floating popup
     */
    showXPPopup(xp, message = '', position = {}) {
        const {
            x = window.innerWidth / 2,
            y = window.innerHeight / 2
        } = position;
        
        const popup = document.createElement('div');
        popup.innerHTML = `
            <div style="font-size: 28px; font-weight: 700; color: #10b981;">+${xp} XP</div>
            ${message ? `<div style="font-size: 16px; color: #fff; margin-top: 4px;">${message}</div>` : ''}
        `;
        popup.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 16px 24px;
            border-radius: 12px;
            pointer-events: none;
            z-index: 9999;
            text-align: center;
            animation: xpPopup 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(popup);
        
        setTimeout(() => popup.remove(), 1500);
        
        this.haptic('light');
    }
    
    /**
     * 🏆 SHOW MILESTONE
     * Large milestone celebration
     */
    showMilestone(title, subtitle = '', icon = '🏆') {
        const milestone = document.createElement('div');
        milestone.innerHTML = `
            <div class="milestone-card">
                <div class="milestone-icon">${icon}</div>
                <div class="milestone-title">${title}</div>
                ${subtitle ? `<div class="milestone-subtitle">${subtitle}</div>` : ''}
            </div>
        `;
        
        milestone.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            z-index: 10000;
            animation: milestoneAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .milestone-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                border-radius: 24px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            }
            .milestone-icon {
                font-size: 80px;
                margin-bottom: 16px;
                animation: iconBounce 1s infinite;
            }
            .milestone-title {
                font-size: 32px;
                font-weight: 800;
                color: #fff;
                margin-bottom: 8px;
            }
            .milestone-subtitle {
                font-size: 18px;
                color: rgba(255, 255, 255, 0.8);
            }
            
            @keyframes milestoneAppear {
                to { transform: translate(-50%, -50%) scale(1); }
            }
            
            @keyframes iconBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(milestone);
        
        // Show confetti
        this.showConfetti({ particleCount: 100, duration: 3000 });
        
        // Remove after 3 seconds
        setTimeout(() => {
            milestone.style.animation = 'milestoneAppear 0.3s ease-out reverse forwards';
            setTimeout(() => {
                milestone.remove();
                style.remove();
            }, 300);
        }, 3000);
        
        this.haptic('heavy');
        this.playSound('milestone');
    }
    
    /**
     * 📳 HAPTIC FEEDBACK
     * iOS-style vibration patterns
     */
    haptic(type = 'light') {
        if (!this.hasHaptics) return;
        
        const patterns = {
            'light': [10],
            'medium': [20],
            'heavy': [30],
            'success': [10, 50, 10],
            'error': [20, 100, 20]
        };
        
        const pattern = patterns[type] || patterns.light;
        navigator.vibrate(pattern);
    }
    
    /**
     * 🔊 PLAY SOUND
     * Sound effects for celebrations
     */
    playSound(soundType) {
        // In production, load actual sound files
        // For now, we'll use the Web Audio API to generate simple beeps
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const soundConfig = {
                'word-save': { freq: 800, duration: 0.1 },
                'celebration': { freq: 1200, duration: 0.2 },
                'emoji-burst': { freq: 1000, duration: 0.15 },
                'milestone': { freq: 1500, duration: 0.3 }
            };
            
            const config = soundConfig[soundType] || soundConfig['word-save'];
            
            oscillator.frequency.value = config.freq;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + config.duration);
        } catch (error) {
            // Silently fail if audio not supported
        }
    }
    
    /**
     * 🎨 GET RANDOM COLOR
     * For confetti particles
     */
    randomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes flashFade {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes xpPopup {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        30% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.2);
        }
        60% {
            transform: translate(-50%, -80%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -120%) scale(0.8);
        }
    }
    
    @keyframes emojiBurst {
        0% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translate(var(--end-x, 0), var(--end-y, 0)) scale(0.5) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Export singleton
const engagementAnimations = new EngagementAnimations();

// Make it globally available
if (typeof window !== 'undefined') {
    window.EngagementAnimations = engagementAnimations;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = engagementAnimations;
}


