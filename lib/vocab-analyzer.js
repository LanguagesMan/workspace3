// 🧠 Vocab Analyzer - CEFR Level Detection & Coverage Scoring
// Analyzes Spanish text for difficulty and vocabulary coverage

const { SpanishFrequencyDatabase } = require('./spanish-frequency-database');

class VocabAnalyzer {
    constructor() {
        // Load frequency data (top 10000 Spanish words by frequency)
        this.frequencyDb = new SpanishFrequencyDatabase();
        this.frequencyMap = this.frequencyDb.wordToFrequency;
    }

    /**
     * Tokenize Spanish text into words
     */
    tokenize(text) {
        if (!text) return [];
        return text
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents for matching
            .match(/\b[a-záéíóúñü]+\b/gi) || [];
    }

    /**
     * Calculate CEFR level based on text characteristics
     * @returns {string} A1, A2, B1, B2, C1, C2
     */
    calculateCEFRLevel(text) {
        const words = this.tokenize(text);
        if (words.length === 0) return 'A1';

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

        // Count rare words (not in top 2000)
        let rareWordCount = 0;
        let knownWordCount = 0;

        words.forEach(word => {
            const freq = this.frequencyMap.get(word);
            if (!freq || freq.rank > 2000) {
                rareWordCount++;
            } else {
                knownWordCount++;
            }
        });

        const rareWordRatio = rareWordCount / words.length;

        // CEFR scoring logic
        let score = 0;

        // Factor 1: Sentence complexity
        if (avgWordsPerSentence < 10) score += 0;
        else if (avgWordsPerSentence < 15) score += 1;
        else if (avgWordsPerSentence < 20) score += 2;
        else if (avgWordsPerSentence < 25) score += 3;
        else score += 4;

        // Factor 2: Vocabulary rarity
        if (rareWordRatio < 0.05) score += 0; // < 5% rare words
        else if (rareWordRatio < 0.10) score += 1;
        else if (rareWordRatio < 0.15) score += 2;
        else if (rareWordRatio < 0.25) score += 3;
        else score += 4;

        // Map score to CEFR level
        if (score <= 1) return 'A1';
        if (score <= 2) return 'A2';
        if (score <= 4) return 'B1';
        if (score <= 6) return 'B2';
        if (score <= 7) return 'C1';
        return 'C2';
    }

    /**
     * Calculate coverage: what % of words the user knows
     * @param {string} text - Spanish text to analyze
     * @param {string[]} knownWords - Array of words user knows
     * @returns {object} { coverage: 0.96, unknownWords: [...], totalWords: 100 }
     */
    calculateCoverage(text, knownWords = []) {
        const words = this.tokenize(text);
        const knownSet = new Set(knownWords.map(w => w.toLowerCase()));

        const unknownWords = [];
        let knownCount = 0;

        words.forEach(word => {
            if (knownSet.has(word)) {
                knownCount++;
            } else {
                // Also check if it's a very common word (top 500)
                const freq = this.frequencyMap.get(word);
                if (freq && freq.rank <= 500) {
                    knownCount++;
                } else if (!unknownWords.includes(word)) {
                    unknownWords.push(word);
                }
            }
        });

        return {
            coverage: words.length > 0 ? knownCount / words.length : 1.0,
            unknownWords: unknownWords.slice(0, 20), // Top 20 unknown
            totalWords: words.length,
            knownWords: knownCount
        };
    }

    /**
     * Annotate article with learning metadata
     */
    annotateArticle(article, userProfile = {}) {
        const { knownWords = [], cefrLevel = 'A2' } = userProfile;

        const title = article.title || '';
        const description = article.description || '';
        const content = article.content || '';
        const fullText = `${title} ${description} ${content}`;

        const cefrEstimate = this.calculateCEFRLevel(fullText);
        const coverage = this.calculateCoverage(fullText, knownWords);

        return {
            ...article,
            targetLevel: cefrEstimate,
            coverage: Math.round(coverage.coverage * 100), // percentage
            unknownWords: coverage.unknownWords,
            totalWords: coverage.totalWords,
            difficulty: this.getDifficultyLabel(cefrEstimate, cefrLevel)
        };
    }

    /**
     * Get user-friendly difficulty label
     */
    getDifficultyLabel(contentLevel, userLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const contentIndex = levels.indexOf(contentLevel);
        const userIndex = levels.indexOf(userLevel);

        const diff = contentIndex - userIndex;

        if (diff <= -2) return 'Too Easy';
        if (diff === -1) return 'Easy';
        if (diff === 0) return 'Perfect';
        if (diff === 1) return 'Challenging';
        return 'Too Hard';
    }

    /**
     * Extract top unknown words with translations (mock for now)
     */
    extractGlossary(text, knownWords = []) {
        const coverage = this.calculateCoverage(text, knownWords);

        // Return top 10 unknown words with mock translations
        return coverage.unknownWords.slice(0, 10).map(word => ({
            word,
            translation: `[${word}]`, // TODO: Real translation API
            frequency: this.frequencyMap.get(word)?.rank || 9999
        }));
    }
}

module.exports = new VocabAnalyzer();
