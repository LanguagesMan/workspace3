const { chromium } = require('playwright');

(async () => {
    console.log('🎨 COMPREHENSIVE DESIGN AUDIT - Comparing to Top Apps\n');

    const browser = await chromium.launch({ headless: false });

    // Test as 5 different user personas
    const userPersonas = [
        {
            name: "Complete Beginner (Maria)",
            profile: { level: 'A1', videosWatched: 0, wordsLearned: 0, streak: 0 },
            goals: "First time user, wants simple onboarding"
        },
        {
            name: "Casual Learner (John)",
            profile: { level: 'A2', videosWatched: 25, wordsLearned: 50, streak: 3 },
            goals: "Uses app occasionally, wants quick sessions"
        },
        {
            name: "Daily User (Sofia)",
            profile: { level: 'B1', videosWatched: 150, wordsLearned: 300, streak: 30 },
            goals: "Daily habit, wants progress tracking"
        },
        {
            name: "Advanced Learner (Chen)",
            profile: { level: 'C1', videosWatched: 500, wordsLearned: 1000, streak: 90 },
            goals: "Advanced content, wants challenge"
        },
        {
            name: "Free Tier User (Alex)",
            profile: { level: 'B1', videosWatched: 8, wordsLearned: 100, streak: 5, isFreeTier: true },
            goals: "Testing free limits, paywall experience"
        }
    ];

    for (const persona of userPersonas) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`👤 TESTING AS: ${persona.name}`);
        console.log(`📋 Profile: ${JSON.stringify(persona.profile, null, 2)}`);
        console.log(`🎯 Goals: ${persona.goals}`);
        console.log('='.repeat(70));

        const page = await browser.newPage({
            viewport: { width: 390, height: 844 }
        });

        // Set up user profile
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate((profile) => {
            localStorage.clear();
            localStorage.setItem('userLevel', profile.level);
            localStorage.setItem('videosWatched', profile.videosWatched);
            localStorage.setItem('wordsLearned', JSON.stringify(Array(profile.wordsLearned).fill('word')));
            localStorage.setItem('userStreak', profile.streak);
        }, persona.profile);

        await page.reload();
        await page.waitForTimeout(3000);

        // Design Audit Checklist
        const audit = await page.evaluate(() => {
            const getComputedStyle = (selector) => {
                const el = document.querySelector(selector);
                return el ? window.getComputedStyle(el) : null;
            };

            const checkVisibility = (selector) => {
                const el = document.querySelector(selector);
                if (!el) return 'NOT_FOUND';
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden' ? 'VISIBLE' : 'HIDDEN';
            };

            return {
                // Top Bar Audit
                topBar: {
                    exists: !!document.querySelector('.stats-top-bar'),
                    height: getComputedStyle('.stats-top-bar')?.height,
                    background: getComputedStyle('.stats-top-bar')?.background,
                    itemCount: document.querySelectorAll('.stats-top-bar span').length,
                    hasLevel: !!document.getElementById('levelBadge'),
                    hasStreak: !!document.getElementById('streakDisplay'),
                    hasXP: !!document.getElementById('xpDisplay'),
                    hasVideos: !!document.getElementById('videosDisplay'),
                    hasBadges: !!document.getElementById('badgesDisplay')
                },

                // Bottom Nav Audit
                bottomNav: {
                    exists: !!document.querySelector('.bottom-nav'),
                    itemCount: document.querySelectorAll('.bottom-nav .nav-item').length,
                    items: Array.from(document.querySelectorAll('.bottom-nav .nav-label')).map(el => el.textContent),
                    hasPremiumButton: Array.from(document.querySelectorAll('.bottom-nav .nav-label')).some(el => el.textContent.includes('Premium'))
                },

                // Sidebar Buttons Audit
                sidebar: {
                    exists: !!document.querySelector('.sidebar'),
                    buttons: Array.from(document.querySelectorAll('.sidebar-button')).map(btn => {
                        const style = window.getComputedStyle(btn);
                        return {
                            visible: style.display !== 'none' && style.visibility !== 'hidden' ? 'VISIBLE' : 'HIDDEN',
                            text: btn.querySelector('.sidebar-count')?.textContent || 'NO_TEXT',
                            background: style.background,
                            border: style.border
                        };
                    })
                },

                // Focus Words Audit
                focusWords: {
                    exists: !!document.querySelector('.focus-words'),
                    count: document.querySelectorAll('.focus-word').length,
                    words: Array.from(document.querySelectorAll('.focus-word')).slice(0, 5).map(el => el.textContent)
                },

                // Clutter Check
                clutter: {
                    modalCount: document.querySelectorAll('.modal, [class*="modal"]').length,
                    popupCount: document.querySelectorAll('.popup, [class*="popup"]').length,
                    visibleModals: Array.from(document.querySelectorAll('.modal, [class*="modal"]')).filter(el => {
                        // Check if element AND all parents are visible
                        let current = el;
                        while (current) {
                            const style = window.getComputedStyle(current);
                            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                                return false;
                            }
                            current = current.parentElement;
                        }
                        return true;
                    }).length
                },

                // UX Scores
                uxScores: {
                    visualClarity: document.querySelectorAll('.video-card').length > 0 ? 10 : 0,
                    minimalism: document.querySelectorAll('.modal:not([style*="display: none"])').length === 0 ? 10 : 5,
                    thumbReachability: document.querySelectorAll('.sidebar-button').length > 0 ? 10 : 0,
                    consistency: true, // Will calculate
                    loadTime: performance.now()
                }
            };
        });

        // Screenshot
        const screenshotPath = `screenshots/persona-${persona.name.toLowerCase().replace(/[^a-z]/g, '-')}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Score this persona's experience
        let totalScore = 0;
        let maxScore = 0;

        console.log('\n📊 DESIGN AUDIT RESULTS:');
        console.log('─'.repeat(70));

        // Top Bar Scoring
        console.log('\n🔝 TOP BAR:');
        console.log(`  Height: ${audit.topBar.height}`);
        console.log(`  Items: ${audit.topBar.itemCount}`);
        console.log(`  ✓ Level Badge: ${audit.topBar.hasLevel ? '✅' : '❌'}`);
        console.log(`  ✓ Streak: ${audit.topBar.hasStreak ? '✅' : '❌'}`);
        console.log(`  ✓ XP: ${audit.topBar.hasXP ? '✅' : '❌'}`);
        console.log(`  ✓ Videos: ${audit.topBar.hasVideos ? '✅' : '❌'}`);
        console.log(`  ✓ Badges: ${audit.topBar.hasBadges ? '✅' : '❌'}`);
        const topBarScore = [audit.topBar.hasLevel, audit.topBar.hasStreak, audit.topBar.hasXP, audit.topBar.hasVideos, audit.topBar.hasBadges].filter(Boolean).length;
        console.log(`  SCORE: ${topBarScore}/5`);
        totalScore += topBarScore;
        maxScore += 5;

        // Bottom Nav Scoring
        console.log('\n📱 BOTTOM NAV:');
        console.log(`  Items: ${audit.bottomNav.items.join(' | ')}`);
        console.log(`  Has Premium Button: ${audit.bottomNav.hasPremiumButton ? '❌ BAD' : '✅ GOOD'}`);
        const navScore = audit.bottomNav.itemCount === 4 && !audit.bottomNav.hasPremiumButton ? 10 : 5;
        console.log(`  SCORE: ${navScore}/10`);
        totalScore += navScore;
        maxScore += 10;

        // Sidebar Scoring
        console.log('\n🎮 SIDEBAR BUTTONS:');
        audit.sidebar.buttons.forEach((btn, i) => {
            console.log(`  Button ${i + 1}: ${btn.text} (${btn.visible})`);
        });
        const sidebarScore = audit.sidebar.buttons.length > 0 ? 10 : 0;
        console.log(`  SCORE: ${sidebarScore}/10`);
        totalScore += sidebarScore;
        maxScore += 10;

        // Focus Words Scoring
        console.log('\n🎯 FOCUS WORDS:');
        console.log(`  Count: ${audit.focusWords.count}`);
        console.log(`  Words: ${audit.focusWords.words.join(', ')}`);
        const focusScore = audit.focusWords.exists && audit.focusWords.count > 0 ? 10 : 0;
        console.log(`  SCORE: ${focusScore}/10`);
        totalScore += focusScore;
        maxScore += 10;

        // Clutter Scoring
        console.log('\n🧹 CLUTTER CHECK:');
        console.log(`  Visible Modals: ${audit.clutter.visibleModals}`);
        console.log(`  Popups: ${audit.clutter.popupCount}`);
        const clutterScore = audit.clutter.visibleModals === 0 ? 10 : 0;
        console.log(`  SCORE: ${clutterScore}/10 ${clutterScore === 10 ? '✅ CLEAN' : '❌ CLUTTERED'}`);
        totalScore += clutterScore;
        maxScore += 10;

        // Final Score
        const finalScore = (totalScore / maxScore * 10).toFixed(1);
        console.log('\n' + '='.repeat(70));
        console.log(`🏆 FINAL SCORE FOR ${persona.name}: ${finalScore}/10`);
        console.log(`📸 Screenshot: ${screenshotPath}`);
        console.log('='.repeat(70));

        await page.close();
    }

    await browser.close();
    console.log('\n✅ COMPREHENSIVE AUDIT COMPLETE');
    console.log('📊 Review all persona screenshots in screenshots/ folder');
})();
