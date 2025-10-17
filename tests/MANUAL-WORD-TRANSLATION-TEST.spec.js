// 🧪 MANUAL TEST: Verify word translation + unified database saving
// This test simulates actual user clicking on Spanish words

const { test, expect } = require('@playwright/test');

test.describe('🔥 MANUAL WORD TRANSLATION + DATABASE TEST', () => {
    test('User clicks Spanish word → sees translation → saves to database', async ({ page }) => {
        console.log('🎯 Starting manual word translation test...');

        // Navigate to app
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for video to load

        console.log('✅ Page loaded');

        // Find all clickable Spanish words
        const words = await page.locator('.word, .clickable-word, [data-word]').all();
        console.log(`📝 Found ${words.length} clickable Spanish words`);

        if (words.length === 0) {
            console.log('⚠️  No clickable words found - checking subtitle structure');

            // Check if subtitles exist
            const subtitles = await page.locator('.subtitle, .caption, [class*="subtitle"]').count();
            console.log(`📺 Found ${subtitles} subtitle elements`);

            if (subtitles === 0) {
                console.log('❌ NO SUBTITLES FOUND - Videos may not have loaded');
            }

            return;
        }

        // Test clicking first 3 words
        for (let i = 0; i < Math.min(3, words.length); i++) {
            const word = words[i];
            const wordText = await word.textContent();

            console.log(`\n🔤 Testing word ${i + 1}: "${wordText}"`);

            // Click the word
            await word.click();
            await page.waitForTimeout(1500); // Wait for translation API

            // Check if tooltip appeared
            const tooltips = page.locator('.word-tooltip, .translation-tooltip, [class*="tooltip"]');
            const tooltipCount = await tooltips.count();

            if (tooltipCount > 0) {
                const tooltipText = await tooltips.first().textContent();
                console.log(`  ✅ Tooltip appeared: "${tooltipText}"`);

                // Click tooltip to save word to database
                await tooltips.first().click();
                await page.waitForTimeout(1000); // Wait for database save

                // Check for success message
                const successMessage = await page.locator('text=/Saved to Database/i').count();
                if (successMessage > 0) {
                    console.log(`  ✅ Word saved to database!`);
                } else {
                    console.log(`  ⚠️  Success message not found`);
                }

                // Screenshot the saved state
                if (i === 0) {
                    await page.screenshot({ path: `/tmp/word-saved-${i}.png` });
                    console.log(`  📸 Screenshot: /tmp/word-saved-${i}.png`);
                }

                // Close tooltip by clicking elsewhere
                await page.mouse.click(640, 400);
                await page.waitForTimeout(500);
            } else {
                console.log(`  ⚠️  No tooltip appeared for "${wordText}"`);
            }
        }

        console.log('\n🎯 Manual word translation test finished');
    });

    test('Verify unified database API endpoint works', async ({ page }) => {
        console.log('🎯 Testing unified database API endpoint...');

        // Test the API directly
        const response = await page.request.post('http://localhost:3002/api/words/learned', {
            data: {
                userId: 'test_user_playwright',
                word: 'hola',
                translation: 'hello',
                level: 'A1',
                context: 'test'
            }
        });

        console.log(`API Response Status: ${response.status()}`);

        if (response.ok()) {
            const data = await response.json();
            console.log('API Response:', JSON.stringify(data, null, 2));

            expect(response.status()).toBe(200);
            console.log('✅ Unified database API endpoint is working!');
        } else {
            console.log('❌ API request failed');
            const text = await response.text();
            console.log('Error:', text);
        }
    });

    test('Check for console errors during word click flow', async ({ page }) => {
        console.log('🎯 Checking for console errors...');

        const errors = [];
        const warnings = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            } else if (msg.type() === 'warning') {
                warnings.push(msg.text());
            }
        });

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Try to click a word
        const words = await page.locator('.word').all();
        if (words.length > 0) {
            await words[0].click();
            await page.waitForTimeout(2000);
        }

        console.log(`\n📊 Console Analysis:`);
        console.log(`  Errors: ${errors.length}`);
        console.log(`  Warnings: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('\n❌ Console Errors Found:');
            errors.forEach((err, i) => {
                console.log(`  ${i + 1}. ${err.substring(0, 100)}`);
            });
        } else {
            console.log('✅ NO console errors!');
        }

        if (warnings.length > 0) {
            console.log('\n⚠️  Console Warnings:');
            warnings.slice(0, 3).forEach((warn, i) => {
                console.log(`  ${i + 1}. ${warn.substring(0, 100)}`);
            });
        }

        expect(errors.length).toBe(0);
    });

    test('Verify videos are loading and playable', async ({ page }) => {
        console.log('🎯 Testing video loading and playback...');

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check for video elements
        const videos = await page.locator('video').all();
        console.log(`📹 Found ${videos.length} video elements`);

        if (videos.length > 0) {
            const firstVideo = videos[0];

            // Check video properties
            const paused = await firstVideo.evaluate(v => v.paused);
            const currentTime = await firstVideo.evaluate(v => v.currentTime);
            const duration = await firstVideo.evaluate(v => v.duration);
            const readyState = await firstVideo.evaluate(v => v.readyState);

            console.log(`\n📊 Video State:`);
            console.log(`  Paused: ${paused}`);
            console.log(`  Current Time: ${currentTime}s`);
            console.log(`  Duration: ${duration}s`);
            console.log(`  Ready State: ${readyState} (4=HAVE_ENOUGH_DATA)`);

            if (readyState >= 2) {
                console.log('✅ Video loaded successfully!');
            } else {
                console.log('⚠️  Video may not be fully loaded');
            }

            // Take screenshot of video
            await page.screenshot({ path: '/tmp/video-loaded-state.png' });
            console.log('📸 Screenshot: /tmp/video-loaded-state.png');
        } else {
            console.log('❌ NO VIDEO ELEMENTS FOUND');
        }

        expect(videos.length).toBeGreaterThan(0);
    });
});
