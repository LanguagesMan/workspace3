// 🧠 ADAPTIVE LEARNING ENGINE - Personalize content based on user level and progress
// Now integrated with Genius Adaptive System and Behavioral Tracker

const geniusAdaptive = require('./genius-adaptive-system');
const behavioralTracker = require('./behavioral-tracker');
const frequencyWords = require('./spanish-frequency-words-extended');

class AdaptiveLearningEngine {
    constructor() {
        this.userProfiles = new Map();
        this.contentDifficulty = new Map();
        this.geniusAdaptive = geniusAdaptive;
        this.behavioralTracker = behavioralTracker;
    }

    /**
     * Analyze user's known words and determine actual level
     */
    calculateUserLevel(knownWords = [], interactions = []) {
        const wordCount = knownWords.length;
        
        // CEFR Level mapping based on vocabulary size
        if (wordCount < 300) return 'A1';
        if (wordCount < 600) return 'A2';
        if (wordCount < 1200) return 'B1';
        if (wordCount < 2000) return 'B2';
        if (wordCount < 3500) return 'C1';
        return 'C2';
    }

    /**
     * Score content difficulty based on word frequency and complexity
     */
    scoreContentDifficulty(text, words = []) {
        const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
        const uniqueWords = new Set(words).size;
        const vocabularyDensity = uniqueWords / words.length;
        
        // Difficulty score (0-100)
        const score = (avgWordLength * 5) + (vocabularyDensity * 50);
        
        if (score < 30) return 'A1';
        if (score < 45) return 'A2';
        if (score < 60) return 'B1';
        if (score < 75) return 'B2';
        if (score < 90) return 'C1';
        return 'C2';
    }

    /**
     * Recommend next content based on user progress (ENHANCED with Goldilocks algorithm)
     */
    recommendContent(userId, availableContent, knownWords = []) {
        const userLevel = this.calculateUserLevel(knownWords);
        const knownWordSet = new Set(knownWords);
        
        // Use Goldilocks algorithm from genius adaptive system
        const goldilocksResult = this.geniusAdaptive.getGoldilocksContent(userId, availableContent);
        
        // Also use traditional scoring as backup
        const scoredContent = availableContent.map(item => {
            const itemWords = this.extractWords(item.text || item.content || '');
            const unknownWords = itemWords.filter(w => !knownWordSet.has(w));
            const newWordCount = unknownWords.length;
            
            // Optimal: 3-7 new words per item (i+1 theory)
            let score = 0;
            if (newWordCount >= 3 && newWordCount <= 7) {
                score = 100 - Math.abs(newWordCount - 5) * 10;
            } else if (newWordCount < 3) {
                score = 40; // Too easy
            } else {
                score = Math.max(0, 100 - (newWordCount - 7) * 5); // Too hard
            }
            
            return {
                ...item,
                score,
                newWords: unknownWords,
                difficulty: this.scoreContentDifficulty(item.text, itemWords)
            };
        });
        
        // Sort by score (best matches first)
        return {
            goldilocks: goldilocksResult.recommended,
            traditional: scoredContent.sort((a, b) => b.score - a.score),
            all: goldilocksResult.all
        };
    }

    /**
     * REAL-TIME ADAPTATION
     * Adjust content difficulty based on user interactions
     */
    adaptInRealTime(userId, signal) {
        // Track the signal
        switch (signal.type) {
            case 'word_click':
                this.behavioralTracker.trackWordClick(userId, signal.word, signal.timestamp);
                break;
            case 'completion':
                this.behavioralTracker.trackCompletionRate(userId, signal.contentId, signal.percentage);
                break;
            case 'button_click':
                this.behavioralTracker.trackButtonClick(userId, signal.buttonType, signal.contentId);
                break;
            case 'quiz':
                this.behavioralTracker.trackQuizPerformance(userId, signal.quizId, signal.score, signal.total);
                break;
            case 'word_save':
                this.behavioralTracker.trackWordSave(userId, signal.word, signal.wordRank, signal.level);
                break;
        }
        
        // Get updated signals
        const userSignals = this.behavioralTracker.calculateUserSignals(userId);
        
        // Adjust level if needed
        const adjustment = this.geniusAdaptive.adjustDifficultyInRealTime(userId, signal);
        
        return {
            adjustment,
            signals: userSignals,
            recommendation: userSignals.recommendation
        };
    }

