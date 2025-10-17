/**
 * 🎯 ADAPTIVE PLACEMENT TEST ENGINE
 * 
 * Implements Computerized Adaptive Testing (CAT) to quickly and accurately
 * determine user's Spanish proficiency level in 5-7 minutes.
 * 
 * Features:
 * - Multi-skill assessment (vocabulary, grammar, listening, reading)
 * - Adaptive difficulty (questions adjust based on performance)
 * - Fast convergence (accurate level in 10-15 questions)
 * - Engaging UX (gamified, not boring)
 * - Micro-level precision (A1.0 → C2.9, 60 levels)
 * 
 * Algorithm: If user gets 3 right in a row → jump up a level
 *            If user gets 2 wrong in a row → drop down a level
 */

const frequencyLookup = require('./frequency-lookup');

class AdaptivePlacementTest {
    constructor() {
        // CEFR levels with decimal precision (A1.0 → A1.9 → A2.0 ...)
        this.LEVELS = [];
        const baselevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        baselevels.forEach(base => {
            for (let i = 0; i <= 9; i++) {
                this.LEVELS.push(`${base}.${i}`);
            }
        });
        
        // Question types for multi-skill assessment
        this.QUESTION_TYPES = {
            VOCABULARY: 'vocabulary',     // "What does 'gato' mean?"
            GRAMMAR: 'grammar',           // "Choose correct verb form"
            LISTENING: 'listening',       // "What did they say?" (audio)
            READING: 'reading',           // "Read and answer question"
            CONTEXT: 'context'            // "Guess meaning from context"
        };
        
        // Difficulty → word frequency mapping
        this.DIFFICULTY_BANDS = {
            'A1': { min: 1, max: 500 },
            'A2': { min: 500, max: 1500 },
            'B1': { min: 1500, max: 3000 },
            'B2': { min: 3000, max: 5000 },
            'C1': { min: 5000, max: 8000 },
            'C2': { min: 8000, max: 10000 }
        };
    }
    
    /**
     * Start new placement test
     */
    async startTest(userId) {
        return {
            userId,
            testId: this.generateTestId(),
            currentLevel: 'A2.0',        // Start at lower-intermediate
            levelIndex: this.LEVELS.indexOf('A2.0'),
            confidence: 0,               // 0-100
            questionsAsked: 0,
            maxQuestions: 15,
            correctInRow: 0,
            wrongInRow: 0,
            skillScores: {
                vocabulary: [],
                grammar: [],
                listening: [],
                reading: []
            },
            history: [],
            startTime: Date.now(),
            completed: false
        };
    }
    
    /**
     * Get next question based on current state
     */
    async getNextQuestion(testState) {
        if (testState.questionsAsked >= testState.maxQuestions || testState.confidence >= 90) {
            return this.completeTest(testState);
        }
        
        const baseLevel = testState.currentLevel.split('.')[0]; // A2.3 → A2
        const questionType = this.selectQuestionType(testState);
        
        const question = await this.generateQuestion(baseLevel, questionType, testState.questionsAsked);
        
        return {
            ...question,
            questionNumber: testState.questionsAsked + 1,
            totalQuestions: testState.maxQuestions,
            currentEstimatedLevel: testState.currentLevel,
            confidence: testState.confidence
        };
    }
    
    /**
     * Select which type of question to ask next
     * Ensures balanced assessment across all skills
     */
    selectQuestionType(testState) {
        const questionNum = testState.questionsAsked;
        
        // Rotate through question types for balance
        const types = [
            this.QUESTION_TYPES.VOCABULARY,
            this.QUESTION_TYPES.GRAMMAR,
            this.QUESTION_TYPES.VOCABULARY,
            this.QUESTION_TYPES.READING,
            this.QUESTION_TYPES.VOCABULARY,
            this.QUESTION_TYPES.GRAMMAR,
            this.QUESTION_TYPES.LISTENING,
            this.QUESTION_TYPES.VOCABULARY,
            this.QUESTION_TYPES.CONTEXT,
            this.QUESTION_TYPES.VOCABULARY,
            this.QUESTION_TYPES.GRAMMAR,
            this.QUESTION_TYPES.READING,
            this.QUESTION_TYPES.VOCABULARY,
            this.QUESTION_TYPES.LISTENING,
            this.QUESTION_TYPES.VOCABULARY
        ];
        
        return types[questionNum] || this.QUESTION_TYPES.VOCABULARY;
    }
    
