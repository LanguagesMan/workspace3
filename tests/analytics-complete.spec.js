// @ts-check
/**
 * Comprehensive Analytics System Tests
 * Tests all analytics features including tracking, profiling, and dashboard
 */

const { test, expect } = require('@playwright/test');

test.describe('Analytics System - Complete Tests', () => {
    const testUserId = `test-user-${Date.now()}`;
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test.beforeEach(async ({ page }) => {
        // Set test user ID
        await page.goto(baseURL);
        await page.evaluate((userId) => {
            localStorage.setItem('userId', userId);
        }, testUserId);
    });

    test.describe('Analytics Tracking API', () => {
        test('should track video watch action', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: {
                        type: 'video',
                        contentType: 'video',
                        contentId: 'test-video-1',
                        duration: 120,
                        action: 'completed',
                        category: 'Sports'
                    }
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.activity).toBeDefined();
        });

        test('should track article read action', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: {
                        type: 'article',
                        contentType: 'article',
                        contentId: 'test-article-1',
                        timeSpent: 180,
                        action: 'completed',
                        category: 'Technology'
                    }
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('should track word learned action', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: {
                        type: 'word',
                        contentType: 'vocabulary',
                        contentId: 'test-word-hola'
                    }
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('should track game played action', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: {
                        type: 'game',
                        contentType: 'game',
                        contentId: 'vocabulary-match',
                        duration: 240,
                        category: 'Entertainment'
                    }
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('should track quiz completed action', async ({ request }) => {
            const response = await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: {
                        type: 'quiz',
                        contentType: 'quiz',
                        contentId: 'grammar-quiz-1'
                    }
                }
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    test.describe('Daily Analytics API', () => {
        test('should get daily statistics', async ({ request }) => {
            // First track some actions
            await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: { type: 'video', duration: 120 }
                }
            });

            await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: { type: 'article', timeSpent: 180 }
                }
            });

            // Get daily stats
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/daily`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.stats).toBeDefined();
            expect(data.stats.videosWatched).toBeGreaterThanOrEqual(1);
            expect(data.stats.articlesRead).toBeGreaterThanOrEqual(1);
        });

        test('should get daily stats for specific date', async ({ request }) => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/daily?date=${today}`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.stats).toBeDefined();
        });
    });

    test.describe('Weekly Summary API', () => {
        test('should get weekly summary', async ({ request }) => {
            // Track multiple actions across the week
            for (let i = 0; i < 5; i++) {
                await request.post(`${baseURL}/api/analytics/track`, {
                    data: {
                        userId: testUserId,
                        action: { 
                            type: 'word',
                            contentType: 'vocabulary',
                            contentId: `word-${i}`
                        }
                    }
                });
            }

            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/weekly`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.summary).toBeDefined();
            expect(data.summary.totalWordsLearned).toBeGreaterThanOrEqual(5);
            expect(data.summary.dailyBreakdown).toBeDefined();
            expect(Array.isArray(data.summary.dailyBreakdown)).toBe(true);
        });

        test('should calculate correct averages', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/weekly`);
            const data = await response.json();
            
            if (data.summary.activeDays > 0) {
                expect(data.summary.avgVideosPerDay).toBeDefined();
                expect(data.summary.avgArticlesPerDay).toBeDefined();
                expect(data.summary.avgTimePerDay).toBeDefined();
            }
        });
    });

    test.describe('Learning Progress API', () => {
        test('should get learning progress data', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/progress?days=30`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.progress).toBeDefined();
            expect(data.progress.progressData).toBeDefined();
            expect(data.progress.totalWordsLearned).toBeDefined();
            expect(data.progress.averageWordsPerDay).toBeDefined();
        });

        test('should calculate weekly change correctly', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/progress?days=30`);
            const data = await response.json();
            
            expect(data.progress.weeklyChange).toBeDefined();
            expect(typeof data.progress.weeklyChange).toBe('number');
        });

        test('should support different time periods', async ({ request }) => {
            const periods = [7, 14, 30, 90];
            
            for (const days of periods) {
                const response = await request.get(`${baseURL}/api/analytics/${testUserId}/progress?days=${days}`);
                expect(response.ok()).toBeTruthy();
                const data = await response.json();
                expect(data.progress.progressData).toBeDefined();
            }
        });
    });

    test.describe('Interest Profiling API', () => {
        test('should get user interests', async ({ request }) => {
            // Track content with different categories
            const categories = ['News', 'Sports', 'Technology', 'Food', 'Travel'];
            
            for (const category of categories) {
                await request.post(`${baseURL}/api/analytics/track`, {
                    data: {
                        userId: testUserId,
                        action: {
                            type: 'article',
                            contentType: 'article',
                            contentId: `article-${category}`,
                            timeSpent: 120,
                            category
                        }
                    }
                });
            }

            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/interests`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.interests).toBeDefined();
            expect(Array.isArray(data.interests)).toBe(true);
        });

        test('should calculate interest percentages', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/interests`);
            const data = await response.json();
            
            if (data.interests.length > 0) {
                data.interests.forEach(interest => {
                    expect(interest.category).toBeDefined();
                    expect(interest.weight).toBeDefined();
                    expect(interest.percentage).toBeDefined();
                    expect(interest.percentage).toBeGreaterThanOrEqual(0);
                    expect(interest.percentage).toBeLessThanOrEqual(100);
                });
            }
        });
    });

    test.describe('Insights and Predictions API', () => {
        test('should generate insights', async ({ request }) => {
            // Track substantial activity
            for (let i = 0; i < 10; i++) {
                await request.post(`${baseURL}/api/analytics/track`, {
                    data: {
                        userId: testUserId,
                        action: {
                            type: 'word',
                            contentType: 'vocabulary',
                            contentId: `insight-word-${i}`
                        }
                    }
                });
            }

            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/insights`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.insights).toBeDefined();
            expect(data.predictions).toBeDefined();
            expect(data.skillRadar).toBeDefined();
        });

        test('should provide skill radar data', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/insights`);
            const data = await response.json();
            
            expect(data.skillRadar.vocabulary).toBeDefined();
            expect(data.skillRadar.grammar).toBeDefined();
            expect(data.skillRadar.reading).toBeDefined();
            expect(data.skillRadar.listening).toBeDefined();
        });
    });

    test.describe('Content Engagement API', () => {
        test('should get content engagement history', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/engagement`);
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.engagement).toBeDefined();
            expect(data.engagement.total).toBeDefined();
            expect(data.engagement.byAction).toBeDefined();
        });

        test('should filter by content type', async ({ request }) => {
            const contentTypes = ['video', 'article', 'game'];
            
            for (const type of contentTypes) {
                const response = await request.get(`${baseURL}/api/analytics/${testUserId}/engagement?contentType=${type}`);
                expect(response.ok()).toBeTruthy();
            }
        });

        test('should support different time periods', async ({ request }) => {
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/engagement?days=7`);
            expect(response.ok()).toBeTruthy();
        });
    });

    test.describe('Progress Dashboard UI', () => {
        test('should load progress dashboard', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            
            // Wait for main content to load
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            // Check if stats cards are visible
            await expect(page.locator('#totalWords')).toBeVisible();
            await expect(page.locator('#totalVideos')).toBeVisible();
            await expect(page.locator('#totalArticles')).toBeVisible();
            await expect(page.locator('#totalTime')).toBeVisible();
        });

        test('should display stat cards with values', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            const totalWords = await page.locator('#totalWords').textContent();
            expect(totalWords).toBeTruthy();
            expect(totalWords).toMatch(/\d+/);
        });

        test('should render all charts', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            // Check for all chart canvases
            await expect(page.locator('#wordsChart')).toBeVisible();
            await expect(page.locator('#timeChart')).toBeVisible();
            await expect(page.locator('#skillRadarChart')).toBeVisible();
            await expect(page.locator('#interestsChart')).toBeVisible();
        });

        test('should display insights section', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            await expect(page.locator('.insights-section')).toBeVisible();
            await expect(page.locator('#insightsList')).toBeVisible();
        });

        test('should display predictions section', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            await expect(page.locator('.predictions-section')).toBeVisible();
            await expect(page.locator('#predictionsList')).toBeVisible();
        });

        test('should display streak calendar', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            await expect(page.locator('.streak-calendar')).toBeVisible();
            await expect(page.locator('#calendarGrid')).toBeVisible();
            
            // Check if calendar days are rendered
            const days = await page.locator('.calendar-day').count();
            expect(days).toBeGreaterThan(0);
        });

        test('should take screenshot of dashboard', async ({ page }) => {
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            // Wait for charts to render
            await page.waitForTimeout(2000);
            
            await page.screenshot({
                path: 'screenshots/progress-dashboard-complete.png',
                fullPage: true
            });
        });
    });

    test.describe('Interest Selection in Onboarding', () => {
        test('should display 7 main interest categories', async ({ page }) => {
            await page.goto(`${baseURL}/preference-setup.html`);
            
            // Navigate to interests step
            await page.click('button:has-text("Next")');
            await page.waitForSelector('#interestGrid', { timeout: 5000 });
            
            const interests = await page.locator('#interestGrid .artist-card').count();
            expect(interests).toBe(7);
        });

        test('should require at least 3 interests', async ({ page }) => {
            await page.goto(`${baseURL}/preference-setup.html`);
            
            // Navigate to interests step
            await page.click('button:has-text("Next")');
            await page.waitForSelector('#interestGrid', { timeout: 5000 });
            
            // Next button should be disabled initially
            const nextBtn = page.locator('#nextBtn2');
            await expect(nextBtn).toBeDisabled();
            
            // Select 3 interests
            const interestCards = page.locator('#interestGrid .artist-card');
            await interestCards.nth(0).click();
            await interestCards.nth(1).click();
            await interestCards.nth(2).click();
            
            // Now button should be enabled
            await expect(nextBtn).toBeEnabled();
        });

        test('should highlight selected interests', async ({ page }) => {
            await page.goto(`${baseURL}/preference-setup.html`);
            
            // Navigate to interests step
            await page.click('button:has-text("Next")');
            await page.waitForSelector('#interestGrid', { timeout: 5000 });
            
            const firstInterest = page.locator('#interestGrid .artist-card').first();
            await firstInterest.click();
            
            await expect(firstInterest).toHaveClass(/selected/);
        });

        test('should save interests to analytics', async ({ page, request }) => {
            await page.goto(`${baseURL}/preference-setup.html`);
            
            // Complete the onboarding with interests
            await page.click('button:has-text("Skip")'); // Skip artists
            
            // Select interests
            await page.waitForSelector('#interestGrid', { timeout: 5000 });
            const interestCards = page.locator('#interestGrid .artist-card');
            await interestCards.nth(0).click();
            await interestCards.nth(1).click();
            await interestCards.nth(2).click();
            await page.click('#nextBtn2');
            
            // Skip remaining steps
            await page.click('button:has-text("Next")'); // Topics
            await page.click('button:has-text("Next")'); // Categories
            await page.click('button:has-text("Finish Setup")'); // Content mix
            
            // Wait for completion
            await page.waitForTimeout(2000);
            
            // Verify interests were saved
            const response = await request.get(`${baseURL}/api/analytics/${testUserId}/interests`);
            const data = await response.json();
            expect(data.interests).toBeDefined();
        });

        test('should take screenshot of interest selection', async ({ page }) => {
            await page.goto(`${baseURL}/preference-setup.html`);
            
            // Navigate to interests step
            await page.click('button:has-text("Next")');
            await page.waitForSelector('#interestGrid', { timeout: 5000 });
            
            // Select some interests
            const interestCards = page.locator('#interestGrid .artist-card');
            await interestCards.nth(0).click();
            await interestCards.nth(2).click();
            await interestCards.nth(4).click();
            
            await page.screenshot({
                path: 'screenshots/interest-selection.png',
                fullPage: true
            });
        });
    });

    test.describe('Chart Accuracy Tests', () => {
        test('should display accurate word count in chart', async ({ page, request }) => {
            // Track known number of words
            const wordCount = 15;
            for (let i = 0; i < wordCount; i++) {
                await request.post(`${baseURL}/api/analytics/track`, {
                    data: {
                        userId: testUserId,
                        action: {
                            type: 'word',
                            contentType: 'vocabulary',
                            contentId: `test-word-${i}`
                        }
                    }
                });
            }

            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            const displayedWords = await page.locator('#totalWords').textContent();
            const count = parseInt(displayedWords || '0');
            expect(count).toBeGreaterThanOrEqual(wordCount);
        });

        test('should display accurate time spent', async ({ page, request }) => {
            // Track known time
            const timeInMinutes = 60;
            await request.post(`${baseURL}/api/analytics/track`, {
                data: {
                    userId: testUserId,
                    action: {
                        type: 'video',
                        duration: timeInMinutes * 60,
                        contentType: 'video',
                        contentId: 'time-test-video'
                    }
                }
            });

            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            const displayedTime = await page.locator('#totalTime').textContent();
            const minutes = parseInt(displayedTime || '0');
            expect(minutes).toBeGreaterThanOrEqual(timeInMinutes);
        });
    });

    test.describe('Error Handling', () => {
        test('should handle missing user data gracefully', async ({ page }) => {
            // Use non-existent user
            await page.goto(baseURL);
            await page.evaluate(() => {
                localStorage.setItem('userId', 'non-existent-user-' + Date.now());
            });

            await page.goto(`${baseURL}/progress-dashboard.html`);
            
            // Should either show empty state or error message
            await page.waitForSelector('#mainContent, #errorState', { timeout: 10000 });
        });

        test('should handle API errors gracefully', async ({ page }) => {
            // Mock API failure by using invalid endpoint
            await page.route('**/api/analytics/**', route => {
                route.fulfill({
                    status: 500,
                    body: JSON.stringify({ error: 'Test error' })
                });
            });

            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForTimeout(2000);
            
            // Should show error state
            const errorState = page.locator('#errorState');
            await expect(errorState).toBeVisible();
        });
    });

    test.describe('Performance Tests', () => {
        test('dashboard should load within 3 seconds', async ({ page }) => {
            const startTime = Date.now();
            
            await page.goto(`${baseURL}/progress-dashboard.html`);
            await page.waitForSelector('#mainContent', { timeout: 10000 });
            
            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(3000);
        });

        test('analytics API should respond quickly', async ({ request }) => {
            const startTime = Date.now();
            
            await request.get(`${baseURL}/api/analytics/${testUserId}/weekly`);
            
            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000);
        });
    });
});


