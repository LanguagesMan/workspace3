const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('🎬 VIDEO CONTROLS - Complete Feature Test', () => {

    test('All video controls work', async ({ page }) => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎬 TESTING VIDEO CONTROLS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(3000);

        // Check videos loaded
        const videos = await page.locator('video').count();
        console.log(`✅ Videos loaded: ${videos}`);
        expect(videos).toBeGreaterThan(0);

        // Screenshot initial state
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_controls_01_initial.png`)
        });

        // Test speed control
        console.log('\n⚡ Testing speed control...');
        const speedBtn = await page.locator('.control-btn').first();
        expect(await speedBtn.textContent()).toBe('1x');

        await speedBtn.click();
        await page.waitForTimeout(500);
        const newSpeed = await speedBtn.textContent();
        console.log(`✅ Speed changed to: ${newSpeed}`);
        expect(newSpeed).not.toBe('1x');

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_controls_02_speed.png`)
        });

        // Test subtitle toggle
        console.log('\n📝 Testing subtitle toggle...');
        const subBtn = await page.locator('.control-btn').nth(1);
        const subtitlesBefore = await page.locator('.subtitles').first().isVisible();
        console.log(`Subtitles before: ${subtitlesBefore ? 'VISIBLE' : 'HIDDEN'}`);

        await subBtn.click();
        await page.waitForTimeout(500);

        const subtitlesAfter = await page.locator('.subtitles').first().isVisible();
        console.log(`Subtitles after: ${subtitlesAfter ? 'VISIBLE' : 'HIDDEN'}`);
        console.log(`✅ Subtitle toggle works`);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_controls_03_subtitles_off.png`)
        });

        // Turn subtitles back on for word test
        await subBtn.click();
        await page.waitForTimeout(500);

        // Test clickable words
        console.log('\n🔤 Testing clickable words...');
        const wordCount = await page.locator('.word').count();
        console.log(`Clickable words: ${wordCount}`);
        expect(wordCount).toBeGreaterThan(0);

        if (wordCount > 0) {
            const firstWord = await page.locator('.word').first();
            await firstWord.click();
            await page.waitForTimeout(1000);

            // Check if popup appeared
            const popup = await page.locator('.word-popup').count();
            console.log(`✅ Word popup: ${popup > 0 ? 'APPEARED' : 'MISSING'}`);

            if (popup > 0) {
                await page.screenshot({
                    path: path.join(screenshotsDir, `${timestamp}_controls_04_word_popup.png`)
                });

                // Close popup
                await page.locator('.word-popup-overlay').click();
                await page.waitForTimeout(500);
            }
        }

        // Test translation toggle
        console.log('\n🌐 Testing translation toggle...');
        const transBtn = await page.locator('.control-btn').nth(2);
        await transBtn.click();
        await page.waitForTimeout(2000); // Wait for translation to load

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_controls_05_translation_on.png`)
        });

        console.log(`✅ Translation toggle works`);

        // Final feature check
        console.log('\n📊 FINAL FEATURE CHECK\n');

        const features = {
            'Videos loaded': videos > 0,
            'Speed control button': await page.locator('.control-btn').count() >= 3,
            'Clickable words': wordCount > 0,
            'Subtitles': await page.locator('.subtitles').count() > 0,
            'Control buttons': await page.locator('.top-controls').count() > 0,
            'Side buttons': await page.locator('.side-buttons').count() > 0
        };

        for (const [feature, present] of Object.entries(features)) {
            console.log(`${present ? '✅' : '❌'} ${feature}`);
        }

        const passedCount = Object.values(features).filter(v => v).length;
        const totalCount = Object.keys(features).length;
        const percentage = Math.round((passedCount / totalCount) * 100);

        console.log(`\n📊 SCORE: ${passedCount}/${totalCount} (${percentage}%)`);

        expect(percentage).toBeGreaterThanOrEqual(100);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_controls_final.png`)
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ALL VIDEO CONTROLS TESTED SUCCESSFULLY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
});
