/**
 * 🎯 CONTENT DIFFICULTY ANALYZER ENGINE
 * Analyzes videos, articles, and songs for exact CEFR difficulty
 * Uses 10K frequency list for precise word-level analysis
 */

const frequencyLookup = require('./frequency-lookup');
const fs = require('fs');
const path = require('path');

class ContentDifficultyAnalyzer {
    constructor() {
        this.cefrThresholds = {
            A1: { percentCommon: 0.90, percentRare: 0.05, avgRank: 500 },
            A2: { percentCommon: 0.75, percentRare: 0.10, avgRank: 1000 },
            B1: { percentCommon: 0.60, percentRare: 0.15, avgRank: 2000 },
            B2: { percentCommon: 0.40, percentRare: 0.25, avgRank: 3500 },
            C1: { percentCommon: 0.25, percentRare: 0.35, avgRank: 5000 },
            C2: { percentCommon: 0.10, percentRare: 0.50, avgRank: 10000 }
        };
    }

    /**
     * Extract words from SRT file content
     * @param {string} srtContent - SRT file content
     * @returns {Array<string>} Array of words
     */
    extractWordsFromSRT(srtContent) {
        const words = [];
        const lines = srtContent.split('\n');

        for (const line of lines) {
            // Skip line numbers and timestamps
            if (/^\d+$/.test(line) || /-->/.test(line)) continue;

            // Extract Spanish words
            const lineWords = line
                .toLowerCase()
                .replace(/[¿¡.,!?;:()"'\[\]{}]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 0 && /^[a-záéíóúñü]+$/.test(w));

            words.push(...lineWords);
        }

        return words;
    }

    /**
     * Extract words from plain text
     * @param {string} text - Text content
     * @returns {Array<string>} Array of words
     */
    extractWords(text) {
        return text
            .toLowerCase()
            .replace(/[¿¡.,!?;:()"'\[\]{}]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 0 && /^[a-záéíóúñü]+$/.test(w));
    }

    /**
     * Analyze transcription/text and return difficulty metrics
     * @param {string} content - Text or SRT content
     * @param {boolean} isSRT - Is SRT format
     * @returns {Object} Analysis results
     */
    analyzeTranscription(content, isSRT = false) {
        const words = isSRT ? this.extractWordsFromSRT(content) : this.extractWords(content);
        const uniqueWords = [...new Set(words)];

        // Frequency analysis
        const frequencyBands = {
            top100: 0,
            top500: 0,
            top1000: 0,
            top3000: 0,
            top5000: 0,
            rare: 0
        };

        let totalRank = 0;
        let rankedWords = 0;

        uniqueWords.forEach(word => {
            const rank = frequencyLookup.getWordRank(word);

            if (rank) {
                totalRank += rank;
                rankedWords++;

                if (rank <= 100) frequencyBands.top100++;
                else if (rank <= 500) frequencyBands.top500++;
                else if (rank <= 1000) frequencyBands.top1000++;
                else if (rank <= 3000) frequencyBands.top3000++;
                else if (rank <= 5000) frequencyBands.top5000++;
                else frequencyBands.rare++;
            } else {
                // Unknown word = treat as moderately rare (rank 5000 instead of 10000)
                // This prevents a few unknown words from skewing the entire result
                frequencyBands.rare++;
                totalRank += 5000;
                rankedWords++;
            }
        });

        const averageWordRank = rankedWords > 0 ? totalRank / rankedWords : 5000;
        const vocabularyDensity = uniqueWords.length / words.length;

        // Calculate CEFR level
        const level = this.calculateCEFRLevel(frequencyBands, uniqueWords.length, averageWordRank);

        return {
            level,
            uniqueWordCount: uniqueWords.length,
            totalWords: words.length,
            uniqueWords, // Store actual unique words for user-specific calculation
            frequencyBands,
            vocabularyDensity: Math.round(vocabularyDensity * 100) / 100,
            averageWordRank: Math.round(averageWordRank),
            difficulty: this.getDifficultyLabel(level),
            comprehensionRate: this.estimateBaseComprehension(level)
        };
    }

    /**
     * Calculate CEFR level based on frequency distribution
     * @param {Object} frequencyBands - Frequency band counts
     * @param {number} totalUniqueWords - Total unique words
     * @param {number} avgRank - Average word rank
     * @returns {string} CEFR level (A1-C2)
     */
    calculateCEFRLevel(frequencyBands, totalUniqueWords, avgRank) {
        if (totalUniqueWords === 0) return 'A1';

        const percentTop100 = frequencyBands.top100 / totalUniqueWords;
        const percentTop500 = (frequencyBands.top100 + frequencyBands.top500) / totalUniqueWords;
        const percentTop1000 = (frequencyBands.top100 + frequencyBands.top500 + frequencyBands.top1000) / totalUniqueWords;
        const percentTop3000 = (frequencyBands.top100 + frequencyBands.top500 + frequencyBands.top1000 + frequencyBands.top3000) / totalUniqueWords;
        const percentTop5000 = (percentTop3000 * totalUniqueWords + frequencyBands.top5000) / totalUniqueWords;

        // A1: Most words in top 500, avg rank < 600
        if (percentTop500 >= 0.80 && avgRank <= 600) return 'A1';
        
        // A2: Most words in top 1000, avg rank < 1200
        if (percentTop1000 >= 0.75 && avgRank <= 1200) return 'A2';
        
        // B1: Most words in top 2000, avg rank < 2000
        if (percentTop1000 >= 0.60 && avgRank <= 2000) return 'B1';
        
        // B2: Most words in top 3000, avg rank < 3500
        if (percentTop3000 >= 0.60 && avgRank <= 3500) return 'B2';
        
        // C1: Most words in top 5000, avg rank < 6000
        if (percentTop5000 >= 0.50 && avgRank <= 6000) return 'C1';
        
        return 'C2';
    }

    /**
     * Calculate difficulty for specific user
     * @param {Object} contentAnalysis - Content analysis result
     * @param {Array<string>} userKnownWords - User's known words
     * @returns {Object} User-specific difficulty
     */
    calculateDifficultyForUser(contentAnalysis, userKnownWords) {
        const userWordSet = new Set(userKnownWords.map(w => w.toLowerCase().trim()));
        
        // If we have actual unique words, do precise calculation
        let unknownWordCount;
        if (contentAnalysis.uniqueWords && Array.isArray(contentAnalysis.uniqueWords)) {
            unknownWordCount = contentAnalysis.uniqueWords.filter(
                word => !userWordSet.has(word.toLowerCase().trim())
            ).length;
        } else {
            // Fall back to estimation based on frequency bands
            unknownWordCount = this.estimateUnknownWords(
                contentAnalysis.frequencyBands,
                contentAnalysis.uniqueWordCount,
                userKnownWords.length
            );
        }

        const comprehensionRate = 1 - (unknownWordCount / contentAnalysis.uniqueWordCount);

        return {
            unknownWordCount: Math.round(unknownWordCount),
            comprehensionRate: comprehensionRate * 100,
            difficulty: this.getDifficultyLabelForUser(comprehensionRate),
            goldilocksScore: this.calculateGoldilocksScore(comprehensionRate),
            newWordsToLearn: Math.min(unknownWordCount, 10)
        };
    }

    /**
     * Estimate unknown words based on user vocabulary size
     * @param {Object} frequencyBands - Frequency distribution
     * @param {number} totalUnique - Total unique words
     * @param {number} userVocabSize - User's vocabulary size
     * @returns {number} Estimated unknown words
     */
    estimateUnknownWords(frequencyBands, totalUnique, userVocabSize) {
        // Validate frequencyBands
        if (!frequencyBands || typeof frequencyBands !== 'object') {
            console.warn('Invalid frequencyBands passed to estimateUnknownWords');
            return Math.max(0, totalUnique - Math.min(totalUnique, userVocabSize));
        }

        // Users typically know words in frequency order
        // Estimate based on their vocabulary size
        const top100 = frequencyBands.top100 || 0;
        const top500 = frequencyBands.top500 || 0;
        const top1000 = frequencyBands.top1000 || 0;
        const top3000 = frequencyBands.top3000 || 0;
        const top5000 = frequencyBands.top5000 || 0;

        const knownTop100 = Math.min(top100, userVocabSize >= 100 ? top100 : Math.min(top100, userVocabSize));
        const knownTop500 = Math.min(top500, Math.max(0, userVocabSize - 100));
        const knownTop1000 = Math.min(top1000, Math.max(0, userVocabSize - 500));
        const knownTop3000 = Math.min(top3000, Math.max(0, userVocabSize - 1000));
        const knownTop5000 = Math.min(top5000, Math.max(0, userVocabSize - 3000));

        const knownWords = knownTop100 + knownTop500 + knownTop1000 + knownTop3000 + knownTop5000;
        return Math.max(0, totalUnique - knownWords);
    }

    /**
     * Calculate Goldilocks score (how perfect the difficulty is)
     * @param {number} comprehensionRate - Comprehension rate (0-1)
     * @returns {number} Score 0-100 (100 = perfect difficulty)
     */
    calculateGoldilocksScore(comprehensionRate) {
        // Perfect zone: 85-95% comprehension
        // Score drops off outside this range
        const perfectMin = 0.85;
        const perfectMax = 0.95;
        const perfectCenter = 0.90;

        if (comprehensionRate >= perfectMin && comprehensionRate <= perfectMax) {
            // Within goldilocks zone
            const distanceFromCenter = Math.abs(comprehensionRate - perfectCenter);
            return 100 - (distanceFromCenter / 0.05) * 10; // 90-100 score
        } else if (comprehensionRate < perfectMin) {
            // Too hard
            const distance = perfectMin - comprehensionRate;
            return Math.max(0, 90 - (distance * 200)); // Drops quickly below 85%
        } else {
            // Too easy
            const distance = comprehensionRate - perfectMax;
            return Math.max(0, 90 - (distance * 100)); // Drops gradually above 95%
        }
    }

    /**
     * Get difficulty label for user
     * @param {number} comprehension - Comprehension rate (0-1)
     * @returns {string} Difficulty label
     */
    getDifficultyLabelForUser(comprehension) {
        if (comprehension > 0.95) return 'Too Easy';
        if (comprehension >= 0.85) return 'Perfect'; // 85-95% is perfect
        if (comprehension >= 0.70) return 'Easy';     // 70-85% is still manageable
        if (comprehension >= 0.50) return 'Challenging'; // 50-70% is challenging
        return 'Too Hard';
    }

    /**
     * Get general difficulty label
     * @param {string} level - CEFR level
     * @returns {string} Difficulty label
     */
    getDifficultyLabel(level) {
        const labels = {
            'A1': 'Beginner',
            'A2': 'Elementary',
            'B1': 'Intermediate',
            'B2': 'Upper-Intermediate',
            'C1': 'Advanced',
            'C2': 'Proficient'
        };
        return labels[level] || 'Unknown';
    }

    /**
     * Estimate base comprehension for level
     * @param {string} level - CEFR level
     * @returns {number} Estimated comprehension percentage
     */
    estimateBaseComprehension(level) {
        const rates = {
            'A1': 95,
            'A2': 90,
            'B1': 80,
            'B2': 70,
            'C1': 60,
            'C2': 50
        };
        return rates[level] || 75;
    }

    /**
     * Analyze a video file (SRT transcription)
     * @param {string} srtPath - Path to SRT file
     * @returns {Object} Analysis result
     */
    analyzeVideoFile(srtPath) {
        try {
            const srtContent = fs.readFileSync(srtPath, 'utf-8');
            const analysis = this.analyzeTranscription(srtContent, true);
            
            return {
                ...analysis,
                filePath: srtPath,
                fileName: path.basename(srtPath),
                contentType: 'video'
            };
        } catch (error) {
            console.error(`Error analyzing ${srtPath}:`, error.message);
            return null;
        }
    }

    /**
     * Analyze article text
     * @param {string} articleText - Article content
     * @param {string} articleId - Article ID
     * @returns {Object} Analysis result
     */
    analyzeArticle(articleText, articleId) {
        const analysis = this.analyzeTranscription(articleText, false);
        
        return {
            ...analysis,
            contentId: articleId,
            contentType: 'article'
        };
    }

    /**
     * Analyze song lyrics
     * @param {Array} lyrics - Array of lyric lines
     * @param {string} songId - Song ID
     * @returns {Object} Analysis result
     */
    analyzeSong(lyrics, songId) {
        const fullText = lyrics.map(line => line.spanish || line.text || '').join(' ');
        const analysis = this.analyzeTranscription(fullText, false);
        
        return {
            ...analysis,
            contentId: songId,
            contentType: 'song'
        };
    }

    /**
     * Get frequency rank for word (exported for use in other modules)
     * @param {string} word - Word to look up
     * @returns {number|null} Frequency rank
     */
    getFrequencyRank(word) {
        return frequencyLookup.getWordRank(word);
    }
}

// Export singleton
const analyzer = new ContentDifficultyAnalyzer();
module.exports = analyzer;

