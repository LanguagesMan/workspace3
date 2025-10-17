/**
 * 🔊 TEXT-TO-SPEECH SERVICE
 * Multi-provider TTS for language learning content
 * 
 * Features:
 * - Web Speech API (browser-based, free)
 * - Multiple Spanish voices
 * - Playback controls (play, pause, resume, stop)
 * - Speed control
 * - Word highlighting during playback
 * - Sentence-by-sentence playback
 */

class TTSService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.isPaused = false;
        this.isPlaying = false;
        this.currentText = '';
        this.currentIndex = 0;
        this.sentences = [];
        this.onWordCallback = null;
        this.onSentenceCallback = null;
        this.onEndCallback = null;
        
        // TTS settings
        this.settings = {
            voice: null,
            rate: 1.0,  // Speed (0.5 - 2.0)
            pitch: 1.0, // Pitch (0 - 2)
            volume: 1.0, // Volume (0 - 1)
            lang: 'es-ES' // Spanish
        };

        this.init();
    }

    /**
     * Initialize TTS service and load voices
     */
    async init() {
        // Wait for voices to be loaded
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.loadVoices();
            };
        }

        // Try loading voices immediately
        this.loadVoices();
    }

    /**
     * Load available Spanish voices
     */
    loadVoices() {
        const voices = this.synth.getVoices();
        const spanishVoices = voices.filter(voice => 
            voice.lang.startsWith('es')
        );

        console.log('📢 Available Spanish voices:', spanishVoices.length);
        
        if (spanishVoices.length > 0) {
            // Prefer high-quality voices
            const preferredVoice = spanishVoices.find(v => 
                v.name.includes('Premium') || 
                v.name.includes('Enhanced') ||
                v.name.includes('Google')
            ) || spanishVoices[0];

            this.settings.voice = preferredVoice;
            console.log('✅ Selected voice:', preferredVoice.name);
        } else {
            console.warn('⚠️ No Spanish voices available');
        }

        return spanishVoices;
    }

    /**
     * Speak text with word-level callbacks
     * @param {string} text - Text to speak
     * @param {Object} options - TTS options
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Stop any current speech
            this.stop();

            this.currentText = text;
            this.isPlaying = true;
            this.isPaused = false;

            // Merge options with settings
            const settings = { ...this.settings, ...options };

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = settings.voice;
            utterance.rate = settings.rate;
            utterance.pitch = settings.pitch;
            utterance.volume = settings.volume;
            utterance.lang = settings.lang;

            // Event listeners
            utterance.onstart = () => {
                console.log('🔊 TTS started');
            };

            utterance.onend = () => {
                console.log('✅ TTS completed');
                this.isPlaying = false;
                if (this.onEndCallback) {
                    this.onEndCallback();
                }
                resolve();
            };

            utterance.onerror = (error) => {
                console.error('❌ TTS error:', error);
                this.isPlaying = false;
                reject(error);
            };

            utterance.onpause = () => {
                this.isPaused = true;
            };

            utterance.onresume = () => {
                this.isPaused = false;
            };

            // Word boundary events (for highlighting)
            utterance.onboundary = (event) => {
                if (event.name === 'word') {
                    const word = text.substr(event.charIndex, event.charLength);
                    if (this.onWordCallback) {
                        this.onWordCallback(word, event.charIndex, event.charLength);
                    }
                }
            };

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
        });
    }

    /**
     * Speak text sentence by sentence
     * @param {string} text - Text to speak
     * @param {Function} onSentence - Callback for each sentence
     */
    async speakSentences(text, onSentence = null) {
        // Split into sentences
        this.sentences = this.splitIntoSentences(text);
        this.currentIndex = 0;
        this.onSentenceCallback = onSentence;

        console.log(`🔊 Speaking ${this.sentences.length} sentences`);

        // Speak each sentence
        for (let i = 0; i < this.sentences.length; i++) {
            this.currentIndex = i;
            const sentence = this.sentences[i];

            // Call sentence callback
            if (this.onSentenceCallback) {
                this.onSentenceCallback(sentence, i);
            }

            // Speak sentence
            try {
                await this.speak(sentence);
                
                // Small pause between sentences
                await this.sleep(300);
            } catch (error) {
                console.error('Error speaking sentence:', error);
                break;
            }

            // Check if stopped
            if (!this.isPlaying) {
                break;
            }
        }
    }

    /**
     * Split text into sentences
     */
    splitIntoSentences(text) {
        // Split on sentence endings, preserve the punctuation
        const sentences = text
            .replace(/([.!?])\s+/g, '$1|')
            .split('|')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        return sentences;
    }

    /**
     * Pause current speech
     */
    pause() {
        if (this.isPlaying && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
            console.log('⏸️ TTS paused');
        }
    }

    /**
     * Resume paused speech
     */
    resume() {
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
            console.log('▶️ TTS resumed');
        }
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.isPlaying || this.isPaused) {
            this.synth.cancel();
            this.isPlaying = false;
            this.isPaused = false;
            this.currentUtterance = null;
            console.log('⏹️ TTS stopped');
        }
    }

    /**
     * Set playback speed
     * @param {number} rate - Speed (0.5 - 2.0)
     */
    setSpeed(rate) {
        this.settings.rate = Math.max(0.5, Math.min(2.0, rate));
        console.log('⚡ TTS speed:', this.settings.rate);
    }

    /**
     * Set voice by name or index
     * @param {string|number} voice - Voice name or index
     */
    setVoice(voice) {
        const voices = this.synth.getVoices();
        const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

        if (typeof voice === 'number') {
            this.settings.voice = spanishVoices[voice];
        } else {
            const foundVoice = spanishVoices.find(v => v.name === voice);
            if (foundVoice) {
                this.settings.voice = foundVoice;
            }
        }

        console.log('🎤 TTS voice:', this.settings.voice?.name);
    }

    /**
     * Get available Spanish voices
     */
    getVoices() {
        const voices = this.synth.getVoices();
        return voices.filter(v => v.lang.startsWith('es'));
    }

    /**
     * Set callback for word highlighting
     * @param {Function} callback - (word, charIndex, charLength) => {}
     */
    onWord(callback) {
        this.onWordCallback = callback;
    }

    /**
     * Set callback for sentence highlighting
     * @param {Function} callback - (sentence, index) => {}
     */
    onSentence(callback) {
        this.onSentenceCallback = callback;
    }

    /**
     * Set callback for speech end
     * @param {Function} callback - () => {}
     */
    onEnd(callback) {
        this.onEndCallback = callback;
    }

    /**
     * Helper: Sleep for milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if TTS is supported
     */
    isSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            currentText: this.currentText,
            currentIndex: this.currentIndex,
            totalSentences: this.sentences.length,
            settings: this.settings
        };
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TTSService;
}

// Global instance for browser use
if (typeof window !== 'undefined') {
    window.TTSService = TTSService;
}
