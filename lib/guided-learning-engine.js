/**
 * 🎯 GUIDED LEARNING ENGINE (GENIUS MODE!)
 * 
 * Creates personalized learning journeys: Article → Videos → Quizzes → Games → Review
 * 
 * Example Journey:
 * 1. User reads article about "Mexican Food"
 * 2. AI extracts 10 target words
 * 3. For each word, show 2-3 videos where it's used
 * 4. Quick quiz after each word
 * 5. Mini-game after every 3 words
 * 6. Return to article (words now highlighted as "learned")
 * 7. Final comprehension quiz
 * 8. Celebration + next topic suggestion
 * 
 * This transforms passive scrolling into active, structured learning
 */

const contentDifficultyAnalyzer = require('./content-difficulty-analyzer');
const frequencyLookup = require('./frequency-lookup');

class GuidedLearningEngine {
    constructor() {
        this.JOURNEY_TYPES = {
            QUICK: 'quick',           // 5 words, 8 minutes
            STANDARD: 'standard',     // 10 words, 15 minutes
            DEEP_DIVE: 'deep_dive',   // 20 words, 30 minutes
            MASTERY: 'mastery'        // 50 words, 1 hour
        };
        
        this.STEPS = {
            ARTICLE_INTRO: 'article_intro',
            VIDEO_LEARNING: 'video_learning',
            WORD_QUIZ: 'word_quiz',
            MINI_GAME: 'mini_game',
            ARTICLE_REVIEW: 'article_review',
            FINAL_QUIZ: 'final_quiz',
            CELEBRATION: 'celebration'
        };
        
        // Pre-defined learning topics with curated content
        this.TOPICS = {
            'food-restaurants': {
                title: 'Food & Restaurants',
                level: 'A1-A2',
                estimatedTime: 15,
                wordCount: 10,
                icon: '🍽️',
                description: 'Master essential food vocabulary and restaurant conversations'
            },
            'travel-spain': {
                title: 'Travel in Spain',
                level: 'A2-B1',
                estimatedTime: 20,
                wordCount: 15,
                icon: '✈️',
                description: 'Navigate Spanish cities, book hotels, and explore like a local'
            },
            'daily-routine': {
                title: 'Daily Routines',
                level: 'A1',
                estimatedTime: 12,
                wordCount: 8,
                icon: '☀️',
                description: 'Talk about your day, habits, and schedules'
            },
            'work-business': {
                title: 'Work & Business',
                level: 'B1-B2',
                estimatedTime: 25,
                wordCount: 20,
                icon: '💼',
                description: 'Professional Spanish for meetings, emails, and presentations'
            },
            'culture-traditions': {
                title: 'Culture & Traditions',
                level: 'B1',
                estimatedTime: 20,
                wordCount: 12,
                icon: '🎭',
                description: 'Explore Spanish-speaking cultures and celebrations'
            },
            'shopping-clothes': {
                title: 'Shopping & Fashion',
                level: 'A2',
                estimatedTime: 15,
                wordCount: 10,
                icon: '👗',
                description: 'Shop confidently for clothes, accessories, and more'
            },
            'health-medical': {
                title: 'Health & Medical',
                level: 'B1',
                estimatedTime: 18,
                wordCount: 15,
                icon: '🏥',
                description: 'Essential vocabulary for doctors, pharmacies, and health'
            },
            'family-relationships': {
                title: 'Family & Relationships',
                level: 'A1-A2',
                estimatedTime: 14,
                wordCount: 12,
                icon: '👨‍👩‍👧‍👦',
                description: 'Talk about family, friends, and relationships'
            },
            'hobbies-sports': {
                title: 'Hobbies & Sports',
                level: 'A2-B1',
                estimatedTime: 16,
                wordCount: 13,
                icon: '⚽',
                description: 'Discuss your interests, sports, and leisure activities'
            },
            'weather-nature': {
                title: 'Weather & Nature',
                level: 'A2',
                estimatedTime: 13,
                wordCount: 10,
                icon: '🌤️',
                description: 'Describe weather, seasons, and the natural world'
            }
        };
        
        // Multi-day learning journeys (7-day programs)
        this.LEARNING_JOURNEYS = {
            'beginner-spanish': {
                title: 'Beginner Spanish Essentials',
                description: 'A 7-day intensive journey through basic Spanish',
                level: 'A1',
                duration: 7, // days
                totalXP: 700,
                topics: ['daily-routine', 'family-relationships', 'food-restaurants', 'shopping-clothes', 'hobbies-sports', 'weather-nature', 'travel-spain'],
                badge: {
                    id: 'beginner_complete',
                    name: 'Beginner Champion',
                    icon: '🌟',
                    description: 'Completed the 7-day Beginner Journey'
                }
            },
            'travel-spanish': {
                title: 'Travel Spanish in a Week',
                description: 'Everything you need to travel confidently in Spanish-speaking countries',
                level: 'A2-B1',
                duration: 7,
                totalXP: 850,
                topics: ['travel-spain', 'food-restaurants', 'shopping-clothes', 'health-medical', 'weather-nature', 'culture-traditions', 'daily-routine'],
                badge: {
                    id: 'travel_ready',
                    name: 'Globetrotter',
                    icon: '🌍',
                    description: 'Ready to travel the Spanish-speaking world'
                }
            },
            'business-spanish': {
                title: 'Business Spanish Professional',
                description: 'Master professional Spanish for work environments',
                level: 'B1-B2',
                duration: 7,
                totalXP: 1000,
                topics: ['work-business', 'daily-routine', 'culture-traditions', 'food-restaurants', 'travel-spain', 'health-medical', 'hobbies-sports'],
                badge: {
                    id: 'business_pro',
                    name: 'Business Pro',
                    icon: '💼',
                    description: 'Mastered professional Spanish'
                }
            }
        };
    }
    
