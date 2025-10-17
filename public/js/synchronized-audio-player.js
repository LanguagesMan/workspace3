/**
 * 🎵 SYNCHRONIZED AUDIO PLAYER
 * Audio player with real-time caption synchronization
 * Perfect for music lyrics and podcast transcripts
 * 
 * Features:
 * - Word-level caption highlighting
 * - Karaoke-style scrolling
 * - Click word to seek
 * - Speed control
 * - Dual language support (Spanish + English)
 * - Auto-scroll to active caption
 */

class SynchronizedAudioPlayer {
    constructor(audioElement, options = {}) {
        this.audio = audioElement;
        this.captions = [];
        this.currentCaptionIndex = -1;
        this.isPlaying = false;
        this.updateInterval = null;
        
        // Options
        this.options = {
            showTranslation: options.showTranslation !== false,
            autoScroll: options.autoScroll !== false,
            highlightWords: options.highlightWords !== false,
            updateFrequency: options.updateFrequency || 100, // ms
            captionContainer: options.captionContainer || null,
            onCaptionChange: options.onCaptionChange || null,
            onWordHighlight: options.onWordHighlight || null
        };

        this.init();
    }

    /**
     * Initialize player
     */
    init() {
        this.setupAudioListeners();
        console.log('🎵 Synchronized audio player initialized');
    }

    /**
     * Setup audio event listeners
     */
    setupAudioListeners() {
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.startSynchronization();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.stopSynchronization();
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.stopSynchronization();
            this.currentCaptionIndex = -1;
        });

        this.audio.addEventListener('seeking', () => {
            this.updateCurrentCaption();
        });

        this.audio.addEventListener('timeupdate', () => {
            if (!this.updateInterval) {
                this.updateCurrentCaption();
            }
        });
    }

    /**
     * Load captions
     * @param {Array} captions - Array of {start, end, text, translation, words}
     */
    loadCaptions(captions) {
        this.captions = captions.map((caption, index) => ({
            ...caption,
            index,
            element: null
        }));

        console.log(`📝 Loaded ${this.captions.length} captions`);

        if (this.options.captionContainer) {
            this.renderCaptions();
        }
    }

    /**
     * Render captions to container
     */
    renderCaptions() {
        const container = this.options.captionContainer;
        if (!container) return;

        container.innerHTML = '';
        container.className = 'caption-container';

        this.captions.forEach((caption, index) => {
            const captionEl = document.createElement('div');
            captionEl.className = 'caption-line';
            captionEl.dataset.index = index;
            captionEl.dataset.start = caption.start;
            captionEl.dataset.end = caption.end;

            // Spanish text with word-level spans
            const spanishDiv = document.createElement('div');
            spanishDiv.className = 'caption-spanish';
            
            if (this.options.highlightWords && caption.words) {
                // Render word by word
                caption.words.forEach((wordData, wordIndex) => {
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'caption-word';
                    wordSpan.textContent = wordData.word;
                    wordSpan.dataset.wordIndex = wordIndex;
                    wordSpan.dataset.start = wordData.start;
                    wordSpan.dataset.end = wordData.end;
                    
                    // Click word to seek
                    wordSpan.addEventListener('click', () => {
                        this.seekTo(wordData.start);
                    });
                    
                    spanishDiv.appendChild(wordSpan);
                    
                    // Add space
                    if (wordIndex < caption.words.length - 1) {
                        spanishDiv.appendChild(document.createTextNode(' '));
                    }
                });
            } else {
                // Render as plain text
                spanishDiv.textContent = caption.text;
            }

            captionEl.appendChild(spanishDiv);

            // English translation
            if (this.options.showTranslation && caption.translation) {
                const englishDiv = document.createElement('div');
                englishDiv.className = 'caption-english';
                englishDiv.textContent = caption.translation;
                captionEl.appendChild(englishDiv);
            }

            // Click caption to seek
            captionEl.addEventListener('click', () => {
                this.seekTo(caption.start);
            });

            container.appendChild(captionEl);
            caption.element = captionEl;
        });
    }

    /**
     * Start synchronization loop
     */
    startSynchronization() {
        this.stopSynchronization(); // Clear any existing interval

        this.updateInterval = setInterval(() => {
            this.updateCurrentCaption();
        }, this.options.updateFrequency);
    }

    /**
     * Stop synchronization loop
     */
    stopSynchronization() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Update current caption based on audio time
     */
    updateCurrentCaption() {
        const currentTime = this.audio.currentTime;
        
        // Find current caption
        const newIndex = this.captions.findIndex(caption =>
            currentTime >= caption.start && currentTime <= caption.end
        );

        if (newIndex !== this.currentCaptionIndex) {
            // Caption changed
            this.setActiveCaption(newIndex);
        }

        // Update word highlighting if within a caption
        if (newIndex >= 0 && this.options.highlightWords) {
            this.updateWordHighlight(newIndex, currentTime);
        }
    }

    /**
     * Set active caption
     */
    setActiveCaption(index) {
        // Remove previous active caption
        if (this.currentCaptionIndex >= 0 && this.captions[this.currentCaptionIndex]?.element) {
            this.captions[this.currentCaptionIndex].element.classList.remove('active');
            
            // Clear word highlights
            const words = this.captions[this.currentCaptionIndex].element.querySelectorAll('.caption-word');
            words.forEach(word => word.classList.remove('active'));
        }

        this.currentCaptionIndex = index;

        // Activate new caption
        if (index >= 0 && this.captions[index]?.element) {
            this.captions[index].element.classList.add('active');
            
            // Auto-scroll
            if (this.options.autoScroll) {
                this.scrollToCaption(index);
            }

            // Callback
            if (this.options.onCaptionChange) {
                this.options.onCaptionChange(this.captions[index], index);
            }
        }
    }

    /**
     * Update word highlighting within current caption
     */
    updateWordHighlight(captionIndex, currentTime) {
        const caption = this.captions[captionIndex];
        if (!caption?.words || !caption.element) return;

        const words = caption.element.querySelectorAll('.caption-word');
        
        words.forEach((wordEl, wordIndex) => {
            const wordData = caption.words[wordIndex];
            if (!wordData) return;

            const isActive = currentTime >= wordData.start && currentTime <= wordData.end;
            
            if (isActive) {
                wordEl.classList.add('active');
                
                // Callback
                if (this.options.onWordHighlight) {
                    this.options.onWordHighlight(wordData, wordIndex, captionIndex);
                }
            } else {
                wordEl.classList.remove('active');
            }
        });
    }

    /**
     * Scroll to active caption
     */
    scrollToCaption(index) {
        const caption = this.captions[index];
        if (!caption?.element || !this.options.captionContainer) return;

        const container = this.options.captionContainer;
        const element = caption.element;

        // Calculate scroll position to center caption
        const containerHeight = container.clientHeight;
        const elementTop = element.offsetTop;
        const elementHeight = element.clientHeight;
        
        const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);

        container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }

    /**
     * Seek to time
     */
    seekTo(time) {
        this.audio.currentTime = time;
    }

    /**
     * Play audio
     */
    play() {
        return this.audio.play();
    }

    /**
     * Pause audio
     */
    pause() {
        this.audio.pause();
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Set playback speed
     */
    setSpeed(speed) {
        this.audio.playbackRate = speed;
    }

    /**
     * Toggle translation visibility
     */
    toggleTranslation() {
        this.options.showTranslation = !this.options.showTranslation;
        
        if (this.options.captionContainer) {
            const translations = this.options.captionContainer.querySelectorAll('.caption-english');
            translations.forEach(el => {
                el.style.display = this.options.showTranslation ? 'block' : 'none';
            });
        }
    }

    /**
     * Get current caption
     */
    getCurrentCaption() {
        if (this.currentCaptionIndex >= 0) {
            return this.captions[this.currentCaptionIndex];
        }
        return null;
    }

    /**
     * Get all captions
     */
    getAllCaptions() {
        return this.captions;
    }

    /**
     * Destroy player
     */
    destroy() {
        this.stopSynchronization();
        
        if (this.options.captionContainer) {
            this.options.captionContainer.innerHTML = '';
        }

        console.log('🎵 Synchronized audio player destroyed');
    }
}

