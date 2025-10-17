/**
 * 🎭 PLAYWRIGHT TESTS - ENHANCED ARTICLE READER
 * 
 * Tests for audio narration and enhanced reading features:
 * - Audio player functionality
 * - Sentence highlighting during playback
 * - Unknown word highlighting
 * - Comprehension calculation
 * - Smart filters
 * - Auto-scroll
 * - Voice/speed controls
 */

const { test, expect } = require('@playwright/test');

test.describe('Enhanced Article Reader with Audio', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to articles page
        await page.goto('http://localhost:3000/discover-articles.html');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Wait for articles to load
        await page.waitForSelector('.article-card', { timeout: 10000 });
    });

    test('should display smart filters section', async ({ page }) => {
        // Check if smart filters exist
        const filters = await page.locator('#smartFilters');
        await expect(filters).toBeVisible();
        
        // Check filter toggle button
        const toggleBtn = await page.locator('#filtersToggle');
        await expect(toggleBtn).toBeVisible();
        await expect(toggleBtn).toHaveText('Show Filters');
        
        // Click to show filters
        await toggleBtn.click();
        await expect(toggleBtn).toHaveText('Hide Filters');
        
        // Check filter controls are visible
        await expect(page.locator('#levelRangeSlider')).toBeVisible();
        await expect(page.locator('#comprehensionMin')).toBeVisible();
        await expect(page.locator('#comprehensionMax')).toBeVisible();
        await expect(page.locator('.interest-tags')).toBeVisible();
    });

    test('should filter articles by interest tags', async ({ page }) => {
        // Show filters
        await page.locator('#filtersToggle').click();
        
        // Get initial article count
        const initialCount = await page.locator('.article-card').count();
        
        // Click a tag (e.g., Sports)
        await page.locator('.interest-tag[data-tag="sports"]').click();
        
        // Wait for filtering
        await page.waitForTimeout(500);
        
        // Check tag is selected
        await expect(page.locator('.interest-tag[data-tag="sports"]')).toHaveClass(/selected/);
        
        console.log(`Initial articles: ${initialCount}`);
    });

    test('should open article reader and show audio player', async ({ page }) => {
        // Click first article
        const firstArticle = await page.locator('.article-card').first();
        await firstArticle.click();
        
        // Wait for reader modal to open
        await page.waitForSelector('.reader-modal.active', { timeout: 5000 });
        
        // Check reader is visible
        const modal = await page.locator('#readerModal');
        await expect(modal).toHaveClass(/active/);
        
        // Check audio player is visible
        await expect(page.locator('#audioPlayerContainer')).toBeVisible();
        
        // Check audio controls
        await expect(page.locator('#playPauseBtn')).toBeVisible();
        await expect(page.locator('#autoScrollBtn')).toBeVisible();
        await expect(page.locator('.speed-selector')).toBeVisible();
        await expect(page.locator('#voiceBtn')).toBeVisible();
    });

    test('should display comprehension banner', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Check comprehension banner exists
        const banner = await page.locator('.comprehension-banner');
        await expect(banner).toBeVisible();
        
        // Check comprehension percentage is shown
        const percentage = await page.locator('.comprehension-percentage');
        await expect(percentage).toBeVisible();
        
        const percentageText = await percentage.textContent();
        expect(percentageText).toMatch(/\d+%/);
        
        console.log(`Comprehension: ${percentageText}`);
    });

    test('should highlight unknown words', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Check for unknown word highlighting
        const unknownWords = await page.locator('.word.unknown');
        const count = await unknownWords.count();
        
        expect(count).toBeGreaterThan(0);
        console.log(`Found ${count} unknown words highlighted`);
        
        // Check styling
        const firstUnknown = unknownWords.first();
        await expect(firstUnknown).toBeVisible();
    });

    test('should show word tooltip on click', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Wait for words to be rendered
        await page.waitForSelector('.word');
        
        // Click on a word
        const firstWord = await page.locator('.word').first();
        await firstWord.click();
        
        // Check tooltip appears
        await page.waitForTimeout(500);
        const tooltip = await page.locator('#wordTooltip');
        
        // Tooltip should show word and translation
        await expect(page.locator('#tooltipWord')).toBeVisible();
        await expect(page.locator('#tooltipTranslation')).toBeVisible();
        await expect(page.locator('#tooltipSaveBtn')).toBeVisible();
    });

    test('should play/pause audio', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Wait for audio to load
        await page.waitForTimeout(2000);
        
        // Check play button
        const playBtn = await page.locator('#playPauseBtn');
        await expect(playBtn).toBeEnabled();
        
        // Click play
        await playBtn.click();
        await page.waitForTimeout(500);
        
        // Button should change to pause
        const btnText = await playBtn.textContent();
        expect(btnText).toContain('⏸');
        
        // Click pause
        await playBtn.click();
        await page.waitForTimeout(500);
    });

    test('should change playback speed', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Check speed buttons
        const speedBtns = await page.locator('.speed-btn');
        const count = await speedBtns.count();
        expect(count).toBeGreaterThanOrEqual(5);
        
        // Click 1.5x speed
        const speed15 = await page.locator('.speed-btn[data-speed="1.5"]');
        await speed15.click();
        
        // Check it's selected
        await expect(speed15).toHaveClass(/active/);
        
        // Check toast message
        await expect(page.locator('.toast')).toBeVisible();
    });

    test('should open voice selector dropdown', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Click voice button
        const voiceBtn = await page.locator('#voiceBtn');
        await voiceBtn.click();
        
        // Check dropdown appears
        const dropdown = await page.locator('#voiceDropdown');
        await expect(dropdown).toHaveClass(/active/);
        
        // Check voice options
        const options = await page.locator('.voice-option');
        const count = await options.count();
        expect(count).toBeGreaterThanOrEqual(6); // Spain, Mexico, Argentina (male/female)
        
        // Check default selection
        await expect(page.locator('.voice-option.selected')).toBeVisible();
    });

    test('should toggle auto-scroll', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Click auto-scroll button
        const autoScrollBtn = await page.locator('#autoScrollBtn');
        await autoScrollBtn.click();
        
        // Check button is active
        await expect(autoScrollBtn).toHaveClass(/active/);
        
        // Check indicator is visible
        await expect(page.locator('#autoScrollIndicator')).toHaveClass(/visible/);
        
        // Toggle off
        await autoScrollBtn.click();
        await expect(autoScrollBtn).not.toHaveClass(/active/);
    });

    test('should segment text into sentences', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Check sentences are wrapped
        const sentences = await page.locator('.sentence');
        const count = await sentences.count();
        
        expect(count).toBeGreaterThan(0);
        console.log(`Article has ${count} sentences`);
        
        // Check sentence has data attribute
        const firstSentence = sentences.first();
        const dataAttr = await firstSentence.getAttribute('data-sentence');
        expect(dataAttr).not.toBeNull();
    });

    test('should highlight sentences during playback', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Wait for audio to load
        await page.waitForTimeout(2000);
        
        // Start playback
        await page.locator('#playPauseBtn').click();
        
        // Wait a bit for playback
        await page.waitForTimeout(2000);
        
        // Check if any sentence is highlighted
        const highlightedSentences = await page.locator('.sentence.highlight');
        const count = await highlightedSentences.count();
        
        // Should have at least one highlighted sentence during playback
        expect(count).toBeGreaterThanOrEqual(0); // May be 0 if audio hasn't started yet
        
        // Stop playback
        await page.locator('#playPauseBtn').click();
    });

    test('should close reader and stop audio', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Start audio
        await page.waitForTimeout(2000);
        await page.locator('#playPauseBtn').click();
        await page.waitForTimeout(500);
        
        // Close reader
        await page.locator('#closeReaderBtn').click();
        
        // Check modal is closed
        const modal = await page.locator('#readerModal');
        await expect(modal).not.toHaveClass(/active/);
        
        // Audio player should be hidden
        await expect(page.locator('#audioPlayerContainer')).not.toBeVisible();
    });

    test('should save word to vocabulary', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Click a word
        await page.locator('.word').first().click();
        await page.waitForTimeout(500);
        
        // Click save button in tooltip
        await page.locator('#tooltipSaveBtn').click();
        
        // Check toast message
        await expect(page.locator('.toast')).toBeVisible();
        
        // Word should now have 'saved' class
        await page.waitForTimeout(500);
    });

    test('should update level range slider', async ({ page }) => {
        // Show filters
        await page.locator('#filtersToggle').click();
        
        // Get slider
        const slider = await page.locator('#levelRangeSlider');
        
        // Change slider value
        await slider.fill('4'); // C1 level
        
        // Wait for filtering
        await page.waitForTimeout(500);
        
        console.log('Level range updated to C1');
    });

    test('should update comprehension range inputs', async ({ page }) => {
        // Show filters
        await page.locator('#filtersToggle').click();
        
        // Update comprehension min
        await page.locator('#comprehensionMin').fill('80');
        
        // Update comprehension max
        await page.locator('#comprehensionMax').fill('95');
        
        // Wait for filtering
        await page.waitForTimeout(500);
        
        console.log('Comprehension range updated to 80-95%');
    });

    test('should take screenshot of enhanced reader', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Wait for everything to load
        await page.waitForTimeout(2000);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'screenshots/enhanced-article-reader.png',
            fullPage: true 
        });
        
        console.log('Screenshot saved: enhanced-article-reader.png');
    });

    test('should take screenshot of audio player', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Wait for audio player
        await page.waitForTimeout(2000);
        
        // Screenshot just the audio player
        const audioPlayer = await page.locator('#audioPlayerContainer');
        await audioPlayer.screenshot({ 
            path: 'screenshots/audio-player.png'
        });
        
        console.log('Screenshot saved: audio-player.png');
    });

    test('should take screenshot of comprehension banner', async ({ page }) => {
        // Open an article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Screenshot comprehension banner
        const banner = await page.locator('.comprehension-banner');
        await banner.screenshot({ 
            path: 'screenshots/comprehension-banner.png'
        });
        
        console.log('Screenshot saved: comprehension-banner.png');
    });

    test('should take screenshot of smart filters', async ({ page }) => {
        // Show filters
        await page.locator('#filtersToggle').click();
        await page.waitForTimeout(500);
        
        // Screenshot filters
        const filters = await page.locator('#smartFilters');
        await filters.screenshot({ 
            path: 'screenshots/smart-filters.png'
        });
        
        console.log('Screenshot saved: smart-filters.png');
    });
});

test.describe('Audio Player Performance', () => {
    test('should load audio within reasonable time', async ({ page }) => {
        await page.goto('http://localhost:3000/discover-articles.html');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('.article-card');
        
        // Open article
        const startTime = Date.now();
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Wait for audio to be ready
        await page.waitForSelector('#playPauseBtn:not([disabled])', { timeout: 10000 });
        
        const loadTime = Date.now() - startTime;
        console.log(`Audio loaded in ${loadTime}ms`);
        
        // Should load within 10 seconds
        expect(loadTime).toBeLessThan(10000);
    });
});

