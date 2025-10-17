// 🤖 AI FEATURES TEST - Content Adaptation + Level Detection
// Tests new AI-powered personalization systems

const { test, expect } = require('@playwright/test');

const API_BASE = 'http://localhost:3002';

test.describe('🤖 AI Features - Content Adaptation & Level Detection', () => {

    test('should adapt Spanish content to user level', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/adapt-content`, {
            data: {
                content: 'El presidente anunció nuevas medidas económicas para combatir la inflación.',
                userLevel: 'A2',
                userKnownWords: ['el', 'para']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`🤖 Content Adaptation Result:`);
        console.log(`   Original length: ${data.original.length} chars`);
        console.log(`   Adapted length: ${data.adapted.length} chars`);
        console.log(`   Type: ${data.type}`);
        console.log(`   Known words: ${data.analysis.knownPercentage.toFixed(1)}%`);
        console.log(`   Unknown words: ${data.analysis.unknownPercentage.toFixed(1)}%`);
        console.log(`   Complexity: ${data.analysis.complexityScore}/100`);
        console.log(`   Recommended level: ${data.analysis.recommendedLevel}`);

        expect(data.success).toBe(true);
        expect(data.analysis).toBeDefined();
        expect(data.analysis.totalWords).toBeGreaterThan(0);
        expect(data.newVocabulary.length).toBeGreaterThan(0);
    });

    test('should detect user Spanish level accurately', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/detect-level`, {
            data: {
                userWords: ['hola', 'gracias', 'buenos', 'días', 'cómo', 'estás'],
                learningHistory: {
                    streak: 7,
                    recentActivity: [],
                    reviews: []
                }
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n🎯 Level Detection Result:`);
        console.log(`   Level: ${data.level} (${data.levelName})`);
        console.log(`   Confidence: ${data.confidence}%`);
        console.log(`   Total words learned: ${data.statistics.totalWords}`);
        console.log(`   Progress in level: ${data.statistics.progressInLevel}%`);
        console.log(`   Next level: ${data.nextLevel}`);
        console.log(`   Words to next level: ${data.wordsToNextLevel}`);

        expect(data.success).toBe(true);
        expect(data.level).toMatch(/^(A1|A2|B1|B2|C1|C2)$/);
        expect(data.confidence).toBeGreaterThanOrEqual(0);
        expect(data.confidence).toBeLessThanOrEqual(100);
        expect(data.nextLevel).toBeDefined();
        expect(data.recommendations).toBeDefined();
        expect(data.recommendations.length).toBeGreaterThan(0);
    });

    test('should validate 90/10 comprehensibility theory', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/check-comprehensibility`, {
            data: {
                content: 'Hola amigo, ¿cómo estás hoy? Hace buen tiempo.',
                userKnownWords: ['hola', 'cómo', 'estás', 'hoy', 'hace', 'buen']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n📚 Comprehensibility Check (90/10 Theory):`);
        console.log(`   Comprehensible: ${data.comprehensible ? '✅' : '❌'}`);
        console.log(`   Optimal: ${data.optimal ? '✅ Perfect!' : '⚠️'}`);
        console.log(`   Known: ${data.knownPercentage.toFixed(1)}%`);
        console.log(`   Unknown: ${data.unknownPercentage.toFixed(1)}%`);
        console.log(`   ${data.recommendation}`);

        expect(data.success).toBe(true);
        expect(data.knownPercentage).toBeGreaterThanOrEqual(0);
        expect(data.knownPercentage).toBeLessThanOrEqual(100);
        expect(data.recommendation).toBeDefined();
    });

    test('should generate personalized article for user level', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/generate-article`, {
            data: {
                topic: 'Spanish Football',
                userLevel: 'B1',
                userInterests: ['sports', 'culture', 'news']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n📝 Personalized Article Generation:`);
        console.log(`   Title: ${data.title}`);
        console.log(`   Level: ${data.level}`);
        console.log(`   Structure: ${data.template.structure}`);
        console.log(`   Vocabulary: ${data.template.vocabulary}`);
        console.log(`   Interests: ${data.interests.join(', ')}`);

        expect(data.success).toBe(true);
        expect(data.title).toContain('Spanish Football');
        expect(data.level).toBe('B1');
        expect(data.template).toBeDefined();
        expect(data.prompt).toBeDefined();
    });

    test('should handle beginner level content adaptation', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/adapt-content`, {
            data: {
                content: 'Hola. Me llamo María. Tengo veinte años.',
                userLevel: 'A1',
                userKnownWords: ['hola', 'me', 'tengo']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n🎓 Beginner Level Adaptation:`);
        console.log(`   Complexity score: ${data.analysis.complexityScore}/100`);
        console.log(`   Should be LOW complexity for A1`);

        expect(data.success).toBe(true);
        expect(data.analysis.recommendedLevel).toMatch(/^(A1|A2)$/);
    });

    test('should handle advanced level content adaptation', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/adapt-content`, {
            data: {
                content: 'La implementación de políticas macroeconómicas requiere un análisis exhaustivo.',
                userLevel: 'C1',
                userKnownWords: []
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n🎓 Advanced Level Adaptation:`);
        console.log(`   Complexity score: ${data.analysis.complexityScore}/100`);
        console.log(`   Should be HIGH complexity`);

        expect(data.success).toBe(true);
        expect(data.analysis.complexityScore).toBeGreaterThan(50);
    });

    test('should provide learning recommendations based on patterns', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/detect-level`, {
            data: {
                userWords: Array(50).fill('word'),
                learningHistory: {
                    streak: 3,
                    recentActivity: [
                        { word: 'test', learnedAt: new Date().toISOString() }
                    ],
                    reviews: [
                        { correct: true },
                        { correct: false },
                        { correct: true }
                    ]
                }
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n💡 Learning Recommendations:`);
        data.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. [${rec.priority}] ${rec.message}`);
        });

        expect(data.recommendations).toBeDefined();
        expect(data.recommendations.length).toBeGreaterThan(0);
        expect(data.patterns.learningVelocity).toBeDefined();
        expect(data.patterns.retention).toBeDefined();
        expect(data.patterns.consistency).toBeDefined();
    });

    test('should calculate new vocabulary from content', async ({ request }) => {
        const response = await request.post(`${API_BASE}/api/ai/adapt-content`, {
            data: {
                content: 'El gato negro duerme en la silla roja.',
                userLevel: 'A2',
                userKnownWords: ['el', 'en', 'la']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`\n📖 New Vocabulary Discovery:`);
        console.log(`   Total new words: ${data.newVocabulary.length}`);
        console.log(`   Words to learn: ${data.newVocabulary.join(', ')}`);

        expect(data.newVocabulary).toBeDefined();
        expect(data.newVocabulary.length).toBeGreaterThan(0);
    });
});
