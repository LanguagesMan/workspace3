/**
 * Articles Feed UI Tests
 * Comprehensive Playwright tests for discover-articles.html
 */

const { test, expect } = require('@playwright/test');

test.describe('Articles Feed - UI Tests', () => {
    const baseURL = 'http://localhost:3000';

    test.beforeEach(async ({ page }) => {
        // Navigate to articles feed page
        await page.goto(`${baseURL}/discover-articles.html`);
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Clear localStorage for clean state
        await page.evaluate(() => {
            localStorage.clear();
        });
    });

    test('should load the page with correct title and header', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/Discover - Spanish Articles AI Feed/);
        
        // Check header elements
        await expect(page.locator('.logo')).toBeVisible();
        await expect(page.locator('.logo')).toContainText('Discover Spanish');
        
        // Check user level badge
        const levelBadge = page.locator('#userLevelBadge');
        await expect(levelBadge).toBeVisible();
        await expect(levelBadge).toHaveText(/A1|A2|B1|B2|C1|C2/);
    });

    test('should display category tabs', async ({ page }) => {
        const tabs = page.locator('.tab');
        
        // Should have at least 7 categories
        await expect(tabs).toHaveCount(7);
        
        // Check specific categories
        await expect(page.locator('.tab[data-category="all"]')).toBeVisible();
        await expect(page.locator('.tab[data-category="news"]')).toBeVisible();
        await expect(page.locator('.tab[data-category="sports"]')).toBeVisible();
        await expect(page.locator('.tab[data-category="technology"]')).toBeVisible();
        
        // First tab should be active
        await expect(page.locator('.tab.active')).toHaveAttribute('data-category', 'all');
    });

    test('should show loading skeletons initially', async ({ page }) => {
        // Reload to catch loading state
        await page.reload();
        
        // Should show skeleton loaders
        const skeletons = page.locator('.skeleton-card');
        await expect(skeletons.first()).toBeVisible({ timeout: 1000 });
    });

    test('should load and display article cards', async ({ page }) => {
        // Wait for articles to load
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        const articles = page.locator('.article-card');
        const count = await articles.count();
        
        // Should have at least one article
        expect(count).toBeGreaterThan(0);
        
        // Check first article structure
        const firstArticle = articles.first();
        await expect(firstArticle.locator('.article-title')).toBeVisible();
        await expect(firstArticle.locator('.article-excerpt')).toBeVisible();
        await expect(firstArticle.locator('.difficulty-pill')).toBeVisible();
        await expect(firstArticle.locator('.article-source')).toBeVisible();
    });

    test('should switch categories when tab is clicked', async ({ page }) => {
        // Wait for initial load
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Click on News tab
        await page.locator('.tab[data-category="news"]').click();
        
        // Should show loading state
        await expect(page.locator('#articlesGrid')).toHaveAttribute('aria-busy', 'true');
        
        // Wait for new articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // News tab should be active
        await expect(page.locator('.tab[data-category="news"]')).toHaveClass(/active/);
    });

    test('should open article reader when card is clicked', async ({ page }) => {
        // Wait for articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Get first article title
        const firstArticle = page.locator('.article-card').first();
        const articleTitle = await firstArticle.locator('.article-title').textContent();
        
        // Click article
        await firstArticle.click();
        
        // Reader modal should be visible
        const modal = page.locator('#readerModal');
        await expect(modal).toHaveClass(/active/);
        await expect(modal).toHaveAttribute('aria-hidden', 'false');
        
        // Should display article content
        await expect(page.locator('.reader-title')).toBeVisible();
        await expect(page.locator('.reader-title')).toContainText(articleTitle.substring(0, 20));
        await expect(page.locator('#spanishText')).toBeVisible();
    });

    test('should close reader modal when close button is clicked', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for modal to open
        await page.waitForSelector('#readerModal.active');
        
        // Click close button
        await page.locator('#closeReaderBtn').click();
        
        // Modal should be hidden
        const modal = page.locator('#readerModal');
        await expect(modal).not.toHaveClass(/active/);
        await expect(modal).toHaveAttribute('aria-hidden', 'true');
    });

    test('should close reader modal with Escape key', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for modal
        await page.waitForSelector('#readerModal.active');
        
        // Press Escape
        await page.keyboard.press('Escape');
        
        // Modal should close
        await expect(page.locator('#readerModal')).not.toHaveClass(/active/);
    });

    test('should toggle translation when button is clicked', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for modal
        await page.waitForSelector('#readerModal.active');
        
        // Initially, English text should be hidden
        await expect(page.locator('#englishText')).not.toBeVisible();
        
        // Click translation toggle
        await page.locator('#translationToggle').click();
        
        // English text should be visible
        await expect(page.locator('#englishText')).toBeVisible();
        await expect(page.locator('#translationToggle')).toHaveAttribute('aria-pressed', 'true');
        
        // Click again to hide
        await page.locator('#translationToggle').click();
        await expect(page.locator('#englishText')).not.toBeVisible();
    });

    test('should show word translation tooltip on word click', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for modal and content
        await page.waitForSelector('#readerModal.active');
        await page.waitForSelector('.word');
        
        // Click a word
        const word = page.locator('.word').first();
        await word.click();
        
        // Tooltip should appear
        const tooltip = page.locator('#wordTooltip');
        await expect(tooltip).toHaveClass(/active/);
        await expect(tooltip).toHaveAttribute('aria-hidden', 'false');
        
        // Should show word and translation
        await expect(page.locator('#tooltipWord')).not.toBeEmpty();
        await expect(page.locator('#tooltipTranslation')).not.toBeEmpty();
    });

    test('should save word to vocabulary', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for content
        await page.waitForSelector('.word');
        
        // Click a word
        await page.locator('.word').first().click();
        
        // Click save button in tooltip
        await page.locator('#tooltipSaveBtn').click();
        
        // Should show toast notification
        await expect(page.locator('.toast')).toBeVisible();
        await expect(page.locator('.toast')).toContainText(/saved to vocabulary/i);
        
        // Word count should increase
        const wordsLearned = page.locator('#wordsLearned');
        const count = parseInt(await wordsLearned.textContent());
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should save article when save button is clicked', async ({ page }) => {
        // Wait for articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Click save button on first article
        const saveBtn = page.locator('.article-card').first().locator('.save-btn');
        await saveBtn.click();
        
        // Should show toast
        await expect(page.locator('.toast')).toBeVisible();
        await expect(page.locator('.toast')).toContainText(/saved/i);
        
        // Button should have saved class
        await expect(saveBtn).toHaveClass(/saved/);
    });

    test('should use TTS button to read article aloud', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for modal
        await page.waitForSelector('#readerModal.active');
        
        // Click TTS button
        await page.locator('#ttsBtn').click();
        
        // Should show toast
        await expect(page.locator('.toast')).toBeVisible();
        await expect(page.locator('.toast')).toContainText(/reading article/i);
    });

    test('should display stats bar at bottom', async ({ page }) => {
        const statsBar = page.locator('.stats-bar');
        
        // Stats bar should be visible
        await expect(statsBar).toBeVisible();
        
        // Should have all stats
        await expect(page.locator('#articlesReadToday')).toBeVisible();
        await expect(page.locator('#wordsLearned')).toBeVisible();
        await expect(page.locator('#comprehensionAvg')).toBeVisible();
        await expect(page.locator('#readingStreak')).toBeVisible();
    });

    test('should navigate articles with arrow keys', async ({ page }) => {
        // Wait for articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Press arrow down
        await page.keyboard.press('ArrowDown');
        
        // First article should be highlighted
        const firstCard = page.locator('.article-card').first();
        await expect(firstCard).toHaveCSS('outline', /3px solid/);
        await expect(firstCard).toHaveAttribute('aria-selected', 'true');
        
        // Press arrow down again
        await page.keyboard.press('ArrowDown');
        
        // Second article should be highlighted
        const secondCard = page.locator('.article-card').nth(1);
        await expect(secondCard).toHaveCSS('outline', /3px solid/);
        
        // Press Enter to open
        await page.keyboard.press('Enter');
        
        // Modal should open
        await expect(page.locator('#readerModal')).toHaveClass(/active/);
    });

    test('should show keyboard shortcuts hint', async ({ page }) => {
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Keyboard hint should be visible briefly
        const hint = page.locator('#keyboardHint');
        
        // Press ? to toggle
        await page.keyboard.press('?');
        
        // Hint should be visible
        await expect(hint).toHaveClass(/visible/);
        await expect(hint).toContainText('Keyboard Shortcuts');
        
        // Press ? again to hide
        await page.keyboard.press('?');
        await expect(hint).not.toHaveClass(/visible/);
    });

    test('should handle API error gracefully', async ({ page }) => {
        // Block API requests to simulate error
        await page.route('**/api/articles/**', route => {
            route.abort('failed');
        });
        
        // Reload page
        await page.reload();
        
        // Should show error state
        await page.waitForSelector('.error-container', { timeout: 10000 });
        await expect(page.locator('.error-title')).toBeVisible();
        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page.locator('#retryBtn')).toBeVisible();
    });

    test('should handle empty state', async ({ page }) => {
        // Mock API to return empty array
        await page.route('**/api/articles/**', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ articles: [] })
            });
        });
        
        // Reload page
        await page.reload();
        
        // Should show empty state
        await page.waitForSelector('.empty-container', { timeout: 10000 });
        await expect(page.locator('.empty-title')).toContainText(/no articles/i);
        await expect(page.locator('#backToAllBtn')).toBeVisible();
    });

    test('should retry loading after error', async ({ page }) => {
        // First request fails
        let requestCount = 0;
        await page.route('**/api/articles/**', route => {
            requestCount++;
            if (requestCount === 1) {
                route.abort('failed');
            } else {
                route.continue();
            }
        });
        
        // Reload page
        await page.reload();
        
        // Wait for error state
        await page.waitForSelector('.error-container', { timeout: 10000 });
        
        // Click retry
        await page.locator('#retryBtn').click();
        
        // Should show loading, then articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
    });

    test('should be responsive on mobile (375px)', async ({ page }) => {
        // Set viewport to mobile size
        await page.setViewportSize({ width: 375, height: 667 });
        
        // Wait for articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Grid should be single column
        const grid = page.locator('.articles-grid');
        const gridColumns = await grid.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });
        
        // Should be single column (one value in grid-template-columns)
        expect(gridColumns.split(' ').length).toBeLessThanOrEqual(1);
        
        // Elements should be visible and properly sized
        await expect(page.locator('.logo')).toBeVisible();
        await expect(page.locator('.tabs')).toBeVisible();
        await expect(page.locator('.stats-bar')).toBeVisible();
    });

    test('should have proper ARIA labels and accessibility', async ({ page }) => {
        // Header should have role="banner"
        await expect(page.locator('header')).toHaveAttribute('role', 'banner');
        
        // Main should have role="main"
        await expect(page.locator('main')).toHaveAttribute('role', 'main');
        
        // Tabs should have proper roles
        await expect(page.locator('.tabs-container')).toHaveAttribute('role', 'navigation');
        
        // Stats bar should have role
        await expect(page.locator('.stats-bar')).toHaveAttribute('role', 'complementary');
        
        // Wait for articles
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Article cards should have proper attributes
        const firstCard = page.locator('.article-card').first();
        await expect(firstCard).toHaveAttribute('role', 'article');
        await expect(firstCard).toHaveAttribute('tabindex', '0');
        await expect(firstCard).toHaveAttribute('aria-label');
    });

    test('should maintain focus management in modal', async ({ page }) => {
        // Open article
        await page.waitForSelector('.article-card', { timeout: 10000 });
        await page.locator('.article-card').first().click();
        
        // Wait for modal
        await page.waitForSelector('#readerModal.active');
        
        // Close button should be focused
        await page.waitForTimeout(200); // Wait for focus transition
        const focusedElement = await page.evaluate(() => document.activeElement.id);
        expect(focusedElement).toBe('closeReaderBtn');
        
        // Close modal
        await page.keyboard.press('Escape');
        
        // Focus should return to page
        await expect(page.locator('#readerModal')).not.toHaveClass(/active/);
    });
});