    /**
     * Start a new guided learning journey
     */
    async startJourney(userId, topicId, journeyType = 'standard') {
        console.log(`🎯 Starting guided learning journey: ${topicId} (${journeyType})`);
        
        // Get topic configuration
        const topic = this.TOPICS[topicId];
        if (!topic) {
            throw new Error(`Topic not found: ${topicId}`);
        }
        
        // Determine word count based on journey type
        const wordCount = this.getWordCountForJourneyType(journeyType);
        
        // Get or generate article for this topic
        const article = await this.getArticleForTopic(topicId, userId);
        
        // Extract target words from article
        const targetWords = await this.extractTargetWords(article, wordCount, userId);
        
        // Find videos for each target word
        const videosByWord = await this.findVideosForWords(targetWords);
        
        // Generate journey steps
        const steps = this.generateJourneySteps(article, targetWords, videosByWord);
        
        // Create journey state
        const journey = {
            journeyId: this.generateJourneyId(),
            userId,
            topicId,
            topic,
            journeyType,
            article,
            targetWords,
            videosByWord,
            steps,
            currentStep: 0,
            progress: {
                wordsLearned: 0,
                totalWords: targetWords.length,
                quizzesCompleted: 0,
                gamesCompleted: 0,
                timeSpent: 0
            },
            startTime: new Date(),
            status: 'active',
            completed: false
        };
        
        return journey;
    }
    
    /**
     * Get word count based on journey type
     */
    getWordCountForJourneyType(journeyType) {
        switch (journeyType) {
            case this.JOURNEY_TYPES.QUICK: return 5;
            case this.JOURNEY_TYPES.STANDARD: return 10;
            case this.JOURNEY_TYPES.DEEP_DIVE: return 20;
            case this.JOURNEY_TYPES.MASTERY: return 50;
            default: return 10;
        }
    }
    