    /**
     * Generate question at specific difficulty level
     */
    async generateQuestion(level, type, questionNum) {
        switch (type) {
            case this.QUESTION_TYPES.VOCABULARY:
                return this.generateVocabularyQuestion(level, questionNum);
            case this.QUESTION_TYPES.GRAMMAR:
                return this.generateGrammarQuestion(level);
            case this.QUESTION_TYPES.LISTENING:
                return this.generateListeningQuestion(level);
            case this.QUESTION_TYPES.READING:
                return this.generateReadingQuestion(level);
            case this.QUESTION_TYPES.CONTEXT:
                return this.generateContextQuestion(level);
            default:
                return this.generateVocabularyQuestion(level, questionNum);
        }
    }
    
    /**
     * Vocabulary Question: "What does X mean?"
     */
    generateVocabularyQuestion(level, questionNum) {
        const band = this.DIFFICULTY_BANDS[level];
        const targetRank = Math.floor(Math.random() * (band.max - band.min)) + band.min;
        
        const word = frequencyLookup.getWordAtRank(targetRank);
        const translation = this.getTranslation(word);
        
        // Generate distractors (wrong answers)
        const distractors = this.generateDistractors(targetRank, 3);
        
        // Shuffle options
        const options = this.shuffle([translation, ...distractors]);
        
        return {
            questionId: `vocab_${level}_${questionNum}`,
            type: this.QUESTION_TYPES.VOCABULARY,
            level: level,
            prompt: `¿Qué significa "${word}"?`,
            promptEnglish: `What does "${word}" mean?`,
            word: word,
            options: options.map((opt, idx) => ({ id: idx, text: opt })),
            correctAnswer: options.indexOf(translation),
            explanation: `"${word}" means "${translation}"`,
            wordRank: targetRank,
            timeLimit: 10 // seconds
        };
    }
    
    /**
     * Grammar Question: Choose correct verb form
     */
    generateGrammarQuestion(level) {
        const grammarRules = {
            'A1': [
                { 
                    sentence: 'Yo ___ un estudiante.',
                    correct: 'soy',
                    options: ['soy', 'es', 'eres', 'son'],
                    explanation: 'Use "soy" with "yo" (I am)'
                },
                {
                    sentence: '¿Cómo ___ tú?',
                    correct: 'estás',
                    options: ['estás', 'está', 'estoy', 'están'],
                    explanation: 'Use "estás" with "tú" (you are - informal)'
                }
            ],
            'A2': [
                {
                    sentence: 'Ayer ___ al parque.',
                    correct: 'fui',
                    options: ['fui', 'fue', 'iba', 'voy'],
                    explanation: 'Use "fui" for completed past action (I went)'
                },
                {
                    sentence: 'Me ___ mucho ese libro.',
                    correct: 'gustó',
                    options: ['gustó', 'gustaba', 'gusta', 'gustan'],
                    explanation: 'Use "gustó" for past tense (I liked)'
                }
            ],
            'B1': [
                {
                    sentence: 'Si tuviera tiempo, ___ a España.',
                    correct: 'viajaría',
                    options: ['viajaría', 'viajo', 'viajé', 'viajar'],
                    explanation: 'Use conditional "viajaría" with "si tuviera" (if I had)'
                }
            ],
            'B2': [
                {
                    sentence: 'Espero que ___ buena suerte.',
                    correct: 'tengas',
                    options: ['tengas', 'tienes', 'tendrás', 'tener'],
                    explanation: 'Use subjunctive "tengas" after "espero que" (I hope that)'
                }
            ],
            'C1': [
                {
                    sentence: 'Aunque ___ dinero, no lo compraría.',
                    correct: 'tuviera',
                    options: ['tuviera', 'tenía', 'tuve', 'tendré'],
                    explanation: 'Use imperfect subjunctive "tuviera" with "aunque" (even if)'
                }
            ],
            'C2': [
                {
                    sentence: 'Habría ido de ___ tu invitación.',
                    correct: 'haber sabido',
                    options: ['haber sabido', 'saber', 'sabiendo', 'sabría'],
                    explanation: 'Use perfect infinitive "haber sabido" (had I known)'
                }
            ]
        };
        
        const questions = grammarRules[level] || grammarRules['A2'];
        const question = questions[Math.floor(Math.random() * questions.length)];
        
        return {
            questionId: `grammar_${level}_${Date.now()}`,
            type: this.QUESTION_TYPES.GRAMMAR,
            level: level,
            prompt: question.sentence,
            promptEnglish: 'Choose the correct word to complete the sentence',
            options: question.options.map((opt, idx) => ({ id: idx, text: opt })),
            correctAnswer: question.options.indexOf(question.correct),
            explanation: question.explanation,
            timeLimit: 15
        };
    }
    
