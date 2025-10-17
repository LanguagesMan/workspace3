// 🤖 AI CONTENT ADAPTATION ENGINE
// Automatically simplifies content to match user's vocabulary level
// Using 90/10 Comprehensible Input theory (90% known words, 10% new words)

class AIContentAdapter {
    constructor() {
        // Spanish word frequency bands
        this.frequencyBands = {
            A1: { range: [1, 300], level: 'beginner' },
            A2: { range: [301, 1000], level: 'elementary' },
            B1: { range: [1001, 3000], level: 'intermediate' },
            B2: { range: [3001, 6000], level: 'upper-intermediate' },
            C1: { range: [6001, 10000], level: 'advanced' },
            C2: { range: [10001, 999999], level: 'mastery' }
        };

        // Top 1000 most frequent Spanish words (simplified for demo)
        this.frequentWords = new Set([
            'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se',
            'no', 'haber', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le',
            'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir',
            'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando',
            'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno',
            // Add more as needed...
        ]);

        console.log('🤖 AI Content Adapter initialized with 90/10 theory');
    }

    /**
     * Adapt content to user's vocabulary level
     * @param {string} content - Original Spanish content
     * @param {string} userLevel - User's CEFR level (A1-C2)
     * @param {Array} userKnownWords - Words user has already learned
     * @returns {Object} - Adapted content with metadata
     */
    adaptContent(content, userLevel = 'A2', userKnownWords = []) {
        const words = content.split(/\s+/);
        const totalWords = words.length;

        // Analyze content complexity
        const analysis = this.analyzeComplexity(words, userKnownWords);

        // Determine if content needs simplification
        const needsSimplification = analysis.unknownPercentage > 15; // More than 15% unknown

        let adaptedContent = content;
        let adaptationType = 'original';

        if (needsSimplification) {
            adaptedContent = this.simplifyContent(content, userLevel, userKnownWords);
            adaptationType = 'simplified';
        }

        return {
            original: content,
            adapted: adaptedContent,
            type: adaptationType,
            analysis: {
                totalWords,
                knownWords: analysis.knownCount,
                unknownWords: analysis.unknownCount,
                knownPercentage: analysis.knownPercentage,
                unknownPercentage: analysis.unknownPercentage,
                complexityScore: analysis.complexityScore,
                recommendedLevel: this.determineLevel(analysis.complexityScore)
            },
            newVocabulary: analysis.newWords.slice(0, 10) // Top 10 new words to learn
        };
    }

    /**
     * Analyze content complexity
     */
    analyzeComplexity(words, userKnownWords) {
        const knownWordsSet = new Set([...this.frequentWords, ...userKnownWords]);

        let knownCount = 0;
        let unknownCount = 0;
        const newWords = [];

        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[.,!?¿¡]/g, '');
            if (knownWordsSet.has(cleanWord)) {
                knownCount++;
            } else {
                unknownCount++;
                if (!newWords.includes(cleanWord) && cleanWord.length > 2) {
                    newWords.push(cleanWord);
                }
            }
        });

        const total = knownCount + unknownCount;
        const knownPercentage = total > 0 ? (knownCount / total) * 100 : 0;
        const unknownPercentage = total > 0 ? (unknownCount / total) * 100 : 0;

        // Complexity score: 0-100 (higher = more complex)
        const complexityScore = Math.min(unknownPercentage * 5, 100);

        return {
            knownCount,
            unknownCount,
            knownPercentage,
            unknownPercentage,
            complexityScore,
            newWords
        };
    }

    /**
     * Simplify content for user's level
     */
    simplifyContent(content, userLevel, userKnownWords) {
        // In production, this would call AI API (OpenAI, Groq, etc.)
        // For now, return a simplified version marker

        const simplificationRules = {
            A1: 'Use only present tense, basic vocabulary',
            A2: 'Use present and simple past, common words',
            B1: 'Use all tenses, everyday vocabulary',
            B2: 'Use complex structures, varied vocabulary',
            C1: 'Use advanced structures, rich vocabulary',
            C2: 'Native-level complexity'
        };

        // Simulate AI simplification
        const simplified = `[SIMPLIFIED FOR ${userLevel}]\n${content}\n\n💡 Simplified using: ${simplificationRules[userLevel] || 'standard rules'}`;

        return simplified;
    }

    /**
     * Determine recommended level based on complexity
     */
    determineLevel(complexityScore) {
        if (complexityScore <= 20) return 'A1';
        if (complexityScore <= 40) return 'A2';
        if (complexityScore <= 60) return 'B1';
        if (complexityScore <= 75) return 'B2';
        if (complexityScore <= 90) return 'C1';
        return 'C2';
    }

    /**
     * Detect user's level based on known words
     */
    detectUserLevel(userKnownWords) {
        const wordCount = userKnownWords.length;

        if (wordCount < 300) return 'A1';
        if (wordCount < 1000) return 'A2';
        if (wordCount < 3000) return 'B1';
        if (wordCount < 6000) return 'B2';
        if (wordCount < 10000) return 'C1';
        return 'C2';
    }

    /**
     * Generate personalized article for specific level
     */
    generatePersonalizedArticle(topic, userLevel, userInterests = []) {
        // In production, this calls AI API with specific prompts

        const templates = {
            A1: {
                structure: 'Simple sentences. Present tense. 50-100 words.',
                vocabulary: 'Basic 300 most common words only'
            },
            A2: {
                structure: 'Simple paragraphs. Present and past tense. 100-150 words.',
                vocabulary: 'Top 1000 most common words'
            },
            B1: {
                structure: 'Multiple paragraphs. All common tenses. 150-250 words.',
                vocabulary: 'Top 3000 most common words'
            },
            B2: {
                structure: 'Complex paragraphs. Varied tenses. 250-400 words.',
                vocabulary: 'Top 6000 most common words'
            },
            C1: {
                structure: 'Advanced writing. Nuanced language. 400-600 words.',
                vocabulary: 'Top 10000 words, idioms'
            },
            C2: {
                structure: 'Native-level writing. Any complexity. 600+ words.',
                vocabulary: 'Full vocabulary, cultural references'
            }
        };

        const template = templates[userLevel] || templates.A2;

        return {
            title: `${topic} - Personalized for ${userLevel}`,
            level: userLevel,
            template: template,
            interests: userInterests,
            prompt: `Create a Spanish article about "${topic}" for ${userLevel} level. ${template.structure} Use only ${template.vocabulary}. User interests: ${userInterests.join(', ')}.`,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Calculate comprehension score (90/10 theory validation)
     */
    validateComprehensibility(content, userKnownWords) {
        const analysis = this.analyzeComplexity(content.split(/\s+/), userKnownWords);

        const isComprehensible = analysis.knownPercentage >= 85 && analysis.knownPercentage <= 95;
        const isOptimal = analysis.knownPercentage >= 88 && analysis.knownPercentage <= 92; // Sweet spot: 90/10

        return {
            comprehensible: isComprehensible,
            optimal: isOptimal,
            knownPercentage: analysis.knownPercentage,
            unknownPercentage: analysis.unknownPercentage,
            recommendation: isOptimal
                ? '✅ Perfect comprehensibility (90/10 theory)'
                : isComprehensible
                    ? '👍 Good comprehensibility'
                    : analysis.knownPercentage < 85
                        ? '⚠️ Too difficult - needs simplification'
                        : '📚 Too easy - user ready for harder content'
        };
    }
}

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIContentAdapter };
}
