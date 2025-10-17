// 🎯 DUAL-LANGUAGE REAL-TIME TRANSCRIPTIONS
// Pattern: Lingopie + YouTube Shorts 2025 best practices
// Research: Lingopie uses professionally synchronized dual subtitles with word-level clicking

class DualLanguageTranscriptions {
    constructor() {
        this.currentTranscription = null;
        this.currentVideo = null;
        this.updateInterval = null;
    }

    // AI Punctuation Service - Add natural punctuation to Spanish text
    addAIPunctuation(text) {
        if (!text) return '';

        // Remove existing punctuation for consistency
        let clean = text.replace(/[.!?,;:]+/g, '').trim();

        // Split into sentences (detect natural breaks)
        const sentences = clean.split(/\s+(y|pero|aunque|porque|cuando|si|mientras|entonces|ahora|después|antes)\s+/i);

        let punctuated = '';
        sentences.forEach((sentence, index) => {
            if (!sentence.trim()) return;

            // Add appropriate punctuation based on context
            if (sentence.match(/^(hola|oye|mira|wow|qué|cómo)/i)) {
                punctuated += '¡' + sentence.charAt(0).toUpperCase() + sentence.slice(1) + '! ';
            } else if (sentence.match(/\b(pregunta|cómo|cuándo|dónde|por qué|qué)\b/i)) {
                punctuated += '¿' + sentence.charAt(0).toUpperCase() + sentence.slice(1) + '? ';
            } else {
                punctuated += sentence.charAt(0).toUpperCase() + sentence.slice(1) + '. ';
            }
        });

        return punctuated.trim();
    }

    // Create dual-language subtitle display (Lingopie pattern)
    createTranscriptionDisplay(spanish, english, videoId) {
        const container = document.createElement('div');
        container.className = 'dual-language-transcription';
        container.id = `transcription-${videoId}`;

        // Add AI punctuation to Spanish
        const spanishPunctuated = this.addAIPunctuation(spanish);

        // Split into clickable words (Lingopie pattern)
        const spanishWords = spanishPunctuated.split(' ').map((word, index) => {
            return `<span class="clickable-word" data-word="${word.replace(/[¡!¿?.,]/g, '')}" data-index="${index}">${word}</span>`;
        }).join(' ');

        const englishWords = english.split(' ').map((word, index) => {
            return `<span class="english-word" data-index="${index}">${word}</span>`;
        }).join(' ');

        container.innerHTML = `
            <div class="transcription-line spanish-line">
                <span class="language-flag">🇪🇸</span>
                <div class="transcription-text">${spanishWords}</div>
            </div>
            <div class="transcription-line english-line">
                <span class="language-flag">🇺🇸</span>
                <div class="transcription-text">${englishWords}</div>
            </div>
        `;

        // Add click handlers for word translation (Lingopie pattern)
        container.querySelectorAll('.clickable-word').forEach(wordSpan => {
            wordSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showWordTranslation(wordSpan.dataset.word, wordSpan);
            });
        });

        return container;
    }

    // Show instant word translation tooltip (Lingopie pattern)
    showWordTranslation(word, element) {
        // Remove existing tooltips
        document.querySelectorAll('.word-translation-tooltip').forEach(t => t.remove());

        const tooltip = document.createElement('div');
        tooltip.className = 'word-translation-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-word">${word}</div>
            <div class="tooltip-translation">Loading...</div>
        `;

        // Position tooltip above word
        document.body.appendChild(tooltip);
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.zIndex = '10000';

        // Fetch translation (mock for now - in production, call API)
        this.fetchWordTranslation(word).then(translation => {
            tooltip.querySelector('.tooltip-translation').textContent = translation;
        });

        // Auto-close after 3 seconds
        setTimeout(() => tooltip.remove(), 3000);
    }

    // Mock translation service (replace with real API)
    async fetchWordTranslation(word) {
        const translations = {
            'hola': 'hello',
            'mira': 'look',
            'está': 'is',
            'pasando': 'happening',
            'semáforo': 'traffic light',
            'mostrando': 'showing',
            'rojo': 'red',
            'verde': 'green',
            'mismo': 'same',
            'tiempo': 'time'
        };

        const clean = word.toLowerCase().replace(/[¡!¿?.,]/g, '');
        return translations[clean] || `[${clean}]`;
    }

    // Real-time synchronized updates (YouTube Shorts pattern)
    startRealTimeSync(videoElement, transcriptionData, containerId) {
        this.currentVideo = videoElement;
        this.currentTranscription = transcriptionData;

        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        // Update transcription every 100ms (smooth sync like YouTube)
        this.updateInterval = setInterval(() => {
            if (!videoElement.paused) {
                const currentTime = videoElement.currentTime;
                this.updateTranscriptionForTime(currentTime, container, transcriptionData);
            }
        }, 100);
    }

    // Update displayed transcription based on video timestamp
    updateTranscriptionForTime(currentTime, container, transcriptionData) {
        // Find current transcription segment
        const current = transcriptionData.find(segment =>
            currentTime >= segment.startTime && currentTime < segment.endTime
        );

        // CRITICAL FIX: Only update if segment changed (prevents flashing)
        if (current) {
            const currentKey = `${current.spanish}-${current.english}`;

            if (currentKey !== this.lastDisplayedKey) {
                this.lastDisplayedKey = currentKey;
                this.lastDisplayedText = current.text;

                // Update display with new segment
                const display = this.createTranscriptionDisplay(
                    current.spanish,
                    current.english,
                    `video-${currentTime}`
                );

                container.innerHTML = '';
                container.appendChild(display);
            }

            // Highlight current word based on precise timing (every frame, but doesn't cause flashing)
            this.highlightCurrentWord(current, currentTime);
        } else if (this.lastDisplayedKey) {
            // Clear subtitles when no active segment
            this.lastDisplayedKey = null;
            container.innerHTML = '';
        }
    }

    // Highlight currently spoken word (Lingopie premium feature)
    highlightCurrentWord(segment, currentTime) {
        const progress = (currentTime - segment.startTime) / (segment.endTime - segment.startTime);
        const totalWords = segment.spanish.split(' ').length;
        const currentWordIndex = Math.floor(progress * totalWords);

        // Highlight current word in both languages
        document.querySelectorAll('.clickable-word').forEach((word, index) => {
            word.classList.toggle('current-word', index === currentWordIndex);
        });

        document.querySelectorAll('.english-word').forEach((word, index) => {
            word.classList.toggle('current-word', index === currentWordIndex);
        });
    }

    // Stop syncing when video changes
    stopRealTimeSync() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Export for use in main app
window.DualLanguageTranscriptions = DualLanguageTranscriptions;
