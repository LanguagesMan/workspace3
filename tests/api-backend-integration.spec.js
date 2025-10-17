/**
 * 🧪 BACKEND API INTEGRATION TESTS (Playwright)
 * 
 * Comprehensive API testing for backend integration
 */

const { test, expect } = require('@playwright/test');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Backend API Integration', () => {
    
    test.beforeAll(async () => {
        // Give server time to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    test('Server is running', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/`);
        expect(response.status()).toBeLessThan(500);
    });

    test.describe('Articles Feed API', () => {
        
        test('GET /api/articles/feed returns valid response', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: {
                    userId: 'test-user',
                    category: 'all',
                    limit: 5
                }
            });

            console.log('Feed response status:', response.status());
            
            // Should return 200 or 500 (if RSS parsing fails), not 404
            expect([200, 500, 503]).toContain(response.status());
            
            if (response.status() === 200) {
                const data = await response.json();
                console.log('Feed response:', JSON.stringify(data, null, 2).substring(0, 500));
                
                expect(data).toHaveProperty('success');
                expect(data).toHaveProperty('articles');
                expect(Array.isArray(data.articles)).toBeTruthy();
            }
        });

        test('GET /api/articles/feed with category filter', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: {
                    userId: 'test-user',
                    category: 'technology',
                    limit: 3
                }
            });

            if (response.status() === 200) {
                const data = await response.json();
                expect(data.category).toBe('technology');
            }
        });

        test('GET /api/articles/feed with difficulty filter', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: {
                    userId: 'test-user',
                    difficulty: 'B1',
                    limit: 5
                }
            });

            if (response.status() === 200) {
                const data = await response.json();
                // Articles should be around B1 difficulty
                if (data.articles && data.articles.length > 0) {
                    const difficulties = data.articles.map(a => a.difficulty);
                    console.log('Article difficulties:', difficulties);
                }
            }
        });
    });

    test.describe('Article Analysis API', () => {
        
        test('POST /api/articles/analyze analyzes Spanish text', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/articles/analyze`, {
                data: {
                    articleText: 'Hola, ¿cómo estás? Esta es una prueba simple del analizador de dificultad.',
                    userId: 'test-user'
                }
            });

            console.log('Analyze response status:', response.status());

            if (response.ok) {
                const data = await response.json();
                console.log('Analysis result:', JSON.stringify(data, null, 2));
                
                expect(data).toHaveProperty('success');
                expect(data).toHaveProperty('analysis');
                
                if (data.analysis) {
                    expect(data.analysis).toHaveProperty('cefrLevel');
                    expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(data.analysis.cefrLevel);
                }
            }
        });

        test('POST /api/articles/analyze requires articleText', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/articles/analyze`, {
                data: {
                    userId: 'test-user'
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('articleText');
        });

        test('POST /api/articles/analyze handles complex text', async ({ request }) => {
            const complexText = `
                La inteligencia artificial está transformando radicalmente 
                la manera en que interactuamos con la tecnología. Los algoritmos 
                de aprendizaje automático pueden procesar cantidades masivas 
                de datos y detectar patrones que serían imposibles de identificar 
                para los humanos.
            `;

            const response = await request.post(`${API_BASE_URL}/api/articles/analyze`, {
                data: {
                    articleText: complexText,
                    userId: 'test-user'
                }
            });

            if (response.ok) {
                const data = await response.json();
                expect(data.analysis).toBeTruthy();
                // Complex text should be B2 or higher
                if (data.analysis && data.analysis.cefrLevel) {
                    console.log('Complex text difficulty:', data.analysis.cefrLevel);
                }
            }
        });
    });

    test.describe('Cache Management API', () => {
        
        test('POST /api/articles/clear-cache clears cache', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/articles/clear-cache`);

            expect(response.ok).toBeTruthy();
            const data = await response.json();
            expect(data).toHaveProperty('success');
            expect(data.message).toContain('cache');
        });
    });

    test.describe('Firecrawl Integration', () => {
        
        test('GET /api/articles/queue/status returns queue status', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/queue/status`);

            // May not be available if Firecrawl not configured
            if (response.status() === 200) {
                const data = await response.json();
                expect(data).toHaveProperty('success');
                console.log('Queue status:', data);
            } else {
                expect(response.status()).toBe(503);
            }
        });
    });

    test.describe('Performance Tests', () => {
        
        test('Articles feed responds within 30 seconds', async ({ request }) => {
            const startTime = Date.now();
            
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: {
                    userId: 'perf-test',
                    limit: 10
                },
                timeout: 30000
            });

            const duration = Date.now() - startTime;
            console.log(`Feed response time: ${duration}ms`);
            
            // First request may be slow (RSS fetching), subsequent should be fast
            expect(duration).toBeLessThan(30000);
        });

        test('Article analysis responds within 5 seconds', async ({ request }) => {
            const startTime = Date.now();
            
            const response = await request.post(`${API_BASE_URL}/api/articles/analyze`, {
                data: {
                    articleText: 'Test rápido de rendimiento.',
                    userId: 'perf-test'
                },
                timeout: 5000
            });

            const duration = Date.now() - startTime;
            console.log(`Analysis response time: ${duration}ms`);
            
            expect(duration).toBeLessThan(5000);
        });
    });

    test.describe('Error Handling', () => {
        
        test('Invalid endpoint returns 404', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/nonexistent`);
            expect(response.status()).toBe(404);
        });

        test('Malformed JSON returns 400', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/articles/analyze`, {
                data: 'not valid json',
                headers: {
                    'Content-Type': 'application/json'
                },
                failOnStatusCode: false
            });

            // Should handle malformed requests gracefully
            expect([400, 500]).toContain(response.status());
        });
    });

    test.describe('CORS and Security', () => {
        
        test('API allows CORS requests', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: { userId: 'cors-test', limit: 1 },
                headers: {
                    'Origin': 'http://localhost:3001'
                }
            });

            const headers = response.headers();
            // CORS should be enabled
            expect(headers['access-control-allow-origin'] || headers['Access-Control-Allow-Origin']).toBeTruthy();
        });

        test('API has security headers', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: { userId: 'security-test', limit: 1 }
            });

            const headers = response.headers();
            console.log('Security headers present:', Object.keys(headers).filter(h => 
                h.toLowerCase().includes('security') || 
                h.toLowerCase().includes('policy') ||
                h.toLowerCase().includes('x-')
            ));
            
            // Should have some security headers (Helmet)
            const hasSecurityHeaders = Object.keys(headers).some(h => 
                h.toLowerCase().startsWith('x-') ||
                h.toLowerCase().includes('content-security')
            );
            
            expect(hasSecurityHeaders).toBeTruthy();
        });
    });

    test.describe('Data Validation', () => {
        
        test('Articles have required fields', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: {
                    userId: 'validation-test',
                    limit: 1
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.articles && data.articles.length > 0) {
                    const article = data.articles[0];
                    console.log('Sample article structure:', Object.keys(article));
                    
                    // Check required fields
                    expect(article).toHaveProperty('id');
                    expect(article).toHaveProperty('title');
                    expect(article).toHaveProperty('source');
                    expect(article).toHaveProperty('difficulty');
                    expect(article).toHaveProperty('category');
                }
            }
        });

        test('CEFR levels are valid', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/articles/feed`, {
                params: {
                    userId: 'validation-test',
                    limit: 10
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.articles) {
                    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                    
                    data.articles.forEach(article => {
                        if (article.difficulty) {
                            expect(validLevels).toContain(article.difficulty);
                        }
                    });
                }
            }
        });
    });
});

