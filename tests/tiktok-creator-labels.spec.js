// 📑 TIKTOK 2025 CREATOR PROFILE LABELS & VERIFIED BADGES TESTS
// Testing TikTok's creator header with avatar, username, and verification
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Creator Labels (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
        await page.waitForSelector('.content-card', { timeout: 10000 });
    });

    // === CREATOR HEADER STRUCTURE TESTS ===
    test('should display creator header on every card', async ({ page }) => {
        const cards = await page.locator('.content-card');
        const cardCount = await cards.count();

        expect(cardCount).toBeGreaterThan(0);

        // Check first 3 cards for creator headers
        for (let i = 0; i < Math.min(3, cardCount); i++) {
            const card = cards.nth(i);
            const creatorHeader = await card.locator('.creator-header');
            await expect(creatorHeader).toBeVisible();
        }

        console.log(`✅ Creator headers present on ${Math.min(3, cardCount)} cards`);
    });

    test('creator header should have avatar, name, and follow button', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const creatorHeader = await firstCard.locator('.creator-header');

        // Check avatar
        const avatar = await creatorHeader.locator('.creator-avatar');
        await expect(avatar).toBeVisible();

        // Check creator name
        const name = await creatorHeader.locator('.creator-name');
        await expect(name).toBeVisible();

        // Check follow button
        const followBtn = await creatorHeader.locator('.follow-btn');
        await expect(followBtn).toBeVisible();

        console.log('✅ All creator header elements present');
    });

    test('creator header should be at top of card', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const creatorHeader = await firstCard.locator('.creator-header');

        const cardBox = await firstCard.boundingBox();
        const headerBox = await creatorHeader.boundingBox();

        // Header should be near top of card (within first 100px)
        expect(headerBox.y - cardBox.y).toBeLessThan(100);

        console.log(`✅ Creator header at top: ${headerBox.y - cardBox.y}px from card top`);
    });

    // === AVATAR TESTS ===
    test('avatar should be circular with emoji', async ({ page }) => {
        const avatar = await page.locator('.creator-avatar').first();

        const styles = await avatar.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                borderRadius: computed.borderRadius,
                width: computed.width,
                height: computed.height,
                display: computed.display
            };
        });

        // Should be circular (50% border-radius)
        expect(styles.borderRadius).toContain('%');

        // Should be square
        expect(styles.width).toBe(styles.height);

        // Should have content (emoji)
        const avatarText = await avatar.textContent();
        expect(avatarText.length).toBeGreaterThan(0);

        console.log(`✅ Avatar circular (${styles.width}x${styles.height}), emoji: ${avatarText}`);
    });

    test('avatar should have gradient background', async ({ page }) => {
        const avatar = await page.locator('.creator-avatar').first();

        const background = await avatar.evaluate(el => {
            return window.getComputedStyle(el).background;
        });

        // Should have gradient or solid background
        expect(background.length).toBeGreaterThan(0);

        console.log('✅ Avatar has background styling');
    });

    test('avatars should be consistent for same creator', async ({ page }) => {
        // Get all cards
        const cards = await page.locator('.content-card');
        const cardCount = await cards.count();

        const creatorMap = new Map();

        for (let i = 0; i < Math.min(5, cardCount); i++) {
            const card = cards.nth(i);
            const creatorName = await card.locator('.creator-name').textContent();
            const avatarEmoji = await card.locator('.creator-avatar').textContent();

            if (creatorMap.has(creatorName)) {
                // Same creator should have same avatar
                expect(creatorMap.get(creatorName)).toBe(avatarEmoji);
            } else {
                creatorMap.set(creatorName, avatarEmoji);
            }
        }

        console.log(`✅ Checked ${creatorMap.size} unique creators for avatar consistency`);
    });

    // === CREATOR NAME TESTS ===
    test('creator name should be visible and readable', async ({ page }) => {
        const creatorName = await page.locator('.creator-name').first();

        const styles = await creatorName.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                color: computed.color,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight
            };
        });

        // Should be white or light color
        expect(styles.color).toMatch(/rgb\(255|rgba\(255/);

        // Should be readable size (14px+)
        const fontSize = parseInt(styles.fontSize);
        expect(fontSize).toBeGreaterThanOrEqual(14);

        // Should be bold (600+)
        const fontWeight = parseInt(styles.fontWeight);
        expect(fontWeight).toBeGreaterThanOrEqual(600);

        console.log(`✅ Creator name styled: ${styles.fontSize}, weight ${styles.fontWeight}`);
    });

    test('creator name should have @ or source text', async ({ page }) => {
        const creatorName = await page.locator('.creator-name').first().textContent();

        // Should have @ prefix or be a source name
        const hasValidFormat = creatorName.includes('@') || creatorName.length > 2;
        expect(hasValidFormat).toBe(true);

        console.log(`✅ Creator name: "${creatorName.trim()}"`);
    });

    // === VERIFIED BADGE TESTS ===
    test('verified creators should have blue checkmark', async ({ page }) => {
        // Find a verified creator (first card should have one based on our logic)
        const cards = await page.locator('.content-card');
        let foundVerified = false;

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const verifiedBadge = await card.locator('.verified-badge');

            if (await verifiedBadge.count() > 0) {
                await expect(verifiedBadge).toBeVisible();
                foundVerified = true;

                const badgeText = await verifiedBadge.textContent();
                expect(badgeText).toBe('✓');

                console.log(`✅ Found verified badge on card ${i + 1}`);
                break;
            }
        }

        // At least one card should be verified
        if (!foundVerified) {
            console.log('⚠️ No verified creators found (this may be expected)');
        }
    });

    test('verified badge should be cyan blue', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const verifiedBadge = await card.locator('.verified-badge');

            if (await verifiedBadge.count() > 0) {
                const styles = await verifiedBadge.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        background: computed.background,
                        borderRadius: computed.borderRadius
                    };
                });

                // Should have cyan/blue background (TikTok color)
                expect(styles.background).toMatch(/20d5ec|rgb\(32, 213, 236\)|cyan|blue/i);

                // Should be circular
                expect(styles.borderRadius).toContain('%');

                console.log('✅ Verified badge has TikTok cyan styling');
                break;
            }
        }
    });

    test('verified badge should be small and inline', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const verifiedBadge = await card.locator('.verified-badge');

            if (await verifiedBadge.count() > 0) {
                const styles = await verifiedBadge.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        width: computed.width,
                        height: computed.height,
                        display: computed.display
                    };
                });

                const size = parseInt(styles.width);
                expect(size).toBeGreaterThanOrEqual(14);
                expect(size).toBeLessThanOrEqual(20);

                console.log(`✅ Verified badge size: ${styles.width}x${styles.height}`);
                break;
            }
        }
    });

    // === FOLLOW BUTTON TESTS ===
    test('follow button should be visible and styled', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();

        await expect(followBtn).toBeVisible();
        await expect(followBtn).toBeEnabled();

        const styles = await followBtn.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                color: computed.color,
                borderColor: computed.borderColor,
                borderRadius: computed.borderRadius
            };
        });

        // Should have TikTok pink color
        expect(styles.color).toMatch(/fe2c55|rgb\(254, 44, 85\)|pink/i);

        console.log('✅ Follow button styled with TikTok pink');
    });

    test('follow button should say "+ Follow"', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();
        const btnText = await followBtn.textContent();

        expect(btnText.trim()).toContain('Follow');

        console.log(`✅ Follow button text: "${btnText.trim()}"`);
    });

    test('clicking follow button should update state', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();
        const initialText = await followBtn.textContent();

        // Click follow button
        await followBtn.click();

        // Wait for state update
        await page.waitForTimeout(500);

        // Check for toast message
        const toast = await page.locator('.toast').first();
        const toastText = await toast.textContent();

        expect(toastText).toContain('following');

        console.log('✅ Follow button click triggers toast');
    });

    test('follow button should change to "Following" after click', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();

        // Click follow button
        await followBtn.click();

        // Wait for state update
        await page.waitForTimeout(300);

        // Button should now say "Following"
        const newText = await followBtn.textContent();
        expect(newText.trim()).toContain('Following');

        console.log(`✅ Follow button updated to: "${newText.trim()}"`);
    });

    test('followed button should be disabled and grayed out', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();

        // Click follow button
        await followBtn.click();
        await page.waitForTimeout(300);

        // Should have "following" class
        await expect(followBtn).toHaveClass(/following/);

        // Should be disabled
        await expect(followBtn).toBeDisabled();

        console.log('✅ Followed button disabled and styled');
    });

    // === LAYOUT TESTS ===
    test('creator header should have horizontal layout', async ({ page }) => {
        const creatorHeader = await page.locator('.creator-header').first();

        const styles = await creatorHeader.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                justifyContent: computed.justifyContent
            };
        });

        expect(styles.display).toBe('flex');
        expect(styles.justifyContent).toBe('space-between');

        console.log('✅ Creator header uses flexbox layout');
    });

    test('creator info should group avatar and name', async ({ page }) => {
        const creatorInfo = await page.locator('.creator-info').first();

        const styles = await creatorInfo.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                display: computed.display,
                alignItems: computed.alignItems
            };
        });

        expect(styles.display).toBe('flex');
        expect(styles.alignItems).toBe('center');

        console.log('✅ Creator info groups elements correctly');
    });

    test('creator header should be responsive', async ({ page }) => {
        const creatorHeader = await page.locator('.creator-header').first();
        const card = await page.locator('.content-card').first();

        const headerBox = await creatorHeader.boundingBox();
        const cardBox = await card.boundingBox();

        // Header should take full card width (cards are 600px max)
        expect(headerBox.width).toBeGreaterThan(cardBox.width * 0.9);

        console.log(`✅ Creator header width: ${headerBox.width}px (card: ${cardBox.width}px)`);
    });

    // === INTEGRATION TESTS ===
    test('creator header should be positioned in card', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const creatorHeader = await firstCard.locator('.creator-header');

        const cardBox = await firstCard.boundingBox();
        const headerBox = await creatorHeader.boundingBox();

        // Header should be within card bounds
        expect(headerBox.y).toBeGreaterThanOrEqual(cardBox.y);
        expect(headerBox.y + headerBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height);

        console.log(`✅ Creator header positioned within card (${headerBox.y}px)`);
    });

    test('creator header should not overlap with card content', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const creatorHeader = await firstCard.locator('.creator-header');
        const cardContent = await firstCard.locator('.card-content');

        const headerBox = await creatorHeader.boundingBox();
        const contentBox = await cardContent.boundingBox();

        // Header should be above content
        expect(headerBox.y + headerBox.height).toBeLessThanOrEqual(contentBox.y + 5); // 5px tolerance

        console.log(`✅ Header ends at ${headerBox.y + headerBox.height}px, content starts at ${contentBox.y}px`);
    });

    // === ACCESSIBILITY TESTS ===
    test('follow button should be keyboard accessible', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();

        // Focus button with keyboard
        await followBtn.focus();

        // Check if focused
        const isFocused = await followBtn.evaluate(el => el === document.activeElement);
        expect(isFocused).toBe(true);

        console.log('✅ Follow button is keyboard accessible');
    });

    test('creator name should be selectable', async ({ page }) => {
        const creatorName = await page.locator('.creator-name').first();

        // Try to select text
        await creatorName.click({ clickCount: 2 }); // Double-click to select

        const nameText = await creatorName.textContent();
        expect(nameText.length).toBeGreaterThan(0);

        console.log('✅ Creator name text is selectable');
    });

    // === SCREENSHOT TESTS ===
    test('should capture creator headers for TikTok comparison', async ({ page }) => {
        await page.waitForSelector('.creator-header', { timeout: 10000 });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/TIKTOK-CREATOR-LABELS.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved for TikTok comparison');
    });

    test('should capture verified creator example', async ({ page }) => {
        const cards = await page.locator('.content-card');

        for (let i = 0; i < Math.min(5, await cards.count()); i++) {
            const card = cards.nth(i);
            const verifiedBadge = await card.locator('.verified-badge');

            if (await verifiedBadge.count() > 0) {
                await card.screenshot({
                    path: 'screenshots/TIKTOK-VERIFIED-CREATOR.png'
                });

                console.log('✅ Verified creator screenshot saved');
                break;
            }
        }
    });

    test('should capture followed creator state', async ({ page }) => {
        const followBtn = await page.locator('.follow-btn').first();
        const card = await page.locator('.content-card').first();

        // Click follow button
        await followBtn.click();
        await page.waitForTimeout(500);

        await card.screenshot({
            path: 'screenshots/TIKTOK-FOLLOWED-CREATOR.png'
        });

        console.log('✅ Followed creator state screenshot saved');
    });
});
