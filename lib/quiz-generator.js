/**
 * Quiz Generator - Personalized Quiz Engine
 * Generates adaptive quizzes from user's vocabulary with spaced repetition
 */

class QuizGenerator {
    constructor() {
        this.apiBase = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : '';
        this.userId = this.getUserId();
        this.usedQuestions = new Set(); // Track to avoid repeats in session
    }

    getUserId() {
        let userId = localStorage.getItem('langflix-user-id');
        if (!userId) {
            userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('langflix-user-id', userId);
        }
        return userId;
    }

    /**
     * Generate personalized quiz from user's vocabulary
     * @param {Object} options - Quiz configuration
     * @returns {Promise<Array>} Array of quiz questions
     */
    async generateQuiz(options = {}) {
        const {
            count = 10,
            difficulty = 'mixed', // 'easy', 'medium', 'hard', 'mixed'
            questionTypes = ['multiple_choice', 'fill_blank', 'match_pairs', 'true_false'],
            prioritizeWeak = true
        } = options;

        try {
            // Fetch user's vocabulary
            const vocabulary = await this.fetchUserVocabulary(prioritizeWeak);
            
            if (vocabulary.length === 0) {
                console.warn('⚠️ No vocabulary found, using fallback words');
                return this.generateFallbackQuiz(count);
            }

            console.log(`📚 Generating quiz from ${vocabulary.length} vocabulary words`);

            // Select words based on difficulty mix
            const selectedWords = this.selectWordsByDifficulty(vocabulary, count, difficulty);

            // Generate questions
            const questions = [];
            for (let i = 0; i < selectedWords.length; i++) {
                const word = selectedWords[i];
                const questionType = questionTypes[i % questionTypes.length];
                
                const question = await this.generateQuestion(word, questionType, vocabulary);
            if (question) {
                questions.push(question);
            }
        }
        
            console.log(`✅ Generated ${questions.length} personalized questions`);
        return questions;

        } catch (error) {
            console.error('❌ Error generating quiz:', error);
            return this.generateFallbackQuiz(count);
        }
    }

    /**
     * Fetch user's vocabulary from API
     */
    async fetchUserVocabulary(prioritizeWeak = true) {
        try {
            const response = await fetch(
                `${this.apiBase}/api/vocabulary/get?userId=${this.userId}&saved=true&limit=200`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch vocabulary');
            }

            const data = await response.json();
            let words = data.words || [];

            // Transform to standard format
            words = words.map(w => ({
                id: w.id,
                spanish: w.word || w.spanish,
                english: w.translation || w.english,
                context: w.context,
                level: w.level || 'A2',
                masteryLevel: w.masteryLevel || w.mastery_level || 0,
                easiness: w.easiness || 2.5,
                repetitions: w.repetitions || 0,
                nextReview: w.nextReview || w.next_review,
                clickCount: w.clickCount || w.click_count || 1
            }));

            if (prioritizeWeak) {
                // Sort by mastery level (weakest first) and due for review
                words.sort((a, b) => {
                    const aDue = new Date(a.nextReview) <= new Date();
                    const bDue = new Date(b.nextReview) <= new Date();
                    
                    if (aDue && !bDue) return -1;
                    if (!aDue && bDue) return 1;
                    
                    return a.masteryLevel - b.masteryLevel;
                });
            }

            return words;

        } catch (error) {
            console.error('Error fetching vocabulary:', error);
            return [];
        }
    }

    /**
     * Select words based on difficulty distribution
     * 60% at user level, 30% easier, 10% harder
     */
    selectWordsByDifficulty(words, count, difficulty) {
        if (difficulty === 'mixed') {
            const atLevel = Math.ceil(count * 0.6);
            const easier = Math.ceil(count * 0.3);
            const harder = count - atLevel - easier;

            const selected = [];
            
            // Prioritize words with low mastery
            const weak = words.filter(w => w.masteryLevel <= 2);
            const medium = words.filter(w => w.masteryLevel > 2 && w.masteryLevel <= 4);
            const strong = words.filter(w => w.masteryLevel > 4);

            // Mix difficulty levels
            selected.push(...this.pickRandom(weak, atLevel));
            selected.push(...this.pickRandom([...weak, ...medium], easier));
            selected.push(...this.pickRandom([...medium, ...strong], harder));

            return selected.slice(0, count);
        }

        return this.pickRandom(words, count);
    }

