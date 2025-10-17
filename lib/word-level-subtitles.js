// 🎯 WORD-LEVEL SUBTITLES SYSTEM - The KILLER Feature
// Tap any word to see translation instantly while video plays

class WordLevelSubtitles {
    constructor(videoElement) {
        this.video = videoElement;
        this.subtitles = [];
        this.currentSubtitle = null;
        this.translationCache = new Map();
        this.isPlaying = false;
    }

    // 📝 LOAD SUBTITLES WITH WORD-LEVEL TIMESTAMPS
    loadSubtitles(subtitles) {
        this.subtitles = subtitles.map(sub => ({
            start: sub.start,
            end: sub.end,
            text: sub.text,
            words: sub.words.map(w => ({
                word: w.word,
                start: w.start,
                end: w.end,
                translation: w.translation || null,
                cleanWord: this.cleanWord(w.word)
            }))
        }));
    }

    // 🎬 START SUBTITLE SYNC
    startSync() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        this.video.addEventListener('timeupdate', () => {
            this.updateSubtitles();
        });

        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
        });

        this.video.addEventListener('play', () => {
            this.isPlaying = true;
        });
    }

    // 📊 UPDATE SUBTITLES BASED ON VIDEO TIME
    updateSubtitles() {
        const currentTime = this.video.currentTime;

        // Find active subtitle
        const activeSubtitle = this.subtitles.find(
            sub => currentTime >= sub.start && currentTime <= sub.end
        );

        if (activeSubtitle && activeSubtitle !== this.currentSubtitle) {
            this.currentSubtitle = activeSubtitle;
            this.displaySubtitle(activeSubtitle);
            this.highlightActiveWord(activeSubtitle, currentTime);
        } else if (!activeSubtitle) {
            this.currentSubtitle = null;
            this.hideSubtitle();
        } else if (activeSubtitle) {
            // Update word highlighting
            this.highlightActiveWord(activeSubtitle, currentTime);
        }
    }

    // 🎨 DISPLAY SUBTITLE WITH WORD-LEVEL ELEMENTS
    displaySubtitle(subtitle) {
        const container = document.getElementById('subtitle-container');
        if (!container) return;

        container.innerHTML = '';

        subtitle.words.forEach((wordData, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'subtitle-word';
            wordSpan.textContent = wordData.word;
            wordSpan.setAttribute('data-word-index', index);
            wordSpan.setAttribute('data-translation', wordData.translation || '');
            wordSpan.setAttribute('data-clean-word', wordData.cleanWord);

            // Tap to translate
            wordSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showWordTranslation(wordData, wordSpan);
                this.trackWordClick(wordData);
            });

            container.appendChild(wordSpan);

            // Add space between words
            if (index < subtitle.words.length - 1) {
                container.appendChild(document.createTextNode(' '));
            }
        });

        container.classList.add('active');
    }

    // ✨ HIGHLIGHT CURRENTLY SPOKEN WORD
    highlightActiveWord(subtitle, currentTime) {
        const activeWord = subtitle.words.find(
            w => currentTime >= w.start && currentTime <= w.end
        );

        // Remove previous highlights
        document.querySelectorAll('.subtitle-word').forEach(el => {
            el.classList.remove('active-word');
        });

        if (activeWord) {
            const wordIndex = subtitle.words.indexOf(activeWord);
            const wordElement = document.querySelector(`[data-word-index="${wordIndex}"]`);

            if (wordElement) {
                wordElement.classList.add('active-word');
                this.animateWord(wordElement);
            }
        }
    }

    // 💬 SHOW WORD TRANSLATION POPUP
    async showWordTranslation(wordData, element) {
        let translation = wordData.translation;

        // Fetch translation if not cached
        if (!translation) {
            translation = await this.fetchTranslation(wordData.cleanWord);
            wordData.translation = translation;
        }

        // Create or update tooltip
        let tooltip = document.getElementById('word-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'word-tooltip';
            tooltip.className = 'word-translation-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `
            <div class="tooltip-word">${wordData.word}</div>
            <div class="tooltip-translation">${translation}</div>
            <div class="tooltip-actions">
                <button onclick="wordSubtitles.saveWord('${wordData.cleanWord}', '${translation}')">
                    💾 Save
                </button>
                <button onclick="wordSubtitles.hearWord('${wordData.word}')">
                    🔊 Hear
                </button>
            </div>
        `;

        // Position tooltip above word
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        tooltip.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        tooltip.classList.add('show');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 3000);
    }

    // 🌐 FETCH TRANSLATION
    async fetchTranslation(word) {
        if (this.translationCache.has(word)) {
            return this.translationCache.get(word);
        }

        try {
            // In production, call DeepL or translation API
            // For now, mock translations
            const mockTranslations = {
                'hola': 'hello',
                'cómo': 'how',
                'estás': 'are you',
                'me': 'I/me',
                'gusta': 'like',
                'la': 'the',
                'paella': 'paella (Spanish rice dish)',
                'dónde': 'where',
                'está': 'is',
                'el': 'the',
                'hotel': 'hotel'
            };

            const translation = mockTranslations[word.toLowerCase()] || `[${word}]`;
            this.translationCache.set(word, translation);
            return translation;

        } catch (error) {
            console.error('Translation error:', error);
            return word;
        }
    }

    // 💾 SAVE WORD TO VOCABULARY
    async saveWord(word, translation) {
        try {
            const response = await fetch('/api/social/save-word', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId') || 'user_' + Date.now(),
                    word: word,
                    translation: translation,
                    context: this.currentSubtitle?.text || '',
                    level: localStorage.getItem('userLevel') || 'A2'
                })
            });

            const data = await response.json();
            this.showToast(data.message);

        } catch (error) {
            console.error('Save word error:', error);
        }
    }

    // 🔊 HEAR WORD PRONUNCIATION
    async hearWord(word) {
        // Use browser's speech synthesis
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'es-ES';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }

    // 🧹 CLEAN WORD (remove punctuation)
    cleanWord(word) {
        return word.replace(/[¿?¡!.,;:]/g, '').toLowerCase();
    }

    // 📊 TRACK WORD CLICK (for analytics)
    trackWordClick(wordData) {
        fetch('/api/social/track-engagement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: localStorage.getItem('userId'),
                action: 'word_click',
                word: wordData.cleanWord,
                translation: wordData.translation
            })
        }).catch(err => console.error('Track error:', err));
    }

    // 🎭 ANIMATE WORD
    animateWord(element) {
        element.style.animation = 'none';
        setTimeout(() => {
            element.style.animation = 'wordPulse 0.3s ease';
        }, 10);
    }

    // 🔄 HIDE SUBTITLE
    hideSubtitle() {
        const container = document.getElementById('subtitle-container');
        if (container) {
            container.classList.remove('active');
        }
    }

    // 💬 SHOW TOAST NOTIFICATION
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'word-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// 🎨 CSS STYLES (add to HTML)
const styles = `
<style>
#subtitle-container {
    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    padding: 12px 20px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 600;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 100;
    max-width: 90%;
    text-align: center;
}

#subtitle-container.active {
    opacity: 1;
}

.subtitle-word {
    display: inline-block;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.subtitle-word:hover {
    background: rgba(255, 255, 255, 0.2);
}

.subtitle-word.active-word {
    background: linear-gradient(135deg, #ff0050, #667eea);
    color: white;
    transform: scale(1.1);
}

@keyframes wordPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
}

.word-translation-tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    color: white;
    padding: 16px;
    border-radius: 16px;
    transform: translateX(-50%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: 10000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    min-width: 200px;
}

.word-translation-tooltip.show {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) translateY(-10px);
}

.tooltip-word {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #ff0050;
}

.tooltip-translation {
    font-size: 16px;
    margin-bottom: 12px;
    opacity: 0.9;
}

.tooltip-actions {
    display: flex;
    gap: 8px;
}

.tooltip-actions button {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tooltip-actions button:hover {
    background: linear-gradient(135deg, #ff0050, #667eea);
    border-color: transparent;
}

.word-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 10001;
}

.word-toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}
</style>
`;

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordLevelSubtitles;
}