// Inject default styles
function injectCaptionStyles() {
    if (document.getElementById('synchronized-caption-styles')) return;

    const style = document.createElement('style');
    style.id = 'synchronized-caption-styles';
    style.textContent = `
        .caption-container {
            max-height: 400px;
            overflow-y: auto;
            padding: 20px;
            background: #0a0a0a;
            border-radius: 12px;
            scrollbar-width: thin;
            scrollbar-color: #3a3a3a #0a0a0a;
        }

        .caption-container::-webkit-scrollbar {
            width: 8px;
        }

        .caption-container::-webkit-scrollbar-track {
            background: #0a0a0a;
        }

        .caption-container::-webkit-scrollbar-thumb {
            background: #3a3a3a;
            border-radius: 4px;
        }

        .caption-line {
            padding: 16px;
            margin-bottom: 12px;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid transparent;
        }

        .caption-line:hover {
            background: #1a1a1a;
            border-color: #2a2a2a;
        }

        .caption-line.active {
            background: linear-gradient(135deg, rgba(16, 163, 127, 0.15), rgba(26, 127, 245, 0.15));
            border-color: #10a37f;
            transform: scale(1.02);
        }

        .caption-spanish {
            font-size: 18px;
            line-height: 1.8;
            color: #ffffff;
            margin-bottom: 8px;
        }

        .caption-line.active .caption-spanish {
            font-weight: 600;
        }

        .caption-word {
            display: inline-block;
            padding: 2px 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .caption-word:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .caption-word.active {
            background: linear-gradient(135deg, #10a37f, #1a7ff5);
            color: #ffffff;
            font-weight: 700;
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(16, 163, 127, 0.3);
        }

        .caption-english {
            font-size: 14px;
            color: #808080;
            font-style: italic;
            line-height: 1.6;
        }

        .caption-line.active .caption-english {
            color: #b3b3b3;
        }
    `;

    document.head.appendChild(style);
}

// Auto-inject styles when script loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCaptionStyles);
    } else {
        injectCaptionStyles();
    }
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SynchronizedAudioPlayer;
}

// Global instance for browser
if (typeof window !== 'undefined') {
    window.SynchronizedAudioPlayer = SynchronizedAudioPlayer;
}

