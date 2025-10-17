// 🎴 ENHANCED SRS SYSTEM - BETTER THAN ANKI
// Auto-create flashcards from clicks, rich content, behavioral adaptation

const spacedRepetition = require('./spaced-repetition-engine-cjs');
const mnemonics = require('./memrise-style-mnemonics');
const frequencyWords = require('./spanish-frequency-words-extended');

class EnhancedSRSSystem {
    constructor() {
        this.cards = new Map(); // cardId -> card
        this.userReviews = new Map(); // userId -> reviews[]
        this.reviewQueue = new Map(); // userId -> queue[]
    }

    /**
     * AUTO-CREATE FLASHCARD FROM WORD CLICK
     * BETTER THAN ANKI: Zero friction, no manual card creation!
     */
    async createCardFromClick(userId, word, context, videoId = null) {
        const cardId = `${userId}_${word}_${Date.now()}`;
        
        // Get word rank from frequency list
        const wordRank = this.getWordRank(word);
        
        // Generate rich card with all enhancements
        const card = {
            id: cardId,
            userId,
            word: word.toLowerCase(),
            context,
            videoId,
            wordRank,
            
            // Translation (in production, use API)
            translation: await this.getTranslation(word),
            
            // Mnemonic from Memrise-style system
            mnemonic: mnemonics.generateMnemonic(word, '', context),
            
            // Visual association
            visual: mnemonics.getVisualAssociation(word, ''),
            
            // Audio URL (in production, generate with TTS)
            audioUrl: await this.generateAudioUrl(word),
            
            // Example sentences (find more examples from content)
            examples: await this.findExampleSentences(word, context, 3),
            
            // Grammar information
            grammar: await this.getGrammarInfo(word, context),
            
            // Pronunciation tips
            pronunciation: mnemonics.getPronunciationTip(word),
            
            // SRS scheduling
            interval: 1, // days
            easeFactor: 2.5, // SM-2 default
            repetitions: 0,
            nextReviewDate: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
            
            // Metadata
            createdAt: Date.now(),
            lastReviewed: null,
            totalReviews: 0,
            correctCount: 0,
            incorrectCount: 0,
            
            // Behavioral data
            averageResponseTime: 0,
            difficultyRating: 'medium',
            userNotes: '',
            tags: this.generateAutoTags(word, context)
        };
        
        this.cards.set(cardId, card);
        this.addToReviewQueue(userId, cardId);
        
        return card;
    }

    /**
     * Get word rank from frequency list
     */
    getWordRank(word) {
        // This would query the frequency database
        // For now, return estimated rank
        return Math.floor(Math.random() * 5000) + 1;
    }

    /**
     * Get translation (in production, use translation API)
     */
    async getTranslation(word) {
        // Placeholder - in production would call translation API
        const commonTranslations = {
            'hola': 'hello',
            'adiós': 'goodbye',
            'gracias': 'thank you',
            'por favor': 'please',
            'agua': 'water',
            'comida': 'food',
            'casa': 'house',
            'gato': 'cat',
            'perro': 'dog',
            'libro': 'book'
        };
        
        return commonTranslations[word.toLowerCase()] || '[translation]';
    }

    /**
     * Generate audio URL (in production, use TTS API)
     */
    async generateAudioUrl(word) {
        // Placeholder - in production would generate TTS
        return `/api/tts/${encodeURIComponent(word)}`;
    }

    /**
     * Find example sentences from content database
     */
    async findExampleSentences(word, currentContext, count = 3) {
        // Placeholder - in production would query content database
        return [
            { sentence: currentContext, source: 'current_video' },
            { sentence: `Example with ${word}...`, source: 'other_content' },
            { sentence: `Another ${word} example...`, source: 'other_content' }
        ];
    }

    /**
     * Get grammar information
     */
    async getGrammarInfo(word, context) {
        // Simple word type detection
        const wordTypes = {
            // Common verbs
            'verb': ['ser', 'estar', 'tener', 'hacer', 'ir', 'ver', 'dar', 'saber', 'querer', 'llegar'],
            // Common adjectives
            'adjective': ['bueno', 'grande', 'pequeño', 'nuevo', 'viejo', 'feliz', 'triste'],
            // Common nouns
            'noun': ['casa', 'persona', 'día', 'tiempo', 'mano', 'cosa', 'hombre', 'mujer', 'niño']
        };
        
        for (const [type, words] of Object.entries(wordTypes)) {
            if (words.includes(word.toLowerCase())) {
                return { type, info: `This is a ${type}` };
            }
        }
        
        return { type: 'unknown', info: 'Word type not determined' };
    }

