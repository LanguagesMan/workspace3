/**
 * SRS Video Prioritizer - Spaced Repetition System for Video Feed
 * Prioritizes videos based on:
 * 1. User's vocabulary needs (words they need to learn)
 * 2. Spaced repetition intervals (SM-2 algorithm)
 * 3. Video vocabulary content (which words are in each video)
 */

const { parseSRT } = require('./srt-parser');
const fs = require('fs');
const path = require('path');

class SRSVideoPrioritizer {
    constructor() {
        this.videoVocabulary = new Map(); // videoId -> Set of words
        this.userVocabulary = new Map();  // userId -> Map of {word -> {interval, dueDate, easeFactor}}
    }

    /**
     * Extract vocabulary from video transcriptions
     * @param {string} videoId - Video identifier
     * @param {string} srtPath - Path to SRT file
     * @returns {Set<string>} Set of Spanish words in the video
     */
    extractVideoVocabulary(videoId, srtPath) {
        if (this.videoVocabulary.has(videoId)) {
            return this.videoVocabulary.get(videoId);
        }

        try {
            const srtContent = fs.readFileSync(srtPath, 'utf-8');
            const subtitles = parseSRT(srtContent);

            const words = new Set();

            subtitles.forEach(sub => {
                if (sub.spanish) {
                    // Extract words, clean punctuation
                    const spanishWords = sub.spanish
                        .toLowerCase()
                        .replace(/[¿¡?!.,;:()]/g, '')
                        .split(/\s+/)
                        .filter(w => w.length > 2); // Ignore very short words (a, el, de, etc.)

                    spanishWords.forEach(word => words.add(word));
                }
            });

            this.videoVocabulary.set(videoId, words);
            return words;

        } catch (error) {
            console.error(`Error extracting vocabulary from ${videoId}:`, error.message);
            return new Set();
        }
    }

    /**
     * Get user's due words (words that need review based on SRS)
     * @param {string} userId - User identifier
     * @returns {Array<string>} Words due for review
     */
    getDueWords(userId) {
        const userVocab = this.userVocabulary.get(userId) || new Map();
        const now = Date.now();
        const dueWords = [];

        for (const [word, data] of userVocab.entries()) {
            if (data.dueDate <= now) {
                dueWords.push(word);
            }
        }

        return dueWords;
    }

    /**
     * Get words user needs to learn (not yet learned)
     * @param {string} userId - User identifier
     * @param {Array<string>} allWords - All available words in content
     * @returns {Array<string>} Words user hasn't learned
     */
    getWordsToLearn(userId, allWords) {
        const userVocab = this.userVocabulary.get(userId) || new Map();
        return allWords.filter(word => !userVocab.has(word));
    }

    /**
     * Calculate priority score for a video based on user's vocabulary needs
     * @param {string} userId - User identifier
     * @param {Set<string>} videoWords - Words in the video
     * @returns {number} Priority score (0-100)
     */
    calculateVideoPriority(userId, videoWords) {
        const userVocab = this.userVocabulary.get(userId) || new Map();
        const dueWords = this.getDueWords(userId);
        const dueWordsSet = new Set(dueWords);

        let score = 0;
        let dueWordMatches = 0;
        let newWordMatches = 0;

        for (const word of videoWords) {
            // High priority: words due for review (SRS)
            if (dueWordsSet.has(word)) {
                dueWordMatches++;
                score += 10;
            }
            // Medium priority: new words to learn
            else if (!userVocab.has(word)) {
                newWordMatches++;
                score += 5;
            }
            // Low priority: already mastered words
            else {
                score += 1;
            }
        }

        // Bonus for optimal word count (i+1 theory: 3-7 new words optimal)
        const totalNewWords = dueWordMatches + newWordMatches;
        if (totalNewWords >= 3 && totalNewWords <= 7) {
            score += 20;
        }

        return Math.min(100, score);
    }

    /**
     * Prioritize videos for a user based on SRS and vocabulary needs
     * @param {string} userId - User identifier
     * @param {Array<Object>} videos - Available videos
     * @returns {Array<Object>} Videos sorted by priority
     */
    prioritizeVideos(userId, videos) {
        const scoredVideos = videos.map(video => {
            const videoWords = this.videoVocabulary.get(video.id) || new Set();
            const priorityScore = this.calculateVideoPriority(userId, videoWords);

            return {
                ...video,
                priorityScore,
                vocabularyMatch: {
                    totalWords: videoWords.size,
                    dueWords: this.getDueWords(userId).filter(w => videoWords.has(w)),
                    newWords: this.getWordsToLearn(userId, Array.from(videoWords))
                }
            };
        });

        // Sort by priority score (highest first)
        return scoredVideos.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    /**
     * Update user vocabulary after learning a word (SM-2 algorithm)
     * @param {string} userId - User identifier
     * @param {string} word - Word learned
     * @param {number} quality - Quality of recall (0-5)
     */
    updateWordProgress(userId, word, quality = 4) {
        if (!this.userVocabulary.has(userId)) {
            this.userVocabulary.set(userId, new Map());
        }

        const userVocab = this.userVocabulary.get(userId);
        const now = Date.now();

        // Get existing data or initialize
        const existing = userVocab.get(word) || {
            interval: 1,
            repetitions: 0,
            easeFactor: 2.5,
            dueDate: now
        };

        // SM-2 Algorithm
        let { interval, repetitions, easeFactor } = existing;

        if (quality >= 3) {
            // Correct response
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions++;
        } else {
            // Incorrect response - reset
            repetitions = 0;
            interval = 1;
        }

        // Update ease factor
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        // Calculate due date (interval in days)
        const dueDate = now + (interval * 24 * 60 * 60 * 1000);

        userVocab.set(word, {
            interval,
            repetitions,
            easeFactor,
            dueDate,
            lastReviewed: now
        });
    }

    /**
     * Mark word as learned (initial learning)
     * @param {string} userId - User identifier
     * @param {string} word - Word learned
     */
    markWordLearned(userId, word) {
        this.updateWordProgress(userId, word, 4); // Good quality recall
    }

    /**
     * Get user's vocabulary statistics
     * @param {string} userId - User identifier
     * @returns {Object} Statistics
     */
    getUserStats(userId) {
        const userVocab = this.userVocabulary.get(userId) || new Map();
        const dueWords = this.getDueWords(userId);

        return {
            totalWords: userVocab.size,
            dueForReview: dueWords.length,
            mastered: Array.from(userVocab.values()).filter(v => v.repetitions >= 5).length,
            learning: Array.from(userVocab.values()).filter(v => v.repetitions > 0 && v.repetitions < 5).length,
            new: Array.from(userVocab.values()).filter(v => v.repetitions === 0).length
        };
    }
}

module.exports = { SRSVideoPrioritizer };
