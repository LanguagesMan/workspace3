/**
 * 📚 VOCABULARY TRACKER - The Core of Adaptive Learning
 * 
 * Tracks every word user learns across ALL content types
 * Implements spaced repetition (SM-2 algorithm)
 * Builds user's vocabulary knowledge graph
 * Powers personalized content generation
 */

const { PrismaClient } = require('@prisma/client');
const SpacedRepetition = require('./spaced-repetition');
const prisma = new PrismaClient();

class VocabularyTracker {
    constructor() {
        // SM-2 Spaced Repetition Algorithm (now using dedicated class)
        this.SM2_DEFAULTS = {
            easiness: 2.5,
            interval: 1,
            repetitions: 0
        };
    }

    /**
     * Track word click (user looked up translation)
     * @param {string} userId - User ID
     * @param {string} word - Word clicked
     * @param {Object} context - Where it was found
     */
    async trackWordClick(userId, word, context = {}) {
        try {
            const cleanWord = word.toLowerCase().trim();

            // Check if word exists in user's vocabulary
            let wordEntry = await prisma.word.findUnique({
                where: {
                    userId_word: { userId, word: cleanWord }
                }
            });

            if (wordEntry) {
                // Update existing word
                await prisma.word.update({
                    where: { id: wordEntry.id },
                    data: {
                        clickCount: wordEntry.clickCount + 1,
                        lastSeen: new Date(),
                        source: context.contentType || wordEntry.source,
                        sourceId: context.contentId || wordEntry.sourceId,
                        context: context.sentence || wordEntry.context
                    }
                });

                console.log(`   📚 Word click tracked: ${cleanWord} (${wordEntry.clickCount + 1} times)`);
            } else {
                // Get translation
                const translation = await this.translateWord(cleanWord);
                
                // Get frequency level
                const level = this.getWordLevel(cleanWord);

                // Create new word entry
                wordEntry = await prisma.word.create({
                    data: {
                        userId,
                        word: cleanWord,
                        translation,
                        level,
                        source: context.contentType || 'unknown',
                        sourceId: context.contentId,
                        context: context.sentence,
                        language: 'es',
                        clickCount: 1,
                        saved: false,
                        masteryLevel: 0,
                        easiness: this.SM2_DEFAULTS.easiness,
                        interval: this.SM2_DEFAULTS.interval,
                        repetitions: this.SM2_DEFAULTS.repetitions,
                        lastSeen: new Date()
                    }
                });

                console.log(`   ✨ New word discovered: ${cleanWord} → ${translation} (${level})`);
            }

            // Track interaction
            await this.trackInteraction(userId, 'word_click', context.contentId, cleanWord);

            return wordEntry;

        } catch (error) {
            console.error('Error tracking word click:', error);
            throw error;
        }
    }

    /**
     * Save word to vocabulary (user wants to learn this)
     * @param {string} userId - User ID
     * @param {string} word - Word to save
     */
    async saveWord(userId, word) {
        try {
            const cleanWord = word.toLowerCase().trim();

            await prisma.word.updateMany({
                where: { userId, word: cleanWord },
                data: {
                    saved: true,
                    savedAt: new Date(),
                    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // Review tomorrow
                }
            });

            console.log(`   💾 Word saved: ${cleanWord}`);

            return { success: true };
        } catch (error) {
            console.error('Error saving word:', error);
            throw error;
        }
    }

    /**
     * Review word (spaced repetition) - ENHANCED with new SM-2 class
     * @param {string} userId - User ID
     * @param {string} wordId - Word ID
     * @param {number} quality - Review quality (0-5)
     */
    async reviewWord(userId, wordId, quality) {
        try {
            const word = await prisma.word.findUnique({
                where: { id: wordId }
            });

            if (!word || word.userId !== userId) {
                throw new Error('Word not found');
            }

            // Use new SpacedRepetition class for calculation
            const card = {
                easeFactor: word.easiness,
                interval: word.interval,
                repetitions: word.repetitions
            };

            const nextReviewData = SpacedRepetition.calculateNextReview(card, quality);
            const masteryLevel = SpacedRepetition.getMasteryLevel({
                ...card,
                ...nextReviewData
            });

            // Update word
            const updatedWord = await prisma.word.update({
                where: { id: wordId },
                data: {
                    easiness: nextReviewData.easeFactor,
                    interval: nextReviewData.interval,
                    repetitions: nextReviewData.repetitions,
                    nextReview: new Date(nextReviewData.nextReview),
                    lastReviewed: new Date(nextReviewData.lastReviewed),
                    reviewCount: word.reviewCount + 1,
                    masteryLevel: masteryLevel === 'mastered' ? 5 : 
                                  masteryLevel === 'mature' ? 4 :
                                  masteryLevel === 'young' ? 3 :
                                  masteryLevel === 'learning' ? 2 : 1,
                    mastered: masteryLevel === 'mastered'
                }
            });

            // Track review session
            await prisma.reviewSession.create({
                data: {
                    userId,
                    wordId,
                    quality,
                    timeSpent: null
                }
            });

            console.log(`   ✅ Word reviewed: ${word.word} (quality: ${quality}, next: ${nextReviewData.interval} days)`);

            return { 
                success: true, 
                nextReview: nextReviewData.nextReview,
                masteryLevel,
                word: updatedWord
            };

        } catch (error) {
            console.error('Error reviewing word:', error);
            throw error;
        }
    }

