/**
 * 🎯 ARTICLE INTELLIGENCE LAYER - Phase 1.5
 * 
 * Analyzes articles for difficulty and user comprehension
 * Features:
 * - CEFR difficulty calculation (A1-C2)
 * - User comprehension percentage
 * - Reading time estimation
 * - Unknown word highlighting
 * - Complexity scoring
 */

const { supabase, isConfigured } = require('./supabase-client');
const spanishFrequency = require('./spanish-frequency-words');

class ArticleDifficultyAnalyzer {
    constructor() {
        // CEFR level word frequency thresholds
        this.cefrThresholds = {
            A1: 500,      // Most common 500 words
            A2: 1000,     // Most common 1000 words
            B1: 2500,     // Most common 2500 words
            B2: 5000,     // Most common 5000 words
            C1: 10000,    // Most common 10000 words
            C2: Infinity  // All words
        };

        // Reading speed (words per minute) by CEFR level
        this.readingSpeed = {
            A1: 50,
            A2: 80,
            B1: 120,
            B2: 150,
            C1: 180,
            C2: 200
        };
    }

    /**
     * Analyze article difficulty
     * @param {string} articleText - The article content
     * @returns {Object} Difficulty analysis
     */
    async analyzeArticle(articleText) {
        const tokens = this.tokenize(articleText);
        const words = tokens.filter(t => /^[a-záéíóúñü]+$/i.test(t));
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
        
        // Calculate various complexity metrics
        const wordFrequencies = this.getWordFrequencies(uniqueWords);
        const averageFrequency = this.calculateAverageFrequency(wordFrequencies);
        const sentenceComplexity = this.analyzeSentenceComplexity(articleText);
        const vocabularyRichness = uniqueWords.length / words.length;

        // Calculate CEFR level
        const cefrLevel = this.calculateCEFRLevel(averageFrequency, sentenceComplexity, vocabularyRichness);
        
        // Calculate difficulty score (0-1)
        const difficultyScore = this.calculateDifficultyScore(averageFrequency, sentenceComplexity);

        return {
            totalWords: words.length,
            uniqueWords: uniqueWords.length,
            vocabularyRichness: vocabularyRichness,
            averageWordFrequency: averageFrequency,
            sentenceComplexity: sentenceComplexity,
            cefrLevel: cefrLevel,
            difficultyScore: difficultyScore,
            readingTimeMinutes: this.estimateReadingTime(words.length, cefrLevel)
        };
    }

    /**
     * Calculate user comprehension for an article
     * @param {string} articleText - The article content
     * @param {string} userId - User ID
     * @returns {Object} Comprehension analysis
     */
    async calculateUserComprehension(articleText, userId) {
        const tokens = this.tokenize(articleText);
        const words = tokens.filter(t => /^[a-záéíóúñü]+$/i.test(t));
        const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];

        if (!isConfigured()) {
            // If no database, return neutral comprehension
            return {
                comprehensionPercentage: 50,
                knownWords: 0,
                unknownWords: uniqueWords.length,
                unknownWordsList: uniqueWords.slice(0, 10)
            };
        }

