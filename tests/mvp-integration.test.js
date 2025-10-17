/**
 * 🧪 MVP INTEGRATION TESTS
 * Comprehensive testing of all MVP systems
 */

const { test, expect } = require('@playwright/test');

test.describe('MVP Integration Tests', () => {
    
    test.describe('Video Catalog System', () => {
        
        test('should load video catalog with all videos', async () => {
            const VideoCatalogEngine = require('../lib/engines/video-catalog-engine');
            const engine = new VideoCatalogEngine();
            
            engine.loadAllVideos();
            
            expect(engine.catalog.length).toBeGreaterThan(0);
            expect(engine.catalog.length).toBe(57);
            
            // Check first video has required fields
            const firstVideo = engine.catalog[0];
            expect(firstVideo).toHaveProperty('id');
            expect(firstVideo).toHaveProperty('spanish');
            expect(firstVideo).toHaveProperty('english');
            expect(firstVideo).toHaveProperty('level');
            expect(firstVideo).toHaveProperty('theme');
            expect(firstVideo).toHaveProperty('words');
            
            console.log(`✅ Loaded ${engine.catalog.length} videos`);
        });
        
        test('should have proper level distribution', async () => {
            const VideoCatalogEngine = require('../lib/engines/video-catalog-engine');
            const engine = new VideoCatalogEngine();
            
            engine.loadAllVideos();
            const stats = engine.getStatistics();
            
            // Should have videos at multiple levels
            expect(stats.byLevel.A1).toBeGreaterThan(0);
            expect(stats.byLevel.A2).toBeGreaterThan(0);
            
            console.log('✅ Level distribution:', stats.byLevel);
        });
        
        test('should categorize videos by theme', async () => {
            const VideoCatalogEngine = require('../lib/engines/video-catalog-engine');
            const engine = new VideoCatalogEngine();
            
            engine.loadAllVideos();
            
            expect(engine.themes.size).toBeGreaterThan(0);
            
            console.log(`✅ Found ${engine.themes.size} unique themes`);
        });
    });
    
    test.describe('User Progress System', () => {
        
        test('should create new user with default values', async () => {
            const UserProgressService = require('../lib/services/user-progress-service');
            const service = new UserProgressService();
            
            const userId = `test_${Date.now()}`;
            const user = service.createUser(userId, { name: 'Test User' });
            
            expect(user.id).toBe(userId);
            expect(user.profile.name).toBe('Test User');
            expect(user.progress.xp).toBe(0);
            expect(user.progress.level).toBe('A1');
            expect(user.progress.currentStreak).toBe(0);
            
            console.log('✅ Created user:', user.id);
        });
        
        test('should award XP and update level', async () => {
            const UserProgressService = require('../lib/services/user-progress-service');
            const service = new UserProgressService();
            
            const userId = `test_xp_${Date.now()}`;
            service.createUser(userId);
            
            // Award XP
            const result = service.awardXP(userId, 100);
            
            expect(result.xp).toBe(100);
            expect(result.totalXP).toBe(100);
            expect(result.level).toBe('A1');
            
            // Award more XP to level up
            const result2 = service.awardXP(userId, 500);
            expect(result2.level).toBe('A2');
            
            console.log('✅ XP system working, leveled up to A2');
        });
        
        test('should save and retrieve words', async () => {
            const UserProgressService = require('../lib/services/user-progress-service');
            const service = new UserProgressService();
            
            const userId = `test_words_${Date.now()}`;
            service.createUser(userId);
            
            // Save word
            const word = service.saveWord(userId, 'hola', {
                translation: 'hello',
                sentence: 'Hola, ¿cómo estás?'
            });
            
            expect(word.word).toBe('hola');
            expect(word.translation).toBe('hello');
            
            // Get user and check word bank
            const user = service.getUser(userId);
            expect(user.wordBank.saved.length).toBe(1);
            expect(user.progress.totalWordsLearned).toBe(1);
            
            console.log('✅ Word saving working');
        });
        
        test('should track streak correctly', async () => {
            const UserProgressService = require('../lib/services/user-progress-service');
            const service = new UserProgressService();
            
            const userId = `test_streak_${Date.now()}`;
            service.createUser(userId);
            
            // Update streak
            const streak = service.updateStreak(userId);
            
            expect(streak).toBe(1);
            
            console.log('✅ Streak tracking working');
        });
        
        test('should generate dashboard data', async () => {
            const UserProgressService = require('../lib/services/user-progress-service');
            const service = new UserProgressService();
            
            const userId = `test_dashboard_${Date.now()}`;
            service.createUser(userId);
            service.awardXP(userId, 150);
            service.saveWord(userId, 'gracias', { translation: 'thank you' });
            
            const dashboard = service.getDashboard(userId);
            
            expect(dashboard).toHaveProperty('profile');
            expect(dashboard).toHaveProperty('progress');
            expect(dashboard).toHaveProperty('stats');
            expect(dashboard.progress.xp).toBe(150);
            expect(dashboard.stats.wordsLearned).toBe(1);
            
            console.log('✅ Dashboard generation working');
        });
    });
    
    test.describe('Recommendation Engine', () => {
        
        test('should generate personalized recommendations', async () => {
            const RecommendationEngine = require('../lib/engines/recommendation-engine');
            const UserProgressService = require('../lib/services/user-progress-service');
            
            const engine = new RecommendationEngine();
            const userService = new UserProgressService();
            
            const userId = `test_rec_${Date.now()}`;
            const user = userService.createUser(userId, { level: 'A1' });
            
            const recommendations = engine.getRecommendations(user, 5);
            
            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations.length).toBeLessThanOrEqual(5);
            
            // Check recommendation structure
            const first = recommendations[0];
            expect(first).toHaveProperty('id');
            expect(first).toHaveProperty('level');
            expect(first).toHaveProperty('recommendationScore');
            expect(first).toHaveProperty('reason');
            
            console.log(`✅ Generated ${recommendations.length} recommendations`);
        });
        
        test('should provide cold start recommendations', async () => {
            const RecommendationEngine = require('../lib/engines/recommendation-engine');
            const engine = new RecommendationEngine();
            
            const coldStart = engine.getColdStartRecommendations('A1', 5);
            
            expect(coldStart.length).toBeGreaterThan(0);
            expect(coldStart.every(v => v.level === 'A1')).toBe(true);
            
            console.log('✅ Cold start recommendations working');
        });
        
        test('should filter by level range', async () => {
            const RecommendationEngine = require('../lib/engines/recommendation-engine');
            const engine = new RecommendationEngine();
            
            const videos = engine.getVideosInLevelRange('A2', 1);
            
            expect(videos.length).toBeGreaterThan(0);
            
            // Should include A1, A2, and B1
            const levels = new Set(videos.map(v => v.level));
            expect(levels.has('A2')).toBe(true);
            
            console.log(`✅ Level filtering working, found ${videos.length} videos`);
        });
    });
    
    test.describe('Quiz System', () => {
        
        test('should generate quiz with multiple question types', async () => {
            const QuizEngine = require('../lib/engines/quiz-engine');
            const UserProgressService = require('../lib/services/user-progress-service');
            
            const quizEngine = new QuizEngine();
            const userService = new UserProgressService();
            
            const userId = `test_quiz_${Date.now()}`;
            const user = userService.createUser(userId);
            
            const quiz = quizEngine.generateQuiz(user, { count: 5 });
            
            expect(quiz.questions.length).toBe(5);
            expect(quiz).toHaveProperty('xpReward');
            expect(quiz.xpReward).toBe(50); // 5 questions * 10 XP
            
            // Check question types
            const types = new Set(quiz.questions.map(q => q.type));
            expect(types.size).toBeGreaterThan(1); // Multiple types
            
            console.log(`✅ Generated quiz with ${quiz.questions.length} questions`);
        });
        
        test('should grade quiz correctly', async () => {
            const QuizEngine = require('../lib/engines/quiz-engine');
            const UserProgressService = require('../lib/services/user-progress-service');
            
            const quizEngine = new QuizEngine();
            const userService = new UserProgressService();
            
            const userId = `test_grade_${Date.now()}`;
            const user = userService.createUser(userId);
            
            const quiz = quizEngine.generateQuiz(user, { count: 3 });
            
            // Simulate perfect answers
            const answers = {};
            quiz.questions.forEach(q => {
                answers[q.id] = q.correctAnswer;
            });
            
            const results = quizEngine.gradeQuiz(quiz, answers);
            
            expect(results.score).toBe(100);
            expect(results.correctAnswers).toBe(3);
            expect(results.passed).toBe(true);
            expect(results.xpEarned).toBe(30);
            
            console.log('✅ Quiz grading working, score: 100%');
        });
    });
    
    test.describe('Game System', () => {
        
        test('should generate Word Match game', async () => {
            const WordMatchGame = require('../lib/games/word-match-game');
            const UserProgressService = require('../lib/services/user-progress-service');
            
            const game = new WordMatchGame();
            const userService = new UserProgressService();
            
            const userId = `test_game_${Date.now()}`;
            const user = userService.createUser(userId);
            
            const session = game.generateGame(user, { pairCount: 6 });
            
            expect(session.pairs.length).toBe(6);
            expect(session.cards.length).toBe(12); // 6 pairs * 2 cards
            expect(session.xpReward).toBe(30); // 6 pairs * 5 XP
            
            console.log('✅ Word Match game generated');
        });
        
        test('should check word matches correctly', async () => {
            const WordMatchGame = require('../lib/games/word-match-game');
            const UserProgressService = require('../lib/services/user-progress-service');
            
            const game = new WordMatchGame();
            const userService = new UserProgressService();
            
            const userId = `test_match_${Date.now()}`;
            const user = userService.createUser(userId);
            
            const session = game.generateGame(user, { pairCount: 3 });
            
            // Get first pair
            const pair = session.pairs[0];
            const card1 = session.cards.find(c => c.pairId === pair.id && c.language === 'spanish');
            const card2 = session.cards.find(c => c.pairId === pair.id && c.language === 'english');
            
            const isMatch = game.checkMatch(session, card1.id, card2.id);
            
            expect(isMatch).toBe(true);
            
            console.log('✅ Match checking working');
        });
        
        test('should generate Sentence Builder game', async () => {
            const SentenceBuilderGame = require('../lib/games/sentence-builder-game');
            const UserProgressService = require('../lib/services/user-progress-service');
            
            const game = new SentenceBuilderGame();
            const userService = new UserProgressService();
            
            const userId = `test_sentence_${Date.now()}`;
            const user = userService.createUser(userId);
            
            const session = game.generateGame(user, { sentenceCount: 3 });
            
            expect(session.challenges.length).toBe(3);
            expect(session.xpReward).toBe(45); // 3 sentences * 15 XP
            
            // Check sentence structure
            const challenge = session.challenges[0];
            expect(challenge).toHaveProperty('original');
            expect(challenge).toHaveProperty('translation');
            expect(challenge).toHaveProperty('words');
            expect(challenge).toHaveProperty('correctOrder');
            
            console.log('✅ Sentence Builder game generated');
        });
    });
    
    test.describe('End-to-End User Journey', () => {
        
        test('should complete full learning session', async () => {
            const VideoCatalogEngine = require('../lib/engines/video-catalog-engine');
            const UserProgressService = require('../lib/services/user-progress-service');
            const RecommendationEngine = require('../lib/engines/recommendation-engine');
            const QuizEngine = require('../lib/engines/quiz-engine');
            
            // Setup
            const videoEngine = new VideoCatalogEngine();
            const userService = new UserProgressService();
            const recEngine = new RecommendationEngine();
            const quizEngine = new QuizEngine();
            
            videoEngine.loadAllVideos();
            
            // 1. Create new user
            const userId = `journey_${Date.now()}`;
            const user = userService.createUser(userId, {
                name: 'Journey Test User',
                level: 'A1'
            });
            
            console.log('1. ✅ User created');
            
            // 2. Get recommendations
            const recommendations = recEngine.getRecommendations(user, 3);
            expect(recommendations.length).toBeGreaterThan(0);
            
            console.log(`2. ✅ Got ${recommendations.length} recommendations`);
            
            // 3. Watch video (simulate)
            const video = recommendations[0];
            userService.trackVideoCompletion(userId, video.id, 30);
            
            console.log('3. ✅ Watched video');
            
            // 4. Save word from video
            const word = video.words[0];
            userService.saveWord(userId, word, {
                translation: 'test translation',
                videoId: video.id
            });
            
            console.log('4. ✅ Saved word');
            
            // 5. Take quiz
            const updatedUser = userService.getUser(userId);
            const quiz = quizEngine.generateQuiz(updatedUser, { count: 3 });
            
            // Simulate answers
            const answers = {};
            quiz.questions.forEach(q => {
                answers[q.id] = q.correctAnswer;
            });
            
            const results = quizEngine.gradeQuiz(quiz, answers);
            
            console.log(`5. ✅ Completed quiz, score: ${results.score}%`);
            
            // 6. Award quiz XP
            userService.awardXP(userId, results.xpEarned, 'quiz');
            
            console.log(`6. ✅ Awarded ${results.xpEarned} XP`);
            
            // 7. Check dashboard
            const dashboard = userService.getDashboard(userId);
            
            expect(dashboard.stats.videosWatched).toBe(1);
            expect(dashboard.stats.wordsLearned).toBe(1);
            expect(dashboard.progress.xp).toBeGreaterThan(0);
            
            console.log('7. ✅ Dashboard updated');
            console.log('\n🎉 FULL USER JOURNEY COMPLETE!');
            console.log(`   Videos watched: ${dashboard.stats.videosWatched}`);
            console.log(`   Words learned: ${dashboard.stats.wordsLearned}`);
            console.log(`   Total XP: ${dashboard.progress.xp}`);
            console.log(`   Level: ${dashboard.progress.level}`);
        });
    });
});

