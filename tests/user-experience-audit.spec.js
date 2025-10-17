const { test, expect } = require('@playwright/test');

test.describe('Comprehensive User Experience Audit', () => {
    test('Beginner User (A1) - First Time Experience', async ({ page }) => {
        console.log('🔰 Testing as BEGINNER user (A1 level)');

        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');

        // Screenshot 1: First impression
        await page.screenshot({
            path: '/tmp/audit-beginner-01-first-load.png',
            fullPage: true
        });

        // Check for onboarding/welcome
        const hasOnboarding = await page.locator('.onboarding, .welcome, .tutorial').count();
        console.log(`Onboarding elements found: ${hasOnboarding}`);

        // Check if difficulty level is clear
        const levelBadge = await page.locator('.level-badge').first();
        if (await levelBadge.count() > 0) {
            const levelText = await levelBadge.textContent();
            console.log(`✅ Level badge visible: ${levelText}`);
        } else {
            console.log('❌ No level badge visible - user doesn\'t know their level');
        }

        // Check for progress indicators
        const hasProgress = await page.locator('.progress, .streak, .points, .score').count();
        console.log(`Progress indicators: ${hasProgress > 0 ? '✅ Found' : '❌ Missing'}`);

        // Check for gamification
        const hasGamification = await page.locator('.achievement, .badge, .reward, .xp').count();
        console.log(`Gamification elements: ${hasGamification > 0 ? '✅ Found' : '❌ Missing'}`);

        // Check for clear CTAs
        const videoCards = await page.locator('.video-card').count();
        console.log(`Videos loaded: ${videoCards}`);

        // Test interaction clarity
        await page.screenshot({
            path: '/tmp/audit-beginner-02-interaction.png',
            fullPage: false
        });

        // Check for help/tutorial
        const hasHelp = await page.locator('button:has-text("Help"), button:has-text("Tutorial"), button:has-text("?")').count();
        console.log(`Help/Tutorial: ${hasHelp > 0 ? '✅ Available' : '❌ Missing'}`);

        console.log('\\n=== BEGINNER USER AUDIT COMPLETE ===\\n');
    });

    test('Intermediate User (B1) - Daily Practice Flow', async ({ page }) => {
        console.log('📚 Testing as INTERMEDIATE user (B1 level)');

        // Simulate returning user
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Screenshot initial state
        await page.screenshot({
            path: '/tmp/audit-intermediate-01-daily-session.png',
            fullPage: true
        });

        // Check for daily goals
        const hasDailyGoal = await page.locator('text=/daily|goal|target|today/i').count();
        console.log(`Daily goals: ${hasDailyGoal > 0 ? '✅ Visible' : '❌ Missing'}`);

        // Check for streak tracking
        const hasStreak = await page.locator('text=/streak|day|consecutive/i').count();
        console.log(`Streak tracking: ${hasStreak > 0 ? '✅ Visible' : '❌ Missing'}`);

        // Test video interaction
        const firstVideo = await page.locator('video').first();
        if (await firstVideo.count() > 0) {
            await firstVideo.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);

            // Check for subtitle controls
            const hasSubtitles = await page.locator('[id^="cc-btn"], [id^="subtitle"]').count();
            console.log(`Subtitle controls: ${hasSubtitles > 0 ? '✅ Available' : '❌ Missing'}`);

            // Check for speed controls
            const hasSpeed = await page.locator('[id^="speed-btn"]').count();
            console.log(`Speed controls: ${hasSpeed > 0 ? '✅ Available' : '❌ Missing'}`);
        }

        // Check for difficulty adjustment
        const hasDifficultyControl = await page.locator('text=/too easy|too hard|difficulty/i').count();
        console.log(`Difficulty controls: ${hasDifficultyControl > 0 ? '✅ Available' : '❌ Missing'}`);

        // Check for vocabulary tracking
        const hasVocabTracking = await page.locator('text=/vocabulary|words learned|new words/i').count();
        console.log(`Vocabulary tracking: ${hasVocabTracking > 0 ? '✅ Visible' : '❌ Missing'}`);

        console.log('\\n=== INTERMEDIATE USER AUDIT COMPLETE ===\\n');
    });

    test('Advanced User (C1) - Content Quality Check', async ({ page }) => {
        console.log('🎓 Testing as ADVANCED user (C1 level)');

        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Screenshot
        await page.screenshot({
            path: '/tmp/audit-advanced-01-content.png',
            fullPage: true
        });

        // Check for content variety
        const videoCards = await page.locator('.video-card');
        const videoCount = await videoCards.count();
        console.log(`Total videos available: ${videoCount}`);

        // Check for content filtering
        const hasFilters = await page.locator('button:has-text("Filter"), select, [role="combobox"]').count();
        console.log(`Content filters: ${hasFilters > 0 ? '✅ Available' : '❌ Missing'}`);

        // Check for topic/category selection
        const hasTopics = await page.locator('text=/topic|category|theme/i').count();
        console.log(`Topic selection: ${hasTopics > 0 ? '✅ Available' : '❌ Missing'}`);

        // Check for advanced features
        const hasNotes = await page.locator('text=/note|save|bookmark/i').count();
        console.log(`Save/Note feature: ${hasNotes > 0 ? '✅ Available' : '❌ Missing'}`);

        // Check for export/review
        const hasReview = await page.locator('text=/review|history|learned/i').count();
        console.log(`Review history: ${hasReview > 0 ? '✅ Available' : '❌ Missing'}`);

        console.log('\\n=== ADVANCED USER AUDIT COMPLETE ===\\n');
    });

    test('Mobile Experience Audit', async ({ page }) => {
        console.log('📱 Testing MOBILE experience');

        // Set mobile viewport (iPhone 12)
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');

        // Screenshot mobile view
        await page.screenshot({
            path: '/tmp/audit-mobile-01-portrait.png',
            fullPage: true
        });

        // Check for mobile-optimized UI
        const navHeight = await page.locator('nav, .nav-bar, .bottom-nav').boundingBox();
        console.log(`Navigation bar: ${navHeight ? '✅ Present' : '❌ Missing'}`);

        // Check touch targets
        const buttons = await page.locator('button, a, .clickable').all();
        let smallButtons = 0;
        for (const button of buttons.slice(0, 5)) {
            const box = await button.boundingBox();
            if (box && (box.width < 44 || box.height < 44)) {
                smallButtons++;
            }
        }
        console.log(`Touch targets < 44px: ${smallButtons > 0 ? `❌ Found ${smallButtons}` : '✅ All good'}`);

        // Check for pull-to-refresh
        const hasRefresh = await page.locator('[data-pull-refresh], .pull-to-refresh').count();
        console.log(`Pull-to-refresh: ${hasRefresh > 0 ? '✅ Available' : '❌ Missing'}`);

        // Test landscape
        await page.setViewportSize({ width: 844, height: 390 });
        await page.waitForTimeout(1000);
        await page.screenshot({
            path: '/tmp/audit-mobile-02-landscape.png',
            fullPage: false
        });

        console.log('\\n=== MOBILE AUDIT COMPLETE ===\\n');
    });

    test('Retention & Gamification Audit', async ({ page }) => {
        console.log('🎮 Testing RETENTION & GAMIFICATION features');

        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Screenshot
        await page.screenshot({
            path: '/tmp/audit-gamification-01.png',
            fullPage: true
        });

        // Check for streak system
        const hasStreak = await page.locator('text=/🔥|streak|day|consecutive/i').count();
        console.log(`Streak system: ${hasStreak > 0 ? '✅ Implemented' : '❌ MISSING (CRITICAL)'}`);

        // Check for points/XP
        const hasPoints = await page.locator('text=/points|xp|score|earned/i').count();
        console.log(`Points/XP system: ${hasPoints > 0 ? '✅ Implemented' : '❌ MISSING (CRITICAL)'}`);

        // Check for achievements
        const hasAchievements = await page.locator('text=/achievement|badge|trophy|unlock/i').count();
        console.log(`Achievements: ${hasAchievements > 0 ? '✅ Implemented' : '❌ MISSING (CRITICAL)'}`);

        // Check for leaderboard
        const hasLeaderboard = await page.locator('text=/leaderboard|rank|top|compete/i').count();
        console.log(`Leaderboard: ${hasLeaderboard > 0 ? '✅ Implemented' : '❌ MISSING'}`);

        // Check for daily goals
        const hasDailyGoals = await page.locator('text=/daily goal|today|target|complete/i').count();
        console.log(`Daily goals: ${hasDailyGoals > 0 ? '✅ Implemented' : '❌ MISSING (CRITICAL)'}`);

        // Check for progress visualization
        const hasProgressBar = await page.locator('.progress-bar, progress, [role="progressbar"]').count();
        console.log(`Progress bars: ${hasProgressBar > 0 ? '✅ Visible' : '❌ MISSING'}`);

        // Check for celebration/feedback
        const hasCelebration = await page.locator('.confetti, .celebration, .success-animation').count();
        console.log(`Success feedback: ${hasCelebration > 0 ? '✅ Implemented' : '❌ MISSING'}`);

        console.log('\\n=== GAMIFICATION AUDIT COMPLETE ===\\n');
    });

    test('Social & Community Features Audit', async ({ page }) => {
        console.log('👥 Testing SOCIAL & COMMUNITY features');

        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');

        // Screenshot
        await page.screenshot({
            path: '/tmp/audit-social-01.png',
            fullPage: true
        });

        // Check for profile/account
        const hasProfile = await page.locator('button:has-text("Profile"), [aria-label="Profile"], .profile-btn').count();
        console.log(`User profile: ${hasProfile > 0 ? '✅ Available' : '❌ MISSING'}`);

        // Check for friends/social
        const hasFriends = await page.locator('text=/friend|follow|community/i').count();
        console.log(`Social features: ${hasFriends > 0 ? '✅ Available' : '❌ MISSING'}`);

        // Check for sharing
        const hasShare = await page.locator('button:has-text("Share"), [aria-label*="Share"]').count();
        console.log(`Share functionality: ${hasShare > 0 ? '✅ Available' : '❌ MISSING'}`);

        // Check for comments/discussion
        const hasComments = await page.locator('text=/comment|discuss|chat/i').count();
        console.log(`Comments/Discussion: ${hasComments > 0 ? '✅ Available' : '❌ MISSING'}`);

        console.log('\\n=== SOCIAL AUDIT COMPLETE ===\\n');
    });
});
