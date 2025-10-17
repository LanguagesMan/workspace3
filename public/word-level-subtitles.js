/**
 * 🎬 DUAL-LANGUAGE CAPTIONS - TikTok/YouTube 2025 Pattern
 * Research: TikTok & YouTube show bilingual captions in real-time
 * Pattern: Spanish + English side-by-side, synchronized with video
 *
 * Implementation based on:
 * - TikTok's auto-captions with word-level timing (2025)
 * - YouTube's dual-language subtitle display
 * - Duolingo's tap-to-translate pattern
 * - 85% of Instagram users watch with sound off - captions essential
 */

class WordLevelSubtitles {
    constructor() {
        this.translationCache = new Map();
        this.currentSubtitleIndex = 0;
        this.subtitles = [];
        this.videoElement = null;
        this.timeUpdateListener = null;
        this.activeContainers = new Map(); // Track active video containers
        this.setupStyles();
    }

    /**
     * 🤖 AI PUNCTUATION SERVICE - YouTube/TikTok 2025 Pattern
     * Adds intelligent punctuation to Spanish transcriptions
     * Based on linguistic context and sentence structure
     *
     * Research: YouTube auto-captions add AI-generated punctuation
     * Pattern: Analyze context (questions, exclamations, statements)
     *
     * @param {string} text - Raw Spanish text without punctuation
     * @returns {string} - Spanish text with AI-added punctuation
     */
    addAIPunctuation(text) {
        if (!text || text.trim().length === 0) return text;

        // Remove existing punctuation for clean processing
        let cleanText = text.trim();

        // Check if already has punctuation
        const hasPunctuation = /[.!?¡¿,;:]$/.test(cleanText);
        if (hasPunctuation) return text; // Already punctuated

        // Convert to lowercase for pattern matching (preserve original for output)
        const lowerText = cleanText.toLowerCase();

        // 🔥 AI PUNCTUATION RULES (Based on Spanish linguistic patterns)

        // Rule 1: Questions (¿...?)
        const questionWords = ['qué', 'cómo', 'cuándo', 'dónde', 'quién', 'cuál', 'por qué', 'cuánto'];
        const isQuestion = questionWords.some(word => lowerText.startsWith(word)) ||
                          lowerText.includes(' no ') && lowerText.length < 50;

        if (isQuestion) {
            // Add inverted question mark at start if not present
            if (!cleanText.startsWith('¿')) {
                cleanText = '¿' + cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
            }
            return cleanText + '?';
        }

        // Rule 2: Exclamations (¡...!)
        const exclamationWords = ['ay', 'oh', 'qué', 'cuánto', 'cómo', 'wow', 'dios', 'madre'];
        const isExclamation = exclamationWords.some(word => lowerText.startsWith(word)) ||
                             lowerText.includes('tan ') || lowerText.includes('muy ') ||
                             lowerText.includes(' calor') || lowerText.includes(' frío');

        if (isExclamation) {
            // Add inverted exclamation mark at start if not present
            if (!cleanText.startsWith('¡')) {
                cleanText = '¡' + cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
            }
            return cleanText + '!';
        }

        // Rule 3: Commands (imperatives) - exclamation
        const commandVerbs = ['mira', 'ven', 'hazlo', 'dime', 'escucha', 'espera', 'corre', 'baila'];
        const isCommand = commandVerbs.some(verb => lowerText.startsWith(verb));

        if (isCommand) {
            return '¡' + cleanText.charAt(0).toUpperCase() + cleanText.slice(1) + '!';
        }

        // Rule 4: Add commas for conjunctions and pauses
        cleanText = cleanText.replace(/ (y|pero|porque|cuando|si|aunque) /g, ', $1 ');

        // Rule 5: Default statement (capitalize + period)
        cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1) + '.';

