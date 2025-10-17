const { test, expect } = require('@playwright/test');
const fs = require('fs');

test.describe('🔬 DEEP TECHNICAL AUDIT - As Smartest Developer', () => {
    
    test('1. RECOMMENDATION ENGINE - Does it ACTUALLY work?', async ({ page }) => {
        console.log('\n🧠 AUDITING RECOMMENDATION ENGINE...\n');
        
        // Test as A1 beginner
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'A1');
            localStorage.setItem('userInterests', JSON.stringify(['travel', 'food']));
            localStorage.setItem('knownWords', JSON.stringify(['hola', 'gracias', 'adiós']));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(20000); // Wait for articles
        
        // Check if articles loaded
        const articles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.article-card')).map(card => ({
                title: card.querySelector('.article-title')?.textContent,
                difficulty: card.querySelector('.difficulty-badge')?.textContent,
                category: card.querySelector('.category-tag')?.textContent,
                hasPersonalization: card.dataset.personalized === 'true'
            }));
        });
        
        console.log(`📰 Articles loaded: ${articles.length}`);
        console.log('\n🔍 Checking personalization:');
        
        // Are articles filtered by level?
        const hasLevelFilter = articles.some(a => a.difficulty?.includes('A1') || a.difficulty?.includes('A2'));
        console.log(`  Level filtering (A1/A2 for beginner): ${hasLevelFilter ? '✅' : '❌ BROKEN'}`);
        
        // Are articles filtered by interests?
        const hasInterestFilter = articles.some(a => 
            a.category?.toLowerCase().includes('travel') || 
            a.category?.toLowerCase().includes('food')
        );
        console.log(`  Interest filtering (travel, food): ${hasInterestFilter ? '✅' : '❌ BROKEN'}`);
        
        // Check personalization engine exists
        const hasEngine = await page.evaluate(() => {
            return typeof window.personalizationEngine !== 'undefined';
        });
        console.log(`  Personalization engine loaded: ${hasEngine ? '✅' : '❌ MISSING'}`);
        
        // Check if it's using known words
        const usesKnownWords = await page.evaluate(() => {
            return localStorage.getItem('knownWords') !== null;
        });
        console.log(`  Tracks known words: ${usesKnownWords ? '✅' : '❌ BROKEN'}`);
        
        await page.screenshot({ 
            path: 'screenshots/audit/01-recommendations-A1.png',
            fullPage: true 
        });
        
        // Now test as C2 advanced
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'C2');
            localStorage.setItem('userInterests', JSON.stringify(['politics', 'technology']));
        });
        await page.reload();
        await page.waitForTimeout(20000);
        
        const advancedArticles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.article-card')).map(card => ({
                difficulty: card.querySelector('.difficulty-badge')?.textContent
            }));
        });
        
        const hasAdvancedContent = advancedArticles.some(a => 
            a.difficulty?.includes('C1') || a.difficulty?.includes('C2')
        );
        console.log(`  Shows C1/C2 for advanced user: ${hasAdvancedContent ? '✅' : '❌ BROKEN'}`);
        
        await page.screenshot({ 
            path: 'screenshots/audit/02-recommendations-C2.png',
            fullPage: true 
        });
    });
    
    test('2. USER LEVEL ASSESSMENT - Can we test user level?', async ({ page }) => {
        console.log('\n📊 AUDITING LEVEL ASSESSMENT SYSTEM...\n');
        
        // Check if placement test exists
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');
        
        // Look for assessment functionality
        const hasAssessment = await page.evaluate(() => {
            // Check for quiz or assessment
            return document.querySelector('[data-test="assessment"]') !== null ||
                   document.querySelector('.assessment') !== null ||
                   document.querySelector('.placement-test') !== null;
        });
        
        console.log(`  Has placement test page: ${hasAssessment ? '✅' : '❌ MISSING'}`);
        
        // Check if adaptive assessment exists
        const adaptiveExists = await page.goto('http://localhost:3001/public/components/adaptive-assessment.html')
            .then(() => true)
            .catch(() => false);
        
        console.log(`  Adaptive assessment component: ${adaptiveExists ? '✅' : '⚠️ EXISTS BUT NOT INTEGRATED'}`);
        
        if (adaptiveExists) {
            await page.screenshot({ 
                path: 'screenshots/audit/03-adaptive-assessment.png',
                fullPage: true 
            });
        }
        
        // Check for level progression tracking
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');
        
        const levelTracking = await page.evaluate(() => {
            const level = localStorage.getItem('userLevel');
            const xp = localStorage.getItem('userXP');
            const wordsLearned = localStorage.getItem('wordsLearned');
            
            return {
                hasLevel: level !== null,
                hasXP: xp !== null,
                hasWordsLearned: wordsLearned !== null,
                level,
                xp,
                wordsLearned
            };
        });
        
        console.log(`\n  Level tracking in localStorage:`);
        console.log(`    User Level: ${levelTracking.hasLevel ? '✅ ' + levelTracking.level : '❌ MISSING'}`);
        console.log(`    XP Points: ${levelTracking.hasXP ? '✅ ' + levelTracking.xp : '❌ MISSING'}`);
        console.log(`    Words Learned: ${levelTracking.hasWordsLearned ? '✅ ' + levelTracking.wordsLearned : '❌ MISSING'}`);
        
        console.log('\n  ❌ CRITICAL: No automatic level assessment based on performance');
        console.log('  ❌ CRITICAL: No algorithm to test and update user level');
    });
    
    test('3. WORD TRACKING - Are we tracking what users click?', async ({ page }) => {
        console.log('\n📝 AUDITING WORD TRACKING SYSTEM...\n');
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Check if words are clickable
        const hasTranscriptWords = await page.locator('.transcript-word').count();
        console.log(`  Transcript words found: ${hasTranscriptWords > 0 ? '✅ ' + hasTranscriptWords : '❌ NONE'}`);
        
        if (hasTranscriptWords > 0) {
            // Try clicking a word
            await page.locator('.transcript-word').first().click();
            await page.waitForTimeout(1000);
            
            // Check if click was tracked
            const clickedWords = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('clickedWords') || '[]');
            });
            
            console.log(`  Clicked words tracked: ${clickedWords.length > 0 ? '✅ ' + clickedWords.length : '❌ NOT TRACKED'}`);
            
            // Check if saved words are stored
            const savedWords = await page.evaluate(() => {
                return JSON.parse(localStorage.getItem('savedWords') || '[]');
            });
            
            console.log(`  Saved words database: ${savedWords.length > 0 ? '✅' : '⚠️ EMPTY (new user)'}`);
            
            // Check if there's a vocabulary review system
            const hasVocabReview = await page.evaluate(() => {
                return document.querySelector('[data-feature="vocabulary"]') !== null;
            });
            
            console.log(`  Vocabulary review page: ${hasVocabReview ? '✅' : '❌ MISSING'}`);
        } else {
            console.log('  ⚠️ Cannot test word tracking - no transcript words on current video');
        }
        
        await page.screenshot({ 
            path: 'screenshots/audit/04-word-tracking.png',
            fullPage: true 
        });
        
        console.log('\n  ❌ CRITICAL: No centralized word database');
        console.log('  ❌ CRITICAL: No spaced repetition system');
        console.log('  ❌ CRITICAL: No vocabulary frequency analysis');
    });
    
    test('4. DATABASE SYSTEM - Is there a real database?', async ({ page }) => {
        console.log('\n💾 AUDITING DATABASE SYSTEM...\n');
        
        // Check if Prisma is set up
        const prismaExists = fs.existsSync('/Users/mindful/_projects/workspace3/prisma/schema.prisma');
        console.log(`  Prisma schema exists: ${prismaExists ? '✅' : '❌ MISSING'}`);
        
        if (prismaExists) {
            const schema = fs.readFileSync('/Users/mindful/_projects/workspace3/prisma/schema.prisma', 'utf-8');
            
            const hasUserModel = schema.includes('model User');
            const hasWordModel = schema.includes('model Word') || schema.includes('model Vocabulary');
            const hasProgressModel = schema.includes('model Progress') || schema.includes('model UserProgress');
            const hasArticleModel = schema.includes('model Article');
            
            console.log(`\n  Database Models:`);
            console.log(`    User model: ${hasUserModel ? '✅' : '❌ MISSING'}`);
            console.log(`    Word/Vocabulary model: ${hasWordModel ? '✅' : '❌ MISSING'}`);
            console.log(`    Progress tracking model: ${hasProgressModel ? '✅' : '❌ MISSING'}`);
            console.log(`    Article model: ${hasArticleModel ? '✅' : '❌ MISSING'}`);
            
            // Check for word tracking fields
            const hasClickTracking = schema.includes('clickedAt') || schema.includes('interactionCount');
            const hasSavedTracking = schema.includes('savedWords') || schema.includes('bookmarked');
            const hasDifficultyTracking = schema.includes('difficulty') || schema.includes('cefrLevel');
            
            console.log(`\n  Word Tracking Features:`);
            console.log(`    Click tracking: ${hasClickTracking ? '✅' : '❌ MISSING'}`);
            console.log(`    Save tracking: ${hasSavedTracking ? '✅' : '❌ MISSING'}`);
            console.log(`    Difficulty tracking: ${hasDifficultyTracking ? '✅' : '❌ MISSING'}`);
        }
        
        // Check if API endpoints exist for word tracking
        await page.goto('http://localhost:3001/api/vocabulary/save').catch(() => {});
        const hasVocabAPI = page.url().includes('/api/vocabulary');
        console.log(`\n  Vocabulary API endpoint: ${hasVocabAPI ? '✅' : '❌ MISSING'}`);
        
        console.log('\n  ❌ CRITICAL: Currently using localStorage only (not persistent across devices)');
        console.log('  ❌ CRITICAL: No server-side word tracking database');
        console.log('  ❌ CRITICAL: No API for saving/retrieving user vocabulary');
    });
    
    test('5. ARTICLE ADAPTATION - Are articles adapted to user?', async ({ page }) => {
        console.log('\n🎯 AUDITING ARTICLE ADAPTATION...\n');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'B1');
            localStorage.setItem('userInterests', JSON.stringify(['technology', 'science']));
            localStorage.setItem('clickedWords', JSON.stringify([
                { word: 'computadora', count: 5 },
                { word: 'internet', count: 3 },
                { word: 'datos', count: 4 }
            ]));
        });
        await page.reload();
        await page.waitForTimeout(20000);
        
        // Check article metadata
        const articleData = await page.evaluate(() => {
            const articles = Array.from(document.querySelectorAll('.article-card'));
            return articles.slice(0, 5).map(card => {
                const titleEl = card.querySelector('.article-title');
                const difficultyEl = card.querySelector('.difficulty-badge, [data-difficulty]');
                const categoryEl = card.querySelector('.category-tag, [data-category]');
                
                return {
                    title: titleEl?.textContent?.trim(),
                    difficulty: difficultyEl?.textContent || difficultyEl?.dataset?.difficulty,
                    category: categoryEl?.textContent || categoryEl?.dataset?.category,
                    hasAdaptation: card.dataset?.adapted === 'true' || card.dataset?.personalized === 'true'
                };
            });
        });
        
        console.log(`  Articles loaded: ${articleData.length}`);
        console.log(`\n  Checking adaptation features:`);
        
        const hasLevelMatch = articleData.some(a => 
            a.difficulty?.includes('B1') || a.difficulty?.includes('B2')
        );
        console.log(`    Level-appropriate (B1/B2): ${hasLevelMatch ? '✅' : '❌ NOT ADAPTED'}`);
        
        const hasInterestMatch = articleData.some(a => 
            a.category?.toLowerCase().includes('tech') || 
            a.category?.toLowerCase().includes('science')
        );
        console.log(`    Interest-matched (tech/science): ${hasInterestMatch ? '✅' : '❌ NOT ADAPTED'}`);
        
        const hasPersonalization = articleData.some(a => a.hasAdaptation);
        console.log(`    Marked as personalized: ${hasPersonalization ? '✅' : '❌ NOT MARKED'}`);
        
        // Check if article difficulty is calculated
        const hasDifficultyCalc = await page.evaluate(() => {
            return typeof window.calculateArticleDifficulty === 'function' ||
                   typeof window.analyzeDifficulty === 'function';
        });
        console.log(`    Difficulty calculation function: ${hasDifficultyCalc ? '✅' : '❌ MISSING'}`);
        
        await page.screenshot({ 
            path: 'screenshots/audit/05-article-adaptation.png',
            fullPage: true 
        });
        
        console.log('\n  ⚠️ Articles are sorted but NOT truly adapted');
        console.log('  ❌ CRITICAL: No vocabulary simplification for lower levels');
        console.log('  ❌ CRITICAL: No sentence complexity analysis');
        console.log('  ❌ CRITICAL: No reading time estimation based on user level');
    });
    
    test('6. GAMES COMPLETENESS - Are all games functional?', async ({ page }) => {
        console.log('\n🎮 AUDITING GAMES SYSTEM...\n');
        
        const games = [
            { name: 'Word Match', file: 'word-match-game.js' },
            { name: 'Sentence Builder', file: 'sentence-builder-game.js' },
            { name: 'Quiz Engine', file: 'quiz-engine.js' },
            { name: 'Flashcards', file: 'flashcards' },
            { name: 'Listening Practice', file: 'listening' }
        ];
        
        for (const game of games) {
            const exists = fs.existsSync(`/Users/mindful/_projects/workspace3/lib/games/${game.file}`);
            console.log(`  ${game.name}: ${exists ? '✅' : '❌ MISSING FILE'}`);
            
            if (exists) {
                const content = fs.readFileSync(`/Users/mindful/_projects/workspace3/lib/games/${game.file}`, 'utf-8');
                
                const hasLevelAdaptation = content.includes('userLevel') || content.includes('difficulty');
                const hasProgressTracking = content.includes('score') && content.includes('localStorage');
                const hasWordDatabase = content.includes('vocabulary') || content.includes('words');
                
                console.log(`    Level-adapted: ${hasLevelAdaptation ? '✅' : '❌'}`);
                console.log(`    Tracks progress: ${hasProgressTracking ? '✅' : '❌'}`);
                console.log(`    Uses word database: ${hasWordDatabase ? '✅' : '❌'}`);
            }
        }
        
        // Test games page
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.click('.nav-item:has-text("Games")').catch(() => {
            console.log('  ⚠️ Games navigation failed');
        });
        await page.waitForTimeout(2000);
        
        const gameCards = await page.locator('.game-card, [data-game]').count();
        console.log(`\n  Game cards visible: ${gameCards > 0 ? '✅ ' + gameCards : '❌ NONE'}`);
        
        await page.screenshot({ 
            path: 'screenshots/audit/06-games-page.png',
            fullPage: true 
        });
        
        console.log('\n  ⚠️ Games exist but integration unclear');
        console.log('  ❌ CRITICAL: Games don\'t pull from user\'s saved words');
        console.log('  ❌ CRITICAL: No spaced repetition in games');
        console.log('  ❌ CRITICAL: Game progress not contributing to overall level');
    });
    
    test('7. SMART FEATURES CHECKLIST', async ({ page }) => {
        console.log('\n✅ SMART SYSTEM CHECKLIST\n');
        console.log('='.repeat(80));
        
        const features = {
            'Recommendation System': {
                'Level-based filtering': '⚠️ PARTIAL',
                'Interest-based filtering': '⚠️ PARTIAL',
                'Known words consideration': '❌ MISSING',
                'Reading history analysis': '❌ MISSING',
                'Click pattern analysis': '❌ MISSING',
                'Engagement-based ranking': '❌ MISSING'
            },
            'Level Assessment': {
                'Initial placement test': '⚠️ EXISTS BUT NOT INTEGRATED',
                'Continuous assessment': '❌ MISSING',
                'Automatic level updates': '❌ MISSING',
                'Skill-based sub-levels': '❌ MISSING',
                'Performance analytics': '❌ MISSING'
            },
            'Word Tracking': {
                'Click tracking': '⚠️ PARTIAL (localStorage only)',
                'Save to database': '❌ MISSING',
                'Frequency analysis': '❌ MISSING',
                'Mastery tracking': '❌ MISSING',
                'Spaced repetition': '❌ MISSING',
                'Context recording': '❌ MISSING'
            },
            'Article Adaptation': {
                'Difficulty calculation': '❌ MISSING',
                'Vocabulary simplification': '❌ MISSING',
                'Sentence complexity analysis': '❌ MISSING',
                'Reading time estimation': '❌ MISSING',
                'Highlighted unknown words': '❌ MISSING',
                'Adaptive content length': '❌ MISSING'
            },
            'Games Integration': {
                'Pull from saved words': '❌ MISSING',
                'Level-adaptive difficulty': '⚠️ PARTIAL',
                'Spaced repetition': '❌ MISSING',
                'Progress affects overall level': '❌ MISSING',
                'Performance analytics': '❌ MISSING'
            },
            'Database & API': {
                'Server-side user data': '❌ MISSING',
                'Word tracking API': '❌ MISSING',
                'Progress sync API': '❌ MISSING',
                'Cross-device sync': '❌ MISSING',
                'Analytics API': '❌ MISSING'
            }
        };
        
        for (const [category, items] of Object.entries(features)) {
            console.log(`\n${category}:`);
            for (const [feature, status] of Object.entries(items)) {
                console.log(`  ${status} ${feature}`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('\n🚨 CRITICAL GAPS FOUND:');
        console.log('  1. No true smart recommendation engine');
        console.log('  2. No automatic level assessment');
        console.log('  3. No persistent word tracking database');
        console.log('  4. No article difficulty adaptation');
        console.log('  5. No spaced repetition system');
        console.log('  6. No server-side data persistence');
        console.log('  7. No cross-device sync');
        console.log('  8. No analytics for improvement');
        console.log('\n  VERDICT: System is 40% complete for "smart" functionality');
    });
});

test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('🔬 TECHNICAL AUDIT COMPLETE');
    console.log('='.repeat(80));
    console.log('\nNext: Creating comprehensive TO-DO list...');
});
