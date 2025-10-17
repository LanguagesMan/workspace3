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
     * REAL-TIME SUBTITLE SYNC - TikTok/YouTube 2025 Pattern
     * Attach to video element and sync subtitles with playback
     * @param {HTMLVideoElement} videoElement - The video element
     * @param {Array} subtitles - Array of {start, end, spanish, english}
     * @param {HTMLElement} container - The subtitle container
     */
    attachToVideo(videoElement, subtitles, container) {
        if (!videoElement || !subtitles || !container) return;

        // CRITICAL FIX: Check if already attached (prevents duplicate listeners)
        if (videoElement.dataset.subtitlesAttached === 'true') {
            console.log('⚠️ Subtitles already attached to this video, skipping');
            return;
        }

        // Mark as attached
        videoElement.dataset.subtitlesAttached = 'true';

        // Store reference with current subtitle index
        const videoData = {
            subtitles,
            container,
            currentIndex: -1,  // Track which subtitle is currently displayed
            listener: null     // Store unique listener per video
        };

        this.activeContainers.set(videoElement, videoData);

        // Create unique listener for this specific video
        videoData.listener = () => {
            const currentTime = videoElement.currentTime;
            const data = this.activeContainers.get(videoElement);
            if (!data) return;

            // Find active subtitle for current time
            const activeSubtitleIndex = data.subtitles.findIndex(
                sub => currentTime >= sub.start && currentTime < sub.end
            );

            // CRITICAL FIX: Only update if subtitle changed (prevents flashing)
            if (activeSubtitleIndex !== data.currentIndex) {
                data.currentIndex = activeSubtitleIndex;

                if (activeSubtitleIndex >= 0) {
                    const activeSubtitle = data.subtitles[activeSubtitleIndex];
                    // Update display with Spanish + English
                    this.renderDualCaptions(activeSubtitle.spanish, activeSubtitle.english, data.container);
                } else {
                    // Clear subtitles if no active subtitle
                    data.container.innerHTML = '';
                }
            }
        };

        videoElement.addEventListener('timeupdate', videoData.listener);

        // Cleanup on video end and pause
        const cleanup = () => {
            if (videoData.listener) {
                videoElement.removeEventListener('timeupdate', videoData.listener);
            }
            this.activeContainers.delete(videoElement);
            videoElement.dataset.subtitlesAttached = 'false';
        };

        videoElement.addEventListener('ended', cleanup, { once: true });

        // Also cleanup when video is removed from DOM
        const observer = new MutationObserver((mutations) => {
            if (!document.body.contains(videoElement)) {
                cleanup();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    setupStyles() {
        // Inject CSS for dual-language subtitles (TikTok/YouTube 2025 pattern)
        const style = document.createElement('style');
        style.textContent = `
            /* DUAL-LANGUAGE CAPTION CONTAINER - YouTube/TikTok 2025 */
            .subtitle-overlay,
            .video-subtitle-container {
                position: absolute;
                bottom: 120px; /* Above controls */
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 500px;
                z-index: 10;
                pointer-events: none;
            }

            /* Dual-language caption block - Spanish + English stacked */
            .dual-caption-block {
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 16px 20px;
                border-radius: 16px;
                margin-bottom: 8px;
                pointer-events: auto;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                /* NO ANIMATION - smooth transitions only, per user request */
                transition: opacity 0.2s ease;
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