    /**
     * Generate auto-tags for organization
     */
    generateAutoTags(word, context) {
        const tags = [];
        
        // Difficulty tags
        const rank = this.getWordRank(word);
        if (rank <= 500) tags.push('essential');
        else if (rank <= 1000) tags.push('common');
        else if (rank <= 2000) tags.push('intermediate');
        else tags.push('advanced');
        
        // Content tags
        if (context.includes('comida') || context.includes('restaurante')) tags.push('food');
        if (context.includes('viaje') || context.includes('hotel')) tags.push('travel');
        if (context.includes('trabajo') || context.includes('oficina')) tags.push('work');
        
        return tags;
    }

    /**
     * Add card to review queue
     */
    addToReviewQueue(userId, cardId) {
        if (!this.reviewQueue.has(userId)) {
            this.reviewQueue.set(userId, []);
        }
        
        const queue = this.reviewQueue.get(userId);
        queue.push(cardId);
    }

    /**
     * GET CARDS DUE FOR REVIEW
     * Smart scheduling based on SM-2 + behavioral signals
     */
    getDueCards(userId, limit = 20) {
        const userCards = Array.from(this.cards.values())
            .filter(card => card.userId === userId);
        
        const now = Date.now();
        const dueCards = userCards
            .filter(card => card.nextReviewDate <= now)
            .sort((a, b) => {
                // Priority: 1) Overdue, 2) New cards, 3) Word frequency
                const aOverdue = now - a.nextReviewDate;
                const bOverdue = now - b.nextReviewDate;
                
                if (a.totalReviews === 0 && b.totalReviews === 0) {
                    // Both new: prioritize high-frequency words
                    return a.wordRank - b.wordRank;
                }
                
                if (a.totalReviews === 0) return -1; // New cards first
                if (b.totalReviews === 0) return 1;
                
                // Order by overdue time
                return bOverdue - aOverdue;
            })
            .slice(0, limit);
        
        return dueCards;
    }

    /**
     * REVIEW A CARD
     * Enhanced SM-2 algorithm with behavioral adaptation
     */
    reviewCard(userId, cardId, quality, responseTime) {
        const card = this.cards.get(cardId);
        if (!card) return null;
        
        // Record review
        if (!this.userReviews.has(userId)) {
            this.userReviews.set(userId, []);
        }
        
        const review = {
            cardId,
            quality,
            responseTime,
            timestamp: Date.now(),
            interval: card.interval,
            easeFactor: card.easeFactor
        };
        
        this.userReviews.get(userId).push(review);
        
        // Calculate new interval using SM-2
        const result = spacedRepetition.calculateNextReview(
            quality,
            card.interval,
            card.easeFactor
        );
        
        // BEHAVIORAL ADAPTATION: Adjust based on response time
        let intervalMultiplier = 1.0;
        
        if (responseTime < 2000) {
            // Very fast response - might be too easy
            intervalMultiplier = 1.2;
            card.difficultyRating = 'easy';
        } else if (responseTime > 10000) {
            // Slow response - might be too hard
            intervalMultiplier = 0.8;
            card.difficultyRating = 'hard';
        } else {
            card.difficultyRating = 'medium';
        }
        
        // Update card
        card.interval = Math.round(result.interval * intervalMultiplier);
        card.easeFactor = result.easeFactor;
        card.nextReviewDate = result.nextReviewDate;
        card.lastReviewed = Date.now();
        card.totalReviews++;
        card.repetitions++;
        
        if (quality >= 3) {
            card.correctCount++;
        } else {
            card.incorrectCount++;
        }
        
        // Update average response time
        card.averageResponseTime = Math.round(
            (card.averageResponseTime * (card.totalReviews - 1) + responseTime) / card.totalReviews
        );
        
        return {
            card,
            nextInterval: card.interval,
            nextReviewDate: new Date(card.nextReviewDate),
            easeFactor: card.easeFactor,
            accuracy: Math.round((card.correctCount / card.totalReviews) * 100),
            difficultyRating: card.difficultyRating
        };
    }

    /**
     * GET REVIEW STATISTICS
     */
    getReviewStats(userId) {
        const userCards = Array.from(this.cards.values())
            .filter(card => card.userId === userId);
        
        const now = Date.now();
        const dueToday = userCards.filter(card => card.nextReviewDate <= now);
        const dueTomorrow = userCards.filter(card => 
            card.nextReviewDate > now && 
            card.nextReviewDate <= now + (24 * 60 * 60 * 1000)
        );
        const newCards = userCards.filter(card => card.totalReviews === 0);
        const matureCards = userCards.filter(card => card.interval >= 21); // 3+ weeks
        
        const totalReviews = userCards.reduce((sum, card) => sum + card.totalReviews, 0);
        const totalCorrect = userCards.reduce((sum, card) => sum + card.correctCount, 0);
        const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
        
        return {
            totalCards: userCards.length,
            dueToday: dueToday.length,
            dueTomorrow: dueTomorrow.length,
            newCards: newCards.length,
            matureCards: matureCards.length,
            totalReviews,
            overallAccuracy,
            averageEaseFactor: this.calculateAverageEaseFactor(userCards),
            estimatedMinutesToday: Math.round(dueToday.length * 0.5) // 30 sec per card
        };
    }

