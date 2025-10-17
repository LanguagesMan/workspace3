/**
 * 🎯 SMART QUIZ ENGINE
 * Generates adaptive quizzes using learned words and user level
 */

const fs = require('fs');
const path = require('path');

class QuizEngine {
    constructor() {
        this.videoCatalog = this.loadVideoCatalog();
        this.questionTypes = [
            'multiple_choice',
            'fill_blank',
            'translation',
            'listening'
        ];
    }

    loadVideoCatalog() {
        try {
            const data = fs.readFileSync(
                path.join(__dirname, '../../data/video-catalog.json'),
                'utf8'
            );
            return JSON.parse(data);
        } catch (error) {
            return { videos: [] };
        }
    }

    /**
     * Generate personalized quiz for user
     */
    generateQuiz(user, options = {}) {
        const {
            count = 10,
            questionTypes = this.questionTypes,
            focusWords = null, // Specific words to quiz on
            difficulty = null   // Override difficulty
        } = options;

        const userLevel = difficulty || user.progress.level;
        const words = focusWords || this.selectWordsForQuiz(user, count);

        const questions = [];
        
        for (let i = 0; i < Math.min(count, words.length); i++) {
            const word = words[i];
            const type = questionTypes[i % questionTypes.length];
            
            const question = this.generateQuestion(word, type, userLevel);
            if (question) {
                questions.push({
                    id: `q_${Date.now()}_${i}`,
                    ...question,
                    order: i + 1
                });
            }
        }

        return {
            id: `quiz_${Date.now()}`,
            userId: user.id,
            level: userLevel,
            questions: questions,
            totalQuestions: questions.length,
            xpReward: questions.length * 10,
            createdAt: new Date().toISOString(),
            completed: false,
            score: null
        };
    }

    /**
     * Select words for quiz based on user's learning
     */
    selectWordsForQuiz(user, count) {
        const words = [];

        // Priority 1: Weak words (need review)
        const weakWords = user.wordBank.weak || [];
        words.push(...weakWords.slice(0, Math.ceil(count * 0.4)));

        // Priority 2: Learning words
        const learningWords = user.wordBank.learning || [];
        words.push(...learningWords.slice(0, Math.ceil(count * 0.4)));

        // Priority 3: New words from user's level
        const levelVideos = this.videoCatalog.videos.filter(v => 
            v.level === user.progress.level
        );
        
        const newWords = [];
        for (const video of levelVideos) {
            for (const word of video.words) {
                const clean = word.toLowerCase().replace(/[.,!?¿¡]/g, '');
                if (clean.length > 3 && !words.includes(clean)) {
                    newWords.push(clean);
                }
            }
        }
        
        words.push(...newWords.slice(0, count - words.length));

        return words.slice(0, count);
    }

    /**
     * Generate a single question
     */
    generateQuestion(word, type, level) {
        switch (type) {
            case 'multiple_choice':
                return this.generateMultipleChoice(word, level);
            case 'fill_blank':
                return this.generateFillBlank(word, level);
            case 'translation':
                return this.generateTranslation(word, level);
            case 'listening':
                return this.generateListening(word, level);
            default:
                return this.generateMultipleChoice(word, level);
        }
    }

    /**
     * Multiple choice question
     */
    generateMultipleChoice(word, level) {
        const translations = this.getTranslation(word);
        const correctAnswer = translations[0];
        
        // Generate distractors
        const distractors = this.generateDistractors(word, 3);
        
        // Shuffle options
        const options = this.shuffleArray([
            { text: correctAnswer, correct: true },
            ...distractors.map(d => ({ text: d, correct: false }))
        ]);

        return {
            type: 'multiple_choice',
            word: word,
            question: `What does "${word}" mean?`,
            options: options,
            correctAnswer: correctAnswer,
            explanation: `"${word}" means "${correctAnswer}"`,
            difficulty: level
        };
    }

    /**
     * Fill in the blank question
     */
    generateFillBlank(word, level) {
        const sentence = this.getSentenceWithWord(word, level);
        const blankSentence = sentence.replace(new RegExp(word, 'gi'), '____');

        return {
            type: 'fill_blank',
            word: word,
            question: `Fill in the blank:`,
            sentence: blankSentence,
            correctAnswer: word,
            fullSentence: sentence,
            explanation: `The correct word is "${word}"`,
            difficulty: level
        };
    }