    /**
     * Listening Question: "What did they say?"
     */
    generateListeningQuestion(level) {
        // Simplified for now - would integrate with OpenAI TTS in production
        const sentences = {
            'A1': ['Hola, ¿cómo estás?', 'Me llamo María', '¿Dónde está el baño?'],
            'A2': ['Ayer fui al supermercado', '¿Qué te gustaría comer?', 'Hace mucho calor hoy'],
            'B1': ['Me encantaría viajar a España algún día', 'No creo que llueva mañana'],
            'B2': ['Si tuviera más tiempo, aprendería francés también'],
            'C1': ['Aunque sea difícil, no voy a rendirme'],
            'C2': ['Habría sido mejor haber planificado con anticipación']
        };
        
        const levelSentences = sentences[level] || sentences['A2'];
        const sentence = levelSentences[Math.floor(Math.random() * levelSentences.length)];
        
        // Generate wrong options (distractors)
        const allSentences = Object.values(sentences).flat();
        const distractors = allSentences
            .filter(s => s !== sentence)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = this.shuffle([sentence, ...distractors]);
        
        return {
            questionId: `listening_${level}_${Date.now()}`,
            type: this.QUESTION_TYPES.LISTENING,
            level: level,
            prompt: 'Listen and select what you heard:',
            promptEnglish: 'Listen to the audio and choose what was said',
            audioText: sentence, // Would be TTS audio URL in production
            audioUrl: `/api/tts?text=${encodeURIComponent(sentence)}&level=${level}`,
            options: options.map((opt, idx) => ({ id: idx, text: opt })),
            correctAnswer: options.indexOf(sentence),
            explanation: `The correct answer is: "${sentence}"`,
            timeLimit: 12,
            canReplay: true
        };
    }
    
    /**
     * Reading Question: Comprehension
     */
    generateReadingQuestion(level) {
        const passages = {
            'A1': {
                text: 'Me llamo Ana. Tengo un gato. Mi gato es blanco y muy bonito. Se llama Nieve.',
                question: '¿De qué color es el gato?',
                correct: 'blanco',
                options: ['blanco', 'negro', 'gris', 'marrón']
            },
            'A2': {
                text: 'Ayer fui al mercado con mi madre. Compramos frutas y verduras. También compramos pan fresco. Me gusta mucho ir al mercado los sábados.',
                question: '¿Cuándo le gusta ir al mercado?',
                correct: 'los sábados',
                options: ['los sábados', 'los domingos', 'los lunes', 'los viernes']
            },
            'B1': {
                text: 'El español es uno de los idiomas más hablados del mundo. Se habla en España y en la mayoría de los países de América Latina. Es un idioma romance que proviene del latín.',
                question: '¿De dónde proviene el español?',
                correct: 'del latín',
                options: ['del latín', 'del griego', 'del árabe', 'del francés']
            },
            'B2': {
                text: 'La inteligencia artificial está transformando nuestra sociedad de formas que apenas comenzamos a comprender. Desde la medicina hasta el entretenimiento, la IA está cambiando cómo vivimos y trabajamos.',
                question: '¿Qué está haciendo la IA según el texto?',
                correct: 'transformando la sociedad',
                options: ['transformando la sociedad', 'reemplazando trabajos', 'curando enfermedades', 'creando entretenimiento']
            }
        };
        
        const passage = passages[level] || passages['A2'];
        
        return {
            questionId: `reading_${level}_${Date.now()}`,
            type: this.QUESTION_TYPES.READING,
            level: level,
            prompt: passage.text,
            promptEnglish: 'Read the passage and answer the question',
            question: passage.question,
            options: passage.options.map((opt, idx) => ({ id: idx, text: opt })),
            correctAnswer: passage.options.indexOf(passage.correct),
            explanation: `The passage mentions: "${passage.correct}"`,
            timeLimit: 20
        };
    }
    
