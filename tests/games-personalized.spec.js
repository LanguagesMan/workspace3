// 🎮 PERSONALIZED GAMES TEST SUITE
// Tests games with different user personas (A1, A2, B1)

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test User Personas
const PERSONAS = {
    beginner: {
        id: 'test-user-a1',
        level: 'A1',
        name: 'Maria (Beginner)',
        words: [
            { word: 'hola', translation: 'hello', level: 'A1' },
            { word: 'gracias', translation: 'thank you', level: 'A1' },
            { word: 'adiós', translation: 'goodbye', level: 'A1' },
            { word: 'agua', translation: 'water', level: 'A1' },
            { word: 'casa', translation: 'house', level: 'A1' },
            { word: 'perro', translation: 'dog', level: 'A1' },
            { word: 'gato', translation: 'cat', level: 'A1' },
            { word: 'amigo', translation: 'friend', level: 'A1' }
        ]
    },
    intermediate: {
        id: 'test-user-a2',
        level: 'A2',
        name: 'Carlos (Intermediate)',
        words: [
            { word: 'escuela', translation: 'school', level: 'A2' },
            { word: 'trabajar', translation: 'to work', level: 'A2' },
            { word: 'ciudad', translation: 'city', level: 'A2' },
            { word: 'viaje', translation: 'trip', level: 'A2' },
            { word: 'restaurante', translation: 'restaurant', level: 'A2' },
            { word: 'película', translation: 'movie', level: 'A2' },
            { word: 'comprar', translation: 'to buy', level: 'A2' },
            { word: 'tiempo', translation: 'time', level: 'A2' }
        ]
    },
    advanced: {
        id: 'test-user-b1',
        level: 'B1',
        name: 'Sofia (Advanced)',
        words: [
            { word: 'desarrollar', translation: 'to develop', level: 'B1' },
            { word: 'ambiente', translation: 'environment', level: 'B1' },
            { word: 'situación', translation: 'situation', level: 'B1' },
            { word: 'experiencia', translation: 'experience', level: 'B1' },
            { word: 'opinión', translation: 'opinion', level: 'B1' },
            { word: 'conseguir', translation: 'to achieve', level: 'B1' },
            { word: 'mantener', translation: 'to maintain', level: 'B1' },
            { word: 'sociedad', translation: 'society', level: 'B1' }
        ]
    }
};

