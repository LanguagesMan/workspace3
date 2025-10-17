// 🎧 PIMSLEUR-STYLE AUDIO-FIRST MODE - BUT BETTER
// Progressive subtitle reveal, graduated intervals, pronunciation focus

class PimsleurAudioMode {
    constructor() {
        this.sessions = new Map(); // sessionId -> session data
        this.userProgress = new Map(); // userId -> progress
    }

    /**
     * START AUDIO-FIRST SESSION
     * Hide subtitles initially, progressive reveal
     */
    startAudioSession(userId, videoId, videoData) {
        const sessionId = `audio_${userId}_${Date.now()}`;
        
        const session = {
            id: sessionId,
            userId,
            videoId,
            videoData,
            startTime: Date.now(),
            phase: 'listen_only', // listen_only → reveal_subtitles → active_practice
            viewCount: 0,
            revealedAt: null,
            practiceStarted: null,
            completed: false,
            
            // Graduated interval tracking
            intervals: {
                immediate: { played: false, timestamp: null },      // Right after first listen
                short: { played: false, timestamp: null },          // 30 seconds later
                medium: { played: false, timestamp: null },         // 5 minutes later
                long: { played: false, timestamp: null }            // 1 hour later
            },
            
            // User engagement
            pauseCount: 0,
            replayCount: 0,
            wordsClicked: [],
            pronunciationAttempts: []
        };
        
        this.sessions.set(sessionId, session);
        return session;
    }

    /**
     * PHASE 1: LISTEN ONLY
     * Video plays with NO subtitles - train your ear!
     */
    getListenOnlyConfig(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        return {
            mode: 'listen_only',
            showSubtitles: false,
            showTranslation: false,
            instructions: '🎧 LISTEN ONLY - No subtitles yet! Train your ear first.',
            tips: [
                'Don\'t worry if you don\'t understand everything',
                'Focus on the rhythm and sounds',
                'Try to catch familiar words',
                'Listen 2-3 times before revealing subtitles'
            ],
            recommendedViews: 2
        };
    }

    /**
     * PHASE 2: REVEAL SUBTITLES
     * After 2+ listens, show Spanish subtitles
     */
    revealSubtitles(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        session.phase = 'reveal_subtitles';
        session.revealedAt = Date.now();
        session.viewCount++;
        
        return {
            mode: 'reveal_subtitles',
            showSubtitles: true,
            showTranslation: false,
            instructions: '📝 Now you can see what you heard!',
            tips: [
                'Match the sounds to the written words',
                'Click any word you don\'t know',
                'Watch how words are pronounced',
                'Compare to what you thought you heard'
            ]
        };
    }

    /**
     * PHASE 3: ACTIVE PRACTICE
     * Interactive practice with graduated intervals
     */
    startActivePractice(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        session.phase = 'active_practice';
        session.practiceStarted = Date.now();
        
        return {
            mode: 'active_practice',
            showSubtitles: true,
            showTranslation: true,
            instructions: '💪 Time to practice! Repeat after the speaker.',
            exercises: this.generatePracticeExercises(session.videoData)
        };
    }

    /**
     * Generate practice exercises from video
     */
    generatePracticeExercises(videoData) {
        // Extract key phrases from transcription
        const exercises = [];
        
        // Exercise types:
        // 1. Repeat after speaker
        // 2. Fill in the blank
        // 3. Translation practice
        // 4. Pronunciation challenge
        
        exercises.push({
            type: 'repeat',
            instruction: 'Repeat this phrase:',
            phrase: 'Extractfrom video transcription',
            audioUrl: '/audio/phrase1.mp3',
            pointsAward: 10
        });
        
        exercises.push({
            type: 'pronunciation',
            instruction: 'Say this word clearly:',
            word: 'difícil',
            targetPronunciation: 'dee-FEE-seal',
            pointsAward: 15
        });
        
        exercises.push({
            type: 'translation',
            instruction: 'What does this mean?',
            phrase: '¿Cómo estás?',
            options: ['How are you?', 'What is this?', 'Where are you?', 'Who are you?'],
            correct: 0,
            pointsAward: 10
        });
        
        return exercises;
    }

