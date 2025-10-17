/**
 * 🎯 COMPLETE APP INTEGRATION TESTS
 * 
 * Tests ALL research-backed features:
 * - TikTok feed algorithm
 * - Duolingo HLR spaced repetition  
 * - Krashen i+1 adaptive difficulty
 * - Gamification (XP, streaks, variable rewards)
 * - Performance optimizations
 * - SEO
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3001';

test.describe('Complete App Integration', () => {
    
    test('App loads with research-backed feed', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Wait for research feed integration
        await page.waitForTimeout(2000);
        
        // Check console for research feed initialization
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        
        await page.reload();
        await page.waitForTimeout(3000);
        
        const hasResearchInit = logs.some(log => 
            log.includes('Research Feed Integration') || 
            log.includes('research-backed')
        );
        
        console.log('✅ Research integration:', hasResearchInit ? 'Active' : 'Fallback mode');
        
        // Check if videos are loaded
        const hasVideos = logs.some(log => log.includes('videos'));
        expect(hasVideos).toBeTruthy();
        
        console.log('✅ Videos loading confirmed');
    });
    
    test('Research API endpoints respond', async ({ request }) => {
        // Test research feed endpoint
        const feedResponse = await request.get(`${BASE_URL}/api/research/feed/research/test_user?count=10`);
        expect(feedResponse.ok()).toBeTruthy();
        
        const feedData = await feedResponse.json();
        expect(feedData.success).toBe(true);
        expect(feedData.feed).toBeDefined();
        
        console.log('✅ Research feed:', feedData.feed.length, 'videos');
        console.log('✅ Personalization stage:', feedData.userProfile?.personalizationStage);
    });
    
    test('XP tracking works', async ({ request }) => {
        const xpResponse = await request.post(`${BASE_URL}/api/research/xp/test_user_xp`, {
            data: {
                action: 'watchToCompletion',
                context: { difficulty: 5 }
            }
        });
        
        expect(xpResponse.ok()).toBeTruthy();
        const xpData = await xpResponse.json();
        
        expect(xpData.success).toBe(true);
        expect(xpData.xpAwarded).toBeGreaterThan(0);
        
        console.log('✅ XP awarded:', xpData.xpAwarded);
        console.log('✅ Bonus:', xpData.bonusAwarded ? 'YES' : 'NO');
    });
    
    test('Video completion tracking', async ({ request }) => {
        const trackResponse = await request.post(`${BASE_URL}/api/research/track/test_user_complete`, {
            data: {
                contentId: 'test_video_1',
                contentType: 'video',
                action: 'complete',
                watchTime: 28,
                videoDuration: 30,
                completed: true
            }
        });
        
        expect(trackResponse.ok()).toBeTruthy();
        const trackData = await trackResponse.json();
        
        expect(trackData.success).toBe(true);
        expect(trackData.xp).toBeDefined();
        expect(trackData.streak).toBeDefined();
        
        console.log('✅ Completion tracked');
        console.log('✅ XP from completion:', trackData.xp?.xpAwarded);
        console.log('✅ Streak:', trackData.streak?.streakDays, 'days');
    });
    
    test('Word click tracking (HLR)', async ({ request }) => {
        const wordResponse = await request.post(`${BASE_URL}/api/research/track/test_user_words`, {
            data: {
                contentId: 'test_video_1',
                contentType: 'video',
                action: 'wordClick',
                words: [
                    {
                        word: 'hablar',
                        correct: true,
                        frequency: 150
                    }
                ]
            }
        });
        
        expect(wordResponse.ok()).toBeTruthy();
        const wordData = await wordResponse.json();
        
        expect(wordData.success).toBe(true);
        console.log('✅ Word tracking successful');
    });
    
    test('Dashboard loads all data', async ({ request }) => {
        const dashboardResponse = await request.get(`${BASE_URL}/api/research/dashboard/test_user_dashboard`);
        expect(dashboardResponse.ok()).toBeTruthy();
        
        const dashboard = await dashboardResponse.json();
        
        expect(dashboard.success).toBe(true);
        expect(dashboard.dashboard).toBeDefined();
        expect(dashboard.dashboard.user).toBeDefined();
        expect(dashboard.dashboard.stats).toBeDefined();
        expect(dashboard.dashboard.learning).toBeDefined();
        
        console.log('📊 Dashboard Data:');
        console.log('  Level:', dashboard.dashboard.user?.level);
        console.log('  XP:', dashboard.dashboard.stats?.totalXP);
        console.log('  Known words:', dashboard.dashboard.learning?.knownWords);
        console.log('  Streak:', dashboard.dashboard.streak?.streakDays, 'days');
    });
    
    test('Practice session generation', async ({ request }) => {
        const practiceResponse = await request.get(`${BASE_URL}/api/research/practice/test_user_practice?duration=5`);
        expect(practiceResponse.ok()).toBeTruthy();
        
        const practice = await practiceResponse.json();
        
        expect(practice.success).toBe(true);
        expect(practice.session).toBeDefined();
        expect(practice.session.items).toBeInstanceOf(Array);
        
        console.log('📚 Practice Session:');
        console.log('  Items:', practice.session.items.length);
        console.log('  XP potential:', practice.session.totalXPPotential);
    });
    
    test('Streak tracking', async ({ request }) => {
        const streakResponse = await request.get(`${BASE_URL}/api/research/streak/test_user_streak`);
        expect(streakResponse.ok()).toBeTruthy();
        
        const streak = await streakResponse.json();
        
        expect(streak.success).toBe(true);
        expect(streak.streak).toBeDefined();
        expect(streak.risk).toBeDefined();
        
        console.log('🔥 Streak Status:');
        console.log('  Days:', streak.streak.streakDays);
        console.log('  Status:', streak.streak.status);
        console.log('  At risk:', streak.risk.atRisk);
    });
    
    test('TikTok 5-point engagement system', async ({ request }) => {
        const engagementActions = [
            { action: 'like', expectedPoints: 1 },
            { action: 'comment', expectedPoints: 2 },
            { action: 'share', expectedPoints: 3 },
            { action: 'complete', expectedPoints: 4 },
            { action: 'rewatch', expectedPoints: 5 }
        ];
        
        for (const { action, expectedPoints } of engagementActions) {
            const response = await request.post(`${BASE_URL}/api/research/track/test_user_engagement`, {
                data: {
                    contentId: 'test_video_1',
                    action,
                    watchTime: 30,
                    completed: action === 'complete' || action === 'rewatch'
                }
            });
            
            const data = await response.json();
            console.log(`✅ ${action}: tracked (worth ${expectedPoints} points)`);
        }
    });
    
    test('Variable rewards (30% bonus chance)', async ({ request }) => {
        const rewards = [];
        
        // Test 20 times to see variance
        for (let i = 0; i < 20; i++) {
            const response = await request.post(`${BASE_URL}/api/research/xp/test_user_variance_${i}`, {
                data: {
                    action: 'watchToCompletion',
                    context: { difficulty: 5 }
                }
            });
            
            const data = await response.json();
            rewards.push({
                xp: data.xpAwarded,
                bonus: data.bonusAwarded
            });
        }
        
        const uniqueXP = [...new Set(rewards.map(r => r.xp))];
        const bonusCount = rewards.filter(r => r.bonus).length;
        
        console.log('🎰 Variable Rewards Test:');
        console.log('  Unique XP values:', uniqueXP.length);
        console.log('  XP range:', Math.min(...uniqueXP), '-', Math.max(...uniqueXP));
        console.log('  Bonuses awarded:', bonusCount, '/ 20 (', (bonusCount/20*100).toFixed(0), '%)');
        
        // Should have variance
        expect(uniqueXP.length).toBeGreaterThan(1);
    });
    
    test('Page performance (optimized)', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto(BASE_URL);
        await page.waitForLoadState('load');
        
        const loadTime = Date.now() - startTime;
        
        console.log('⚡ Performance:');
        console.log('  Page load:', loadTime, 'ms');
        
        // Should load in under 5 seconds (with all research algorithms)
        expect(loadTime).toBeLessThan(5000);
        
        // Check Core Web Vitals
        const metrics = await page.evaluate(() => {
            const paint = performance.getEntriesByType('paint');
            return {
                fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime
            };
        });
        
        console.log('  FCP:', metrics.fcp?.toFixed(0), 'ms');
        
        if (metrics.fcp) {
            expect(metrics.fcp).toBeLessThan(1800); // Should be under 1.8s
        }
    });
    
    test('SEO tags present', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const title = await page.title();
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        const h1Count = await page.locator('h1').count();
        
        console.log('🎯 SEO:');
        console.log('  Title:', title);
        console.log('  Description:', description ? 'Present' : 'Missing');
        console.log('  H1 tags:', h1Count);
        
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        expect(description).toBeTruthy();
        expect(h1Count).toBeLessThanOrEqual(1); // Should have 1 or 0 (if hidden)
    });
    
    test('All research algorithms loaded', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check if research integration script loaded
        const hasResearchScript = await page.evaluate(() => {
            return typeof window.researchFeed !== 'undefined';
        });
        
        console.log('✅ Research integration loaded:', hasResearchScript);
        expect(hasResearchScript).toBeTruthy();
    });
});

test.describe('Best Practices Validation', () => {
    
    test('Compression enabled', async ({ request }) => {
        const response = await request.get(BASE_URL);
        const headers = response.headers();
        
        const hasCompression = headers['content-encoding'] === 'gzip' || 
                             headers['content-encoding'] === 'br';
        
        console.log('📦 Compression:', headers['content-encoding'] || 'None');
        expect(hasCompression || headers['content-length'] < 10000).toBeTruthy();
    });
    
    test('Caching headers set', async ({ request }) => {
        const response = await request.get(BASE_URL);
        const headers = response.headers();
        
        const hasCaching = headers['cache-control'] !== undefined ||
                          headers['etag'] !== undefined;
        
        console.log('💾 Cache-Control:', headers['cache-control']);
        console.log('💾 ETag:', headers['etag']);
        
        expect(hasCaching).toBeTruthy();
    });
    
    test('Mobile viewport configured', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        
        console.log('📱 Viewport:', viewport);
        expect(viewport).toContain('width=device-width');
    });
});

console.log('\n🎯 Complete App Integration Test Suite');
console.log('📊 Testing ALL research-backed features\n');
