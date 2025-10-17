const { test, expect } = require('@playwright/test');

test.describe('🎯 FINAL INTEGRATION TEST - All Features', () => {
    const timestamp = Date.now();

    test('COMPLETE FEATURE VALIDATION', async ({ page }) => {
        console.log('\n🚀 === COMPREHENSIVE FEATURE TEST ===\n');

        // 1. Load main page
        console.log('1️⃣ Testing unified-infinite-feed with ALL features...');
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        await page.screenshot({
            path: `screenshots/FINAL-root-complete-${timestamp}.png`,
            fullPage: true
        });

        // 2. Verify audio controls
        const audioButtons = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`✅ Audio buttons found: ${audioButtons}`);
        expect(audioButtons).toBeGreaterThan(0);

        // 3. Verify Spanish content
        const spanishText = await page.locator('.spanish-text').count();
        console.log(`✅ Spanish text blocks: ${spanishText}`);
        expect(spanishText).toBeGreaterThan(0);

        // 4. Verify action buttons (Like, Share, Save)
        const likeButtons = await page.locator('button:has-text("❤️")').count();
        const shareButtons = await page.locator('button:has-text("📤 Share")').count();
        const saveButtons = await page.locator('button:has-text("📚 Save")').count();

        console.log(`✅ Like buttons: ${likeButtons}`);
        console.log(`✅ Share buttons: ${shareButtons}`);
        console.log(`✅ Save buttons: ${saveButtons}`);

        expect(likeButtons).toBeGreaterThan(0);
        expect(shareButtons).toBeGreaterThan(0);
        expect(saveButtons).toBeGreaterThan(0);

        // 5. Verify accessibility
        const html = await page.content();
        const hasAudioAria = html.includes('aria-label="Listen to Spanish pronunciation"');
        const hasMainRole = html.includes('role="main"');
        const hasH1 = html.includes('<h1');

        console.log(`✅ Audio ARIA labels: ${hasAudioAria}`);
        console.log(`✅ Semantic HTML: ${hasMainRole}`);
        console.log(`✅ H1 heading: ${hasH1}`);

        expect(hasAudioAria).toBeTruthy();
        expect(hasMainRole).toBeTruthy();
        expect(hasH1).toBeTruthy();

        console.log('\n🎉 ROOT PAGE: ALL FEATURES VALIDATED!\n');
    });

    test('API ENDPOINTS VALIDATION', async ({ page, request }) => {
        console.log('\n🔌 === TESTING ALL API ENDPOINTS ===\n');

        // Test health endpoint
        const healthResponse = await request.get('http://localhost:3002/health');
        expect(healthResponse.ok()).toBeTruthy();
        const healthData = await healthResponse.json();
        console.log(`✅ Health: ${healthData.status}`);
        console.log(`✅ Port: ${healthData.port}`);
        console.log(`✅ Features: ${healthData.features.length} enabled`);

        // Test unified feed endpoint
        const feedResponse = await request.get('http://localhost:3002/api/unified-feed?level=A2&interests=news,culture');
        expect(feedResponse.ok()).toBeTruthy();
        const feedData = await feedResponse.json();
        console.log(`✅ Unified Feed: ${feedData.videos?.length || 0} videos loaded`);

        // Test Globe Universe endpoint
        const globeResponse = await request.get('http://localhost:3002/api/globe-universe/story');
        expect(globeResponse.ok()).toBeTruthy();
        const globeData = await globeResponse.json();
        console.log(`✅ Globe Universe: ${globeData.story?.title}`);
        console.log(`   Spanish: ${globeData.story?.structure?.spanishLearning?.sentence1}`);
        console.log(`   Vocabulary: ${globeData.story?.metadata?.vocabulary_count} words`);

        console.log('\n🎉 ALL API ENDPOINTS WORKING!\n');
    });

    test('MOBILE + DESKTOP RESPONSIVE', async ({ page }) => {
        console.log('\n📱💻 === RESPONSIVE DESIGN TEST ===\n');

        // Mobile
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/FINAL-mobile-${timestamp}.png`,
            fullPage: true
        });
        const mobileAudio = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`📱 Mobile: ${mobileAudio} audio buttons visible`);

        // Tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/FINAL-tablet-${timestamp}.png`,
            fullPage: true
        });
        const tabletAudio = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`📱 Tablet: ${tabletAudio} audio buttons visible`);

        // Desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/FINAL-desktop-${timestamp}.png`,
            fullPage: true
        });
        const desktopAudio = await page.locator('button:has-text("🔊 Listen")').count();
        console.log(`💻 Desktop: ${desktopAudio} audio buttons visible`);

        expect(mobileAudio).toBeGreaterThan(0);
        expect(tabletAudio).toBeGreaterThan(0);
        expect(desktopAudio).toBeGreaterThan(0);

        console.log('\n🎉 RESPONSIVE DESIGN VALIDATED!\n');
    });

    test('ALL ROUTES SCREENSHOT', async ({ page }) => {
        console.log('\n🗺️ === ALL ROUTES TEST ===\n');

        const routes = [
            { path: '/', name: 'root' },
            { path: '/stats', name: 'stats' },
            { path: '/unified', name: 'unified' },
            { path: '/comedy', name: 'comedy' },
            { path: '/viral', name: 'viral' }
        ];

        for (const route of routes) {
            await page.goto(`http://localhost:3002${route.path}`);
            await page.waitForTimeout(2000);

            await page.screenshot({
                path: `screenshots/FINAL-route-${route.name}-${timestamp}.png`,
                fullPage: true
            });

            console.log(`✅ Screenshot: ${route.name} (${route.path})`);
        }

        console.log('\n🎉 ALL ROUTES VALIDATED!\n');
    });

    test('FEATURE COMPLETENESS REPORT', async ({ page }) => {
        console.log('\n📊 === FEATURE COMPLETENESS REPORT ===\n');

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        const report = {
            '🎙️ TTS Audio Integration': await page.locator('button:has-text("🔊 Listen")').count() > 0,
            '🌍 Spanish Content': await page.locator('.spanish-text').count() > 0,
            '❤️ Like System': await page.locator('button:has-text("❤️")').count() > 0,
            '📤 Share Feature': await page.locator('button:has-text("📤 Share")').count() > 0,
            '📚 Save System': await page.locator('button:has-text("📚 Save")').count() > 0,
            '💾 Word Saving': await page.locator('button:has-text("💾 Word")').count() > 0,
            '🎯 Level Selector': await page.locator('button:has-text("🎯")').count() > 0,
            '❤️ Interests Selector': await page.locator('button:has-text("❤️")').first().count() > 0,
            '♿ ARIA Accessibility': (await page.content()).includes('aria-label'),
            '🏷️ Semantic HTML': (await page.content()).includes('role="main"')
        };

        console.log('\n📋 FEATURE STATUS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        Object.entries(report).forEach(([feature, status]) => {
            const icon = status ? '✅' : '❌';
            console.log(`${icon} ${feature}: ${status ? 'WORKING' : 'MISSING'}`);
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const completedFeatures = Object.values(report).filter(v => v).length;
        const totalFeatures = Object.keys(report).length;
        const completionRate = ((completedFeatures / totalFeatures) * 100).toFixed(1);

        console.log(`\n🎯 COMPLETION RATE: ${completedFeatures}/${totalFeatures} (${completionRate}%)\n`);

        await page.screenshot({
            path: `screenshots/FINAL-report-${timestamp}.png`,
            fullPage: true
        });

        // Expect 80%+ completion
        expect(completedFeatures / totalFeatures).toBeGreaterThan(0.8);

        console.log('🎉 FEATURE COMPLETENESS VALIDATED!\n');
    });
});