    /**
     * GRADUATED INTERVAL RECALL
     * Pimsleur's signature technique: Review at increasing intervals
     */
    scheduleGraduatedIntervals(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        const now = Date.now();
        
        return {
            immediate: {
                time: now,
                delay: 0,
                message: '🔄 Review immediately - fresh in your memory!'
            },
            short: {
                time: now + (30 * 1000), // 30 seconds
                delay: 30,
                message: '⏱️ Quick review - can you still remember?'
            },
            medium: {
                time: now + (5 * 60 * 1000), // 5 minutes
                delay: 300,
                message: '🧠 Medium interval - solidifying memory...'
            },
            long: {
                time: now + (60 * 60 * 1000), // 1 hour
                delay: 3600,
                message: '📚 Long interval - test your retention!'
            },
            nextDay: {
                time: now + (24 * 60 * 60 * 1000), // 24 hours
                delay: 86400,
                message: '🌅 Tomorrow - see if it stuck!'
            }
        };
    }

    /**
     * Track interval completion
     */
    completeInterval(sessionId, intervalType) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.intervals[intervalType]) return false;
        
        session.intervals[intervalType].played = true;
        session.intervals[intervalType].timestamp = Date.now();
        
        return true;
    }

    /**
     * Get next interval due
     */
    getNextInterval(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        const now = Date.now();
        const intervals = this.scheduleGraduatedIntervals(sessionId);
        
        for (const [type, interval] of Object.entries(intervals)) {
            const sessionInterval = session.intervals[type];
            if (sessionInterval && !sessionInterval.played && interval.time <= now) {
                return {
                    type,
                    ...interval,
                    message: `${interval.message} (${Math.floor(interval.delay / 60)} min ago)`
                };
            }
        }
        
        return null; // All intervals completed or not yet due
    }

    /**
     * PRONUNCIATION FOCUS
     * Pimsleur emphasizes correct pronunciation from day 1
     */
    getPronunciationGuide(word) {
        const guides = {
            'difícil': {
                word: 'difícil',
                ipa: '/diˈfisil/',
                syllables: ['dee', 'FEE', 'seel'],
                stress: 2,
                pronunciation: 'dee-FEE-seal',
                tips: [
                    'Stress on the second syllable',
                    'The í has an accent - emphasize it!',
                    'Final "l" is soft, not hard'
                ],
                soundsLike: 'The "FEE" part sounds like "fee" in "coffee"',
                commonMistakes: [
                    '❌ "dif-ee-CULT" (English influence)',
                    '✅ "dee-FEE-seel" (Correct)'
                ]
            },
            'gracias': {
                word: 'gracias',
                ipa: '/ˈɡɾasjas/',
                syllables: ['GRA', 'see', 'ahs'],
                stress: 1,
                pronunciation: 'GRA-see-ahs',
                tips: [
                    'Stress on the first syllable',
                    'The "ci" sounds like "see"',
                    'Roll the "r" slightly if you can'
                ],
                soundsLike: '"GRA" like "grass" without the "s"',
                commonMistakes: [
                    '❌ "GRAY-shus" (English)',
                    '✅ "GRA-see-ahs" (Correct)'
                ]
            },
            'español': {
                word: 'español',
                ipa: '/espaˈɲol/',
                syllables: ['es', 'pah', 'NYOL'],
                stress: 3,
                pronunciation: 'es-pah-NYOL',
                tips: [
                    'Stress on the last syllable',
                    'The ñ sounds like "ny" in "canyon"',
                    'Final "ol" is emphasized'
                ],
                soundsLike: '"ñ" is like saying "ny" quickly',
                commonMistakes: [
                    '❌ "es-PAN-yol" (wrong stress)',
                    '✅ "es-pah-NYOL" (Correct)'
                ]
            }
        };
        
        return guides[word.toLowerCase()] || this.generateBasicPronunciation(word);
    }

    /**
     * Generate basic pronunciation guide for any word
     */
    generateBasicPronunciation(word) {
        return {
            word,
            pronunciation: word,
            tips: [
                'Listen to native pronunciation',
                'Repeat slowly at first',
                'Match the rhythm and intonation'
            ]
        };
    }

    /**
     * AUDIO-ONLY CHALLENGE MODE
     * No subtitles at all - ultimate test!
     */
    startAudioOnlyChallenge(userId, videoId) {
        const challengeId = `challenge_${userId}_${Date.now()}`;
        
        const challenge = {
            id: challengeId,
            userId,
            videoId,
            mode: 'audio_only_challenge',
            startTime: Date.now(),
            showSubtitles: false,
            showTranslation: false,
            allowReveal: false, // Can't reveal until end!
            
            // Comprehension check
            questions: this.generateComprehensionQuestions(),
            answersCorrect: 0,
            answersTotal: 0,
            
            completed: false
        };
        
        return challenge;
    }

    /**
     * Generate comprehension questions
     */
    generateComprehensionQuestions() {
        return [
            {
                question: 'What was the main topic?',
                options: ['Food', 'Travel', 'Work', 'Family'],
                correct: 0
            },
            {
                question: 'What emotion did the speaker express?',
                options: ['Happy', 'Sad', 'Angry', 'Surprised'],
                correct: 0
            },
            {
                question: 'How many people were mentioned?',
                options: ['1', '2', '3', '4+'],
                correct: 1
            }
        ];
    }

    /**
     * Track user progress in audio-first mode
     */
    trackProgress(userId, sessionData) {
        if (!this.userProgress.has(userId)) {
            this.userProgress.set(userId, {
                totalSessions: 0,
                completedSessions: 0,
                totalListeningTime: 0,
                averageViewsBeforeReveal: 0,
                pronunciationScore: 0,
                comprehensionScore: 0
            });
        }
        
        const progress = this.userProgress.get(userId);
        progress.totalSessions++;
        
        if (sessionData.completed) {
            progress.completedSessions++;
        }
        
        progress.totalListeningTime += sessionData.duration || 0;
        progress.averageViewsBeforeReveal = 
            (progress.averageViewsBeforeReveal * (progress.totalSessions - 1) + sessionData.viewCount) /
            progress.totalSessions;
        
        return progress;
    }

    /**
     * Get audio-first statistics
     */
    getAudioStats(userId) {
        const progress = this.userProgress.get(userId) || {
            totalSessions: 0,
            completedSessions: 0,
            totalListeningTime: 0,
            averageViewsBeforeReveal: 0,
            pronunciationScore: 0,
            comprehensionScore: 0
        };
        
        return {
            ...progress,
            listeningHours: Math.round(progress.totalListeningTime / 3600),
            completionRate: progress.totalSessions > 0 
                ? Math.round((progress.completedSessions / progress.totalSessions) * 100)
                : 0,
            recommendation: this.getListeningRecommendation(progress)
        };
    }

    /**
     * Get personalized listening recommendation
     */
    getListeningRecommendation(progress) {
        if (progress.averageViewsBeforeReveal < 2) {
            return {
                message: '💡 Try listening 2-3 times before revealing subtitles',
                benefit: 'Builds stronger listening skills'
            };
        }
        
        if (progress.comprehensionScore < 50) {
            return {
                message: '🎯 Focus on easier content to build confidence',
                benefit: 'Gradual improvement is better than overwhelming difficulty'
            };
        }
        
        return {
            message: '🌟 Great progress! Keep up the audio-first practice',
            benefit: 'You\'re building native-level listening skills'
        };
    }

    /**
     * Complete session
     */
    completeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        
        session.completed = true;
        session.endTime = Date.now();
        session.duration = (session.endTime - session.startTime) / 1000; // seconds
        
        // Track progress
        this.trackProgress(session.userId, session);
        
        return {
            sessionId,
            duration: session.duration,
            viewCount: session.viewCount,
            wordsLearned: session.wordsClicked.length,
            intervalsCompleted: Object.values(session.intervals).filter(i => i.played).length,
            xpEarned: this.calculateAudioXP(session)
        };
    }

    /**
     * Calculate XP for audio session
     */
    calculateAudioXP(session) {
        let xp = 0;
        
        // Base XP for completion
        xp += 30;
        
        // Bonus for listening multiple times before reveal
        if (session.viewCount >= 2) xp += 20;
        if (session.viewCount >= 3) xp += 10;
        
        // Bonus for completing intervals
        const intervalsCompleted = Object.values(session.intervals).filter(i => i.played).length;
        xp += intervalsCompleted * 15;
        
        // Bonus for pronunciation attempts
        xp += session.pronunciationAttempts.length * 5;
        
        // Bonus for words learned
        xp += session.wordsClicked.length * 3;
        
        return xp;
    }
}

module.exports = new PimsleurAudioMode();