    /**
     * Generate a single question
     */
    async generateQuestion(word, type, allWords) {
        const questionId = `${word.id}-${type}`;
        
        // Skip if already used in this session
        if (this.usedQuestions.has(questionId)) {
            return null;
        }

        this.usedQuestions.add(questionId);

        switch (type) {
            case 'multiple_choice':
                return this.generateMultipleChoice(word, allWords);
            case 'fill_blank':
                return this.generateFillBlank(word);
            case 'match_pairs':
                return this.generateMatchPairs([word, ...this.pickRandom(allWords, 3)]);
            case 'true_false':
                return this.generateTrueFalse(word, allWords);
            default:
                return this.generateMultipleChoice(word, allWords);
        }
    }

    /**
     * Generate multiple choice question
     */
    generateMultipleChoice(word, allWords) {
        // Get wrong answers from other words
        const wrongAnswers = allWords
            .filter(w => w.id !== word.id && w.english !== word.english)
            .map(w => w.english);
        
        const distractors = this.pickRandom(wrongAnswers, 3);
        const options = this.shuffle([word.english, ...distractors]);
        
        return {
            id: `mc-${word.id}`,
            type: 'multiple_choice',
            wordId: word.id,
            question: `What does "${word.spanish}" mean?`,
            spanish: word.spanish,
            options: options,
            correctAnswer: word.english,
            difficulty: this.getDifficultyTag(word.level),
            masteryLevel: word.masteryLevel,
            context: word.context
        };
    }

    /**
     * Generate fill in the blank question
     */
    generateFillBlank(word) {
        const contexts = [
            `Complete: "${word.spanish}" means _____`,
            `Translation: ${word.spanish} = _____`,
            `Fill in the blank: "${word.spanish}" in English is _____`
        ];

        // If we have context sentence, use it
        let question = contexts[Math.floor(Math.random() * contexts.length)];
        
        if (word.context) {
            // Try to create a cloze deletion from context
            const contextLower = word.context.toLowerCase();
            const wordLower = word.spanish.toLowerCase();
            
            if (contextLower.includes(wordLower)) {
                question = word.context.replace(new RegExp(word.spanish, 'gi'), '_____');
                question = `Complete the sentence: "${question}"`;
            }
        }
        
        return {
            id: `fb-${word.id}`,
            type: 'fill_blank',
            wordId: word.id,
            question: question,
            spanish: word.spanish,
            correctAnswer: word.english.toLowerCase(),
            acceptableAnswers: this.generateAcceptableAnswers(word.english),
            difficulty: this.getDifficultyTag(word.level),
            masteryLevel: word.masteryLevel,
            hint: `Starts with "${word.english.charAt(0).toUpperCase()}"`
        };
    }

    /**
     * Generate match pairs question
     */
    generateMatchPairs(words) {
        const pairs = words.map(w => ({
            spanish: w.spanish,
            english: w.english,
            id: w.id
        }));

        return {
            id: `mp-${words[0].id}`,
            type: 'match_pairs',
            wordIds: words.map(w => w.id),
            question: 'Match the Spanish words with their English translations',
            pairs: pairs,
            difficulty: 'medium',
            masteryLevel: Math.min(...words.map(w => w.masteryLevel))
        };
    }

    /**
     * Generate true/false question
     */
    generateTrueFalse(word, allWords) {
        const isTrue = Math.random() > 0.5;
        
        let statement, answer;
        if (isTrue) {
            statement = `"${word.spanish}" means "${word.english}"`;
            answer = true;
        } else {
            // Pick a wrong translation
            const wrongWord = allWords.find(w => w.id !== word.id);
            statement = `"${word.spanish}" means "${wrongWord.english}"`;
            answer = false;
        }

        return {
            id: `tf-${word.id}`,
            type: 'true_false',
            wordId: word.id,
            question: 'True or False?',
            statement: statement,
            correctAnswer: answer,
            difficulty: this.getDifficultyTag(word.level),
            masteryLevel: word.masteryLevel,
            explanation: `"${word.spanish}" actually means "${word.english}"`
        };
    }