        return cleanText;
    }

    /**
     * Parse SRT timestamp to seconds
     * Converts "00:00:01,500" to 1.5
     */
    parseTimestamp(timestamp) {
        if (typeof timestamp === 'number') return timestamp;
        if (!timestamp) return 0;

        // Handle HH:MM:SS,mmm format
        const parts = timestamp.split(':');
        if (parts.length === 3) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            const secondsParts = parts[2].split(',');
            const seconds = parseInt(secondsParts[0]);
            const milliseconds = secondsParts[1] ? parseInt(secondsParts[1]) : 0;

            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        }

        return parseFloat(timestamp) || 0;
    }

    /**
     * REAL-TIME SUBTITLE SYNC - TikTok/YouTube 2025 Pattern
     * Attach to video element and sync subtitles with playback
     * @param {HTMLVideoElement} videoElement - The video element
     * @param {Array} subtitles - Array of {start, end, spanish, english}
     * @param {HTMLElement} container - The subtitle container
     */
    attachToVideo(videoElement, subtitles, container) {
        if (!videoElement || !subtitles || !container) return;

        // Store reference with current subtitle tracking
        this.activeContainers.set(videoElement, {
            subtitles,
            container,
            currentSubtitleId: null // Track which subtitle is currently displayed
        });

        // Remove any existing listener
        if (this.timeUpdateListener) {
            videoElement.removeEventListener('timeupdate', this.timeUpdateListener);
        }

        // Real-time subtitle update on timeupdate
        this.timeUpdateListener = () => {
            const currentTime = videoElement.currentTime;
            const data = this.activeContainers.get(videoElement);
            if (!data) return;

            // Find active subtitle for current time
            const activeSubtitle = data.subtitles.find(sub => {
                const startTime = this.parseTimestamp(sub.start);
                const endTime = this.parseTimestamp(sub.end);
                return currentTime >= startTime && currentTime < endTime;
            });

            if (activeSubtitle) {
                // Create unique ID for this subtitle segment
                const subtitleId = `${activeSubtitle.start}-${activeSubtitle.end}`;

                // ONLY update display if subtitle actually changed (prevents flashing!)
                if (data.currentSubtitleId !== subtitleId) {
                    data.currentSubtitleId = subtitleId;

                    // 🤖 AI PUNCTUATION: Add intelligent punctuation to Spanish text (USER REQUEST!)
                    const spanishWithPunctuation = this.addAIPunctuation(activeSubtitle.spanish);

                    // FIXED: Use provided English translation from SRT file (no async delay = no flashing!)
                    const englishTranslation = activeSubtitle.english || activeSubtitle.translation || '';

                    // If English translation exists in SRT, use it directly
                    if (englishTranslation && englishTranslation.length > 0) {
                        this.renderDualCaptions(spanishWithPunctuation, englishTranslation, data.container);
                    } else {
                        // Fallback: Auto-translate if no English provided
                        this.autoTranslateText(spanishWithPunctuation).then(translation => {
                            this.renderDualCaptions(spanishWithPunctuation, translation, data.container);
                        });
                    }
                }
            } else {
                // Clear subtitles if no active subtitle (only if there was one before)
                if (data.currentSubtitleId !== null) {
                    data.currentSubtitleId = null;
                    data.container.innerHTML = '';
                }
            }
        };

        videoElement.addEventListener('timeupdate', this.timeUpdateListener);

        // Cleanup on video end
        videoElement.addEventListener('ended', () => {
            this.activeContainers.delete(videoElement);
        }, { once: true });
    }

    /**
     * Alias for attachToVideo - for backward compatibility
     * Used in index.html line 789
     */
    syncCaptionsToVideo(videoElement, subtitles, container) {
        this.attachToVideo(videoElement, subtitles, container);
    }

    setupStyles() {
        // Inject CSS for dual-language subtitles (TikTok/YouTube 2025 pattern)
        const style = document.createElement('style');
        style.textContent = `
            /* DUAL-LANGUAGE CAPTION CONTAINER - Instagram/TikTok 2025 Safe Zones */
            .subtitle-overlay {
                position: absolute;
                bottom: 320px; /* 2025 Safe Zone: 320px from bottom per Instagram Reels guidelines */
                left: 50%;
                transform: translateX(-50%);
                width: calc(100% - 180px); /* 60px left + 120px right safe zones */
                max-width: 500px;
                z-index: 10;
                pointer-events: none;
            }

            /* Dual-language caption block - Spanish + English stacked (2025 Glassmorphism) */
            .dual-caption-block {
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                padding: 18px 24px;
                border-radius: 20px;
                margin-bottom: 12px;
                pointer-events: auto;
                box-shadow:
                    0 8px 32px rgba(0, 0, 0, 0.6),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.15);
                animation: captionSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes captionSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Spanish text line - with clickable words */
            .caption-spanish {
                font-size: 18px;
                line-height: 1.5;
                color: #ffffff;
                font-weight: 700;
                margin-bottom: 8px;
                text-align: left;
                display: flex;
                align-items: center;
            }

            .caption-spanish::before {
                content: '🇪🇸';
                margin-right: 8px;
                font-size: 16px;
            }

            /* English translation line */
            .caption-english {
                font-size: 16px;
                line-height: 1.4;
                color: rgba(255, 255, 255, 0.85);
                font-weight: 500;
                text-align: left;
                display: flex;
                align-items: center;
            }

            .caption-english::before {
                content: '🇺🇸';
                margin-right: 8px;
                font-size: 16px;
            }

            .subtitle-text {
                flex: 1;
            }

            .clickable-word {
                display: inline-block;
                padding: 2px 4px;
                margin: 0 2px;
                cursor: pointer;
                transition: all 0.2s ease;
                border-radius: 4px;
                position: relative;
            }

            .clickable-word:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }

            .clickable-word:active {
                transform: scale(0.95);
            }

            .clickable-word.translated {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                animation: translatePulse 0.3s ease;
            }

            @keyframes translatePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .clickable-word.word-saved {
                background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
                box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
            }

            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-10px);
                }
            }

            .word-translation-popup {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(-8px);
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 14px;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                animation: popupFadeIn 0.2s ease forwards;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 100;
            }

            .word-translation-popup::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.95);
            }

            @keyframes popupFadeIn {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-4px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(-8px);
                }
            }

            .word-translation-popup .english {
                font-weight: 700;
                color: #4ade80;
            }

            .word-translation-popup .context {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Display DUAL-LANGUAGE captions (Spanish + English) - YouTube/TikTok 2025 Pattern
     * @param {string} spanishText - The Spanish text with AI punctuation
     * @param {string} englishText - The English translation
     * @param {HTMLElement} container - The container to render into
     */
    renderDualCaptions(spanishText, englishText, container) {
        if (!spanishText || !container) return;

        // Clear container
        container.innerHTML = '';

        // Create caption overlay
        const overlay = document.createElement('div');
        overlay.className = 'subtitle-overlay';

        // Create dual-caption block
        const captionBlock = document.createElement('div');
        captionBlock.className = 'dual-caption-block';

        // Spanish line with clickable words
        const spanishLine = document.createElement('div');
        spanishLine.className = 'caption-spanish';

        const spanishTextContainer = document.createElement('div');
        spanishTextContainer.className = 'subtitle-text';
        this.makeWordsClickable(spanishText, spanishTextContainer);
        spanishLine.appendChild(spanishTextContainer);

        // English translation line
        const englishLine = document.createElement('div');
        englishLine.className = 'caption-english';
        const englishTextContainer = document.createElement('div');
        englishTextContainer.className = 'subtitle-text';
        englishTextContainer.textContent = englishText || '(Translation loading...)';
        englishLine.appendChild(englishTextContainer);

        // Assemble
        captionBlock.appendChild(spanishLine);
        captionBlock.appendChild(englishLine);
        overlay.appendChild(captionBlock);
        container.appendChild(overlay);
    }

    /**
     * Make Spanish text clickable for word-level translation
     * @param {string} spanishText - The Spanish text to make clickable
     * @param {HTMLElement} textContainer - The text container element
     */
    makeWordsClickable(spanishText, textContainer) {
        // Split into words and create clickable spans
        const words = spanishText.split(/(\s+)/); // Keep whitespace

        words.forEach(wordWithSpace => {
            const trimmed = wordWithSpace.trim();

            if (!trimmed) {
                // It's just whitespace
                textContainer.appendChild(document.createTextNode(wordWithSpace));
                return;
            }

            // Create clickable word span
            const wordSpan = document.createElement('span');
            wordSpan.className = 'clickable-word';
            wordSpan.textContent = trimmed;
            wordSpan.dataset.spanish = trimmed;

            // Add click handler
            wordSpan.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.translateWord(wordSpan, trimmed);
            });

            textContainer.appendChild(wordSpan);

            // Add back whitespace
            if (wordWithSpace !== trimmed) {
                textContainer.appendChild(document.createTextNode(' '));
            }
        });
    }

    /**
     * Legacy method - backwards compatible
     * @param {string} spanishText - The Spanish text to make clickable
     * @param {HTMLElement} container - The container to render into
     */
    makeClickable(spanishText, container) {
        // Auto-translate Spanish text to English
        this.autoTranslateText(spanishText).then(englishText => {
            this.renderDualCaptions(spanishText, englishText, container);
        });
    }

    /**
     * Auto-translate full Spanish text to English using API
     * @param {string} spanishText - Full Spanish text
     * @returns {Promise<string>} English translation
     */
    async autoTranslateText(spanishText) {
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: spanishText,
                    from: 'es',
                    to: 'en'
                })
            });

            const data = await response.json();
            return data.success ? data.translation : spanishText;
        } catch (error) {
            console.error('Auto-translation error:', error);
            return ''; // Return empty on error
        }
    }

    /**
     * Translate a word and show popup (TikTok pattern)
     * UPDATED: Now saves words to unified database via /api/words/learned
     */
    async translateWord(wordElement, spanishWord) {
        // Remove punctuation for translation
        const cleanWord = spanishWord.replace(/[¿?!¡.,;:()]/g, '').toLowerCase();

        // Check cache first
        if (this.translationCache.has(cleanWord)) {
            const cachedTranslation = this.translationCache.get(cleanWord);
            this.showTranslation(wordElement, cachedTranslation);

            // Save word to database (even if cached)
            await this.saveWordToDatabase(cleanWord, cachedTranslation.english, wordElement);
            return;
        }

        // Mark as being translated
        wordElement.classList.add('translated');

        try {
            // Call translation API
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: cleanWord,
                    from: 'es',
                    to: 'en'
                })
            });

            const data = await response.json();

            if (data.success) {
                const translation = {
                    english: data.translation,
                    context: data.context || ''
                };

                // Cache it
                this.translationCache.set(cleanWord, translation);

                // Show popup
                this.showTranslation(wordElement, translation);

                // CRITICAL: Save word to unified database
                await this.saveWordToDatabase(cleanWord, translation.english, wordElement);

                // Track engagement (TikTok analytics pattern)
                this.trackWordClick(cleanWord);
            }
        } catch (error) {
            console.error('Translation error:', error);
            this.showTranslation(wordElement, {
                english: '❌ Translation failed',
                context: 'Please try again'
            });
        }
    }

    /**
     * Save word to unified database via /api/words/learned
     * Pattern: Duolingo + Anki - track learned words for SRS
     */
    async saveWordToDatabase(spanishWord, englishTranslation, wordElement) {
        try {
            const response = await fetch('/api/words/learned', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-demo', // Demo user for now
                    word: spanishWord,
                    translation: englishTranslation,
                    context: 'video-subtitle' // Track where word was learned
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log(`✅ Word saved: ${spanishWord} = ${englishTranslation}`);

                // Visual feedback: Add "saved" class with animation
                wordElement.classList.add('word-saved');

                // Show brief "Saved!" indicator
                const savedIndicator = document.createElement('span');
                savedIndicator.textContent = ' ✓';
                savedIndicator.style.cssText = 'color: #4ade80; font-weight: bold; animation: fadeOut 1s ease forwards;';
                wordElement.appendChild(savedIndicator);

                setTimeout(() => savedIndicator.remove(), 1000);
            } else {
                console.warn(`⚠️ Failed to save word: ${spanishWord}`);
            }
        } catch (error) {
            console.error('Word save error:', error);
        }
    }

    /**
     * Show translation popup above word (TikTok tooltip pattern)
     */
    showTranslation(wordElement, translation) {
        // Remove any existing popups
        const existingPopup = wordElement.querySelector('.word-translation-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'word-translation-popup';
        popup.innerHTML = `
            <div class="english">${translation.english}</div>
            ${translation.context ? `<div class="context">${translation.context}</div>` : ''}
        `;

        wordElement.appendChild(popup);

        // Auto-hide after 3 seconds (TikTok pattern)
        setTimeout(() => {
            if (popup.parentElement) {
                popup.style.animation = 'popupFadeIn 0.2s ease reverse';
                setTimeout(() => popup.remove(), 200);
            }
        }, 3000);
    }

    /**
     * Track word click for analytics (TikTok engagement tracking)
     */
    trackWordClick(word) {
        // Save to localStorage for analytics
        const clicks = JSON.parse(localStorage.getItem('wordClicks') || '{}');
        clicks[word] = (clicks[word] || 0) + 1;
        localStorage.setItem('wordClicks', JSON.stringify(clicks));

        // Also track in engagement system
        if (typeof feed !== 'undefined' && feed.trackEngagement) {
            feed.trackEngagement('word-translation');
        }
    }

    /**
     * Get most clicked words (for SRS system)
     */
    getMostClickedWords(limit = 10) {
        const clicks = JSON.parse(localStorage.getItem('wordClicks') || '{}');
        return Object.entries(clicks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word, count]) => ({ word, count }));
    }
}

// Export for use in unified-infinite-feed.html
if (typeof window !== 'undefined') {
    window.WordLevelSubtitles = WordLevelSubtitles;
}