    /**
     * Context Question: Guess meaning from context
     */
    generateContextQuestion(level) {
        const contexts = {
            'A2': {
                sentence: 'Tengo mucha sed. Necesito agua.',
                targetWord: 'sed',
                meaning: 'thirst',
                options: ['thirst', 'hunger', 'tiredness', 'happiness']
            },
            'B1': {
                sentence: 'El clima está muy agradable hoy, no hace ni frío ni calor.',
                targetWord: 'agradable',
                meaning: 'pleasant',
                options: ['pleasant', 'terrible', 'cold', 'hot']
            },
            'B2': {
                sentence: 'Su comportamiento fue inapropiado durante la reunión.',
                targetWord: 'inapropiado',
                meaning: 'inappropriate',
                options: ['inappropriate', 'excellent', 'funny', 'boring']
            }
        };
        
        const context = contexts[level] || contexts['A2'];
        
        return {
            questionId: `context_${level}_${Date.now()}`,
            type: this.QUESTION_TYPES.CONTEXT,
            level: level,
            prompt: context.sentence,
            promptEnglish: `Based on the context, what does "${context.targetWord}" probably mean?`,
            targetWord: context.targetWord,
            options: context.options.map((opt, idx) => ({ id: idx, text: opt })),
            correctAnswer: context.options.indexOf(context.meaning),
            explanation: `From context, "${context.targetWord}" means "${context.meaning}"`,
            timeLimit: 15
        };
    }
    
    /**
     * Process user's answer and update test state
     */
    async submitAnswer(testState, questionId, userAnswer, timeSpent) {
        const question = this.reconstructQuestion(questionId, testState);
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Update streak counters
        if (isCorrect) {
            testState.correctInRow++;
            testState.wrongInRow = 0;
        } else {
            testState.correctInRow = 0;
            testState.wrongInRow++;
        }
        
        // Update skill scores
        const skillType = question.type;
        if (testState.skillScores[skillType]) {
            testState.skillScores[skillType].push(isCorrect ? 1 : 0);
        }
        
        // Record in history
        testState.history.push({
            questionId,
            level: testState.currentLevel,
            correct: isCorrect,
            timeSpent,
            type: skillType
        });
        
        testState.questionsAsked++;
        
        // ADAPTIVE LOGIC: Adjust level based on performance
        testState = this.adjustLevel(testState, isCorrect);
        
        // Calculate confidence
        testState.confidence = this.calculateConfidence(testState);
        
        return {
            correct: isCorrect,
            explanation: question.explanation,
            newLevel: testState.currentLevel,
            confidence: testState.confidence,
            progress: {
                questionsAnswered: testState.questionsAsked,
                totalQuestions: testState.maxQuestions
            }
        };
    }
    
    /**
     * Adjust difficulty level based on performance
     * Algorithm: 3 right in a row → level up
     *            2 wrong in a row → level down
     */
    adjustLevel(testState, isCorrect) {
        const currentIndex = this.LEVELS.indexOf(testState.currentLevel);
        
        if (isCorrect && testState.correctInRow >= 3) {
            // Level up!
            if (currentIndex < this.LEVELS.length - 1) {
                testState.levelIndex = currentIndex + 3; // Jump 3 micro-levels
                if (testState.levelIndex >= this.LEVELS.length) {
                    testState.levelIndex = this.LEVELS.length - 1;
                }
                testState.currentLevel = this.LEVELS[testState.levelIndex];
                testState.correctInRow = 0; // Reset streak
            }
        } else if (!isCorrect && testState.wrongInRow >= 2) {
            // Level down
            if (currentIndex > 0) {
                testState.levelIndex = Math.max(0, currentIndex - 2); // Drop 2 micro-levels
                testState.currentLevel = this.LEVELS[testState.levelIndex];
                testState.wrongInRow = 0; // Reset streak
            }
        }
        
        return testState;
    }
    
    /**
     * Calculate confidence score (0-100)
     */
    calculateConfidence(testState) {
        if (testState.questionsAsked < 5) return 20;
        
        const totalCorrect = testState.history.filter(h => h.correct).length;
        const accuracy = totalCorrect / testState.questionsAsked;
        
        // More questions = more confidence
        const questionFactor = Math.min(testState.questionsAsked / testState.maxQuestions, 1);
        
        // Consistent performance = more confidence
        const recentAnswers = testState.history.slice(-5).map(h => h.correct ? 1 : 0);
        const variance = this.calculateVariance(recentAnswers);
        const consistencyFactor = 1 - Math.min(variance, 0.5);
        
        let confidence = 30 + (accuracy * 40) + (questionFactor * 15) + (consistencyFactor * 15);
        
        return Math.min(Math.round(confidence), 100);
    }
    
