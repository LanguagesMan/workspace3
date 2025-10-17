/**
 * 🌐 INLINE TRANSLATION SERVICE
 * Click/hover to translate any word in Spanish content
 * 
 * Features:
 * - Instant word translation
 * - Context-aware translations
 * - Save words to vocabulary
 * - Multiple translation providers
 * - Offline dictionary fallback
 * - Visual word highlighting
 */

class InlineTranslationService {
    constructor() {
        this.translationCache = new Map();
        this.activeTooltip = null;
        this.currentHighlights = [];
        this.savedWords = new Set();
        this.provider = 'libre'; // 'libre', 'google', 'deepl', 'dictionary'
        
        // Common Spanish-English dictionary (fallback)
        this.dictionary = this.loadDictionary();
        
        this.init();
    }

    /**
     * Initialize translation service
     */
    init() {
        // Load saved words from localStorage
        this.loadSavedWords();
        
        // Setup styles
        this.injectStyles();
    }

    /**
     * Make text translatable by wrapping words in spans
     * @param {string} text - Spanish text
     * @param {HTMLElement} container - Container element
     * @returns {HTMLElement} Container with translatable text
     */
    makeTranslatable(text, container) {
        // Split text into words while preserving spaces and punctuation
        const words = this.tokenize(text);
        
        container.innerHTML = '';
        
        words.forEach(token => {
            if (token.type === 'word') {
                const span = document.createElement('span');
                span.className = 'translatable-word';
                span.textContent = token.text;
                span.dataset.word = token.text.toLowerCase();
                
                // Check if word is saved
                if (this.savedWords.has(token.text.toLowerCase())) {
                    span.classList.add('saved-word');
                }
                
                // Add click handler
                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showTranslation(token.text, span);
                });
                
                container.appendChild(span);
            } else {
                // Punctuation or whitespace
                container.appendChild(document.createTextNode(token.text));
            }
        });
        
        return container;
    }

    /**
     * Tokenize text into words and punctuation
     */
    tokenize(text) {
        const tokens = [];
        const regex = /(\w+)|([^\w])/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            if (match[1]) {
                tokens.push({ type: 'word', text: match[1] });
            } else if (match[2]) {
                tokens.push({ type: 'other', text: match[2] });
            }
        }
        
        return tokens;
    }

    /**
     * Show translation tooltip for a word
     * @param {string} word - Spanish word
     * @param {HTMLElement} element - Word element
     */
    async showTranslation(word, element) {
        // Close existing tooltip
        this.closeTooltip();
        
        // Highlight word
        element.classList.add('active-word');
        
        // Get translation
        const translation = await this.translate(word);
        
        // Create tooltip
        const tooltip = this.createTooltip(word, translation, element);
        
        // Position tooltip
        this.positionTooltip(tooltip, element);
        
        // Add to DOM
        document.body.appendChild(tooltip);
        this.activeTooltip = tooltip;
        
        // Animate in
        setTimeout(() => tooltip.classList.add('visible'), 10);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', this.closeTooltip.bind(this), { once: true });
        }, 100);
    }

    /**
     * Create translation tooltip element
     */
    createTooltip(word, translation, wordElement) {
        const tooltip = document.createElement('div');
        tooltip.className = 'translation-tooltip';
        
        const isSaved = this.savedWords.has(word.toLowerCase());
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-word">${word}</span>
                <button class="tooltip-close" onclick="window.translationService.closeTooltip()">×</button>
            </div>
            <div class="tooltip-translation">${translation}</div>
            <div class="tooltip-actions">
                <button class="tooltip-btn save-btn ${isSaved ? 'saved' : ''}" 
                        onclick="window.translationService.toggleSaveWord('${word}', '${translation}', this)">
                    ${isSaved ? '✓ Saved' : '💾 Save Word'}
                </button>
                <button class="tooltip-btn speak-btn" 
                        onclick="window.translationService.speakWord('${word}')">
                    🔊 Listen
                </button>
            </div>
        `;
        
        return tooltip;
    }

    /**
     * Position tooltip near word
     */
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Default: below word
        let top = rect.bottom + window.scrollY + 8;
        let left = rect.left + window.scrollX;
        
        // Check if tooltip goes off-screen
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 20;
        }
        
        if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
            // Show above word instead
            top = rect.top + window.scrollY - tooltipRect.height - 8;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    /**
     * Close active tooltip
     */
    closeTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
        
        // Remove active word highlighting
        document.querySelectorAll('.active-word').forEach(el => {
            el.classList.remove('active-word');
        });
    }

    /**
     * Translate a word
     * @param {string} word - Spanish word
     * @returns {Promise<string>} English translation
     */
    async translate(word) {
        const normalized = word.toLowerCase();
        
        // Check cache
        if (this.translationCache.has(normalized)) {
            return this.translationCache.get(normalized);
        }
        
        try {
            let translation;
            
            // Try API translation
            if (this.provider === 'libre') {
                translation = await this.translateWithLibre(word);
            } else if (this.provider === 'google') {
                translation = await this.translateWithGoogle(word);
            }
            
            // Fallback to dictionary
            if (!translation) {
                translation = this.dictionary[normalized] || `[Translation: ${word}]`;
            }
            
            // Cache translation
            this.translationCache.set(normalized, translation);
            
            return translation;
            
        } catch (error) {
            console.error('Translation error:', error);
            
            // Fallback to dictionary
            return this.dictionary[normalized] || `[Translation unavailable]`;
        }
    }

    /**
     * Translate with LibreTranslate API
     */
    async translateWithLibre(word) {
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: word,
                    sourceLang: 'es',
                    targetLang: 'en'
                })
            });
            
            const data = await response.json();
            return data.translation || null;
        } catch (error) {
            console.error('LibreTranslate error:', error);
            return null;
        }
    }

    /**
     * Translate with Google Translate API
     */
    async translateWithGoogle(word) {
        try {
            const response = await fetch(`/api/translate/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: word,
                    targetLang: 'en'
                })
            });
            
            const data = await response.json();
            return data.translation || null;
        } catch (error) {
            console.error('Google Translate error:', error);
            return null;
        }
    }

    /**
     * Toggle save word to vocabulary
     */
    async toggleSaveWord(word, translation, button) {
        const normalized = word.toLowerCase();
        
        if (this.savedWords.has(normalized)) {
            // Remove from saved
            this.savedWords.delete(normalized);
            button.classList.remove('saved');
            button.innerHTML = '💾 Save Word';
            
            // Remove visual highlight
            document.querySelectorAll(`[data-word="${normalized}"]`).forEach(el => {
                el.classList.remove('saved-word');
            });
            
            // Remove from server
            await this.removeSavedWord(word);
            
        } else {
            // Add to saved
            this.savedWords.add(normalized);
            button.classList.add('saved');
            button.innerHTML = '✓ Saved';
            
            // Add visual highlight
            document.querySelectorAll(`[data-word="${normalized}"]`).forEach(el => {
                el.classList.add('saved-word');
            });
            
            // Save to server
            await this.saveToVocabulary(word, translation);
        }
        
        // Update localStorage
        this.saveSavedWords();
    }

    /**
     * Save word to vocabulary (server)
     */
    async saveToVocabulary(word, translation) {
        try {
            const userId = localStorage.getItem('userId') || 'guest';
            
            const response = await fetch('/api/vocabulary/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    word,
                    translation,
                    sourceType: 'inline',
                    context: window.location.pathname
                })
            });
            
            const data = await response.json();
            console.log('✅ Saved word to vocabulary:', word);
            return data;
            
        } catch (error) {
            console.error('Error saving to vocabulary:', error);
        }
    }

    /**
     * Remove word from vocabulary (server)
     */
    async removeSavedWord(word) {
        try {
            const userId = localStorage.getItem('userId') || 'guest';
            
            await fetch('/api/vocabulary/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, word })
            });
            
            console.log('🗑️ Removed word from vocabulary:', word);
            
        } catch (error) {
            console.error('Error removing from vocabulary:', error);
        }
    }

    /**
     * Speak word using TTS
     */
    async speakWord(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Load saved words from localStorage
     */
    loadSavedWords() {
        try {
            const saved = localStorage.getItem('savedWords');
            if (saved) {
                this.savedWords = new Set(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved words:', error);
        }
    }

    /**
     * Save words to localStorage
     */
    saveSavedWords() {
        try {
            localStorage.setItem('savedWords', JSON.stringify([...this.savedWords]));
        } catch (error) {
            console.error('Error saving words:', error);
        }
    }

    /**
     * Load basic Spanish-English dictionary
     */
    loadDictionary() {
        return {
            // Common verbs
            'ser': 'to be',
            'estar': 'to be',
            'tener': 'to have',
            'hacer': 'to do/make',
            'poder': 'can/to be able',
            'decir': 'to say',
            'ir': 'to go',
            'ver': 'to see',
            'dar': 'to give',
            'saber': 'to know',
            'querer': 'to want',
            'llegar': 'to arrive',
            'poner': 'to put',
            'parecer': 'to seem',
            'dejar': 'to leave',
            'hablar': 'to speak',
            'gustar': 'to like',
            'comenzar': 'to begin',
            'encontrar': 'to find',
            'vivir': 'to live',
            
            // Common nouns
            'casa': 'house',
            'tiempo': 'time',
            'día': 'day',
            'vida': 'life',
            'persona': 'person',
            'año': 'year',
            'vez': 'time/occasion',
            'mujer': 'woman',
            'hombre': 'man',
            'ciudad': 'city',
            'país': 'country',
            'mundo': 'world',
            'familia': 'family',
            'amigo': 'friend',
            'trabajo': 'work',
            'escuela': 'school',
            'agua': 'water',
            'comida': 'food',
            'coche': 'car',
            'libro': 'book',
            
            // Common adjectives
            'bueno': 'good',
            'grande': 'big',
            'pequeño': 'small',
            'nuevo': 'new',
            'viejo': 'old',
            'mejor': 'better',
            'peor': 'worse',
            'joven': 'young',
            'feliz': 'happy',
            'triste': 'sad',
            'hermoso': 'beautiful',
            'fácil': 'easy',
            'difícil': 'difficult',
            'importante': 'important',
            'largo': 'long',
            'corto': 'short',
            
            // Common adverbs/prepositions
            'muy': 'very',
            'más': 'more',
            'menos': 'less',
            'bien': 'well',
            'mal': 'badly',
            'aquí': 'here',
            'allí': 'there',
            'ahora': 'now',
            'después': 'after',
            'antes': 'before',
            'siempre': 'always',
            'nunca': 'never',
            'también': 'also',
            'con': 'with',
            'sin': 'without',
            'para': 'for',
            'por': 'for/by',
            'desde': 'from/since',
            'hasta': 'until',
            'sobre': 'about/on'
        };
    }

    /**
     * Inject CSS styles for translation UI
     */
    injectStyles() {
        if (document.getElementById('inline-translation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'inline-translation-styles';
        style.textContent = `
            .translatable-word {
                cursor: pointer;
                border-bottom: 1px dashed transparent;
                transition: all 0.2s;
                padding: 2px 0;
            }
            
            .translatable-word:hover {
                border-bottom-color: #10a37f;
                background: rgba(16, 163, 127, 0.1);
            }
            
            .translatable-word.active-word {
                background: rgba(16, 163, 127, 0.2);
                border-bottom-color: #10a37f;
            }
            
            .translatable-word.saved-word {
                background: rgba(139, 92, 246, 0.15);
                border-bottom: 2px solid #8b5cf6;
                font-weight: 500;
            }
            
            .translation-tooltip {
                position: absolute;
                background: #1e1e1e;
                border: 1px solid #3a3a3a;
                border-radius: 12px;
                padding: 16px;
                min-width: 250px;
                max-width: 350px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                z-index: 10000;
                opacity: 0;
                transform: translateY(-4px);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .translation-tooltip.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .tooltip-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .tooltip-word {
                font-size: 18px;
                font-weight: 600;
                color: #ffffff;
            }
            
            .tooltip-close {
                background: none;
                border: none;
                color: #808080;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .tooltip-close:hover {
                color: #ffffff;
            }
            
            .tooltip-translation {
                color: #b3b3b3;
                font-size: 15px;
                margin-bottom: 12px;
                line-height: 1.5;
            }
            
            .tooltip-actions {
                display: flex;
                gap: 8px;
            }
            
            .tooltip-btn {
                flex: 1;
                padding: 8px 12px;
                background: #2a2a2a;
                border: 1px solid #3a3a3a;
                border-radius: 6px;
                color: #b3b3b3;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            
            .tooltip-btn:hover {
                background: #3a3a3a;
                color: #ffffff;
            }
            
            .tooltip-btn.save-btn.saved {
                background: #8b5cf6;
                border-color: #8b5cf6;
                color: #ffffff;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.InlineTranslationService = InlineTranslationService;
    window.translationService = new InlineTranslationService();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InlineTranslationService;
}

