// 🔥 SESSION 6 - SPANISH FREQUENCY & GOSSIP SYSTEMS
// Tests revolutionary frequency-based learning and celebrity gossip feed
// Merged from workspace-4 archives!

const { test, expect } = require('@playwright/test');

test.describe('🔥 Session 6 - Spanish Learning Systems', () => {

    test('should return Spanish frequency words API', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/frequency?level=beginner&count=5');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log(`✅ Frequency API: ${data.count} words returned`);
        console.log(`Top words: ${data.words.slice(0, 3).map(w => w.word).join(', ')}`);

        expect(data.success).toBe(true);
        expect(data.level).toBe('beginner');
        expect(data.words.length).toBe(5);
        expect(data.words[0].word).toBe('no'); // #1 most common
        expect(data.words[0].frequency).toBe(1);
        expect(data.words[0].contexts.length).toBeGreaterThan(0);
    });

    test('should return celebrity gossip feed API', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/gossip?level=beginner&count=3');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log(`🔥 Gossip API: ${data.count} items returned`);
        console.log(`Top gossip: ${data.gossip.slice(0, 2).map(g => g.source).join(', ')}`);

        expect(data.success).toBe(true);
        expect(data.gossip.length).toBe(3);
        expect(data.gossip[0].type).toBe('gossip');
        expect(data.gossip[0].viral_score).toBeGreaterThan(80);
        expect(data.gossip[0].vocabulary.length).toBeGreaterThan(0);
    });

    test('should return viral context for word', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/viral-context/no');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log(`💬 Viral context for "no": ${data.context.viralHook}`);

        expect(data.success).toBe(true);
        expect(data.word).toBe('no');
        expect(data.context.spanishPhrase).toBeTruthy();
        expect(data.context.viralHook).toBeTruthy();
        expect(data.context.relatability).toBeGreaterThan(5);
    });

    test('should verify 13 active features in health', async ({ request }) => {
        const response = await request.get('http://localhost:3002/health');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log(`💚 Health: ${data.features.length} features`);
        console.log(`New features: spanish-frequency-words, spanish-gossip-feed`);

        expect(data.status).toBe('healthy');
        expect(data.features).toContain('spanish-frequency-words');
        expect(data.features).toContain('spanish-gossip-feed');
        expect(data.features.length).toBe(13);
        expect(data.routes.frequency).toBeTruthy();
        expect(data.routes.gossip).toBeTruthy();
    });

    test('should have viral context for all top 5 words', async ({ request }) => {
        const topWords = ['no', 'sí', 'hola', 'yo', 'qué'];

        for (const word of topWords) {
            const response = await request.get(`http://localhost:3002/api/spanish/viral-context/${word}`);
            expect(response.ok()).toBeTruthy();

            const data = await response.json();
            console.log(`✅ "${word}" has ${data.context.relatability}/10 relatability`);
            expect(data.success).toBe(true);
            expect(data.context.relatability).toBeGreaterThan(5);
        }
    });

    test('should return gossip sorted by viral score', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/gossip?level=beginner&count=5');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        const scores = data.gossip.map(g => g.viral_score);

        console.log(`📊 Gossip viral scores: ${scores.join(', ')}`);

        // Check if sorted descending
        for (let i = 0; i < scores.length - 1; i++) {
            expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
        }
    });

    test('should have celebrity names in gossip items', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/gossip?level=beginner&count=5');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        const celebrities = data.gossip.map(g => g.source);

        console.log(`⭐ Celebrities: ${celebrities.join(', ')}`);

        expect(celebrities.some(c => c.includes('Bad Bunny') || c.includes('Karol G') || c.includes('Peso Pluma'))).toBe(true);
    });

    test('should have vocabulary highlights for learning', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/gossip?level=beginner&count=1');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        const vocab = data.gossip[0].vocabulary;

        console.log(`📚 Vocabulary to learn: ${vocab.join(', ')}`);

        expect(vocab.length).toBeGreaterThan(3);
        expect(Array.isArray(vocab)).toBe(true);
    });

    test('should have relatable viral contexts', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/frequency?level=beginner&count=10');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        const avgRelatability = data.words.reduce((sum, word) => {
            const contextRelatability = word.contexts.reduce((s, c) => s + c.relatability, 0) / word.contexts.length;
            return sum + contextRelatability;
        }, 0) / data.words.length;

        console.log(`🎯 Average relatability: ${avgRelatability.toFixed(1)}/10`);

        expect(avgRelatability).toBeGreaterThan(7);
    });

    test('should provide both Spanish and English translations', async ({ request }) => {
        const response = await request.get('http://localhost:3002/api/spanish/gossip?level=beginner&count=1');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        const item = data.gossip[0];

        console.log(`🌐 Dual language: "${item.title}" | "${item.english}"`);

        expect(item.spanish).toBeTruthy();
        expect(item.english).toBeTruthy();
        expect(item.spanish).not.toBe(item.english);
    });

});

console.log('🔥 SESSION 6 SPANISH SYSTEMS - Revolutionary frequency + gossip learning!');