    /**
     * Complete the test and return final results
     */
    completeTest(testState) {
        testState.completed = true;
        testState.endTime = Date.now();
        testState.duration = (testState.endTime - testState.startTime) / 1000; // seconds
        
        // Calculate skill breakdown
        const skillBreakdown = {};
        Object.keys(testState.skillScores).forEach(skill => {
            const scores = testState.skillScores[skill];
            if (scores.length > 0) {
                const correct = scores.filter(s => s === 1).length;
                skillBreakdown[skill] = Math.round((correct / scores.length) * 100);
            } else {
                skillBreakdown[skill] = 0;
            }
        });
        
        // Determine final level
        const baseLevel = testState.currentLevel.split('.')[0];
        const subLevel = parseFloat(testState.currentLevel.split('.')[1]);
        
        return {
            completed: true,
            finalLevel: testState.currentLevel,
            baseLevel: baseLevel,
            subLevel: subLevel,
            confidence: testState.confidence,
            questionsAnswered: testState.questionsAsked,
            duration: Math.round(testState.duration),
            skillBreakdown: skillBreakdown,
            overallScore: Math.round(
                testState.history.filter(h => h.correct).length / testState.questionsAsked * 100
            ),
            recommendations: this.generateRecommendations(testState, skillBreakdown),
            celebration: {
                title: `You're at ${baseLevel} level! 🎉`,
                message: this.getCelebrationMessage(baseLevel),
                nextSteps: `Start learning with videos matched to your ${baseLevel} level`
            }
        };
    }
    
    /**
     * Generate personalized recommendations
     */
    generateRecommendations(testState, skillBreakdown) {
        const recommendations = [];
        
        // Identify weak areas
        Object.entries(skillBreakdown).forEach(([skill, score]) => {
            if (score < 60 && score > 0) {
                recommendations.push({
                    type: 'skill_improvement',
                    skill: skill,
                    message: `Focus on ${skill} - Try watching videos with subtitles and practice ${skill} quizzes`
                });
            }
        });
        
        // Level-specific recommendations
        const level = testState.currentLevel.split('.')[0];
        if (level === 'A1' || level === 'A2') {
            recommendations.push({
                type: 'content',
                message: 'Start with beginner videos and build your vocabulary with daily practice'
            });
        } else if (level === 'B1' || level === 'B2') {
            recommendations.push({
                type: 'content',
                message: 'Challenge yourself with intermediate content and conversation practice'
            });
        } else {
            recommendations.push({
                type: 'content',
                message: 'Dive into advanced topics and native-level conversations'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Get celebration message based on level
     */
    getCelebrationMessage(level) {
        const messages = {
            'A1': 'You\'re starting your Spanish journey! 🌱 With practice, you\'ll be fluent in no time.',
            'A2': 'You know the basics! 🚀 Ready to expand your vocabulary and tackle new topics.',
            'B1': 'You\'re conversational! 💬 You can handle everyday situations and understand most content.',
            'B2': 'You\'re advanced! 🌟 You can express yourself fluently and understand complex topics.',
            'C1': 'You\'re proficient! 🏆 You can understand and use Spanish at a near-native level.',
            'C2': 'You\'re mastery level! 👑 You have native-like fluency and can understand everything!'
        };
        
        return messages[level] || messages['A2'];
    }
    
    // ===== Helper Functions =====
    
    generateTestId() {
        return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getTranslation(spanishWord) {
        // Simplified - would use actual translation API in production
        const translations = {
            'gato': 'cat',
            'perro': 'dog',
            'casa': 'house',
            'comer': 'to eat',
            'agua': 'water',
            'libro': 'book',
            'feliz': 'happy',
            'grande': 'big',
            'pequeño': 'small',
            'azul': 'blue',
            'rojo': 'red',
            'verde': 'green',
            'trabajar': 'to work',
            'estudiar': 'to study',
            'correr': 'to run',
            'hablar': 'to speak',
            'escuchar': 'to listen',
            'mirar': 'to look',
            'tomar': 'to take',
            'hacer': 'to do/make'
        };
        
        return translations[spanishWord] || 'unknown';
    }
    
    generateDistractors(targetRank, count) {
        const distractors = [];
        for (let i = 0; i < count; i++) {
            const offset = Math.floor(Math.random() * 1000) - 500;
            const distractorRank = Math.max(1, targetRank + offset);
            const word = frequencyLookup.getWordAtRank(distractorRank);
            const translation = this.getTranslation(word);
            if (!distractors.includes(translation)) {
                distractors.push(translation);
            }
        }
        return distractors;
    }
    
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    calculateVariance(numbers) {
        if (numbers.length === 0) return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
        return variance;
    }
    
    reconstructQuestion(questionId, testState) {
        // In production, store questions in memory or retrieve from history
        // For now, return a mock question structure
        const history = testState.history.find(h => h.questionId === questionId);
        return {
            questionId,
            correctAnswer: 0, // Would be stored
            explanation: 'Great job!',
            type: history ? history.type : 'vocabulary'
        };
    }
}

module.exports = AdaptivePlacementTest;