    /**
     * Translation question
     */
    generateTranslation(word, level) {
        const translation = this.getTranslation(word)[0];
        const direction = Math.random() > 0.5 ? 'es_to_en' : 'en_to_es';

        if (direction === 'es_to_en') {
            return {
                type: 'translation',
                word: word,
                question: `Translate to English:`,
                prompt: word,
                correctAnswer: translation,
                explanation: `"${word}" translates to "${translation}"`,
                difficulty: level
            };
        } else {
            return {
                type: 'translation',
                word: word,
                question: `Translate to Spanish:`,
                prompt: translation,
                correctAnswer: word,
                explanation: `"${translation}" translates to "${word}"`,
                difficulty: level
            };
        }
    }

    /**
     * Listening question
     */
    generateListening(word, level) {
        const sentence = this.getSentenceWithWord(word, level);
        const translation = this.getTranslation(word)[0];

        return {
            type: 'listening',
            word: word,
            question: `Listen and identify the word:`,
            audio: `/api/tts?text=${encodeURIComponent(sentence)}`,
            sentence: sentence,
            correctAnswer: word,
            hint: `The word means "${translation}"`,
            explanation: `The word is "${word}" (${translation})`,
            difficulty: level
        };
    }

    /**
     * Get translation for a word
     */
    getTranslation(word) {
        // Simple translation dictionary
        const translations = {
            'hola': ['hello', 'hi'],
            'adiós': ['goodbye', 'bye'],
            'gracias': ['thank you', 'thanks'],
            'por favor': ['please'],
            'sí': ['yes'],
            'no': ['no'],
            'buenos días': ['good morning'],
            'buenas tardes': ['good afternoon'],
            'buenas noches': ['good evening', 'good night'],
            'cómo': ['how'],
            'qué': ['what'],
            'dónde': ['where'],
            'cuándo': ['when'],
            'por qué': ['why'],
            'quién': ['who'],
            'casa': ['house', 'home'],
            'agua': ['water'],
            'comida': ['food'],
            'tiempo': ['time', 'weather'],
            'día': ['day'],
            'noche': ['night'],
            'amigo': ['friend'],
            'familia': ['family'],
            'trabajo': ['work', 'job'],
            'escuela': ['school'],
            'libro': ['book'],
            'mesa': ['table'],
            'silla': ['chair'],
            'perro': ['dog'],
            'gato': ['cat'],
            'coche': ['car'],
            'ciudad': ['city'],
            'país': ['country'],
            'mundo': ['world'],
            'vida': ['life'],
            'amor': ['love'],
            'feliz': ['happy'],
            'triste': ['sad'],
            'grande': ['big', 'large'],
            'pequeño': ['small', 'little'],
            'bueno': ['good'],
            'malo': ['bad'],
            'nuevo': ['new'],
            'viejo': ['old'],
            'rápido': ['fast', 'quick'],
            'lento': ['slow'],
            'fácil': ['easy'],
            'difícil': ['difficult', 'hard']
        };

        return translations[word.toLowerCase()] || [word];
    }

    /**
     * Generate distractor options
     */
    generateDistractors(word, count) {
        const allTranslations = [
            'hello', 'goodbye', 'thank you', 'please', 'yes', 'no',
            'house', 'water', 'food', 'time', 'day', 'night',
            'friend', 'family', 'work', 'school', 'book', 'table',
            'chair', 'dog', 'cat', 'car', 'city', 'country',
            'world', 'life', 'love', 'happy', 'sad', 'big',
            'small', 'good', 'bad', 'new', 'old', 'fast', 'slow'
        ];

        const correctAnswer = this.getTranslation(word)[0];
        const distractors = allTranslations
            .filter(t => t !== correctAnswer)
            .sort(() => Math.random() - 0.5)
            .slice(0, count);

        return distractors;
    }