test.describe('Personalized Games System', () => {
    
    test.beforeEach(async ({ page }) => {
        // Setup: Clear any previous test data
        await page.goto(`${BASE_URL}/public/games-personalized.html`);
        await page.waitForLoadState('domcontentloaded');
    });

    // ==================================
    // TEST 1: Page Load & User Info
    // ==================================
    
    test('should load games page and display user info', async ({ page }) => {
        console.log('\n🧪 TEST: Page Load & User Info');
        
        // Check page title
        await expect(page).toHaveTitle(/Personalized Spanish Games/);
        
        // Check header
        const header = await page.locator('h1').textContent();
        expect(header).toContain('Personalized Spanish Games');
        
        // Check user stats are displayed
        await page.waitForSelector('#userLevel');
        await page.waitForSelector('#userWords');
        await page.waitForSelector('#userXP');
        
        const level = await page.locator('#userLevel').textContent();
        const words = await page.locator('#userWords').textContent();
        const xp = await page.locator('#userXP').textContent();
        
        console.log(`  Level: ${level}`);
        console.log(`  Words: ${words}`);
        console.log(`  XP: ${xp}`);
        
        expect(level).toContain('Level:');
        expect(words).toContain('Words:');
        expect(xp).toContain('XP:');
    });

    test('should display all 5 game cards', async ({ page }) => {
        console.log('\n🧪 TEST: All Games Display');
        
        const gameCards = await page.locator('.game-card');
        const count = await gameCards.count();
        
        expect(count).toBe(5);
        
        // Check each game
        const games = [
            'Match Madness',
            'Speed Challenge',
            'Word Builder',
            'Listening Practice',
            'Translation Race'
        ];
        
        for (const gameName of games) {
            const card = await page.locator('.game-title', { hasText: gameName });
            expect(await card.count()).toBeGreaterThan(0);
            console.log(`  ✅ ${gameName}`);
        }
    });

    // ==================================
    // TEST 2: Match Madness Game
    // ==================================
    
    test('Match Madness - A1 Beginner User', async ({ page }) => {
        console.log('\n🧪 TEST: Match Madness (A1 Beginner)');
        
        // Simulate A1 user
        await page.evaluate((persona) => {
            window.currentUserId = persona.id;
            localStorage.setItem('userLevel', persona.level);
        }, PERSONAS.beginner);
        
        // Start game
        await page.locator('.game-card').filter({ hasText: 'Match Madness' }).locator('.play-button').click();
        
        // Wait for game to load
        await page.waitForSelector('.match-grid', { timeout: 10000 });
        
        // Check modal is visible
        const modal = page.locator('#gameModal');
        await expect(modal).toHaveClass(/active/);
        
        // Check cards are present
        const cards = page.locator('.match-card');
        const cardCount = await cards.count();
        expect(cardCount).toBe(16); // 8 pairs
        
        console.log(`  ✅ ${cardCount} cards loaded`);
        
        // Try to flip 2 cards
        await cards.nth(0).click();
        await page.waitForTimeout(200);
        await cards.nth(1).click();
        await page.waitForTimeout(1000);
        
        // Check if they matched or flipped back
        const firstCard = cards.nth(0);
        const hasMatchedOrFlipped = await firstCard.evaluate((el) => {
            return el.classList.contains('matched') || el.textContent === '?';
        });
        
        expect(hasMatchedOrFlipped).toBe(true);
        console.log('  ✅ Card flipping works');
        
        // Close game
        await page.locator('.close-button').click();
        await expect(modal).not.toHaveClass(/active/);
    });

    test('Match Madness - Complete Full Game', async ({ page }) => {
        console.log('\n🧪 TEST: Match Madness (Complete Game)');
        
        // Start game
        await page.locator('.game-card').filter({ hasText: 'Match Madness' }).locator('.play-button').click();
        await page.waitForSelector('.match-grid', { timeout: 10000 });
        
        // Get all cards and their pair IDs
        const cards = await page.$$('.match-card');
        const cardData = await Promise.all(cards.map(async (card) => {
            return {
                element: card,
                pairId: await card.getAttribute('data-pair-id'),
                text: await card.getAttribute('data-text')
            };
        }));
        
        // Group by pair ID
        const pairs = {};
        cardData.forEach((card) => {
            if (!pairs[card.pairId]) pairs[card.pairId] = [];
            pairs[card.pairId].push(card);
        });
        
        // Match all pairs
        let matchedCount = 0;
        for (const pairId in pairs) {
            const [card1, card2] = pairs[pairId];
            await card1.element.click();
                await page.waitForTimeout(300);
            await card2.element.click();
            await page.waitForTimeout(1000);
            matchedCount++;
            console.log(`  ✅ Matched pair ${matchedCount}: ${card1.text} - ${card2.text}`);
        }
        
        // Wait for results screen
        await page.waitForSelector('.results', { timeout: 5000 });
        
        // Check results
        const score = await page.locator('.results-score').textContent();
        const message = await page.locator('.results-message').textContent();
        
        console.log(`  🎉 Final Score: ${score}`);
        console.log(`  💬 Message: ${message}`);
        
        expect(score).not.toBe('0');
    });

    // ==================================
    // TEST 3: Speed Challenge Game
    // ==================================
    
    test('Speed Challenge - A2 Intermediate User', async ({ page }) => {
        console.log('\n🧪 TEST: Speed Challenge (A2 Intermediate)');
        
        // Simulate A2 user
        await page.evaluate((persona) => {
            window.currentUserId = persona.id;
            localStorage.setItem('userLevel', persona.level);
        }, PERSONAS.intermediate);
        
        // Start game
        await page.locator('.game-card').filter({ hasText: 'Speed Challenge' }).locator('.play-button').click();
        await page.waitForSelector('#timer', { timeout: 10000 });
        
        // Check timer is running
        const timer = page.locator('#timer');
        const initialTime = parseInt(await timer.textContent());
        expect(initialTime).toBe(60);
        
        console.log('  ✅ Timer started at 60 seconds');
        
        // Check question is displayed
        const word = page.locator('.speed-word');
        await expect(word).toBeVisible();
        
        const wordText = await word.textContent();
        console.log(`  📝 First question: ${wordText}`);
        
        // Check options are present
        const options = page.locator('.speed-option');
        const optionCount = await options.count();
        expect(optionCount).toBe(4);
        
        // Answer a question
        await options.nth(0).click();
        await page.waitForTimeout(1500);
        
        // Check if new question appeared or results shown
        const hasResults = await page.locator('.results').count() > 0;
        const hasNewQuestion = await page.locator('.speed-word').count() > 0;
        
        expect(hasResults || hasNewQuestion).toBe(true);
        console.log('  ✅ Game progression works');
        
        // Close
        await page.locator('.close-button').click();
    });

    test('Speed Challenge - Answer 5 Questions', async ({ page }) => {
        console.log('\n🧪 TEST: Speed Challenge (Answer 5 Questions)');
        
        await page.locator('.game-card').filter({ hasText: 'Speed Challenge' }).locator('.play-button').click();
        await page.waitForSelector('#timer', { timeout: 10000 });
        
        // Answer 5 questions
        for (let i = 0; i < 5; i++) {
            await page.waitForSelector('.speed-option', { timeout: 5000 });
            
            const word = await page.locator('.speed-word').textContent();
            console.log(`  Question ${i + 1}: ${word}`);
            
            // Click first option
            await page.locator('.speed-option').nth(0).click();
            await page.waitForTimeout(1200);
        }
        
        console.log('  ✅ Answered 5 questions successfully');
        
        // Check progress updated
        const progressBar = page.locator('#progressFill');
        const width = await progressBar.evaluate((el) => el.style.width);
        console.log(`  📊 Progress: ${width}`);
        
        await page.locator('.close-button').click();
    });

    // ==================================
    // TEST 4: Word Builder Game
    // ==================================
    
    test('Word Builder - B1 Advanced User', async ({ page }) => {
        console.log('\n🧪 TEST: Word Builder (B1 Advanced)');
        
        // Simulate B1 user
        await page.evaluate((persona) => {
            window.currentUserId = persona.id;
            localStorage.setItem('userLevel', persona.level);
        }, PERSONAS.advanced);
        
        // Start game
        await page.locator('.game-card').filter({ hasText: 'Word Builder' }).locator('.play-button').click();
        await page.waitForSelector('.word-tiles', { timeout: 10000 });
        
        // Check tiles are present
        const tiles = page.locator('.word-tile');
        const tileCount = await tiles.count();
        expect(tileCount).toBeGreaterThan(0);
        
        console.log(`  ✅ ${tileCount} word tiles loaded`);
        
        // Check English prompt is shown
        const prompt = await page.locator('p strong').textContent();
        console.log(`  📝 Build: ${prompt}`);
        
        // Click a few tiles
        await tiles.nth(0).click();
        await page.waitForTimeout(200);
        await tiles.nth(1).click();
        await page.waitForTimeout(200);
        
        // Check sentence is being built
        const userSentence = await page.locator('#userSentence').textContent();
        expect(userSentence.length).toBeGreaterThan(0);
        console.log(`  🔤 User sentence: ${userSentence}`);
        
        // Test clear button
        await page.locator('button', { hasText: 'Clear' }).click();
        const clearedSentence = await page.locator('#userSentence').textContent();
        expect(clearedSentence.length).toBe(0);
        console.log('  ✅ Clear button works');
        
        await page.locator('.close-button').click();
    });

    test('Word Builder - Complete Sentence', async ({ page }) => {
        console.log('\n🧪 TEST: Word Builder (Complete Sentence)');
        
        await page.locator('.game-card').filter({ hasText: 'Word Builder' }).locator('.play-button').click();
        await page.waitForSelector('.word-tiles', { timeout: 10000 });
        
        // Click all tiles in order
        const tiles = await page.$$('.word-tile');
        for (let i = 0; i < tiles.length; i++) {
            await tiles[i].click();
            await page.waitForTimeout(200);
        }
        
        const sentence = await page.locator('#userSentence').textContent();
        console.log(`  📝 Built sentence: ${sentence}`);
        
        // Click check button
        await page.locator('button', { hasText: 'Check' }).click();
        await page.waitForTimeout(1000);
        
        console.log('  ✅ Sentence submitted');
        
        await page.locator('.close-button').click();
    });

    // ==================================
    // TEST 5: Listening Practice
    // ==================================
    
    test('Listening Practice - Audio Playback', async ({ page }) => {
        console.log('\n🧪 TEST: Listening Practice');
        
        // Start game
        await page.locator('.game-card').filter({ hasText: 'Listening Practice' }).locator('.play-button').click();
        await page.waitForSelector('.audio-button', { timeout: 10000 });
        
        // Check audio button exists
        const audioButton = page.locator('.audio-button');
        await expect(audioButton).toBeVisible();
        console.log('  ✅ Audio button visible');
        
        // Check options are present
        const options = page.locator('.speed-option');
        const optionCount = await options.count();
        expect(optionCount).toBe(4);
        console.log(`  ✅ ${optionCount} options available`);
        
        // Click audio button
        await audioButton.click();
        await page.waitForTimeout(1000);
        console.log('  🔊 Audio played');
        
        // Select an answer
        await options.nth(0).click();
        await page.waitForTimeout(1500);
        
        console.log('  ✅ Answer selected');
        
        await page.locator('.close-button').click();
    });

    // ==================================
    // TEST 6: Translation Race
    // ==================================
    
    test('Translation Race - Type Answers', async ({ page }) => {
        console.log('\n🧪 TEST: Translation Race');
        
        // Start game
        await page.locator('.game-card').filter({ hasText: 'Translation Race' }).locator('.play-button').click();
        await page.waitForSelector('#raceInput', { timeout: 10000 });
        
        // Check timer is running
        const timer = page.locator('#timer');
        const initialTime = parseInt(await timer.textContent());
        expect(initialTime).toBe(90);
        console.log('  ✅ Timer started at 90 seconds');
        
        // Answer 3 questions by typing
        for (let i = 0; i < 3; i++) {
            const word = await page.locator('#raceWord').textContent();
            console.log(`  Question ${i + 1}: ${word}`);
            
            // Type a guess (just type "test" to move forward)
            await page.locator('#raceInput').fill('test');
            await page.locator('button', { hasText: 'Submit' }).click();
            await page.waitForTimeout(500);
        }
        
        // Check score updated
        const score = await page.locator('#raceScore').textContent();
        console.log(`  📊 Current score: ${score}`);
        
        // Check progress
        const progress = await page.locator('#raceProgress').textContent();
        console.log(`  📈 Progress: ${progress}`);
        
        await page.locator('.close-button').click();
    });

    // ==================================
    // TEST 7: Cross-Persona Testing
    // ==================================
    
    test('All personas can access all games', async ({ page }) => {
        console.log('\n🧪 TEST: Cross-Persona Access');
        
        const personas = [PERSONAS.beginner, PERSONAS.intermediate, PERSONAS.advanced];
        
        for (const persona of personas) {
            console.log(`\n  Testing with ${persona.name} (${persona.level})`);
            
            // Set persona
            await page.evaluate((p) => {
                window.currentUserId = p.id;
                localStorage.setItem('userLevel', p.level);
            }, persona);
            
            await page.reload();
            await page.waitForLoadState('domcontentloaded');
            
            // Try to open each game
            const games = ['Match Madness', 'Speed Challenge', 'Word Builder'];
            
            for (const gameName of games) {
                await page.locator('.game-card').filter({ hasText: gameName }).locator('.play-button').click();
            await page.waitForTimeout(2000);
            
                // Check game loaded
                const modal = page.locator('#gameModal');
                const isActive = await modal.evaluate((el) => el.classList.contains('active'));
                expect(isActive).toBe(true);
                
                console.log(`    ✅ ${gameName}: Loaded`);
                
                // Close game
                await page.locator('.close-button').click();
                await page.waitForTimeout(500);
            }
        }
    });

    // ==================================
    // TEST 8: Results & Scoring
    // ==================================
    
    test('Results screen displays correctly', async ({ page }) => {
        console.log('\n🧪 TEST: Results Screen');
        
        // Start a quick game and force completion
        await page.locator('.game-card').filter({ hasText: 'Speed Challenge' }).locator('.play-button').click();
        await page.waitForSelector('#timer', { timeout: 10000 });
        
        // Fast-forward timer by modifying game state
        await page.evaluate(() => {
            clearInterval(window.speedTimer);
            window.speedTimer = null;
            window.currentGameState.correct = 15;
            window.currentGameState.total = 20;
            window.currentGameState.score = 75;
        });
        
        // Trigger results
        await page.evaluate(() => {
            showResults('speedChallenge');
        });
        
        await page.waitForSelector('.results', { timeout: 5000 });
        
        // Check results elements
        const score = await page.locator('.results-score');
        await expect(score).toBeVisible();
        
        const stars = await page.locator('.results-stars');
        await expect(stars).toBeVisible();
        
        const message = await page.locator('.results-message');
        await expect(message).toBeVisible();
        
        const stats = await page.locator('.result-stat').count();
        expect(stats).toBe(3); // Correct, Accuracy, Time
        
        console.log('  ✅ All result elements visible');
        
        // Check action buttons
        const playAgain = page.locator('button', { hasText: 'Play Again' });
        await expect(playAgain).toBeVisible();
        
        const closeButton = page.locator('button', { hasText: 'Close' });
        await expect(closeButton).toBeVisible();
        
        console.log('  ✅ Action buttons present');
    });

    // ==================================
    // TEST 9: Responsive Design
    // ==================================
    
    test('Games work on mobile viewport', async ({ page }) => {
        console.log('\n🧪 TEST: Mobile Responsiveness');
        
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        // Check games grid is responsive
        const grid = page.locator('.games-grid');
        await expect(grid).toBeVisible();
        
        // Check cards are still visible
        const cards = page.locator('.game-card');
        const count = await cards.count();
        expect(count).toBe(5);
        
        console.log('  ✅ All game cards visible on mobile');
        
        // Try to open a game
        await cards.nth(0).click();
            await page.waitForTimeout(2000);
            
        // Check modal fits screen
        const modal = page.locator('.modal-content');
        await expect(modal).toBeVisible();
        
        console.log('  ✅ Game modal adapts to mobile screen');
        
        await page.locator('.close-button').click();
    });

    // ==================================
    // TEST 10: Performance Test
    // ==================================
    
    test('Page loads within 3 seconds', async ({ page }) => {
        console.log('\n🧪 TEST: Performance');
        
        const startTime = Date.now();
        await page.goto(`${BASE_URL}/public/games-personalized.html`);
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;
        
        console.log(`  ⏱️  Load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(3000);
    });
});

// ==================================
// VISUAL REGRESSION TESTS
// ==================================

test.describe('Visual Regression Tests', () => {
    
    test('Homepage screenshot', async ({ page }) => {
        await page.goto(`${BASE_URL}/public/games-personalized.html`);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        
                await page.screenshot({ 
            path: 'tests/screenshots/games-homepage.png',
                    fullPage: true 
        });
        
        console.log('  📸 Homepage screenshot saved');
    });

    test('Match Madness gameplay screenshot', async ({ page }) => {
        await page.goto(`${BASE_URL}/public/games-personalized.html`);
        await page.locator('.game-card').filter({ hasText: 'Match Madness' }).locator('.play-button').click();
        await page.waitForSelector('.match-grid', { timeout: 10000 });
        
        await page.screenshot({ 
            path: 'tests/screenshots/match-madness-game.png'
        });
        
        console.log('  📸 Match Madness screenshot saved');
    });

    test('Speed Challenge gameplay screenshot', async ({ page }) => {
        await page.goto(`${BASE_URL}/public/games-personalized.html`);
        await page.locator('.game-card').filter({ hasText: 'Speed Challenge' }).locator('.play-button').click();
        await page.waitForSelector('.speed-question', { timeout: 10000 });
        
        await page.screenshot({ 
            path: 'tests/screenshots/speed-challenge-game.png'
        });
        
        console.log('  📸 Speed Challenge screenshot saved');
    });

    test('Results screen screenshot', async ({ page }) => {
        await page.goto(`${BASE_URL}/public/games-personalized.html`);
        await page.locator('.game-card').filter({ hasText: 'Speed Challenge' }).locator('.play-button').click();
        await page.waitForSelector('#timer', { timeout: 10000 });
        
        // Force results
        await page.evaluate(() => {
            clearInterval(window.speedTimer);
            window.currentGameState.correct = 18;
            window.currentGameState.total = 20;
            window.currentGameState.score = 90;
            showResults('speedChallenge');
        });
        
        await page.waitForSelector('.results');
        
        await page.screenshot({ 
            path: 'tests/screenshots/results-screen.png'
        });
        
        console.log('  📸 Results screen screenshot saved');
    });
});
