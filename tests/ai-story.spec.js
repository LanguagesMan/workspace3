// 🧪 PLAYWRIGHT TEST - AI Story Arc Generator
// Tests: One Goal Rule, Hamster Sidekick, Coherent Quest System

const { test, expect } = require('@playwright/test');

test.describe('AI Story Arc Generator - Golden Flows', () => {
    const BASE_URL = 'http://localhost:3002';

    test('GF-1: Server health check passes', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/health`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.status).toBe('healthy');
        expect(data.apis).toContain('LangFeed');
    });

    test('GF-2: Story starts with one clear overarching quest', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/story/start`, {
            data: {
                userId: 'test_user_' + Date.now(),
                level: 'A2'
            }
        });

        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log('Story Response:', JSON.stringify(data, null, 2));

        expect(data.success).toBe(true);
        expect(data.story).toBeDefined();
        expect(data.story.quest).toBeDefined();
        expect(data.story.quest.goal).toBeDefined();
        expect(data.story.quest.goalEN).toBeDefined();

        // Verify one clear goal
        expect(data.story.quest.goal.length).toBeGreaterThan(0);
        console.log(`✅ Quest Goal: ${data.story.quest.goal}`);
    });

    test('GF-5: Hamster sidekick appears in story', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/story/start`, {
            data: {
                userId: 'test_hamster_' + Date.now(),
                level: 'A2'
            }
        });

        const data = await response.json();

        expect(data.story.hamsterIntro).toBeDefined();
        expect(data.story.hamsterIntro.name).toBe('Chispa');
        expect(data.story.hamsterIntro.greeting).toContain('Chispa');

        console.log(`🐹 Hamster Intro: ${data.story.hamsterIntro.greeting}`);
    });

    test('GF-3: Scene follows setup → choice → consequence', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/story/start`, {
            data: {
                userId: 'test_scene_' + Date.now(),
                level: 'A2'
            }
        });

        const data = await response.json();
        const scene = data.story.currentScene;

        // Verify scene structure
        expect(scene.location).toBeDefined();
        expect(scene.description).toBeDefined();
        expect(scene.obstacle).toBeDefined();
        expect(scene.choices).toBeDefined();
        expect(scene.choices.length).toBeGreaterThan(0);

        // Verify each choice has spanish, english, consequence
        scene.choices.forEach(choice => {
            expect(choice.spanish).toBeDefined();
            expect(choice.english).toBeDefined();
            expect(choice.consequence).toBeDefined();
        });

        console.log(`📍 Location: ${scene.location}`);
        console.log(`🎬 Scene: ${scene.description}`);
        console.log(`🚧 Obstacle: ${scene.obstacle}`);
    });

    test('GF-4: Wrong choice spawns funny consequence', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/story/choice`, {
            data: {
                storyId: 'test_story',
                userInput: 'La manzana me come',
                expectedPattern: 'Como la manzana',
                storyContext: {
                    goal: 'Escapar del laberinto'
                }
            }
        });

        expect(response.ok()).toBeTruthy();

        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.consequence).toBeDefined();
        expect(data.consequence.consequence).toBeDefined();
        expect(data.consequence.hamsterReaction).toBeDefined();

        console.log(`😂 Funny Consequence: ${data.consequence.consequence}`);
        console.log(`🐹 Hamster: ${data.consequence.hamsterReaction}`);
    });

    test('GF-7: Level progression scaffolds difficulty', async ({ request }) => {
        const levels = ['A1', 'A2', 'B1', 'B2'];

        for (const level of levels) {
            const response = await request.post(`${BASE_URL}/api/story/start`, {
                data: {
                    userId: `test_level_${level}_${Date.now()}`,
                    level: level
                }
            });

            const data = await response.json();

            expect(data.story.quest.difficulty).toBe(level);

            console.log(`📊 Level ${level}: ${data.story.quest.goal}`);
        }
    });

    test('Unified Feed: Videos integration', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/unified-feed?level=A2&interests=news&limit=5`);

        expect(response.ok()).toBeTruthy();

        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.videos).toBeDefined();
        expect(data.videos.length).toBeGreaterThan(0);

        // Check for LangFeed videos
        const langfeedVideo = data.videos.find(v => v.source === 'LangFeed');

        if (langfeedVideo) {
            console.log(`🎥 LangFeed Video Found: ${langfeedVideo.title}`);
            expect(langfeedVideo.videoUrl).toContain('/api/langfeed/stream/');
        }
    });
});
