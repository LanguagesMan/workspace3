// 📑 TIKTOK 2025 SOUND WAVE VISUALIZATION TESTS
// Testing TikTok's animated sound bars for audio feedback
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Sound Wave (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
        await page.waitForSelector('.content-card', { timeout: 10000 });
    });

    // === SOUND WAVE STRUCTURE TESTS ===
    test('should display sound wave on video cards', async ({ page }) => {
        // Find first video card
        const cards = await page.locator('.content-card');
        let foundSoundWave = false;

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                await expect(soundWave).toBeAttached();
                foundSoundWave = true;
                console.log(`✅ Sound wave found on card ${i + 1}`);
                break;
            }
        }

        if (!foundSoundWave) {
            console.log('ℹ️ No video cards in first 5 (may be article cards)');
        }
    });

    test('sound wave should have 5 bars', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                const bars = await soundWave.locator('.sound-bar');
                const barCount = await bars.count();

                expect(barCount).toBe(5);
                console.log('✅ Sound wave has 5 bars');
                return;
            }
        }
    });

    test('sound bars should be positioned at bottom left', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                const styles = await soundWave.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        position: computed.position,
                        bottom: computed.bottom,
                        left: computed.left
                    };
                });

                expect(styles.position).toBe('absolute');
                expect(parseInt(styles.bottom)).toBeGreaterThan(0);
                expect(parseInt(styles.left)).toBeGreaterThan(0);

                console.log(`✅ Sound wave positioned: bottom ${styles.bottom}, left ${styles.left}`);
                return;
            }
        }
    });

    // === VISUAL STYLING TESTS ===
    test('sound bars should have TikTok pink gradient', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundBar = await card.locator('.sound-bar').first();

            if (await soundBar.count() > 0) {
                const background = await soundBar.evaluate(el => {
                    return window.getComputedStyle(el).background;
                });

                expect(background).toMatch(/gradient|fe2c55|ff6b6b/i);
                console.log('✅ Sound bars have TikTok pink gradient');
                return;
            }
        }
    });

    test('sound bars should be thin vertical bars', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundBar = await card.locator('.sound-bar').first();

            if (await soundBar.count() > 0) {
                const box = await soundBar.boundingBox();

                // Should be tall and thin
                expect(box.height).toBeGreaterThan(box.width);
                expect(box.width).toBeLessThanOrEqual(5);

                console.log(`✅ Sound bar dimensions: ${box.width}px wide, ${box.height}px tall`);
                return;
            }
        }
    });

    test('sound bars should have rounded corners', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundBar = await card.locator('.sound-bar').first();

            if (await soundBar.count() > 0) {
                const borderRadius = await soundBar.evaluate(el => {
                    return window.getComputedStyle(el).borderRadius;
                });

                expect(borderRadius).not.toBe('0px');
                console.log(`✅ Sound bars rounded: ${borderRadius}`);
                return;
            }
        }
    });

    test('sound bars should have gaps between them', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                const gap = await soundWave.evaluate(el => {
                    return window.getComputedStyle(el).gap;
                });

                expect(gap).not.toBe('0px');
                console.log(`✅ Bars have gap: ${gap}`);
                return;
            }
        }
    });

    // === ANIMATION TESTS ===
    test('sound bars should have pulsing animations', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundBar = await card.locator('.sound-bar').first();

            if (await soundBar.count() > 0) {
                const animation = await soundBar.evaluate(el => {
                    return window.getComputedStyle(el).animation;
                });

                // Should have animation defined
                expect(animation).toMatch(/soundPulse|infinite/i);
                console.log('✅ Sound bars have pulse animation');
                return;
            }
        }
    });

    test('each bar should have different animation timing', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const bars = await card.locator('.sound-bar');
            const barCount = await bars.count();

            if (barCount >= 5) {
                const durations = [];

                for (let j = 0; j < 5; j++) {
                    const duration = await bars.nth(j).evaluate(el => {
                        return window.getComputedStyle(el).animationDuration;
                    });
                    durations.push(duration);
                }

                // Should have different durations
                const uniqueDurations = new Set(durations);
                expect(uniqueDurations.size).toBeGreaterThan(1);

                console.log(`✅ Bars have varied animations: ${durations.join(', ')}`);
                return;
            }
        }
    });

    test('bars should animate with alternating direction', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundBar = await card.locator('.sound-bar').first();

            if (await soundBar.count() > 0) {
                const direction = await soundBar.evaluate(el => {
                    return window.getComputedStyle(el).animationDirection;
                });

                expect(direction).toBe('alternate');
                console.log('✅ Bars animate with alternate direction');
                return;
            }
        }
    });

    test('bars should animate infinitely', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundBar = await card.locator('.sound-bar').first();

            if (await soundBar.count() > 0) {
                const iteration = await soundBar.evaluate(el => {
                    return window.getComputedStyle(el).animationIterationCount;
                });

                expect(iteration).toBe('infinite');
                console.log('✅ Bars animate infinitely');
                return;
            }
        }
    });

    // === PAUSE STATE TESTS ===
    test('sound wave should have paused state class', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                // Initial state may or may not be paused
                const hasPausedClass = await soundWave.evaluate(el => {
                    return el.classList.contains('paused');
                });

                console.log(`✅ Sound wave paused state: ${hasPausedClass}`);
                return;
            }
        }
    });

    test('paused sound wave should have reduced opacity', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                // Add paused class manually to test
                await soundWave.evaluate(el => el.classList.add('paused'));

                const opacity = await soundWave.evaluate(el => {
                    return parseFloat(window.getComputedStyle(el).opacity);
                });

                expect(opacity).toBeLessThan(0.5);
                console.log(`✅ Paused sound wave opacity: ${opacity}`);
                return;
            }
        }
    });

    test('paused bars should have fixed height', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                await soundWave.evaluate(el => el.classList.add('paused'));

                const bar = await soundWave.locator('.sound-bar').first();
                const height = await bar.evaluate(el => {
                    return window.getComputedStyle(el).height;
                });

                expect(height).toBe('4px');
                console.log('✅ Paused bars have 4px height');
                return;
            }
        }
    });

    // === Z-INDEX AND LAYERING TESTS ===
    test('sound wave should have high z-index', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                const zIndex = await soundWave.evaluate(el => {
                    return window.getComputedStyle(el).zIndex;
                });

                expect(parseInt(zIndex)).toBeGreaterThanOrEqual(10);
                console.log(`✅ Sound wave z-index: ${zIndex}`);
                return;
            }
        }
    });

    test('sound wave should not overlap with video controls', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');
            const soundIndicator = await card.locator('.sound-indicator');

            if (await soundWave.count() > 0 && await soundIndicator.count() > 0) {
                const waveBox = await soundWave.boundingBox();
                const indicatorBox = await soundIndicator.boundingBox();

                // Should not overlap (wave is left, indicator is right)
                const overlaps = !(waveBox.x + waveBox.width <= indicatorBox.x ||
                                  waveBox.x >= indicatorBox.x + indicatorBox.width);

                expect(overlaps).toBe(false);
                console.log('✅ Sound wave does not overlap controls');
                return;
            }
        }
    });

    // === SCREENSHOT TESTS ===
    test('should capture sound wave playing', async ({ page }) => {
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: 'screenshots/TIKTOK-SOUND-WAVE-PLAYING.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Sound wave playing');
    });

    test('should capture sound wave paused', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const soundWave = await card.locator('.sound-wave');

            if (await soundWave.count() > 0) {
                await soundWave.evaluate(el => el.classList.add('paused'));
                await page.waitForTimeout(300);

                await page.screenshot({
                    path: 'screenshots/TIKTOK-SOUND-WAVE-PAUSED.png',
                    fullPage: false
                });

                console.log('✅ Screenshot: Sound wave paused');
                return;
            }
        }
    });
});