    /**
     * SM-2 Spaced Repetition Algorithm
     * @param {number} quality - Quality of recall (1-5)
     * @param {number} easiness - Current easiness factor
     * @param {number} interval - Current interval
     * @param {number} repetitions - Number of successful repetitions
     */
    calculateSM2(quality, easiness, interval, repetitions) {
        let newEasiness = easiness;
        let newInterval = interval;
        let newRepetitions = repetitions;

        // Update easiness factor
        newEasiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

        if (quality < 3) {
            // Failed recall - reset interval
            newRepetitions = 0;
            newInterval = 1;
        } else {
            // Successful recall
            newRepetitions++;

            if (newRepetitions === 1) {
                newInterval = 1;
            } else if (newRepetitions === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * newEasiness);
            }
        }

        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newInterval);

        return {
            easiness: Math.round(newEasiness * 100) / 100,
            interval: newInterval,
            repetitions: newRepetitions,
            nextReview
        };
    }

    /**
     * Calculate mastery level (0-5)
     */
    calculateMasteryLevel(repetitions, quality) {
        if (repetitions === 0) return 0;
        if (repetitions >= 10 && quality >= 4) return 5; // Mastered
        if (repetitions >= 7) return 4;
        if (repetitions >= 5) return 3;
        if (repetitions >= 3) return 2;
        return 1;
    }

    /**
     * Get user's known words
     * @param {string} userId - User ID
     * @returns {Array} Known words
     */
    async getKnownWords(userId) {
        try {
            const words = await prisma.word.findMany({
                where: {
                    userId,
                    OR: [
                        { saved: true },
                        { clickCount: { gte: 2 } } // Seen 2+ times = known
                    ]
                },
                select: { word: true }
            });

            return words.map(w => w.word);
        } catch (error) {
            console.error('Error getting known words:', error);
            return [];
        }
    }

    /**
     * Get words currently being learned (new, not mastered)
     * @param {string} userId - User ID
     * @returns {Array} Learning words
     */
    async getLearningWords(userId) {
        try {
            const words = await prisma.word.findMany({
                where: {
                    userId,
                    mastered: false,
                    saved: true,
                    masteryLevel: { lt: 3 }
                },
                orderBy: { savedAt: 'desc' },
                take: 20
            });

            return words;
        } catch (error) {
            console.error('Error getting learning words:', error);
            return [];
        }
    }

    /**
     * Get words due for review (spaced repetition)
     * @param {string} userId - User ID
     * @returns {Array} Words due for review
     */
    async getWordsNeedingReview(userId) {
        try {
            const now = new Date();
            
            const words = await prisma.word.findMany({
                where: {
                    userId,
                    saved: true,
                    mastered: false,
                    nextReview: {
                        lte: now
                    }
                },
                orderBy: { nextReview: 'asc' },
                take: 20
            });

            return words;
        } catch (error) {
            console.error('Error getting words needing review:', error);
            return [];
        }
    }

    /**
     * Get mastered words
     * @param {string} userId - User ID
     * @returns {Array} Mastered words
     */
    async getMasteredWords(userId) {
        try {
            const words = await prisma.word.findMany({
                where: {
                    userId,
                    mastered: true
                },
                select: { word: true }
            });

            return words.map(w => w.word);
        } catch (error) {
            console.error('Error getting mastered words:', error);
            return [];
        }
    }

    /**
     * Get word level from frequency list
     * @param {string} word - Word to check
     * @returns {string} CEFR level
     */
    getWordLevel(word) {
        const frequencyLookup = require('./frequency-lookup');
        const wordData = frequencyLookup.getWordData(word);
        
        if (wordData) {
            return wordData.level || 'B1';
        }

        // Unknown word - estimate based on length and complexity
        return 'B2';
    }

    /**
     * Translate word (simple translation for now)
     * @param {string} word - Spanish word
     * @returns {string} English translation
     */
    async translateWord(word) {
        // Use existing translation service
        const translationService = require('./translation-service');
        
        try {
            const result = await translationService.translateText(word, 'es', 'en');
            return result.translation || word;
        } catch (error) {
            return word; // Fallback
        }
    }

    /**
     * Track user interaction
     */
    async trackInteraction(userId, type, contentId, metadata = null) {
        try {
            await prisma.userInteraction.create({
                data: {
                    userId,
                    type,
                    contentId: contentId || 'unknown',
                    metadata: metadata ? JSON.stringify({ word: metadata }) : '{}',
                    createdAt: new Date()
                }
            });
        } catch (error) {
            // Silent fail - tracking shouldn't break app
            console.error('Error tracking interaction:', error.message);
        }
    }

    /**
     * Get vocabulary statistics
     * @param {string} userId - User ID
     * @returns {Object} Stats
     */
    async getVocabularyStats(userId) {
        try {
            const total = await prisma.word.count({ where: { userId } });
            const saved = await prisma.word.count({ where: { userId, saved: true } });
            const mastered = await prisma.word.count({ where: { userId, mastered: true } });
            const learning = await prisma.word.count({ 
                where: { userId, saved: true, mastered: false } 
            });

            const dueForReview = await prisma.word.count({
                where: {
                    userId,
                    saved: true,
                    mastered: false,
                    nextReview: { lte: new Date() }
                }
            });

            // Get words by level
            const byLevel = {};
            for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
                byLevel[level] = await prisma.word.count({
                    where: { userId, saved: true, level }
                });
            }

            return {
                total,
                saved,
                mastered,
                learning,
                dueForReview,
                byLevel,
                progress: Math.round((saved / 2000) * 100) // 2000 = B1 target
            };
        } catch (error) {
            console.error('Error getting vocabulary stats:', error);
            return {
                total: 0,
                saved: 0,
                mastered: 0,
                learning: 0,
                dueForReview: 0,
                byLevel: {},
                progress: 0
            };
        }
    }
}

// Export singleton
const vocabularyTracker = new VocabularyTracker();
module.exports = vocabularyTracker;