    /**
     * Get article for topic (from database or generate with AI)
     */
    async getArticleForTopic(topicId, userId) {
        // In production, fetch from database or generate with OpenAI
        // For now, return mock article
        const articles = {
            'food-restaurants': {
                title: 'La Comida Mexicana',
                content: `
La comida mexicana es muy popular en todo el mundo. Los tacos, las quesadillas y los burritos son algunos de los platos más conocidos. En un restaurante mexicano, puedes encontrar muchos ingredientes frescos como tomate, aguacate, cilantro y chile.

El guacamole es una salsa hecha con aguacate que acompaña muchos platos. También es común comer tortillas de maíz con la comida. La comida mexicana tiene muchos sabores: dulce, salado, picante y ácido.

Si visitas México, debes probar los tacos al pastor, los tamales y el mole. Cada región de México tiene sus propias especialidades culinarias. ¡Buen provecho!
                `.trim(),
                level: 'A2',
                imageUrl: '/images/mexican-food.jpg',
                topics: ['food', 'restaurants', 'mexico']
            },
            'travel-spain': {
                title: 'Viajando por España',
                content: `
España es un país hermoso con mucha historia y cultura. Si planeas viajar a España, hay muchos lugares interesantes que visitar. Madrid, la capital, tiene museos famosos como el Museo del Prado. Barcelona es conocida por la arquitectura de Gaudí y las playas del Mediterráneo.

En el sur de España está Andalucía, donde puedes ver el Flamenco y visitar la Alhambra de Granada. El norte tiene paisajes verdes y la deliciosa comida vasca. No olvides probar la paella en Valencia y el jamón ibérico en todas partes.

El transporte en España es muy bueno. Puedes viajar en tren de alta velocidad entre ciudades. Los hoteles y hostales son cómodos y no muy caros. ¡España te espera!
                `.trim(),
                level: 'B1',
                imageUrl: '/images/spain-travel.jpg',
                topics: ['travel', 'spain', 'culture']
            },
            'daily-routine': {
                title: 'Mi Rutina Diaria',
                content: `
Me levanto a las siete de la mañana todos los días. Primero, me ducho y me visto. Luego desayuno café con tostadas. A las ocho, salgo de casa y voy al trabajo en autobús.

Trabajo desde las nueve hasta las cinco de la tarde. A mediodía, tengo una hora para almorzar. Normalmente como en un restaurante cerca de mi oficina con mis compañeros.

Después del trabajo, voy al gimnasio o doy un paseo. Llego a casa a las siete. Preparo la cena, veo televisión y leo un libro. Me acuesto a las once de la noche. ¡Y mañana empieza todo otra vez!
                `.trim(),
                level: 'A1',
                imageUrl: '/images/daily-routine.jpg',
                topics: ['daily-life', 'routine']
            }
        };
        
        return articles[topicId] || articles['food-restaurants'];
    }
    
    /**
     * Extract target words from article that user should learn
     */
    async extractTargetWords(article, wordCount, userId) {
        // Analyze article difficulty
        const analysis = contentDifficultyAnalyzer.analyzeTranscription(article.content, false);
        
        // Get user's known words (mock for now)
        const userKnownWords = new Set(); // Would fetch from database
        
        // Find words user doesn't know yet
        const unknownWords = analysis.uniqueWords.filter(word => {
            return !userKnownWords.has(word.toLowerCase());
        });
        
        // Sort by frequency (more common words first)
        const wordsWithFrequency = unknownWords.map(word => {
            const rank = frequencyLookup.getWordRank(word);
            return { word, rank };
        }).sort((a, b) => a.rank - b.rank);
        
        // Select top N words
        const targetWords = wordsWithFrequency
            .slice(0, wordCount)
            .map((item, index) => ({
                word: item.word,
                rank: item.rank,
                translation: this.getTranslation(item.word), // Would use real translation API
                index: index + 1,
                learned: false,
                context: this.extractContext(article.content, item.word)
            }));
        
        return targetWords;
    }
    
    /**
     * Find videos where each target word is used
     */
    async findVideosForWords(targetWords) {
        // In production, search video database for videos containing these words
        // For now, return mock video assignments
        const videosByWord = {};
        
        targetWords.forEach(wordObj => {
            videosByWord[wordObj.word] = [
                {
                    id: `video_${wordObj.word}_1`,
                    title: `Using "${wordObj.word}" in conversation`,
                    path: `/videos/word-examples/${wordObj.word}_1.mp4`,
                    duration: 30,
                    difficulty: 'A2',
                    context: 'casual'
                },
                {
                    id: `video_${wordObj.word}_2`,
                    title: `"${wordObj.word}" in different situations`,
                    path: `/videos/word-examples/${wordObj.word}_2.mp4`,
                    duration: 35,
                    difficulty: 'A2',
                    context: 'formal'
                }
            ];
        });
        
        return videosByWord;
    }
    
