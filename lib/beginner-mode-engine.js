/**
 * BEGINNER MODE ENGINE
 * 
 * Complete system for absolute beginners (0 Spanish words known)
 * Research-backed approach to prevent cognitive overload and build confidence
 * 
 * Key Principles:
 * 1. Never show more than 3 new words at once
 * 2. Every action gets positive reinforcement
 * 3. Automatic difficulty adjustment based on struggle signals
 * 4. Progressive vocabulary introduction (20 → 50 → 100 → 200 words)
 * 5. Confidence building through micro-wins
 */

const path = require('path');
const fs = require('fs');

// First 20 words curriculum (Week 1) - Ultra-essential survival Spanish
const FIRST_20_WORDS = [
    // Session 1: Basic greetings (5 words)
    { spanish: 'hola', english: 'hello', frequency: 1, category: 'greetings', imageHint: '👋' },
    { spanish: 'adiós', english: 'goodbye', frequency: 2, category: 'greetings', imageHint: '👋' },
    { spanish: 'sí', english: 'yes', frequency: 3, category: 'basic', imageHint: '✓' },
    { spanish: 'no', english: 'no', frequency: 4, category: 'basic', imageHint: '✗' },
    { spanish: 'gracias', english: 'thank you', frequency: 5, category: 'courtesy', imageHint: '🙏' },
    
    // Session 2: Courtesy & basics (5 words)
    { spanish: 'por favor', english: 'please', frequency: 6, category: 'courtesy', imageHint: '🙏' },
    { spanish: 'perdón', english: 'sorry/excuse me', frequency: 7, category: 'courtesy', imageHint: '😊' },
    { spanish: 'yo', english: 'I', frequency: 8, category: 'pronouns', imageHint: '👤' },
    { spanish: 'tú', english: 'you', frequency: 9, category: 'pronouns', imageHint: '👥' },
    { spanish: 'qué', english: 'what', frequency: 10, category: 'questions', imageHint: '❓' },
    
    // Session 3: Questions & essentials (5 words)
    { spanish: 'cómo', english: 'how', frequency: 11, category: 'questions', imageHint: '❓' },
    { spanish: 'dónde', english: 'where', frequency: 12, category: 'questions', imageHint: '📍' },
    { spanish: 'agua', english: 'water', frequency: 15, category: 'essentials', imageHint: '💧' },
    { spanish: 'comida', english: 'food', frequency: 18, category: 'essentials', imageHint: '🍽️' },
    { spanish: 'baño', english: 'bathroom', frequency: 20, category: 'essentials', imageHint: '🚽' },
    
    // Session 4: More essentials (5 words)
    { spanish: 'ayuda', english: 'help', frequency: 25, category: 'essentials', imageHint: '🆘' },
    { spanish: 'amigo', english: 'friend', frequency: 30, category: 'social', imageHint: '👫' },
    { spanish: 'casa', english: 'house', frequency: 35, category: 'places', imageHint: '🏠' },
    { spanish: 'bueno', english: 'good', frequency: 40, category: 'adjectives', imageHint: '👍' },
    { spanish: 'malo', english: 'bad', frequency: 45, category: 'adjectives', imageHint: '👎' }
];