    /**
     * Simplify content for user level (with GPT-4 integration)
     */
    async simplifyContent(text, targetLevel = 'A2', useGPT = false) {
        // If GPT-4 is enabled and API key exists, use AI simplification
        if (useGPT && process.env.OPENAI_API_KEY) {
            return await this.simplifyWithGPT4(text, targetLevel);
        }
        
        // Otherwise use rule-based simplification
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        // Simplification strategies
        const simplified = sentences.map(sentence => {
            let result = sentence.trim();
            
            if (targetLevel === 'A1' || targetLevel === 'A2') {
                // Replace complex words with simpler alternatives
                result = result
                    .replace(/utilizar/gi, 'usar')
                    .replace(/efectuar/gi, 'hacer')
                    .replace(/obtener/gi, 'conseguir')
                    .replace(/realizar/gi, 'hacer')
                    .replace(/proporcionar/gi, 'dar')
                    .replace(/adquirir/gi, 'conseguir')
                    .replace(/manifestar/gi, 'decir')
                    .replace(/evidenciar/gi, 'mostrar')
                    .replace(/posteriormente/gi, 'después')
                    .replace(/anteriormente/gi, 'antes')
                    .replace(/actualmente/gi, 'ahora')
                    .replace(/frecuentemente/gi, 'a menudo')
                    .replace(/ocasionalmente/gi, 'a veces');
                
                // Shorten long sentences (split at conjunctions)
                if (result.split(' ').length > 15) {
                    result = result.split(/,\s*(y|pero|aunque)/)[0] + '.';
                }
            }
            
            return result;
        });
        
        return simplified.join(' ');
    }

    /**
     * Simplify content using GPT-4 API
     */
    async simplifyWithGPT4(text, targetLevel = 'A2') {
        try {
            // This is a placeholder for actual OpenAI API integration
            // In production, you would call:
            /*
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{
                        role: 'system',
                        content: `You are a Spanish language teacher. Simplify the following Spanish text to ${targetLevel} level while preserving its meaning. Use only high-frequency words (rank 1-${targetLevel === 'A1' ? '500' : '1500'}) and keep sentences under 15 words.`
                    }, {
                        role: 'user',
                        content: text
                    }],
                    temperature: 0.3
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content;
            */
            
            // For now, fall back to rule-based
            console.log('📝 GPT-4 simplification requested but not yet implemented. Using rule-based fallback.');
            return await this.simplifyContent(text, targetLevel, false);
            
        } catch (error) {
            console.error('Error simplifying with GPT-4:', error);
            // Fall back to rule-based simplification
            return await this.simplifyContent(text, targetLevel, false);
        }
    }

    /**
     * Extract words from text
     */
    extractWords(text) {
        return text
            .toLowerCase()
            .replace(/[^\wáéíóúñü\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
    }

    /**
     * Track user engagement for algorithm improvement
     */
    trackEngagement(userId, contentId, metrics = {}) {
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, {
                engagements: [],
                preferences: {}
            });
        }
        
        const profile = this.userProfiles.get(userId);
        profile.engagements.push({
            contentId,
            timestamp: Date.now(),
            ...metrics
        });
        
        // Update preferences based on engagement
        if (metrics.completed) {
            profile.preferences[metrics.contentType] = 
                (profile.preferences[metrics.contentType] || 0) + 1;
        }
    }

    /**
     * Get personalized content mix based on user preferences
     */
    getContentMix(userId) {
        const profile = this.userProfiles.get(userId);
        
        if (!profile || Object.keys(profile.preferences).length === 0) {
            // Default mix for new users
            return {
                videos: 0.4,
                articles: 0.2,
                music: 0.2,
                stories: 0.2
            };
        }
        
        // Calculate percentages based on engagement
        const total = Object.values(profile.preferences).reduce((sum, val) => sum + val, 0);
        const mix = {};
        
        for (const [type, count] of Object.entries(profile.preferences)) {
            mix[type] = count / total;
        }
        
        return mix;
    }

    /**
     * Generate quiz questions based on content
     */
    generateQuiz(content, difficulty = 'A2') {
        const words = this.extractWords(content.text || content.content || '');
        const uniqueWords = [...new Set(words)];
        
        // Select 3-5 words for quiz
        const quizWords = uniqueWords
            .filter(w => w.length > 3)
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(5, uniqueWords.length));
        
        const questions = quizWords.map(word => ({
            type: 'translation',
            word,
            context: content.text || content.content,
            difficulty
        }));
        
        return questions;
    }

    /**
     * Calculate spaced repetition intervals (SM-2 algorithm)
     */
    calculateNextReview(quality, previousInterval = 1, previousEaseFactor = 2.5) {
        // quality: 0-5 (user rating)
        let easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        
        if (easeFactor < 1.3) easeFactor = 1.3;
        
        let interval;
        if (quality < 3) {
            interval = 1; // Reset if failed
        } else {
            if (previousInterval === 1) {
                interval = 6;
            } else {
                interval = Math.round(previousInterval * easeFactor);
            }
        }
        
        return {
            interval, // days
            easeFactor,
            nextReviewDate: Date.now() + (interval * 24 * 60 * 60 * 1000)
        };
    }
}

module.exports = new AdaptiveLearningEngine();