    /**
     * Submit quiz results and update word mastery
     */
    async submitQuizResults(results) {
        const {
            questions,
            answers,
            score,
            totalQuestions,
            timeSpent
        } = results;

        try {
            // Track each word's performance
            const wordPerformance = {};
            
            questions.forEach((q, i) => {
                const correct = answers[i] === q.correctAnswer || 
                               (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(answers[i]));
                
                const wordId = q.wordId;
                if (wordId) {
                    if (!wordPerformance[wordId]) {
                        wordPerformance[wordId] = { correct: 0, total: 0, masteryLevel: q.masteryLevel };
                    }
                    wordPerformance[wordId].total++;
                    if (correct) wordPerformance[wordId].correct++;
                }
            });

            // Submit to game API
            const response = await fetch(`${this.apiBase}/api/games/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    gameType: 'quiz',
                    score: score,
                    totalQuestions: totalQuestions,
                    timeSpent: timeSpent,
                    wordPerformance: wordPerformance,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Quiz results submitted successfully');
                return data;
            } else {
                console.warn('⚠️ Failed to submit quiz results');
            }

        } catch (error) {
            console.error('❌ Error submitting quiz results:', error);
        }
    }

    /**
     * Helper functions
     */
    pickRandom(array, count) {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, array.length));
    }

    shuffle(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }

    getDifficultyTag(level) {
        const levels = { 'A1': 'Beginner', 'A2': 'Elementary', 'B1': 'Intermediate', 
                        'B2': 'Upper-Int', 'C1': 'Advanced', 'C2': 'Proficient' };
        return levels[level] || 'Intermediate';
    }

    generateAcceptableAnswers(answer) {
        // Generate variations that should be accepted
        const variations = [
            answer.toLowerCase(),
            answer.toLowerCase().trim(),
            answer.replace(/[,.!?;:]/g, '').toLowerCase()
        ];
        
        // Add common variations (singular/plural)
        if (answer.endsWith('s')) {
            variations.push(answer.slice(0, -1).toLowerCase());
        } else {
            variations.push((answer + 's').toLowerCase());
        }

        return [...new Set(variations)];
    }

    /**
     * Generate fallback quiz when no vocabulary available
     */
    generateFallbackQuiz(count) {
        const fallbackWords = [
            { spanish: 'hola', english: 'hello', level: 'A1' },
            { spanish: 'gracias', english: 'thank you', level: 'A1' },
            { spanish: 'adiós', english: 'goodbye', level: 'A1' },
            { spanish: 'agua', english: 'water', level: 'A1' },
            { spanish: 'casa', english: 'house', level: 'A1' },
            { spanish: 'amor', english: 'love', level: 'A2' },
            { spanish: 'tiempo', english: 'time', level: 'A2' },
            { spanish: 'amigo', english: 'friend', level: 'A2' },
            { spanish: 'comida', english: 'food', level: 'A2' },
            { spanish: 'familia', english: 'family', level: 'B1' }
        ];

        const selected = this.pickRandom(fallbackWords, count);
        return selected.map((w, i) => ({
            id: `fallback-${i}`,
            type: 'multiple_choice',
            wordId: null,
            question: `What does "${w.spanish}" mean?`,
            spanish: w.spanish,
            options: this.shuffle([
                w.english,
                ...this.pickRandom(fallbackWords.filter(fw => fw.spanish !== w.spanish), 3).map(fw => fw.english)
            ]),
            correctAnswer: w.english,
            difficulty: this.getDifficultyTag(w.level),
            masteryLevel: 0
        }));
    }

    /**
     * Get quiz statistics
     */
    getQuizStats() {
        const stats = localStorage.getItem('langflix-quiz-stats');
        if (!stats) {
            return {
                quizzesTaken: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                averageScore: 0,
                bestStreak: 0
            };
        }
        return JSON.parse(stats);
    }

    /**
     * Update quiz statistics
     */
    updateQuizStats(score, totalQuestions) {
        const stats = this.getQuizStats();
        
        stats.quizzesTaken++;
        stats.totalQuestions += totalQuestions;
        stats.correctAnswers += score;
        stats.averageScore = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
        
        localStorage.setItem('langflix-quiz-stats', JSON.stringify(stats));
        
        return stats;
    }
}

// Export for use in HTML files
if (typeof window !== 'undefined') {
    window.QuizGenerator = QuizGenerator;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizGenerator;
}