// Week 2-4 progressive vocabulary (rank 20-200)
const PROGRESSIVE_CURRICULUM = {
    week2: ['de', 'en', 'el', 'la', 'un', 'una', 'está', 'estoy', 'muy', 'más', 'menos', 'grande', 'pequeño', 'tiempo', 'día', 'noche', 'mañana', 'tarde', 'ahora', 'después', 'antes', 'siempre', 'nunca', 'mucho', 'poco', 'todo', 'nada', 'algo', 'aquí', 'allí'],
    week3: ['quiero', 'puedo', 'tengo', 'voy', 'necesito', 'me gusta', 'comer', 'beber', 'hablar', 'escuchar', 'ver', 'hacer', 'ir', 'venir', 'dar', 'tomar', 'poner', 'sacar', 'buscar', 'encontrar', 'trabajo', 'dinero', 'precio', 'cuánto', 'demasiado', 'suficiente', 'cerca', 'lejos', 'rápido', 'lento'],
    week4: ['familia', 'madre', 'padre', 'hermano', 'hermana', 'hijo', 'hija', 'ciudad', 'país', 'calle', 'tienda', 'restaurante', 'hotel', 'aeropuerto', 'hospital', 'escuela', 'universidad', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio']
};

class BeginnerModeEngine {
    constructor(supabase = null) {
        this.supabase = supabase;
        this.dataDir = path.join(__dirname, '../data/beginner-progress');
        this.ensureDataDir();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * BEGINNER DETECTION
     * Determines if user is an absolute beginner
     */
    isAbsoluteBeginner(user) {
        if (!user) return true; // No user data = beginner
        
        const knownWords = user.knownWords?.length || 0;
        const accountAge = this.getAccountAgeHours(user.createdAt);
        const placementLevel = user.currentLevel || user.level || 'A1';
        const clickedSkipTest = user.skippedPlacement || false;
        const totalVideosWatched = user.totalVideosWatched || user.progress?.totalVideosWatched || 0;

        // Beginner criteria
        return (
            knownWords < 50 ||
            accountAge < 24 ||
            placementLevel === 'A1' ||
            clickedSkipTest === true ||
            totalVideosWatched < 5
        );
    }

    getAccountAgeHours(createdAt) {
        if (!createdAt) return 0;
        const created = new Date(createdAt);
        const now = new Date();
        return (now - created) / (1000 * 60 * 60); // hours
    }

    /**
     * GET BEGINNER CURRICULUM
     * Returns structured learning path for beginners
     */
    getBeginnerCurriculum(week = 1) {
        if (week === 1) {
            return {
                week: 1,
                title: 'Your First 20 Spanish Words',
                description: 'Essential words for survival Spanish',
                words: FIRST_20_WORDS,
                sessions: [
                    { session: 1, words: FIRST_20_WORDS.slice(0, 5), title: 'Greetings & Basics' },
                    { session: 2, words: FIRST_20_WORDS.slice(5, 10), title: 'Being Polite' },
                    { session: 3, words: FIRST_20_WORDS.slice(10, 15), title: 'Asking Questions' },
                    { session: 4, words: FIRST_20_WORDS.slice(15, 20), title: 'Essential Needs' }
                ],
                goalXP: 100,
                estimatedTime: '15-20 minutes'
            };
        }

        // Weeks 2-4
        if (week >= 2 && week <= 4) {
            const weekKey = `week${week}`;
            return {
                week: week,
                title: `Week ${week}: Building Your Foundation`,
                description: 'Expanding your vocabulary naturally',
                wordList: PROGRESSIVE_CURRICULUM[weekKey] || [],
                maxNewWordsPerSession: 3,
                goalXP: week * 150,
                estimatedTime: `${week * 5} minutes per day`
            };
        }

        return null;
    }

    /**
     * FILTER CONTENT FOR BEGINNERS
     * Only show videos with words from rank 1-100
     * Max 3 new words per video
     */
    filterBeginnerContent(allContent, userKnownWords = []) {
        const knownWordsSet = new Set(userKnownWords.map(w => w.toLowerCase()));
        
        return allContent
            .filter(content => {
                // Must have transcription
                if (!content.transcription || !content.transcription.lines) return false;

                // Calculate unique words in content
                const wordsInContent = this.extractWords(content.transcription);
                const uniqueWords = [...new Set(wordsInContent.map(w => w.toLowerCase()))];
                
                // Count new words (unknown to user)
                const newWords = uniqueWords.filter(w => !knownWordsSet.has(w));
                
                // Beginner criteria:
                // 1. Max 3 new words
                // 2. Total unique words < 15
                // 3. Video duration < 30 seconds
                const duration = content.duration || 0;
                
                return (
                    newWords.length <= 3 &&
                    uniqueWords.length <= 15 &&
                    duration > 3 &&
                    duration <= 30
                );
            })
            .map(content => {
                // Add beginner-friendly metadata
                const wordsInContent = this.extractWords(content.transcription);
                const uniqueWords = [...new Set(wordsInContent.map(w => w.toLowerCase()))];
                const newWords = uniqueWords.filter(w => !knownWordsSet.has(w));
                
                return {
                    ...content,
                    beginnerMetadata: {
                        totalUniqueWords: uniqueWords.length,
                        newWordsCount: newWords.length,
                        newWords: newWords,
                        difficulty: 'A1',
                        recommendedForBeginner: true
                    }
                };
            })
            .sort((a, b) => {
                // Sort by: fewest new words first, then shortest duration
                if (a.beginnerMetadata.newWordsCount !== b.beginnerMetadata.newWordsCount) {
                    return a.beginnerMetadata.newWordsCount - b.beginnerMetadata.newWordsCount;
                }
                return a.duration - b.duration;
            });
    }

    extractWords(transcription) {
        if (!transcription || !transcription.lines) return [];
        
        const words = [];
        transcription.lines.forEach(line => {
            if (line.spanish) {
                const lineWords = line.spanish
                    .toLowerCase()
                    .replace(/[¿?!¡.,;:]/g, '') // Remove punctuation
                    .split(/\s+/)
                    .filter(w => w.length > 0);
                words.push(...lineWords);
            }
        });
        
        return words;
    }

    /**
     * PROGRESSIVE WORD INTRODUCTION
     * Returns next 3 words to learn based on user progress
     */
    getNextWordsToLearn(userProgress, count = 3) {
        const knownWords = userProgress.knownWords || [];
        const knownWordsSet = new Set(knownWords.map(w => w.toLowerCase()));
        
        // Determine current week based on known words
        let currentWeek = 1;
        if (knownWords.length >= 20) currentWeek = 2;
        if (knownWords.length >= 50) currentWeek = 3;
        if (knownWords.length >= 100) currentWeek = 4;
        
        const curriculum = this.getBeginnerCurriculum(currentWeek);
        if (!curriculum) return [];
        
        // Get next unknown words from curriculum
        const allCurriculumWords = curriculum.words || 
            (curriculum.wordList || []).map(w => ({ spanish: w, english: '', frequency: 0 }));
        
        const nextWords = allCurriculumWords
            .filter(w => !knownWordsSet.has(w.spanish.toLowerCase()))
            .slice(0, count);
        
        return nextWords;
    }

    /**
     * DETECT STRUGGLE SIGNALS
     * Automatically detect when user is struggling
     */
    detectStruggle(userBehavior) {
        const struggles = [];
        
        // Signal 1: Multiple "I don't know" clicks
        if (userBehavior.dontKnowClicks >= 3) {
            struggles.push({
                type: 'vocabulary_confusion',
                severity: 'high',
                action: 'reduce_difficulty'
            });
        }
        
        // Signal 2: Frequent video skips
        const skipRate = userBehavior.videosSkipped / userBehavior.videosShown;
        if (skipRate > 0.5) {
            struggles.push({
                type: 'content_not_engaging',
                severity: 'medium',
                action: 'adjust_content_type'
            });
        }
        
        // Signal 3: Long session without progress
        if (userBehavior.sessionDurationMinutes > 20 && userBehavior.wordsLearned === 0) {
            struggles.push({
                type: 'overwhelmed',
                severity: 'high',
                action: 'suggest_break'
            });
        }
        
        // Signal 4: Low quiz scores
        if (userBehavior.lastQuizScore !== undefined && userBehavior.lastQuizScore < 50) {
            struggles.push({
                type: 'quiz_difficulty',
                severity: 'medium',
                action: 'review_mode'
            });
        }
        
        // Signal 5: Repeated slow playback speed
        if (userBehavior.playbackSpeed < 0.75) {
            struggles.push({
                type: 'comprehension_speed',
                severity: 'low',
                action: 'maintain_slow_speed'
            });
        }
        
        return {
            isStruggling: struggles.length > 0,
            struggles: struggles,
            recommendedActions: this.getRecommendedActions(struggles)
        };
    }

    getRecommendedActions(struggles) {
        const actions = [];
        
        struggles.forEach(struggle => {
            switch (struggle.action) {
                case 'reduce_difficulty':
                    actions.push({
                        action: 'Show only known words in next video',
                        message: '🌟 Let\'s review what you know!',
                        immediate: true
                    });
                    break;
                case 'adjust_content_type':
                    actions.push({
                        action: 'Show shorter, more visual content',
                        message: '✨ Let\'s try something different!',
                        immediate: true
                    });
                    break;
                case 'suggest_break':
                    actions.push({
                        action: 'Display break suggestion',
                        message: '😊 Great session! Take a 5-minute break?',
                        immediate: true
                    });
                    break;
                case 'review_mode':
                    actions.push({
                        action: 'Switch to review mode',
                        message: '💪 Let\'s practice what you\'ve learned!',
                        immediate: false
                    });
                    break;
            }
        });
        
        return actions;
    }

    /**
     * CHECK GRADUATION READINESS
     * Determine if user is ready to graduate from beginner mode
     */
    checkGraduationReadiness(userProgress) {
        const knownWords = userProgress.knownWords?.length || 0;
        const recentQuizScores = userProgress.recentQuizScores || [];
        const avgQuizScore = recentQuizScores.length > 0
            ? recentQuizScores.reduce((a, b) => a + b, 0) / recentQuizScores.length
            : 0;
        
        const completionRate = userProgress.videosCompleted / userProgress.videosShown || 0;
        const daysActive = userProgress.daysActive || 0;
        const hasClickedTooHard = userProgress.clickedTooHardRecently || false;
        
        const criteria = {
            knownWords: { required: 100, current: knownWords, met: knownWords >= 100 },
            quizPerformance: { required: 80, current: avgQuizScore, met: avgQuizScore >= 80 },
            completionRate: { required: 0.7, current: completionRate, met: completionRate >= 0.7 },
            daysActive: { required: 7, current: daysActive, met: daysActive >= 7 },
            noRecentStruggles: { required: true, current: !hasClickedTooHard, met: !hasClickedTooHard }
        };
        
        const allCriteriaMet = Object.values(criteria).every(c => c.met);
        const criteriaMet = Object.values(criteria).filter(c => c.met).length;
        const totalCriteria = Object.keys(criteria).length;
        
        return {
            ready: allCriteriaMet,
            progress: criteriaMet / totalCriteria,
            criteria: criteria,
            recommendedLevel: allCriteriaMet ? 'A2' : 'A1',
            nextMilestone: this.getNextMilestone(criteria)
        };
    }

    getNextMilestone(criteria) {
        for (const [key, value] of Object.entries(criteria)) {
            if (!value.met) {
                return {
                    criterion: key,
                    current: value.current,
                    required: value.required,
                    message: this.getMilestoneMessage(key, value)
                };
            }
        }
        return null;
    }

    getMilestoneMessage(criterion, value) {
        const messages = {
            knownWords: `Learn ${value.required - value.current} more words to reach 100!`,
            quizPerformance: `Keep practicing! Aim for ${value.required}% quiz scores.`,
            completionRate: `Try to complete more videos. You're at ${Math.round(value.current * 100)}%`,
            daysActive: `Come back for ${value.required - value.current} more days!`,
            noRecentStruggles: `You're doing great! Keep up the good work.`
        };
        return messages[criterion] || '';
    }

    /**
     * GENERATE BEGINNER ONBOARDING DATA
     * First-time user experience flow
     */
    generateOnboardingFlow() {
        return {
            steps: [
                {
                    step: 1,
                    title: '¡Hola! 👋',
                    content: 'Let\'s learn Spanish together!',
                    subtitle: 'No pressure, just fun',
                    action: 'Start Learning!',
                    duration: 3000
                },
                {
                    step: 2,
                    title: 'Your First Word',
                    content: FIRST_20_WORDS[0],
                    type: 'interactive_word',
                    action: 'Next Word →',
                    autoPlayAudio: true
                },
                {
                    step: 3,
                    title: '🎉 You know your first word!',
                    content: 'Tap any Spanish word to hear it',
                    type: 'tip',
                    action: 'Continue',
                    duration: 2000
                },
                {
                    step: 4,
                    title: 'Learn 5 More Words',
                    content: FIRST_20_WORDS.slice(1, 5),
                    type: 'word_carousel',
                    action: 'I\'m Ready!',
                    skippable: false
                },
                {
                    step: 5,
                    title: '🌟 Amazing!',
                    content: 'You now know 5 Spanish words!',
                    type: 'celebration',
                    xpEarned: 50,
                    action: 'Watch Your First Video',
                    duration: 2000
                }
            ],
            totalSteps: 5,
            estimatedTime: '2 minutes',
            xpReward: 50
        };
    }

    /**
     * SAVE USER PROGRESS
     */
    saveBeginnerProgress(userId, progressData) {
        const filePath = path.join(this.dataDir, `${userId}.json`);
        const existingData = this.loadBeginnerProgress(userId);
        
        const updatedData = {
            ...existingData,
            ...progressData,
            lastUpdated: new Date().toISOString()
        };
        
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
        return updatedData;
    }

    /**
     * LOAD USER PROGRESS
     */
    loadBeginnerProgress(userId) {
        const filePath = path.join(this.dataDir, `${userId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return {
                userId: userId,
                week: 1,
                knownWords: [],
                videosWatched: 0,
                xpEarned: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * TRACK MICRO-WIN
     * Record and celebrate small achievements
     */
    trackMicroWin(userId, winType, data = {}) {
        const microWins = {
            learned_first_word: { xp: 10, message: "You learned '{word}'!" },
            watched_first_video: { xp: 25, message: "You watched your first video!" },
            know_10_words: { xp: 50, message: "You know 10 words! 🎉" },
            three_day_streak: { xp: 100, message: "You're on a 3-day streak!" },
            completed_session: { xp: 20, message: "You're better than yesterday!" }
        };
        
        const win = microWins[winType];
        if (!win) return null;
        
        const progress = this.loadBeginnerProgress(userId);
        progress.xpEarned = (progress.xpEarned || 0) + win.xp;
        progress.microWins = progress.microWins || [];
        progress.microWins.push({
            type: winType,
            xp: win.xp,
            timestamp: new Date().toISOString(),
            data: data
        });
        
        this.saveBeginnerProgress(userId, progress);
        
        return {
            ...win,
            message: win.message.replace('{word}', data.word || ''),
            xp: win.xp,
            totalXP: progress.xpEarned
        };
    }
}

module.exports = BeginnerModeEngine;