    /**
     * Generate all journey steps
     */
    generateJourneySteps(article, targetWords, videosByWord) {
        const steps = [];
        
        // Step 1: Article Introduction
        steps.push({
            id: 'intro',
            type: this.STEPS.ARTICLE_INTRO,
            title: article.title,
            content: {
                article: article,
                targetWords: targetWords.map(w => w.word),
                instruction: `Read this article. You'll learn ${targetWords.length} new words!`
            },
            estimatedTime: 3 // minutes
        });
        
        // Steps 2-N: For each word, show videos + quiz
        targetWords.forEach((wordObj, index) => {
            // Video learning step
            steps.push({
                id: `word_${index}_videos`,
                type: this.STEPS.VIDEO_LEARNING,
                title: `Learn: "${wordObj.word}"`,
                content: {
                    word: wordObj,
                    videos: videosByWord[wordObj.word],
                    instruction: `Watch these videos to see how "${wordObj.word}" is used`
                },
                estimatedTime: 2
            });
            
            // Quick quiz step
            steps.push({
                id: `word_${index}_quiz`,
                type: this.STEPS.WORD_QUIZ,
                title: `Quick Quiz`,
                content: {
                    word: wordObj,
                    questions: this.generateWordQuiz(wordObj, videosByWord[wordObj.word])
                },
                estimatedTime: 1
            });
            
            // Mini-game every 3 words
            if ((index + 1) % 3 === 0 || index === targetWords.length - 1) {
                steps.push({
                    id: `game_${Math.floor(index / 3)}`,
                    type: this.STEPS.MINI_GAME,
                    title: `Practice Game`,
                    content: {
                        words: targetWords.slice(Math.max(0, index - 2), index + 1),
                        gameType: 'speed_match' // or 'memory', 'fill_blank', etc.
                    },
                    estimatedTime: 2
                });
            }
        });
        
        // Step N+1: Return to article
        steps.push({
            id: 'review_article',
            type: this.STEPS.ARTICLE_REVIEW,
            title: 'Review the Article',
            content: {
                article: article,
                learnedWords: targetWords.map(w => w.word),
                instruction: 'Re-read the article. Notice how much more you understand now!'
            },
            estimatedTime: 2
        });
        
        // Step N+2: Final comprehension quiz
        steps.push({
            id: 'final_quiz',
            type: this.STEPS.FINAL_QUIZ,
            title: 'Final Challenge',
            content: {
                questions: this.generateFinalQuiz(article, targetWords)
            },
            estimatedTime: 3
        });
        
        // Step N+3: Celebration
        steps.push({
            id: 'celebration',
            type: this.STEPS.CELEBRATION,
            title: '🎉 Journey Complete!',
            content: {
                wordsLearned: targetWords.length,
                topic: article.title,
                nextTopicsSuggestion: this.suggestNextTopics(article.topics)
            },
            estimatedTime: 1
        });
        
        return steps;
    }
    
    /**
     * Generate quiz questions for a specific word
     */
    generateWordQuiz(wordObj, videos) {
        return [
            {
                id: `${wordObj.word}_q1`,
                type: 'translation',
                question: `What does "${wordObj.word}" mean?`,
                options: [
                    wordObj.translation,
                    this.getRandomTranslation(),
                    this.getRandomTranslation(),
                    this.getRandomTranslation()
                ],
                correctAnswer: 0,
                explanation: `"${wordObj.word}" means "${wordObj.translation}"`
            },
            {
                id: `${wordObj.word}_q2`,
                type: 'context',
                question: `Which sentence uses "${wordObj.word}" correctly?`,
                options: [
                    wordObj.context,
                    `Incorrect usage example 1`,
                    `Incorrect usage example 2`,
                    `Incorrect usage example 3`
                ],
                correctAnswer: 0,
                explanation: `The correct usage is: "${wordObj.context}"`
            },
            {
                id: `${wordObj.word}_q3`,
                type: 'audio',
                question: `Listen and identify "${wordObj.word}"`,
                audioUrl: `/api/tts?text=${encodeURIComponent(wordObj.word)}`,
                options: [
                    wordObj.word,
                    this.getRandomWord(),
                    this.getRandomWord(),
                    this.getRandomWord()
                ],
                correctAnswer: 0,
                explanation: `You heard: "${wordObj.word}"`
            }
        ];
    }
    
