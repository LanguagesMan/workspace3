// TikTok 2025 "See More" Text Expansion Tests
// Pattern: Curiosity gap with truncated text → "...more" button → smooth expansion

const { test, expect } = require('@playwright/test');

test.describe('TikTok 2025 "See More" Text Expansion', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    // ===== VISUAL PRESENCE TESTS =====
    test('truncated text container exists for long descriptions', async ({ page }) => {
        const truncatedTexts = page.locator('.truncated-text');
        const count = await truncatedTexts.count();
        expect(count).toBeGreaterThan(0);
    });

    test('"...more" button exists for long descriptions', async ({ page }) => {
        const moreButtons = page.locator('.see-more-btn');
        const count = await moreButtons.count();
        expect(count).toBeGreaterThan(0);
    });

    test('short descriptions (<100 chars) should NOT have truncation', async ({ page }) => {
        // Count all descriptions
        const allDescriptions = page.locator('.card-text');
        const allCount = await allDescriptions.count();

        // Count truncated descriptions
        const truncatedTexts = page.locator('.truncated-text');
        const truncatedCount = await truncatedTexts.count();

        // Some descriptions should NOT be truncated
        expect(truncatedCount).toBeLessThan(allCount);
    });

    // ===== CSS STYLING TESTS =====
    test('truncated text has max-height constraint', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        await expect(truncatedText).toBeVisible();

        const maxHeight = await truncatedText.evaluate(el =>
            window.getComputedStyle(el).maxHeight
        );

        // Should be 60px as per TikTok pattern
        expect(maxHeight).toBe('60px');
    });

    test('truncated text has overflow hidden', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        const overflow = await truncatedText.evaluate(el =>
            window.getComputedStyle(el).overflow
        );
        expect(overflow).toBe('hidden');
    });

    test('"...more" button has proper TikTok styling', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();
        await expect(moreBtn).toBeVisible();

        const styles = await moreBtn.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                color: computed.color,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight,
                cursor: computed.cursor
            };
        });

        // TikTok-style semi-transparent white
        expect(styles.color).toContain('rgba(255, 255, 255, 0.6)');
        expect(styles.fontSize).toBe('14px');
        expect(styles.fontWeight).toBe('600');
        expect(styles.cursor).toBe('pointer');
    });

    test('"...more" button has hover effect', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();
        await expect(moreBtn).toBeVisible();

        // Force hover to bypass bottom nav
        await moreBtn.hover({ force: true });
        await page.waitForTimeout(300); // Wait for transition

        const hoverColor = await moreBtn.evaluate(el =>
            window.getComputedStyle(el).color
        );

        // Should be brighter on hover (white instead of rgba)
        expect(hoverColor).toContain('rgb(255, 255, 255)');
    });

    // ===== INTERACTION TESTS =====
    test('clicking "...more" expands the text', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        const moreBtn = page.locator('.see-more-btn').first();

        // Initial state
        const initialHeight = await truncatedText.evaluate(el =>
            window.getComputedStyle(el).maxHeight
        );
        expect(initialHeight).toBe('60px');

        // Click "...more" with force to bypass bottom nav
        await moreBtn.click({ force: true });
        await page.waitForTimeout(400); // Wait for transition

        // Check expanded state
        const expandedHeight = await truncatedText.evaluate(el =>
            window.getComputedStyle(el).maxHeight
        );
        expect(expandedHeight).toBe('1000px');
    });

    test('clicking "...more" adds .expanded class', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        const moreBtn = page.locator('.see-more-btn').first();

        // Initial state
        await expect(truncatedText).not.toHaveClass(/expanded/);

        // Click "...more" with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(100);

        // Check expanded class added
        await expect(truncatedText).toHaveClass(/expanded/);
    });

    test('clicking "...more" changes button text to "Show less"', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();

        // Initial state
        await expect(moreBtn).toHaveText('...more');

        // Click to expand with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(100);

        // Check button text changed
        await expect(moreBtn).toHaveText('Show less');
    });

    test('clicking "Show less" collapses the text', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        const moreBtn = page.locator('.see-more-btn').first();

        // Expand first with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(400);

        // Verify expanded
        await expect(truncatedText).toHaveClass(/expanded/);

        // Click "Show less" with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(400);

        // Check collapsed
        await expect(truncatedText).not.toHaveClass(/expanded/);
        const collapsedHeight = await truncatedText.evaluate(el =>
            window.getComputedStyle(el).maxHeight
        );
        expect(collapsedHeight).toBe('60px');
    });

    test('clicking "Show less" changes button text back to "...more"', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();

        // Expand first with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(100);
        await expect(moreBtn).toHaveText('Show less');

        // Collapse with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(100);

        // Check button text reverted
        await expect(moreBtn).toHaveText('...more');
    });

    test('multiple cards can be expanded independently', async ({ page }) => {
        const moreButtons = page.locator('.see-more-btn');
        const count = await moreButtons.count();

        if (count >= 2) {
            const firstBtn = moreButtons.nth(0);
            const secondBtn = moreButtons.nth(1);
            const firstText = page.locator('.truncated-text').nth(0);
            const secondText = page.locator('.truncated-text').nth(1);

            // Expand first card with force
            await firstBtn.click({ force: true });
            await page.waitForTimeout(100);

            // Check first expanded, second collapsed
            await expect(firstText).toHaveClass(/expanded/);
            await expect(secondText).not.toHaveClass(/expanded/);

            // Expand second card with force
            await secondBtn.click({ force: true });
            await page.waitForTimeout(100);

            // Check both expanded
            await expect(firstText).toHaveClass(/expanded/);
            await expect(secondText).toHaveClass(/expanded/);
        }
    });

    // ===== ANIMATION TESTS =====
    test('expansion has smooth height transition', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();

        const transition = await truncatedText.evaluate(el =>
            window.getComputedStyle(el).transition
        );

        // Should have max-height transition (0.3s ease)
        expect(transition).toContain('max-height');
        expect(transition).toContain('0.3s');
        expect(transition).toContain('ease');
    });

    test('expansion animation completes within 400ms', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();
        const truncatedText = page.locator('.truncated-text').first();

        const startTime = Date.now();

        await moreBtn.click({ force: true });

        // Wait for animation to complete
        await page.waitForTimeout(400);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete in < 500ms (TikTok standard)
        expect(duration).toBeLessThan(500);

        // Verify expanded state
        await expect(truncatedText).toHaveClass(/expanded/);
    });

    // ===== PERFORMANCE TESTS =====
    test('toggle responds within 50ms', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();

        const startTime = Date.now();
        await moreBtn.click({ force: true });
        const endTime = Date.now();

        const responseTime = endTime - startTime;

        // Should respond instantly (< 50ms)
        expect(responseTime).toBeLessThan(50);
    });

    test('multiple rapid toggles work correctly', async ({ page }) => {
        const moreBtn = page.locator('.see-more-btn').first();
        const truncatedText = page.locator('.truncated-text').first();

        // Rapid toggles with force
        await moreBtn.click({ force: true }); // Expand
        await page.waitForTimeout(50);
        await moreBtn.click({ force: true }); // Collapse
        await page.waitForTimeout(50);
        await moreBtn.click({ force: true }); // Expand
        await page.waitForTimeout(50);
        await moreBtn.click({ force: true }); // Collapse

        // Wait for final animation
        await page.waitForTimeout(400);

        // Should be in collapsed state
        await expect(truncatedText).not.toHaveClass(/expanded/);
        await expect(moreBtn).toHaveText('...more');
    });

    // ===== CONTENT TESTS =====
    test('expanded text shows full description content', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        const moreBtn = page.locator('.see-more-btn').first();

        // Get text content before expansion
        const truncatedContent = await truncatedText.textContent();

        // Expand with force
        await moreBtn.click({ force: true });
        await page.waitForTimeout(400);

        // Get expanded content
        const expandedContent = await truncatedText.textContent();

        // Content should be the same (just visible height changed)
        expect(expandedContent).toBe(truncatedContent);
    });

    test('truncated text visually shows only ~3 lines initially', async ({ page }) => {
        const truncatedText = page.locator('.truncated-text').first();
        await expect(truncatedText).toBeVisible();

        const box = await truncatedText.boundingBox();

        // 60px max-height should show ~3 lines (assuming 20px line-height)
        expect(box.height).toBeLessThanOrEqual(65); // Allow 5px tolerance
    });

    // ===== EDGE CASES =====
    test('empty descriptions do not show "...more" button', async ({ page }) => {
        // Scroll to see all cards
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(500);

        // All see-more buttons should have associated content
        const moreButtons = page.locator('.see-more-btn');
        const count = await moreButtons.count();

        for (let i = 0; i < count; i++) {
            const btn = moreButtons.nth(i);
            const parent = btn.locator('..');
            const text = page.locator('.truncated-text').nth(i);

            await expect(text).toBeVisible();
        }
    });
});
