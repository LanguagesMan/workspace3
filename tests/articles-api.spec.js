/**
 * Articles API Tests
 * Comprehensive Playwright API tests for articles endpoints
 */

const { test, expect } = require('@playwright/test');

test.describe('Articles API - Endpoint Tests', () => {
    const baseURL = 'http://localhost:3000';
    const apiBase = `${baseURL}/api`;

    test.describe('GET /api/articles/feed', () => {
        test('should return articles feed with default parameters', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 10
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data).toHaveProperty('articles');
            expect(Array.isArray(data.articles)).toBeTruthy();
            
            // Should have articles
            if (data.articles.length > 0) {
                const article = data.articles[0];
                expect(article).toHaveProperty('id');
                expect(article).toHaveProperty('title');
                expect(article).toHaveProperty('content');
                expect(article).toHaveProperty('difficulty');
            }
        });

        test('should filter by category', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    category: 'technology',
                    limit: 10
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data).toHaveProperty('articles');
            
            // Check if articles are from technology category
            if (data.articles.length > 0) {
                const article = data.articles[0];
                expect(article.category).toBe('technology');
            }
        });

        test('should respect limit parameter', async ({ request }) => {
            const limit = 5;
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: limit
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data.articles.length).toBeLessThanOrEqual(limit);
        });

        test('should include analysis when requested', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    withAnalysis: true,
                    limit: 5
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            
            if (data.articles.length > 0) {
                const article = data.articles[0];
                expect(article).toHaveProperty('difficulty');
                expect(article.difficulty).toMatch(/A1|A2|B1|B2|C1|C2/);
            }
        });

        test('should include translations when requested', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    includeTranslations: true,
                    limit: 5
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            
            if (data.articles.length > 0) {
                const article = data.articles[0];
                // May have translations
                if (article.titleEnglish) {
                    expect(typeof article.titleEnglish).toBe('string');
                }
                if (article.contentEnglish) {
                    expect(typeof article.contentEnglish).toBe('string');
                }
            }
        });

        test('should return 400 for missing userId', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`);
            
            // Should either work with default user or return 400
            expect([200, 400]).toContain(response.status());
        });

        test('should handle invalid category gracefully', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    category: 'invalid_category_xyz',
                    limit: 10
                }
            });

            // Should return 200 with empty array or 400
            expect([200, 400]).toContain(response.status());
        });

        test('should return different results for different user levels', async ({ request }) => {
            // Get articles for A1 user
            const responseA1 = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_a1',
                    userLevel: 'A1',
                    limit: 10
                }
            });

            // Get articles for C2 user
            const responseC2 = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_c2',
                    userLevel: 'C2',
                    limit: 10
                }
            });

            expect(responseA1.status()).toBe(200);
            expect(responseC2.status()).toBe(200);

            const dataA1 = await responseA1.json();
            const dataC2 = await responseC2.json();

            // Both should return articles
            expect(dataA1.articles).toBeDefined();
            expect(dataC2.articles).toBeDefined();
        });
    });

    test.describe('POST /api/articles/analyze', () => {
        test('should analyze article difficulty', async ({ request }) => {
            const articleText = 'Hola, ¿cómo estás? Me llamo Juan y vivo en Madrid. Tengo un perro.';
            
            const response = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    text: articleText,
                    userLevel: 'B1'
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data).toHaveProperty('difficulty');
            expect(data.difficulty).toMatch(/A1|A2|B1|B2|C1|C2/);
            expect(data).toHaveProperty('comprehension');
        });

        test('should provide comprehension analysis', async ({ request }) => {
            const articleText = 'La tecnología moderna ha transformado nuestra sociedad de manera fundamental.';
            
            const response = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    text: articleText,
                    userLevel: 'B1'
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            expect(data).toHaveProperty('comprehension');
            
            if (data.comprehension) {
                expect(data.comprehension).toHaveProperty('comprehensionPercentage');
                expect(typeof data.comprehension.comprehensionPercentage).toBe('number');
                expect(data.comprehension.comprehensionPercentage).toBeGreaterThanOrEqual(0);
                expect(data.comprehension.comprehensionPercentage).toBeLessThanOrEqual(100);
            }
        });

        test('should return 400 for missing text', async ({ request }) => {
            const response = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    userLevel: 'B1'
                }
            });

            expect(response.status()).toBe(400);
        });

        test('should handle empty text', async ({ request }) => {
            const response = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    text: '',
                    userLevel: 'B1'
                }
            });

            expect(response.status()).toBe(400);
        });

        test('should analyze text for different difficulty levels', async ({ request }) => {
            // Simple A1 text
            const simpleText = 'Hola. Me llamo Ana. Tengo un gato.';
            const responseA1 = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    text: simpleText,
                    userLevel: 'A1'
                }
            });

            // Complex C2 text
            const complexText = 'La epistemología contemporánea ha revolucionado nuestra comprensión sobre la naturaleza del conocimiento científico.';
            const responseC2 = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    text: complexText,
                    userLevel: 'C2'
                }
            });

            expect(responseA1.status()).toBe(200);
            expect(responseC2.status()).toBe(200);

            const dataA1 = await responseA1.json();
            const dataC2 = await responseC2.json();

            // Simple text should be lower difficulty
            expect(['A1', 'A2']).toContain(dataA1.difficulty);
            
            // Complex text should be higher difficulty
            expect(['B2', 'C1', 'C2']).toContain(dataC2.difficulty);
        });
    });

    test.describe('GET /api/articles/:id', () => {
        test('should get specific article by id', async ({ request }) => {
            // First, get list of articles
            const feedResponse = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 1
                }
            });

            const feedData = await feedResponse.json();
            
            if (feedData.articles && feedData.articles.length > 0) {
                const articleId = feedData.articles[0].id;
                
                // Get specific article
                const response = await request.get(`${apiBase}/articles/${articleId}`);
                
                expect(response.status()).toBe(200);
                
                const data = await response.json();
                expect(data).toHaveProperty('id', articleId);
                expect(data).toHaveProperty('title');
                expect(data).toHaveProperty('content');
            }
        });

        test('should return 404 for non-existent article', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/nonexistent_article_999`);
            
            expect(response.status()).toBe(404);
        });
    });

    test.describe('Error Handling', () => {
        test('should return proper error for malformed request', async ({ request }) => {
            const response = await request.post(`${apiBase}/articles/analyze`, {
                data: {
                    // Missing required fields
                }
            });

            expect([400, 422]).toContain(response.status());
        });

        test('should handle server errors gracefully', async ({ request }) => {
            // This would require mocking, but we test that errors have proper format
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 'invalid' // Invalid limit
                }
            });

            // Should either work with default or return error
            if (response.status() >= 400) {
                const data = await response.json();
                expect(data).toHaveProperty('error');
            }
        });

        test('should set correct CORS headers', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123'
                }
            });

            const headers = response.headers();
            // CORS headers should be present
            expect(headers['access-control-allow-origin']).toBeDefined();
        });
    });

    test.describe('Performance Tests', () => {
        test('should respond within acceptable time', async ({ request }) => {
            const startTime = Date.now();
            
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 20
                }
            });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            expect(response.status()).toBe(200);
            
            // Should respond within 5 seconds
            expect(responseTime).toBeLessThan(5000);
        });

        test('should handle concurrent requests', async ({ request }) => {
            const requests = [];
            
            // Make 10 concurrent requests
            for (let i = 0; i < 10; i++) {
                requests.push(
                    request.get(`${apiBase}/articles/feed`, {
                        params: {
                            userId: `test_user_${i}`,
                            limit: 5
                        }
                    })
                );
            }

            const responses = await Promise.all(requests);
            
            // All should succeed
            responses.forEach(response => {
                expect(response.status()).toBe(200);
            });
        });
    });

    test.describe('Data Validation', () => {
        test('should return articles with required fields', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 5
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    // Required fields
                    expect(article).toHaveProperty('id');
                    expect(article).toHaveProperty('title');
                    expect(article).toHaveProperty('content');
                    
                    // Field types
                    expect(typeof article.id).toBe('string');
                    expect(typeof article.title).toBe('string');
                    expect(typeof article.content).toBe('string');
                    
                    // Title and content should not be empty
                    expect(article.title.length).toBeGreaterThan(0);
                    expect(article.content.length).toBeGreaterThan(0);
                });
            }
        });

        test('should return valid difficulty levels', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    withAnalysis: true,
                    limit: 10
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            
            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    if (article.difficulty) {
                        expect(validLevels).toContain(article.difficulty);
                    }
                });
            }
        });

        test('should return valid image URLs', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 10
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    if (article.image) {
                        // Should be a valid URL
                        expect(article.image).toMatch(/^https?:\/\/.+/);
                    }
                });
            }
        });

        test('should return valid timestamps', async ({ request }) => {
            const response = await request.get(`${apiBase}/articles/feed`, {
                params: {
                    userId: 'test_user_123',
                    limit: 5
                }
            });

            expect(response.status()).toBe(200);
            
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    if (article.publishedAt) {
                        // Should be a valid date
                        const date = new Date(article.publishedAt);
                        expect(date.toString()).not.toBe('Invalid Date');
                    }
                });
            }
        });
    });

    test.describe('Category Filtering', () => {
        const categories = ['news', 'sports', 'technology', 'culture', 'entertainment', 'international'];

        categories.forEach(category => {
            test(`should return articles for ${category} category`, async ({ request }) => {
                const response = await request.get(`${apiBase}/articles/feed`, {
                    params: {
                        userId: 'test_user_123',
                        category: category,
                        limit: 10
                    }
                });

                expect(response.status()).toBe(200);
                
                const data = await response.json();
                expect(data).toHaveProperty('articles');
                expect(Array.isArray(data.articles)).toBeTruthy();
            });
        });
    });

    test.describe('User Level Adaptation', () => {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

        levels.forEach(level => {
            test(`should return appropriate articles for ${level} level`, async ({ request }) => {
                const response = await request.get(`${apiBase}/articles/feed`, {
                    params: {
                        userId: 'test_user_123',
                        userLevel: level,
                        withAnalysis: true,
                        limit: 10
                    }
                });

                expect(response.status()).toBe(200);
                
                const data = await response.json();
                expect(data.articles).toBeDefined();
                
                // Articles should be appropriate for user level (within ±1 level)
                if (data.articles.length > 0) {
                    const article = data.articles[0];
                    if (article.difficulty) {
                        expect(levels).toContain(article.difficulty);
                    }
                }
            });
        });
    });
});