test.describe('MVP Performance Tests', () => {
    
    test('should load video catalog quickly', async () => {
        const VideoCatalogEngine = require('../lib/engines/video-catalog-engine');
        const engine = new VideoCatalogEngine();
        
        const start = Date.now();
        engine.loadAllVideos();
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(1000); // Should load in <1s
        
        console.log(`✅ Video catalog loaded in ${duration}ms`);
    });
    
    test('should generate recommendations quickly', async () => {
        const RecommendationEngine = require('../lib/engines/recommendation-engine');
        const UserProgressService = require('../lib/services/user-progress-service');
        
        const engine = new RecommendationEngine();
        const userService = new UserProgressService();
        
        const user = userService.createUser(`perf_${Date.now()}`);
        
        const start = Date.now();
        const recommendations = engine.getRecommendations(user, 10);
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(100); // Should generate in <100ms
        
        console.log(`✅ Recommendations generated in ${duration}ms`);
    });
    
    test('should generate quiz quickly', async () => {
        const QuizEngine = require('../lib/engines/quiz-engine');
        const UserProgressService = require('../lib/services/user-progress-service');
        
        const quizEngine = new QuizEngine();
        const userService = new UserProgressService();
        
        const user = userService.createUser(`perf_quiz_${Date.now()}`);
        
        const start = Date.now();
        const quiz = quizEngine.generateQuiz(user, { count: 10 });
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(100); // Should generate in <100ms
        
        console.log(`✅ Quiz generated in ${duration}ms`);
    });
});