test.describe('Articles Feed - Visual Regression Tests', () => {
    const baseURL = 'http://localhost:3000';

    test('should match article feed layout screenshot', async ({ page }) => {
        await page.goto(`${baseURL}/discover-articles.html`);
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Take screenshot
        await expect(page).toHaveScreenshot('articles-feed-layout.png', {
            fullPage: false,
            maxDiffPixels: 100
        });
    });

    test('should match article reader modal screenshot', async ({ page }) => {
        await page.goto(`${baseURL}/discover-articles.html`);
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Open article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('#readerModal.active');
        
        // Take screenshot
        await expect(page).toHaveScreenshot('article-reader-modal.png', {
            maxDiffPixels: 100
        });
    });

    test('should match mobile layout screenshot', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`${baseURL}/discover-articles.html`);
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Take screenshot
        await expect(page).toHaveScreenshot('articles-feed-mobile.png', {
            fullPage: false,
            maxDiffPixels: 100
        });
    });

    test('should match error state screenshot', async ({ page }) => {
        // Block API
        await page.route('**/api/articles/**', route => route.abort('failed'));
        
        await page.goto(`${baseURL}/discover-articles.html`);
        await page.waitForSelector('.error-container', { timeout: 10000 });
        
        // Take screenshot
        await expect(page).toHaveScreenshot('articles-error-state.png', {
            maxDiffPixels: 50
        });
    });

    test('should match empty state screenshot', async ({ page }) => {
        // Mock empty response
        await page.route('**/api/articles/**', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ articles: [] })
            });
        });
        
        await page.goto(`${baseURL}/discover-articles.html`);
        await page.waitForSelector('.empty-container', { timeout: 10000 });
        
        // Take screenshot
        await expect(page).toHaveScreenshot('articles-empty-state.png', {
            maxDiffPixels: 50
        });
    });
});

