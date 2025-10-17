const { test, expect } = require('@playwright/test');

test.describe('🔥 CRITICAL REAL USER TESTING - Find ALL Issues', () => {
    
    // Test as COMPLETE BEGINNER - First Time User
    test('BEGINNER USER - Complete First Session', async ({ page, context }) => {
        console.log('\n👶 SIMULATING COMPLETE BEGINNER USER...\n');
        
        // Clear everything - brand new user
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Screenshot 1: First impression
        await page.screenshot({ 
            path: 'screenshots/critical/beginner-01-first-load.png',
            fullPage: true 
        });
        console.log('📸 First impression captured');
        
        // Check what they see
        const hasVideos = await page.locator('video').count() > 0;
        const hasTranscript = await page.locator('.transcript-word').count() > 0;
        console.log(`  Videos visible: ${hasVideos}`);
        console.log(`  Transcript visible: ${hasTranscript}`);
        
        if (!hasVideos) {
            console.log('❌ CRITICAL: No videos visible for new user!');
        }
        
        // Try to click a word in transcript
        await page.waitForTimeout(2000);
        const firstWord = page.locator('.transcript-word').first();
        const wordExists = await firstWord.count() > 0;
        
        if (wordExists) {
            await firstWord.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: 'screenshots/critical/beginner-02-clicked-word.png',
                fullPage: true 
            });
            console.log('📸 Clicked word - checking translation popup');
            
            // Check if translation appeared
            const hasTranslation = await page.locator('.word-popup, .translation-popup').count() > 0;
            console.log(`  Translation shown: ${hasTranslation}`);
            if (!hasTranslation) {
                console.log('❌ ISSUE: Translation popup not appearing!');
            }
        } else {
            console.log('⚠️  No transcript words found to click');
        }
        
        // Try to navigate to Discover
        await page.click('text=Discover', { timeout: 5000 }).catch(() => {
            console.log('⚠️  No Discover button found in nav');
        });
        await page.waitForTimeout(2000);
        
        // Try going to discover directly
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForTimeout(5000);
        
        await page.screenshot({ 
            path: 'screenshots/critical/beginner-03-discover-page.png',
            fullPage: true 
        });
        console.log('📸 Discover page for beginner');
        
        // Check if articles loaded
        const articleCount = await page.locator('.article-card').count();
        console.log(`  Articles loaded: ${articleCount}`);
        if (articleCount === 0) {
            console.log('❌ CRITICAL: No articles showing for beginner!');
        }
        
        // Try share cards
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/beginner-04-share-cards.png',
            fullPage: true 
        });
        console.log('📸 Share cards page');
        
        // Check stats display
        const streakValue = await page.locator('#stat1Value').textContent();
        console.log(`  Streak shown: ${streakValue}`);
        
        // Try referral page
        await page.goto('http://localhost:3001/refer-a-friend.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/beginner-05-referral.png',
            fullPage: true 
        });
        console.log('📸 Referral page');
        
        // Try Premium page
        await page.goto('http://localhost:3001/premium.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/beginner-06-premium.png',
            fullPage: true 
        });
        console.log('📸 Premium page');
        
        console.log('✅ Beginner user journey captured\n');
    });
    
    // Test as ACTIVE USER with history
    test('ACTIVE USER - Daily Learning Session', async ({ page }) => {
        console.log('\n🔥 SIMULATING ACTIVE USER (3-day streak)...\n');
        
        // Set up active user profile
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('userLevel', 'B1');
            localStorage.setItem('userStreak', '3');
            localStorage.setItem('userXP', '450');
            localStorage.setItem('wordsLearned', JSON.stringify(['hola', 'mundo', 'gracias', 'por', 'favor']));
            localStorage.setItem('videosWatched', '12');
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/critical/active-01-homepage.png',
            fullPage: true 
        });
        console.log('📸 Active user homepage');
        
        // Check if stats are visible
        const streakDisplay = await page.locator('#streakDisplay').textContent();
        const levelBadge = await page.locator('.level-badge').textContent();
        console.log(`  Streak: ${streakDisplay}, Level: ${levelBadge}`);
        
        // Go to Discover
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForTimeout(5000);
        await page.screenshot({ 
            path: 'screenshots/critical/active-02-discover.png',
            fullPage: true 
        });
        console.log('📸 Active user discover page');
        
        // Try to click an article
        const firstArticle = page.locator('.article-card').first();
        const articleExists = await firstArticle.count() > 0;
        if (articleExists) {
            await firstArticle.screenshot({ 
                path: 'screenshots/critical/active-03-article-card.png' 
            });
            console.log('📸 Article card close-up');
        }
        
        // Generate share card
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.waitForLoadState('networkidle');
        
        // Try different templates
        await page.click('text=Words');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: 'screenshots/critical/active-04-share-words.png',
            fullPage: true 
        });
        
        await page.click('text=Streak');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: 'screenshots/critical/active-05-share-streak.png',
            fullPage: true 
        });
        console.log('📸 Share cards with real data');
        
        console.log('✅ Active user journey captured\n');
    });
    
    // Test as PREMIUM USER
    test('PREMIUM USER - Full Access Experience', async ({ page }) => {
        console.log('\n👑 SIMULATING PREMIUM USER...\n');
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('userLevel', 'C1');
            localStorage.setItem('userStreak', '45');
            localStorage.setItem('userXP', '3500');
            localStorage.setItem('wordsLearned', JSON.stringify(Array(150).fill('word')));
            localStorage.setItem('videosWatched', '200');
            localStorage.setItem('isPremium', 'true');
            localStorage.setItem('premiumExpiry', Date.now() + 30 * 24 * 60 * 60 * 1000);
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/critical/premium-01-homepage.png',
            fullPage: true 
        });
        console.log('📸 Premium user homepage');
        
        // Check Premium badge/indicator
        const hasPremiumIndicator = await page.locator('text=/Premium|👑|PRO/i').count() > 0;
        console.log(`  Premium indicator visible: ${hasPremiumIndicator}`);
        if (!hasPremiumIndicator) {
            console.log('⚠️  No visible Premium indicator!');
        }
        
        // Check all features
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForTimeout(5000);
        await page.screenshot({ 
            path: 'screenshots/critical/premium-02-discover.png',
            fullPage: true 
        });
        
        await page.goto('http://localhost:3001/premium.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/premium-03-premium-page.png',
            fullPage: true 
        });
        console.log('📸 Premium page (should show "Current Plan")');
        
        console.log('✅ Premium user journey captured\n');
    });
    
    // Test MOBILE USER
    test('MOBILE USER - iPhone Experience', async ({ page }) => {
        console.log('\n📱 SIMULATING MOBILE USER (iPhone 12)...\n');
        
        // Set iPhone 12 viewport
        await page.setViewportSize({ width: 390, height: 844 });
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'A2');
            localStorage.setItem('userStreak', '1');
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'screenshots/critical/mobile-01-homepage.png',
            fullPage: true 
        });
        console.log('📸 Mobile homepage');
        
        // Try scrolling
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: 'screenshots/critical/mobile-02-scrolled.png',
            fullPage: true 
        });
        
        // Check if video controls are touch-friendly
        const videoElement = page.locator('video').first();
        const videoExists = await videoElement.count() > 0;
        if (videoExists) {
            const boundingBox = await videoElement.boundingBox();
            console.log(`  Video size: ${boundingBox?.width}x${boundingBox?.height}`);
        }
        
        // Try each page on mobile
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForTimeout(3000);
        await page.screenshot({ 
            path: 'screenshots/critical/mobile-03-discover.png',
            fullPage: true 
        });
        
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/mobile-04-share.png',
            fullPage: true 
        });
        
        await page.goto('http://localhost:3001/refer-a-friend.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/mobile-05-referral.png',
            fullPage: true 
        });
        
        await page.goto('http://localhost:3001/premium.html');
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/mobile-06-premium.png',
            fullPage: true 
        });
        
        console.log('✅ Mobile user journey captured\n');
    });
    
    // Test ERROR SCENARIOS
    test('ERROR HANDLING - What breaks?', async ({ page }) => {
        console.log('\n💥 TESTING ERROR SCENARIOS...\n');
        
        // Test with no internet (simulate)
        await page.goto('http://localhost:3001/discover-ai.html');
        
        // Block API calls
        await page.route('**/api/**', route => route.abort());
        
        await page.reload();
        await page.waitForTimeout(5000);
        await page.screenshot({ 
            path: 'screenshots/critical/error-01-no-api.png',
            fullPage: true 
        });
        console.log('📸 Page with blocked API');
        
        // Check error message
        const hasErrorMessage = await page.locator('text=/error|failed|wrong/i').count() > 0;
        console.log(`  Error message shown: ${hasErrorMessage}`);
        
        // Test with corrupted localStorage
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'INVALID');
            localStorage.setItem('wordsLearned', 'NOT JSON');
            localStorage.setItem('userXP', 'abc');
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ 
            path: 'screenshots/critical/error-02-corrupt-data.png',
            fullPage: true 
        });
        console.log('📸 Page with corrupted data');
        
        console.log('✅ Error scenarios captured\n');
    });
    
    // Test NAVIGATION FLOW
    test('NAVIGATION - Can user find everything?', async ({ page }) => {
        console.log('\n🗺️  TESTING NAVIGATION FLOW...\n');
        
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');
        
        // Check what navigation exists
        const hasBottomNav = await page.locator('.bottom-nav, .nav-bar, [class*="nav"]').count() > 0;
        const hasMenuButton = await page.locator('button:has-text("Menu"), .menu-button, .hamburger').count() > 0;
        
        console.log(`  Bottom nav exists: ${hasBottomNav}`);
        console.log(`  Menu button exists: ${hasMenuButton}`);
        
        // Try to find links to all pages
        const pages = [
            { name: 'Discover', url: 'discover' },
            { name: 'Share', url: 'share' },
            { name: 'Refer', url: 'refer' },
            { name: 'Premium', url: 'premium' }
        ];
        
        for (const pageInfo of pages) {
            const linkExists = await page.locator(`a[href*="${pageInfo.url}"], button:has-text("${pageInfo.name}")`).count() > 0;
            console.log(`  Link to ${pageInfo.name}: ${linkExists ? '✅' : '❌'}`);
        }
        
        await page.screenshot({ 
            path: 'screenshots/critical/nav-01-homepage.png',
            fullPage: true 
        });
        
        // Try manual navigation
        const urlsToTest = [
            'discover-ai.html',
            'share-card-generator.html',
            'refer-a-friend.html',
            'premium.html'
        ];
        
        for (const url of urlsToTest) {
            await page.goto(`http://localhost:3001/${url}`);
            await page.waitForLoadState('networkidle');
            const title = await page.title();
            console.log(`  ${url}: ${title}`);
        }
        
        console.log('✅ Navigation tested\n');
    });
    
    // Test ACTUAL USER INTERACTIONS
    test('INTERACTION TEST - Does everything respond?', async ({ page }) => {
        console.log('\n🖱️  TESTING ALL INTERACTIONS...\n');
        
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.waitForLoadState('networkidle');
        
        // Test all template buttons
        const templates = ['Streak', 'Words', 'Level', 'Videos', 'Week', 'Milestone'];
        for (const template of templates) {
            await page.click(`text=${template}`);
            await page.waitForTimeout(300);
            const title = await page.locator('#cardTitle').textContent();
            console.log(`  ${template} template: "${title}"`);
        }
        
        // Test copy button
        await page.goto('http://localhost:3001/refer-a-friend.html');
        await page.waitForLoadState('networkidle');
        
        const copyBtn = page.locator('.copy-btn');
        await copyBtn.click();
        await page.waitForTimeout(500);
        const btnText = await copyBtn.textContent();
        console.log(`  Copy button response: ${btnText}`);
        
        // Test Premium CTA
        await page.goto('http://localhost:3001/premium.html');
        await page.waitForLoadState('networkidle');
        
        page.once('dialog', dialog => {
            console.log(`  Premium dialog: ${dialog.message().substring(0, 50)}...`);
            dialog.accept();
        });
        
        await page.click('.featured .cta-btn');
        await page.waitForTimeout(1000);
        
        console.log('✅ Interactions tested\n');
    });
});

test.afterAll(async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 CRITICAL ANALYSIS COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📸 Screenshots in: screenshots/critical/');
    console.log('📊 Review ALL screenshots to find issues\n');
});