        try {
            // Get user's known words from database
            const { data: userWords } = await supabase
                .from('user_words')
                .select('lemma')
                .eq('user_id', userId)
                .eq('language', 'es');

            const knownWordSet = new Set((userWords || []).map(w => w.lemma.toLowerCase()));

            // Calculate comprehension
            let knownCount = 0;
            const unknownWordsList = [];

            uniqueWords.forEach(word => {
                const wordLower = word.toLowerCase();
                if (knownWordSet.has(wordLower) || this.isCommonWord(wordLower)) {
                    knownCount++;
            } else {
                    unknownWordsList.push(word);
                }
            });

            const comprehensionPercentage = (knownCount / uniqueWords.length) * 100;

            return {
                comprehensionPercentage: Math.round(comprehensionPercentage),
                knownWords: knownCount,
                unknownWords: uniqueWords.length - knownCount,
                unknownWordsList: unknownWordsList.slice(0, 10), // Top 10 unknown words
                totalUniqueWords: uniqueWords.length
            };

        } catch (error) {
            console.error('Error calculating user comprehension:', error);
            return {
                comprehensionPercentage: 50,
                knownWords: 0,
                unknownWords: uniqueWords.length,
                unknownWordsList: uniqueWords.slice(0, 10)
            };
        }
    }

    /**
     * Tokenize text into words
     * @param {string} text - Text to tokenize
     * @returns {Array} Array of tokens
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[¿¡]/g, '')
            .split(/\s+|[.,;:!?()"\-]/g)
            .filter(t => t.length > 0);
    }

    /**
     * Get word frequency ranks
     * @param {Array} words - Array of words
     * @returns {Array} Array of frequency ranks
     */
    getWordFrequencies(words) {
        const frequencies = [];
        
        words.forEach(word => {
            const rank = spanishFrequency.getWordRank(word);
            if (rank !== null) {
                frequencies.push(rank);
            }
        });

        return frequencies;
    }

    /**
     * Calculate average word frequency
     * @param {Array} frequencies - Array of frequency ranks
     * @returns {number} Average frequency rank
     */
    calculateAverageFrequency(frequencies) {
        if (frequencies.length === 0) return 5000; // Default mid-level
        
        const sum = frequencies.reduce((a, b) => a + b, 0);
        return sum / frequencies.length;
    }

    /**
     * Analyze sentence complexity
     * @param {string} text - Text to analyze
     * @returns {number} Complexity score (0-10)
     */
    analyzeSentenceComplexity(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
        
        // Complexity based on average sentence length
        // Simple: <10 words, Complex: >25 words
        const lengthScore = Math.min(10, avgSentenceLength / 2.5);
        
        // Check for complex structures (subjunctive, conditional, etc.)
        const complexPatterns = [
            /\b(hubiera|hubiese|habría)\b/i,  // Subjunctive/conditional
            /\b(aunque|sin embargo|no obstante)\b/i,  // Complex conjunctions
            /\b(cuyo|cuya)\b/i  // Relative pronouns
        ];
        
        let complexityBonus = 0;
        complexPatterns.forEach(pattern => {
            if (pattern.test(text)) complexityBonus += 1;
        });
        
        return Math.min(10, lengthScore + complexityBonus);
    }

    /**
     * Calculate CEFR level
     * @param {number} avgFrequency - Average word frequency
     * @param {number} sentenceComplexity - Sentence complexity score
     * @param {number} vocabularyRichness - Vocabulary richness
     * @returns {string} CEFR level (A1-C2)
     */
    calculateCEFRLevel(avgFrequency, sentenceComplexity, vocabularyRichness) {
        // Weight different factors
        const frequencyScore = avgFrequency;
        const complexityWeight = sentenceComplexity * 200;
        const richnessWeight = vocabularyRichness * 1000;
        
        const totalScore = frequencyScore + complexityWeight + richnessWeight;
        
        if (totalScore < 800) return 'A1';
        if (totalScore < 1500) return 'A2';
        if (totalScore < 3000) return 'B1';
        if (totalScore < 6000) return 'B2';
        if (totalScore < 12000) return 'C1';
        return 'C2';
    }
    
    /**
     * Calculate difficulty score (0-1)
     * @param {number} avgFrequency - Average word frequency
     * @param {number} sentenceComplexity - Sentence complexity
     * @returns {number} Difficulty score
     */
    calculateDifficultyScore(avgFrequency, sentenceComplexity) {
        // Normalize frequency (0-1, where 1 is most difficult)
        const freqScore = Math.min(1, avgFrequency / 10000);
        
        // Normalize complexity (0-1)
        const compScore = sentenceComplexity / 10;
        
        // Weighted average
        return (freqScore * 0.7 + compScore * 0.3);
    }

    /**
     * Estimate reading time for user level
     * @param {number} wordCount - Number of words
     * @param {string} userLevel - User's CEFR level
     * @returns {Object} Reading time estimate
     */
    estimateReadingTime(wordCount, userLevel = 'A2') {
        const wpm = this.readingSpeed[userLevel] || 120;
        const minutes = Math.ceil(wordCount / wpm);
        
        return {
            minutes: minutes,
            formatted: minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
        };
    }
    
    /**
     * Check if word is common (top 1000)
     * @param {string} word - Word to check
     * @returns {boolean} Is common word
     */
    isCommonWord(word) {
        const rank = spanishFrequency.getWordRank(word);
        return rank !== null && rank <= 1000;
    }

    /**
     * Get difficulty badge HTML
     * @param {string} cefrLevel - CEFR level
     * @returns {string} HTML for badge
     */
    getDifficultyBadge(cefrLevel) {
        const badgeColors = {
            A1: { bg: '#10b981', text: 'Beginner' },
            A2: { bg: '#3b82f6', text: 'Elementary' },
            B1: { bg: '#f59e0b', text: 'Intermediate' },
            B2: { bg: '#ef4444', text: 'Upper Int.' },
            C1: { bg: '#8b5cf6', text: 'Advanced' },
            C2: { bg: '#ec4899', text: 'Proficient' }
        };
        
        const badge = badgeColors[cefrLevel] || badgeColors.B1;
        
        return `
            <span style="
                background: ${badge.bg};
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            ">
                ${cefrLevel} - ${badge.text}
            </span>
        `;
    }
}

module.exports = new ArticleDifficultyAnalyzer();