    /**
     * Generate final comprehension quiz
     */
    generateFinalQuiz(article, targetWords) {
        return [
            {
                id: 'final_q1',
                type: 'comprehension',
                question: `What is the main topic of the article?`,
                options: [
                    article.title,
                    'Unrelated topic 1',
                    'Unrelated topic 2',
                    'Unrelated topic 3'
                ],
                correctAnswer: 0
            },
            {
                id: 'final_q2',
                type: 'vocabulary_mix',
                question: `Match the words to their meanings`,
                words: targetWords.slice(0, 5).map(w => w.word),
                translations: targetWords.slice(0, 5).map(w => w.translation)
            },
            {
                id: 'final_q3',
                type: 'fill_blank',
                question: `Complete the sentence with the correct word`,
                sentence: this.generateFillBlankFromArticle(article, targetWords[0])
            }
        ];
    }
    
    /**
     * Get next step in journey
     */
    async getNextStep(journey) {
        const currentStepIndex = journey.currentStep;
        
        if (currentStepIndex >= journey.steps.length) {
            return this.completeJourney(journey);
        }
        
        const step = journey.steps[currentStepIndex];
        
        return {
            journey,
            step,
            progress: {
                current: currentStepIndex + 1,
                total: journey.steps.length,
                percent: Math.round(((currentStepIndex + 1) / journey.steps.length) * 100)
            }
        };
    }
    
    /**
     * Submit answer for current step
     */
    async submitStepAnswer(journey, answer) {
        const currentStep = journey.steps[journey.currentStep];
        
        let result = {
            correct: false,
            feedback: '',
            points: 0
        };
        
        if (currentStep.type === this.STEPS.WORD_QUIZ) {
            result = this.gradeQuiz(currentStep.content.questions, answer);
        } else if (currentStep.type === this.STEPS.MINI_GAME) {
            result = this.gradeGame(currentStep.content, answer);
        } else if (currentStep.type === this.STEPS.FINAL_QUIZ) {
            result = this.gradeFinalQuiz(currentStep.content.questions, answer);
        }
        
        // Update progress
        if (result.correct) {
            if (currentStep.type === this.STEPS.WORD_QUIZ) {
                journey.progress.quizzesCompleted++;
            } else if (currentStep.type === this.STEPS.MINI_GAME) {
                journey.progress.gamesCompleted++;
            }
        }
        
        // Move to next step
        journey.currentStep++;
        
        return {
            ...result,
            nextStep: journey.currentStep < journey.steps.length
        };
    }
    
    /**
     * Complete journey and show results
     */
    async completeJourney(journey) {
        journey.completed = true;
        journey.endTime = new Date();
        journey.status = 'completed';
        
        const duration = (journey.endTime - journey.startTime) / 1000 / 60; // minutes
        
        return {
            completed: true,
            results: {
                wordsLearned: journey.targetWords.length,
                quizzesCompleted: journey.progress.quizzesCompleted,
                gamesCompleted: journey.progress.gamesCompleted,
                duration: Math.round(duration),
                xpEarned: journey.targetWords.length * 10,
                badges: this.awardBadges(journey),
                nextTopics: this.suggestNextTopics(journey.article.topics)
            },
            celebration: {
                title: `🎉 Amazing! You learned ${journey.targetWords.length} words!`,
                message: `You completed the ${journey.topic.title} journey in ${Math.round(duration)} minutes.`,
                shareable: true
            }
        };
    }
    
    /**
     * Award badges based on performance
     */
    awardBadges(journey) {
        const badges = [];
        
        if (journey.progress.quizzesCompleted === journey.targetWords.length) {
            badges.push({
                id: 'quiz_master',
                name: 'Quiz Master',
                icon: '🎯',
                description: 'Completed all quizzes perfectly'
            });
        }
        
        const duration = (journey.endTime - journey.startTime) / 1000 / 60;
        if (duration < journey.steps.reduce((sum, step) => sum + step.estimatedTime, 0)) {
            badges.push({
                id: 'speed_learner',
                name: 'Speed Learner',
                icon: '⚡',
                description: 'Completed faster than estimated'
            });
        }
        
        return badges;
    }
    
