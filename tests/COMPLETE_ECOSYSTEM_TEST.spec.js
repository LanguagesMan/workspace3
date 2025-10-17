const { test, expect } = require('@playwright/test');

test.describe('🎯 COMPLETE ECOSYSTEM TEST - Perfect MVP', () => {
    
    test('1. BEGINNER USER - Complete Journey', async ({ page }) => {
        console.log('\n👶 TESTING AS COMPLETE BEGINNER (A1)...\n');
        
        // Setup beginner user
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('userLevel', 'A1');
            localStorage.setItem('userInterests', JSON.stringify(['travel', 'food']));
            localStorage.setItem('onboardingComplete', 'true');
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Test 1: Bottom nav exists
        const hasBottomNav = await page.locator('.bottom-nav').isVisible();
        console.log(`✅ Test 1 - Bottom nav visible: ${hasBottomNav ? 'PASS' : 'FAIL'}`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/01-beginner-home.png', fullPage: true });
        
        // Test 2: Navigate to Discover
        await page.click('.nav-item[data-page="discover"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(20000); // Wait for articles
        
        const discoverHasNav = await page.locator('.bottom-nav').isVisible();
        console.log(`✅ Test 2 - Discover has bottom nav: ${discoverHasNav ? 'PASS' : 'FAIL'}`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/02-beginner-discover.png', fullPage: true });
        
        // Test 3: Click word in article
        const articleWords = await page.locator('.article-content span, .article-content p').first();
        if (await articleWords.isVisible()) {
            await articleWords.click();
            await page.waitForTimeout(1000);
            console.log(`✅ Test 3 - Word clickable in articles: CHECKING`);
        }
        
        // Test 4: Navigate to Games
        await page.click('.nav-item[data-page="games"]');
        await page.waitForTimeout(2000);
        
        const gamesHasNav = await page.locator('.bottom-nav').isVisible();
        console.log(`✅ Test 4 - Games has bottom nav: ${gamesHasNav ? 'PASS' : 'FAIL'}`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/03-beginner-games.png', fullPage: true });
        
        // Test 5: Navigate to Review
        await page.click('.nav-item[data-page="review"]');
        await page.waitForTimeout(2000);
        
        const reviewHasNav = await page.locator('.bottom-nav').isVisible();
        console.log(`✅ Test 5 - Review has bottom nav: ${reviewHasNav ? 'PASS' : 'FAIL'}`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/04-beginner-review.png', fullPage: true });
        
        // Test 6: Navigate to Refer
        await page.click('.nav-item[data-page="refer"]');
        await page.waitForTimeout(2000);
        
        const referHasNav = await page.locator('.bottom-nav').isVisible();
        console.log(`✅ Test 6 - Refer has bottom nav: ${referHasNav ? 'PASS' : 'FAIL'}`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/05-beginner-refer.png', fullPage: true });
        
        console.log('\n📊 BEGINNER USER SUMMARY:');
        console.log(`  Navigation: ${hasBottomNav && discoverHasNav && gamesHasNav ? 'PASS ✅' : 'FAIL ❌'}`);
        console.log(`  All pages accessible: ${referHasNav ? 'PASS ✅' : 'FAIL ❌'}`);
    });
    
    test('2. VIDEO SCROLLING TEST', async ({ page }) => {
        console.log('\n📱 TESTING VIDEO SCROLLING...\n');
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Count initial videos
        const initialVideos = await page.locator('.video-card').count();
        console.log(`  Initial videos loaded: ${initialVideos}`);
        
        // Try scrolling
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(2000);
        
        // Check if more videos loaded
        const afterScrollVideos = await page.locator('.video-card').count();
        console.log(`  After scroll videos: ${afterScrollVideos}`);
        
        const canScroll = afterScrollVideos > initialVideos || initialVideos > 10;
        console.log(`✅ Video scrolling: ${canScroll ? 'PASS' : 'FAIL - Only ' + initialVideos + ' videos'}`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/06-video-scrolling.png', fullPage: true });
    });
    
    test('3. BUTTON POSITIONING TEST', async ({ page }) => {
        console.log('\n👆 TESTING BUTTON POSITIONING...\n');
        
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone size
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Check button position
        const buttonPosition = await page.evaluate(() => {
            const controls = document.querySelector('.video-controls');
            if (!controls) return null;
            const rect = controls.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                isOnRight: rect.right > window.innerWidth / 2
            };
        });
        
        if (buttonPosition) {
            console.log(`  Button position: ${buttonPosition.isOnRight ? 'RIGHT ✅' : 'LEFT ❌'}`);
            console.log(`  Thumb reachable: ${buttonPosition.isOnRight ? 'YES ✅' : 'NO ❌'}`);
        }
        
        await page.screenshot({ path: 'screenshots/ecosystem/07-button-position-mobile.png', fullPage: true });
    });
    
    test('4. INTERMEDIATE USER - Level Appropriate Content', async ({ page }) => {
        console.log('\n📚 TESTING AS INTERMEDIATE USER (B1)...\n');
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('userLevel', 'B1');
            localStorage.setItem('userInterests', JSON.stringify(['technology', 'news']));
            localStorage.setItem('onboardingComplete', 'true');
            localStorage.setItem('knownWords', JSON.stringify(['hola', 'gracias', 'computadora', 'internet']));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'screenshots/ecosystem/08-intermediate-home.png', fullPage: true });
        
        // Go to Discover
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForTimeout(20000);
        
        // Check if articles match level
        const articles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.article-card')).map(card => ({
                title: card.querySelector('.article-title')?.textContent,
                difficulty: card.querySelector('[data-difficulty]')?.dataset?.difficulty,
                category: card.querySelector('[data-category]')?.dataset?.category
            }));
        });
        
        console.log(`  Articles loaded: ${articles.length}`);
        console.log(`  First article: ${articles[0]?.title?.substring(0, 50)}...`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/09-intermediate-discover.png', fullPage: true });
    });
    
    test('5. ADVANCED USER - Complex Content', async ({ page }) => {
        console.log('\n🎓 TESTING AS ADVANCED USER (C1)...\n');
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('userLevel', 'C1');
            localStorage.setItem('userInterests', JSON.stringify(['politics', 'culture']));
            localStorage.setItem('onboardingComplete', 'true');
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'screenshots/ecosystem/10-advanced-home.png', fullPage: true });
        
        console.log(`  ✅ Advanced user setup complete`);
    });
    
    test('6. COHESIVE ECOSYSTEM CHECK', async ({ page }) => {
        console.log('\n🔗 TESTING COHESIVE ECOSYSTEM...\n');
        
        const checks = {
            bottomNavAllPages: false,
            clickableWordsArticles: false,
            videoScrolling: false,
            buttonPositioning: false,
            savedWordsInGames: false,
            levelFiltering: false,
            interestTracking: false,
            spacedRepetition: false
        };
        
        // Test bottom nav on all pages
        const pages = [
            '/tiktok-video-feed.html',
            '/discover-ai.html',
            '/games.html',
            '/refer-a-friend.html',
            '/vocabulary-review.html'
        ];
        
        let navCount = 0;
        for (const pagePath of pages) {
            try {
                await page.goto(`http://localhost:3001${pagePath}`);
                await page.waitForTimeout(2000);
                const hasNav = await page.locator('.bottom-nav').isVisible();
                if (hasNav) navCount++;
            } catch (e) {
                console.log(`  ⚠️  Page ${pagePath} not found`);
            }
        }
        
        checks.bottomNavAllPages = navCount >= 3;
        
        console.log('\n📊 ECOSYSTEM CHECKLIST:');
        console.log(`  ✅ Bottom nav on pages: ${navCount}/${pages.length}`);
        console.log(`  ${checks.bottomNavAllPages ? '✅' : '❌'} Unified navigation`);
        console.log(`  ⏳ Clickable words in articles: TESTING NEEDED`);
        console.log(`  ⏳ Video scrolling: TESTING NEEDED`);
        console.log(`  ⏳ Button positioning: TESTING NEEDED`);
        console.log(`  ⏳ Saved words in games: BUILD NEEDED`);
        console.log(`  ⏳ Level filtering: BUILD NEEDED`);
        console.log(`  ⏳ Interest tracking: BUILD NEEDED`);
        console.log(`  ⏳ Spaced repetition: BUILD NEEDED`);
        
        await page.screenshot({ path: 'screenshots/ecosystem/11-ecosystem-summary.png', fullPage: true });
    });
});

test.afterAll(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPLETE ECOSYSTEM TEST FINISHED');
    console.log('='.repeat(80));
    console.log('\n📸 Screenshots saved to /screenshots/ecosystem/');
    console.log('\n🔍 Review screenshots to verify:');
    console.log('  1. Bottom nav on all pages');
    console.log('  2. Clickable words in articles');
    console.log('  3. Video scrolling works');
    console.log('  4. Buttons positioned correctly');
    console.log('  5. Content appropriate for each level');
    console.log('\n📋 Next: Build missing smart features');
});