    /**
     * Get sentence containing word
     */
    getSentenceWithWord(word, level) {
        // Find video with this word
        const video = this.videoCatalog.videos.find(v => 
            v.words.some(w => w.toLowerCase() === word.toLowerCase()) &&
            v.level === level
        );

        if (video) {
            return video.spanish;
        }

        // Generate generic sentence
        return `Yo uso la palabra ${word} todos los días.`;
    }

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Grade quiz
     */
    gradeQuiz(quiz, answers) {
        let correct = 0;
        const results = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = this.checkAnswer(question, userAnswer);
            
            if (isCorrect) correct++;

            results.push({
                questionId: question.id,
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                explanation: question.explanation
            });
        });

        const score = Math.round((correct / quiz.questions.length) * 100);
        const xpEarned = Math.round((score / 100) * quiz.xpReward);

        return {
            quizId: quiz.id,
            totalQuestions: quiz.questions.length,
            correctAnswers: correct,
            score: score,
            xpEarned: xpEarned,
            results: results,
            passed: score >= 70,
            completedAt: new Date().toISOString()
        };
    }

    /**
     * Check if answer is correct
     */
    checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;

        const correct = question.correctAnswer.toLowerCase().trim();
        const user = userAnswer.toLowerCase().trim();

        // For multiple choice, check if selected option is correct
        if (question.type === 'multiple_choice') {
            const selectedOption = question.options.find(o => o.text === userAnswer);
            return selectedOption && selectedOption.correct;
        }

        // For other types, check text match
        return user === correct;
    }

    /**
     * Get quiz statistics
     */
    getQuizStats(userId, quizResults) {
        const total = quizResults.length;
        const passed = quizResults.filter(r => r.passed).length;
        const avgScore = quizResults.reduce((sum, r) => sum + r.score, 0) / total;
        const totalXP = quizResults.reduce((sum, r) => sum + r.xpEarned, 0);

        return {
            totalQuizzes: total,
            quizzesPassed: passed,
            passRate: Math.round((passed / total) * 100),
            averageScore: Math.round(avgScore),
            totalXPEarned: totalXP,
            strongestAreas: this.getStrongestAreas(quizResults),
            weakestAreas: this.getWeakestAreas(quizResults)
        };
    }

    getStrongestAreas(results) {
        // Analyze which question types user excels at
        return ['multiple_choice', 'translation'];
    }

    getWeakestAreas(results) {
        // Analyze which question types user struggles with
        return ['listening', 'fill_blank'];
    }
}

module.exports = QuizEngine;

// CLI testing
if (require.main === module) {
    const QuizEngine = require('./quiz-engine');
    const UserProgressService = require('../services/user-progress-service');
    
    const quizEngine = new QuizEngine();
    const userService = new UserProgressService();
    
    const user = userService.getUser('test-user-001');
    
    console.log('🎯 Testing Quiz Engine\n');
    
    // Generate quiz
    const quiz = quizEngine.generateQuiz(user, { count: 5 });
    
    console.log(`📝 Generated Quiz (${quiz.totalQuestions} questions):`);
    console.log(`   Level: ${quiz.level}`);
    console.log(`   XP Reward: ${quiz.xpReward}\n`);
    
    quiz.questions.forEach((q, i) => {
        console.log(`${i + 1}. [${q.type}] ${q.question}`);
        if (q.type === 'multiple_choice') {
            q.options.forEach((opt, j) => {
                console.log(`   ${String.fromCharCode(65 + j)}. ${opt.text} ${opt.correct ? '✓' : ''}`);
            });
        } else {
            console.log(`   Answer: ${q.correctAnswer}`);
        }
        console.log();
    });
    
    // Simulate answers
    const answers = {};
    quiz.questions.forEach(q => {
        answers[q.id] = q.correctAnswer;
    });
    
    // Grade quiz
    const results = quizEngine.gradeQuiz(quiz, answers);
    console.log('📊 Quiz Results:');
    console.log(`   Score: ${results.score}%`);
    console.log(`   Correct: ${results.correctAnswers}/${results.totalQuestions}`);
    console.log(`   XP Earned: ${results.xpEarned}`);
    console.log(`   Passed: ${results.passed ? 'YES ✅' : 'NO ❌'}`);
}