    /**
     * Suggest next topics based on completed topic
     */
    suggestNextTopics(completedTopics) {
        const allTopics = Object.entries(this.TOPICS);
        
        return allTopics
            .filter(([id, topic]) => !completedTopics.includes(id))
            .slice(0, 3)
            .map(([id, topic]) => ({
                id,
                ...topic
            }));
    }
    
    // ===== Helper Functions =====
    
    generateJourneyId() {
        return `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getTranslation(spanishWord) {
        const translations = {
            'comida': 'food',
            'tacos': 'tacos',
            'restaurante': 'restaurant',
            'aguacate': 'avocado',
            'tomate': 'tomato',
            'chile': 'chili',
            'salsa': 'sauce',
            'tortilla': 'tortilla',
            'picante': 'spicy',
            'dulce': 'sweet'
        };
        return translations[spanishWord] || 'unknown';
    }
    
    getRandomTranslation() {
        const translations = ['water', 'house', 'dog', 'car', 'book', 'happy', 'big', 'small'];
        return translations[Math.floor(Math.random() * translations.length)];
    }
    
    getRandomWord() {
        const words = ['casa', 'perro', 'gato', 'agua', 'libro', 'mesa', 'silla'];
        return words[Math.floor(Math.random() * words.length)];
    }
    
    extractContext(text, word) {
        const sentences = text.split(/[.!?]+/);
        const sentenceWithWord = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
        return sentenceWithWord ? sentenceWithWord.trim() : `Example sentence with ${word}`;
    }
    
    generateFillBlankFromArticle(article, wordObj) {
        const context = wordObj.context;
        const sentence = context.replace(new RegExp(wordObj.word, 'gi'), '_____');
        return {
            sentence,
            correctAnswer: wordObj.word,
            options: [wordObj.word, this.getRandomWord(), this.getRandomWord(), this.getRandomWord()]
        };
    }
    
    gradeQuiz(questions, answer) {
        // Simplified grading
        return {
            correct: true,
            feedback: 'Correct! Great job!',
            points: 10
        };
    }
    
    gradeGame(gameContent, answer) {
        return {
            correct: true,
            feedback: 'Nice work!',
            points: 20
        };
    }
    
    gradeFinalQuiz(questions, answer) {
        return {
            correct: true,
            feedback: 'Perfect! You mastered this topic!',
            points: 50
        };
    }
    
    /**
     * Get available topics for user's level
     */
    getAvailableTopics(userLevel) {
        return Object.entries(this.TOPICS)
            .filter(([id, topic]) => {
                // Match topic level to user level
                const topicLevelRange = topic.level.split('-');
                return topicLevelRange.some(lvl => userLevel.startsWith(lvl));
            })
            .map(([id, topic]) => ({
                id,
                ...topic
            }));
    }
    
    /**
     * Start a multi-day learning journey (7-day program)
     */
    async startMultiDayJourney(userId, journeyId) {
        console.log(`🎯 Starting multi-day journey: ${journeyId}`);
        
        const journey = this.LEARNING_JOURNEYS[journeyId];
        if (!journey) {
            throw new Error(`Journey not found: ${journeyId}`);
        }
        
        // Create journey state with all days
        const multiDayJourney = {
            journeyId: this.generateJourneyId(),
            userId,
            programId: journeyId,
            title: journey.title,
            description: journey.description,
            level: journey.level,
            duration: journey.duration,
            totalXP: journey.totalXP,
            badge: journey.badge,
            days: [],
            currentDay: 0,
            overallProgress: {
                daysCompleted: 0,
                totalDays: journey.duration,
                xpEarned: 0,
                totalXP: journey.totalXP
            },
            startTime: new Date(),
            status: 'active'
        };
        
        // Generate a session for each day/topic
        for (let dayIndex = 0; dayIndex < journey.topics.length; dayIndex++) {
            const topicId = journey.topics[dayIndex];
            const topic = this.TOPICS[topicId];
            
            multiDayJourney.days.push({
                dayNumber: dayIndex + 1,
                topicId,
                topic,
                status: dayIndex === 0 ? 'active' : 'locked',
                completed: false,
                xpEarned: 0,
                xpPossible: 100
            });
        }
        
        return multiDayJourney;
    }
    
    /**
     * Get current day's session for a multi-day journey
     */
    async getCurrentDaySession(multiDayJourney) {
        const currentDay = multiDayJourney.days[multiDayJourney.currentDay];
        
        if (!currentDay || currentDay.completed) {
            return null;
        }
        
        // Generate a single-day journey for the current topic
        const session = await this.startJourney(
            multiDayJourney.userId,
            currentDay.topicId,
            'standard'
        );
        
        return {
            multiDayJourney,
            currentDay,
            session
        };
    }
    
    /**
     * Complete current day and advance to next
     */
    async completeDayAndAdvance(multiDayJourney, dayResults) {
        const currentDay = multiDayJourney.days[multiDayJourney.currentDay];
        
        // Mark current day complete
        currentDay.completed = true;
        currentDay.status = 'completed';
        currentDay.xpEarned = dayResults.xpEarned || 100;
        
        // Update overall progress
        multiDayJourney.overallProgress.daysCompleted++;
        multiDayJourney.overallProgress.xpEarned += currentDay.xpEarned;
        
        // Unlock next day
        if (multiDayJourney.currentDay + 1 < multiDayJourney.days.length) {
            multiDayJourney.currentDay++;
            multiDayJourney.days[multiDayJourney.currentDay].status = 'active';
            
            return {
                journeyComplete: false,
                nextDay: multiDayJourney.days[multiDayJourney.currentDay],
                progress: multiDayJourney.overallProgress
            };
        } else {
            // Journey complete!
            multiDayJourney.status = 'completed';
            multiDayJourney.endTime = new Date();
            
            return {
                journeyComplete: true,
                badge: multiDayJourney.badge,
                totalXP: multiDayJourney.overallProgress.xpEarned,
                duration: Math.round((multiDayJourney.endTime - multiDayJourney.startTime) / 1000 / 60 / 60 / 24), // days
                celebration: {
                    title: `🎉 ${multiDayJourney.title} Complete!`,
                    message: `You've completed all ${multiDayJourney.duration} days and earned ${multiDayJourney.overallProgress.xpEarned} XP!`,
                    badge: multiDayJourney.badge
                }
            };
        }
    }
    
    /**
     * Get all available journeys for user
     */
    getAvailableJourneys(userLevel) {
        return Object.entries(this.LEARNING_JOURNEYS)
            .filter(([id, journey]) => {
                // Basic level matching
                const journeyLevel = journey.level.split('-')[0];
                return userLevel.startsWith(journeyLevel) || journeyLevel === 'A1';
            })
            .map(([id, journey]) => ({
                id,
                ...journey
            }));
    }
    
    /**
     * Generate active recall questions from learned content
     */
    generateActiveRecallQuiz(learnedWords, articleContext) {
        const questions = [];
        
        // Sample 5 words for quick recall
        const wordsToTest = learnedWords.slice(0, 5);
        
        wordsToTest.forEach((wordObj, idx) => {
            // Fill-in-the-blank from original context
            questions.push({
                id: `recall_${idx}_fill`,
                type: 'fill_blank',
                question: `Complete the sentence:`,
                sentence: this.generateFillBlankFromArticle({ content: articleContext }, wordObj).sentence,
                correctAnswer: wordObj.word,
                points: 10
            });
            
            // Quick translation recall
            questions.push({
                id: `recall_${idx}_translate`,
                type: 'translation_recall',
                question: `What does "${wordObj.word}" mean in English?`,
                correctAnswer: wordObj.translation,
                points: 5
            });
        });
        
        return questions;
    }
    
    /**
     * Schedule spaced repetition follow-ups
     */
    scheduleSpacedRepetition(userId, learnedWords, journeyId) {
        const schedule = [];
        const now = new Date();
        
        // Spaced repetition intervals: 1 day, 3 days, 7 days, 14 days, 30 days
        const intervals = [1, 3, 7, 14, 30];
        
        intervals.forEach(days => {
            const reviewDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            
            schedule.push({
                userId,
                journeyId,
                words: learnedWords.map(w => w.word),
                reviewDate,
                intervalDays: days,
                status: 'scheduled'
            });
        });
        
        return schedule;
    }
}

module.exports = GuidedLearningEngine;