    /**
     * Calculate average ease factor
     */
    calculateAverageEaseFactor(cards) {
        if (cards.length === 0) return 2.5;
        const sum = cards.reduce((acc, card) => acc + card.easeFactor, 0);
        return Math.round((sum / cards.length) * 100) / 100;
    }

    /**
     * GET LEARNING PROGRESS
     */
    getLearningProgress(userId) {
        const userCards = Array.from(this.cards.values())
            .filter(card => card.userId === userId);
        
        // Group by interval ranges
        const progress = {
            new: userCards.filter(c => c.totalReviews === 0).length,
            learning: userCards.filter(c => c.totalReviews > 0 && c.interval < 21).length,
            mature: userCards.filter(c => c.interval >= 21).length
        };
        
        // Group by difficulty
        const byDifficulty = {
            easy: userCards.filter(c => c.difficultyRating === 'easy').length,
            medium: userCards.filter(c => c.difficultyRating === 'medium').length,
            hard: userCards.filter(c => c.difficultyRating === 'hard').length
        };
        
        // Recent activity (last 7 days)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentReviews = (this.userReviews.get(userId) || [])
            .filter(r => r.timestamp >= weekAgo);
        
        return {
            progress,
            byDifficulty,
            recentActivity: {
                reviewsLast7Days: recentReviews.length,
                averageDaily: Math.round(recentReviews.length / 7)
            },
            retention: this.calculateRetention(userId)
        };
    }

    /**
     * Calculate retention rate
     */
    calculateRetention(userId) {
        const reviews = this.userReviews.get(userId) || [];
        if (reviews.length === 0) return 0;
        
        const correct = reviews.filter(r => r.quality >= 3).length;
        return Math.round((correct / reviews.length) * 100);
    }

    /**
     * STUDY SESSION MODE
     * Batch review with gamification
     */
    async startStudySession(userId, targetCards = 20) {
        const dueCards = this.getDueCards(userId, targetCards);
        
        return {
            sessionId: `session_${Date.now()}`,
            userId,
            cards: dueCards,
            totalCards: dueCards.length,
            startTime: Date.now(),
            completed: 0,
            accuracy: 0
        };
    }

    /**
     * Complete study session
     */
    completeStudySession(sessionId, results) {
        const totalCards = results.length;
        const correct = results.filter(r => r.quality >= 3).length;
        const accuracy = Math.round((correct / totalCards) * 100);
        const duration = Date.now() - results[0]?.timestamp || 0;
        
        return {
            sessionId,
            totalCards,
            correct,
            incorrect: totalCards - correct,
            accuracy,
            duration,
            xpEarned: this.calculateSessionXP(results)
        };
    }

    /**
     * Calculate XP for study session
     */
    calculateSessionXP(results) {
        let xp = 0;
        
        for (const result of results) {
            if (result.quality >= 3) {
                xp += 10; // Base XP
                
                // Bonus for perfect recall (quality 5)
                if (result.quality === 5) xp += 5;
                
                // Speed bonus
                if (result.responseTime < 3000) xp += 3;
            }
        }
        
        // Perfect session bonus
        if (results.every(r => r.quality >= 3)) {
            xp += 50;
        }
        
        return xp;
    }

    /**
     * Get card by ID
     */
    getCard(cardId) {
        return this.cards.get(cardId);
    }

    /**
     * Update card notes
     */
    updateCardNotes(cardId, notes) {
        const card = this.cards.get(cardId);
        if (card) {
            card.userNotes = notes;
            return true;
        }
        return false;
    }

    /**
     * Delete card
     */
    deleteCard(cardId) {
        return this.cards.delete(cardId);
    }

    /**
     * Search cards
     */
    searchCards(userId, query) {
        const userCards = Array.from(this.cards.values())
            .filter(card => card.userId === userId);
        
        const lowerQuery = query.toLowerCase();
        return userCards.filter(card =>
            card.word.includes(lowerQuery) ||
            card.translation.includes(lowerQuery) ||
            card.context.includes(lowerQuery) ||
            card.tags.some(tag => tag.includes(lowerQuery))
        );
    }
}

module.exports = new EnhancedSRSSystem();

