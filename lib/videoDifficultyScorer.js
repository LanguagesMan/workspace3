/**
 * VIDEO DIFFICULTY SCORING SYSTEM
 *
 * Research-based difficulty calculation using:
 * 1. Word Frequency (CEFR A1-C2 mapping) - 40% weight
 * 2. Vocabulary Density (unique words / total words) - 30% weight
 * 3. Sentence Complexity (words per subtitle line) - 20% weight
 * 4. Speaking Speed (words per minute) - 10% weight
 *
 * Based on Duolingo/Babbel/Busuu adaptive learning research (2025)
 */

const fs = require('fs');
const path = require('path');

class VideoDifficultyScorer {
    constructor() {
        // Load Spanish frequency data
        const dataPath = path.join(__dirname, '../data/spanish-frequency-10k.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        this.frequencyData = data.words;
        this.cefrMapping = data.cefrMapping;
        console.log('✅ VideoDifficultyScorer initialized with 10k Spanish words');
    }

    /**
     * Calculate comprehensive difficulty score for a video
     * @param {Object} video - Video object with transcription
     * @returns {Object} Difficulty analysis
     */
    calculateVideoDifficulty(video) {
        if (!video.transcription || !video.transcription.lines || video.transcription.lines.length === 0) {
            return {
                difficultyScore: 50,
                cefrLevel: 'B1',
                confidence: 'low',
                reason: 'No transcription data available',
                metrics: {}
            };
        }

        // Extract all Spanish words from transcription
        const words = this.extractSpanishWords(video.transcription);

        if (words.length === 0) {
            return {
                difficultyScore: 50,
                cefrLevel: 'B1',
                confidence: 'low',
                reason: 'No valid words found',
                metrics: {}
            };
        }

        // Calculate individual difficulty metrics
        const frequencyScore = this.calculateFrequencyScore(words);
        const vocabularyDensity = this.calculateVocabularyDensity(words);
        const sentenceComplexity = this.calculateSentenceComplexity(video.transcription);
        const speedFactor = this.calculateSpeedFactor(words, video.duration || 30);

        // Combine scores with weights (based on Duolingo's research)
        const difficultyScore = Math.min(100, Math.max(0,
            frequencyScore * 0.40 +      // 40% weight on word rarity
            vocabularyDensity * 0.30 +    // 30% weight on unique vocab
            sentenceComplexity * 0.20 +   // 20% weight on sentence complexity
            speedFactor * 0.10            // 10% weight on speaking speed
        ));

        // Map to CEFR level (A1-C2)
        const cefrLevel = this.mapToCEFR(difficultyScore);

        return {
            difficultyScore: Math.round(difficultyScore * 10) / 10,
            cefrLevel,
            confidence: 'high',
            metrics: {
                frequencyScore: Math.round(frequencyScore * 10) / 10,
                vocabularyDensity: Math.round(vocabularyDensity * 100) / 100,
                sentenceComplexity: Math.round(sentenceComplexity * 10) / 10,
                speedFactor: Math.round(speedFactor * 10) / 10,
                totalWords: words.length,
                uniqueWords: new Set(words).size,
                wordsPerMinute: this.calculateWPM(words, video.duration || 30),
                avgSentenceLength: words.length / video.transcription.lines.length
            }
        };
    }

    /**
     * Extract Spanish words from transcription lines
     */
    extractSpanishWords(transcription) {
        const words = [];

        transcription.lines.forEach(line => {
            if (line.spanish) {
                // Remove punctuation and split into words
                const cleanText = line.spanish
                    .toLowerCase()
                    .replace(/[¿¡.,!?;:()"""']/g, ' ')
                    .trim();

                const lineWords = cleanText
                    .split(/\s+/)
                    .filter(w => w.length > 0 && /^[a-záéíóúñü]+$/.test(w));

                words.push(...lineWords);
            }
        });

        return words;
    }

    /**
     * Calculate word frequency score (0-100)
     * Lower frequency rank = harder word
     */
    calculateFrequencyScore(words) {
        let totalRank = 0;
        let foundWords = 0;

        words.forEach(word => {
            const wordData = this.frequencyData[word];
            if (wordData) {
                totalRank += wordData.rank;
                foundWords++;
            } else {
                // Unknown word = assume very rare (high rank)
                totalRank += 9000;
                foundWords++;
            }
        });

        if (foundWords === 0) return 50;

        const avgRank = totalRank / foundWords;

        // Map rank to 0-100 scale
        // Rank 1-500 (A1) = 0-20 points
        // Rank 501-1500 (A2) = 20-35 points
        // Rank 1501-3500 (B1) = 35-50 points
        // Rank 3501-6000 (B2) = 50-65 points
        // Rank 6001-8500 (C1) = 65-80 points
        // Rank 8501+ (C2) = 80-100 points

        if (avgRank <= 500) return (avgRank / 500) * 20;
        if (avgRank <= 1500) return 20 + ((avgRank - 500) / 1000) * 15;
        if (avgRank <= 3500) return 35 + ((avgRank - 1500) / 2000) * 15;
        if (avgRank <= 6000) return 50 + ((avgRank - 3500) / 2500) * 15;
        if (avgRank <= 8500) return 65 + ((avgRank - 6000) / 2500) * 15;
        return Math.min(100, 80 + ((avgRank - 8500) / 1500) * 20);
    }

    /**
     * Calculate vocabulary density (unique words / total words)
     * Higher density = more challenging
     */
    calculateVocabularyDensity(words) {
        const uniqueWords = new Set(words).size;
        const density = uniqueWords / words.length;

        // Map density (typically 0.3-0.9) to 0-100 scale
        // Low density (0.3-0.5) = easier (repeated vocab)
        // High density (0.7-0.9) = harder (diverse vocab)
        return Math.min(100, Math.max(0, (density - 0.3) / 0.6 * 100));
    }

    /**
     * Calculate sentence complexity (words per line)
     * Longer sentences = more complex
     */
    calculateSentenceComplexity(transcription) {
        const totalWords = this.extractSpanishWords(transcription).length;
        const avgSentenceLength = totalWords / transcription.lines.length;

        // Map sentence length to difficulty
        // 3-5 words = easy (A1-A2)
        // 6-10 words = medium (B1-B2)
        // 11-20 words = hard (C1-C2)
        if (avgSentenceLength <= 5) return (avgSentenceLength / 5) * 35;
        if (avgSentenceLength <= 10) return 35 + ((avgSentenceLength - 5) / 5) * 30;
        return Math.min(100, 65 + ((avgSentenceLength - 10) / 10) * 35);
    }

    /**
     * Calculate speaking speed factor
     * Faster speech = harder to follow
     */
    calculateSpeedFactor(words, durationInSeconds) {
        const wpm = this.calculateWPM(words, durationInSeconds);

        // Native Spanish speakers: 150-180 WPM
        // Learner-friendly: 80-120 WPM
        // Very slow: < 80 WPM
        if (wpm <= 80) return Math.max(0, (wpm / 80) * 35);
        if (wpm <= 150) return 35 + ((wpm - 80) / 70) * 30;
        return Math.min(100, 65 + ((wpm - 150) / 50) * 35);
    }

    /**
     * Calculate words per minute
     */
    calculateWPM(words, durationInSeconds) {
        return Math.round((words.length / durationInSeconds) * 60);
    }

    /**
     * Map difficulty score (0-100) to CEFR level (A1-C2)
     */
    mapToCEFR(score) {
        if (score < 20) return 'A1';
        if (score < 35) return 'A2';
        if (score < 50) return 'B1';
        if (score < 65) return 'B2';
        if (score < 80) return 'C1';
        return 'C2';
    }

    /**
     * Get difficulty level for a word
     */
    getWordDifficulty(word) {
        const cleanWord = word.toLowerCase().replace(/[¿¡.,!?;:()"""']/g, '');
        const wordData = this.frequencyData[cleanWord];

        if (!wordData) {
            return {
                word: cleanWord,
                rank: 9999,
                cefrLevel: 'C2',
                difficulty: 'very hard',
                frequency: 0
            };
        }

        return {
            word: cleanWord,
            rank: wordData.rank,
            cefrLevel: wordData.cefrLevel,
            difficulty: this.getDifficultyLabel(wordData.cefrLevel),
            frequency: wordData.frequency
        };
    }

    /**
     * Get human-readable difficulty label
     */
    getDifficultyLabel(cefrLevel) {
        const labels = {
            'A1': 'very easy',
            'A2': 'easy',
            'B1': 'medium',
            'B2': 'medium-hard',
            'C1': 'hard',
            'C2': 'very hard'
        };
        return labels[cefrLevel] || 'unknown';
    }

    /**
     * Batch score multiple videos
     */
    scoreMultipleVideos(videos) {
        console.log(`📊 Scoring ${videos.length} videos for difficulty...`);

        const scoredVideos = videos.map(video => {
            const difficulty = this.calculateVideoDifficulty(video);
            return {
                ...video,
                difficulty: difficulty
            };
        });

        // Calculate distribution
        const distribution = {
            'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0
        };

        scoredVideos.forEach(v => {
            if (v.difficulty && v.difficulty.cefrLevel) {
                distribution[v.difficulty.cefrLevel]++;
            }
        });

        console.log('📈 CEFR Level Distribution:');
        Object.entries(distribution).forEach(([level, count]) => {
            const percentage = ((count / videos.length) * 100).toFixed(1);
            console.log(`  ${level}: ${count} videos (${percentage}%)`);
        });

        return scoredVideos;
    }

    /**
     * Get recommended videos for user level
     */
    getRecommendedVideos(videos, userLevel, count = 20) {
        const scored = this.scoreMultipleVideos(videos);

        // Get videos at user's level (70%)
        const atLevel = scored.filter(v => v.difficulty.cefrLevel === userLevel);

        // Get slightly easier videos (20%)
        const easierLevel = this.getOneLevelLower(userLevel);
        const easier = scored.filter(v => v.difficulty.cefrLevel === easierLevel);

        // Get challenging videos (10%)
        const harderLevel = this.getOneLevelHigher(userLevel);
        const harder = scored.filter(v => v.difficulty.cefrLevel === harderLevel);

        // Mix: 70% at level, 20% easier, 10% harder
        const recommended = [
            ...this.shuffle(atLevel).slice(0, Math.ceil(count * 0.7)),
            ...this.shuffle(easier).slice(0, Math.ceil(count * 0.2)),
            ...this.shuffle(harder).slice(0, Math.ceil(count * 0.1))
        ];

        return this.shuffle(recommended).slice(0, count);
    }

    /**
     * Get one CEFR level lower
     */
    getOneLevelLower(level) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        return index > 0 ? levels[index - 1] : level;
    }

    /**
     * Get one CEFR level higher
     */
    getOneLevelHigher(level) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        return index < levels.length - 1 ? levels[index + 1] : level;
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Export both the class and a singleton instance for backward compatibility
module.exports = VideoDifficultyScorer;
module.exports.default = new VideoDifficultyScorer();
