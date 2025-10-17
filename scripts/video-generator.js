/**
 * AI Feed: Core Video Generation System
 * Creates actual animated TikTok-style videos with Canvas animation
 * Fixes the critical missing feature identified in CRITICAL_ANALYSIS_REPORT.md
 */

class AIFeedVideoGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;

        // Video specs for TikTok format
        this.VIDEO_WIDTH = 1080;
        this.VIDEO_HEIGHT = 1920;
        this.FPS = 30;
        this.DURATION = 15000; // 15 seconds

        // Character animations
        this.characterAnimations = {
            globe: {
                emoji: '🌍',
                size: 200,
                animations: ['spin', 'bounce', 'glow']
            },
            marco: {
                emoji: '🏃‍♂️',
                size: 180,
                animations: ['run', 'stumble', 'wave']
            },
            sofia: {
                emoji: '📺',
                size: 160,
                animations: ['present', 'interview', 'broadcast']
            },
            superhero_grandma: {
                emoji: '👵',
                size: 170,
                animations: ['fly', 'cook', 'knit']
            }
        };

        this.initializeCanvas();
    }

    initializeCanvas() {
        // Create hidden canvas for video generation
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.VIDEO_WIDTH;
        this.canvas.height = this.VIDEO_HEIGHT;
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        // Set up high quality rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }

    /**
     * Generate actual video from scenario data
     */
    async generateVideo(scenario, character) {
        console.log('🎬 Starting REAL video generation...');

        try {
            // Parse scenario content
            const videoData = this.parseScenario(scenario, character);

            // Create video stream
            const stream = this.canvas.captureStream(this.FPS);

            // Set up MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp9'
            });

            this.recordedChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            // Start recording
            this.mediaRecorder.start();
            this.isRecording = true;

            // Generate Spanish audio
            const audioUrl = await this.generateSpanishAudio(videoData.spanish);

            // Animate the video
            await this.animateScene(videoData, audioUrl);

            // Stop recording and return video
            return new Promise((resolve) => {
                this.mediaRecorder.onstop = () => {
                    const videoBlob = new Blob(this.recordedChunks, {
                        type: 'video/webm'
                    });
                    console.log('✅ Real video generated successfully!', {
                        size: videoBlob.size,
                        type: videoBlob.type,
                        duration: this.DURATION
                    });
                    resolve(videoBlob);
                };
                this.mediaRecorder.stop();
            });

        } catch (error) {
            console.error('❌ Video generation failed:', error);
            throw error;
        }
    }

    /**
     * Parse scenario text into structured video data
     */
    parseScenario(scenario, character) {
        // Extract Spanish phrases using regex
        const spanishMatches = scenario.match(/"([^"]*?)"\s*\(([^)]*?)\)/g) || [];
        const spanishPhrases = spanishMatches.map(match => {
            const [, spanish, english] = match.match(/"([^"]*?)"\s*\(([^)]*?)\)/) || [];
            return { spanish: spanish || '', english: english || '' };
        });

        // Extract character data
        const characterData = this.characterAnimations[character] || this.characterAnimations.globe;

        // Parse scenario content
        const lines = scenario.split('\n').filter(line => line.trim());
        const title = lines[0] || 'AI Feed Video';
        const description = lines.find(line => line.includes('SCENARIO:')) || scenario;

        return {
            character: characterData,
            title,
            description,
            spanish: spanishPhrases,
            background: this.getScenarioBackground(scenario),
            effects: this.getScenarioEffects(scenario)
        };
    }

    /**
     * Generate Spanish text-to-speech audio
     */
    async generateSpanishAudio(spanishPhrases) {
        if (!spanishPhrases || spanishPhrases.length === 0) return null;

        try {
            // Use Web Speech API for Spanish TTS
            const speech = new SpeechSynthesisUtterance();
            speech.lang = 'es-ES';
            speech.rate = 0.8; // Slower for learning
            speech.pitch = 1.0;

            // Combine all Spanish phrases
            const fullText = spanishPhrases.map(p => p.spanish).join('. ');
            speech.text = fullText;

            // Find Spanish voice
            const voices = speechSynthesis.getVoices();
            const spanishVoice = voices.find(voice =>
                voice.lang.includes('es') && voice.name.includes('Google')
            ) || voices.find(voice => voice.lang.includes('es'));

            if (spanishVoice) {
                speech.voice = spanishVoice;
            }

            console.log('🗣️ Generating Spanish audio:', fullText);

            return new Promise((resolve) => {
                speech.onend = () => resolve(speech);
                speech.onerror = () => resolve(null);
                speechSynthesis.speak(speech);

                // Fallback timeout
                setTimeout(() => resolve(null), 5000);
            });

        } catch (error) {
            console.warn('⚠️ Spanish TTS failed, continuing without audio:', error);
            return null;
        }
    }

    /**
     * Animate the complete video scene
     */
    async animateScene(videoData, audioUrl) {
        const frameCount = Math.floor(this.DURATION / 1000 * this.FPS);
        const frameDuration = 1000 / this.FPS;

        console.log('🎭 Animating', frameCount, 'frames at', this.FPS, 'FPS');

        for (let frame = 0; frame < frameCount; frame++) {
            const progress = frame / frameCount;
            const timeMs = frame * frameDuration;

            // Clear canvas
            this.clearCanvas();

            // Draw animated background
            this.drawBackground(videoData.background, progress);

            // Draw animated character
            this.drawCharacter(videoData.character, progress, timeMs);

            // Draw text overlays
            this.drawTextOverlays(videoData, progress, timeMs);

            // Draw effects
            this.drawEffects(videoData.effects, progress, timeMs);

            // Draw branding
            this.drawBranding();

            // Wait for frame timing
            await this.waitForFrame(frameDuration);
        }
    }

    /**
     * Clear canvas with gradient background
     */
    clearCanvas() {
        // TikTok-style gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.VIDEO_HEIGHT);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.VIDEO_WIDTH, this.VIDEO_HEIGHT);
    }

    /**
     * Draw animated background elements
     */
    drawBackground(backgroundType, progress) {
        const centerX = this.VIDEO_WIDTH / 2;
        const centerY = this.VIDEO_HEIGHT / 2;

        // Animated floating elements
        for (let i = 0; i < 8; i++) {
            const angle = (progress * 360 + i * 45) * Math.PI / 180;
            const radius = 100 + Math.sin(progress * Math.PI * 4 + i) * 20;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.ctx.font = '60px serif';
            this.ctx.fillStyle = '#ffffff';

            const emojis = ['⭐', '🎵', '📚', '🎭', '🌟', '💫', '🎪', '🎨'];
            this.ctx.fillText(emojis[i], x, y);
            this.ctx.restore();
        }
    }

    /**
     * Draw animated character
     */
    drawCharacter(characterData, progress, timeMs) {
        const centerX = this.VIDEO_WIDTH / 2;
        const centerY = this.VIDEO_HEIGHT / 2;

        this.ctx.save();

        // Character bounce animation
        const bounceOffset = Math.sin(timeMs / 200) * 20;
        const characterY = centerY + bounceOffset;

        // Character spin animation (for GLOBE)
        if (characterData.animations.includes('spin')) {
            this.ctx.translate(centerX, characterY);
            this.ctx.rotate(progress * Math.PI * 4);
            this.ctx.translate(-centerX, -characterY);
        }

        // Scale animation
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
        this.ctx.scale(scale, scale);

        // Draw character emoji
        this.ctx.font = `${characterData.size}px serif`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;

        this.ctx.strokeText(characterData.emoji, centerX / scale, characterY / scale);
        this.ctx.fillText(characterData.emoji, centerX / scale, characterY / scale);

        this.ctx.restore();
    }

    /**
     * Draw text overlays with animation
     */
    drawTextOverlays(videoData, progress, timeMs) {
        const centerX = this.VIDEO_WIDTH / 2;

        // Title at top
        this.ctx.save();
        this.ctx.font = 'bold 80px Arial';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;

        const titleY = 150;
        const title = videoData.title.substring(0, 30); // Truncate long titles

        this.ctx.strokeText(title, centerX, titleY);
        this.ctx.fillText(title, centerX, titleY);
        this.ctx.restore();

        // Spanish text with timing
        if (videoData.spanish && videoData.spanish.length > 0) {
            const phraseIndex = Math.floor(progress * videoData.spanish.length);
            const currentPhrase = videoData.spanish[phraseIndex];

            if (currentPhrase) {
                // Spanish text
                this.ctx.save();
                this.ctx.font = 'bold 70px Arial';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;

                const spanishY = this.VIDEO_HEIGHT - 400;
                this.ctx.strokeText(currentPhrase.spanish, centerX, spanishY);
                this.ctx.fillText(currentPhrase.spanish, centerX, spanishY);

                // English translation
                this.ctx.font = '50px Arial';
                this.ctx.fillStyle = '#ffff00';
                const englishY = spanishY + 80;
                this.ctx.strokeText(`(${currentPhrase.english})`, centerX, englishY);
                this.ctx.fillText(`(${currentPhrase.english})`, centerX, englishY);

                this.ctx.restore();
            }
        }
    }

    /**
     * Draw special effects
     */
    drawEffects(effects, progress, timeMs) {
        // Sparkle effects
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.VIDEO_WIDTH;
            const y = Math.random() * this.VIDEO_HEIGHT;
            const size = 5 + Math.sin(timeMs / 100 + i) * 3;

            this.ctx.save();
            this.ctx.fillStyle = '#ffff00';
            this.ctx.globalAlpha = 0.7;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Draw AI Feed branding
     */
    drawBranding() {
        // Logo at bottom
        this.ctx.save();
        this.ctx.font = 'bold 40px Arial';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;

        const brandingText = '🎬 AI Feed - Learn Spanish';
        const brandingY = this.VIDEO_HEIGHT - 50;
        const centerX = this.VIDEO_WIDTH / 2;

        this.ctx.strokeText(brandingText, centerX, brandingY);
        this.ctx.fillText(brandingText, centerX, brandingY);
        this.ctx.restore();
    }

    /**
     * Get background type from scenario
     */
    getScenarioBackground(scenario) {
        if (scenario.includes('bank') || scenario.includes('office')) return 'indoor';
        if (scenario.includes('garden') || scenario.includes('outdoor')) return 'outdoor';
        if (scenario.includes('kitchen') || scenario.includes('cooking')) return 'kitchen';
        return 'general';
    }

    /**
     * Get effects from scenario
     */
    getScenarioEffects(scenario) {
        const effects = [];
        if (scenario.includes('magic') || scenario.includes('super')) effects.push('sparkles');
        if (scenario.includes('cooking') || scenario.includes('kitchen')) effects.push('steam');
        if (scenario.includes('flying') || scenario.includes('floating')) effects.push('trails');
        return effects;
    }

    /**
     * Wait for frame timing
     */
    waitForFrame(duration) {
        return new Promise(resolve => setTimeout(resolve, Math.max(0, duration - 5)));
    }

    /**
     * Create downloadable video URL
     */
    createVideoUrl(videoBlob) {
        return URL.createObjectURL(videoBlob);
    }

    /**
     * Download video file
     */
    downloadVideo(videoBlob, filename = 'ai-feed-video.webm') {
        const url = this.createVideoUrl(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

// Global instance for use in HTML
window.AIFeedVideoGenerator = AIFeedVideoGenerator;

console.log('🎬 AI Feed Video Generator loaded successfully!');