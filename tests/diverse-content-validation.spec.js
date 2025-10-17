/**
 * Diverse Content Validation Tests
 * VISION-ALIGNED: Validates content generation beyond GLOBO
 * Tests historical figures, objects comedy, and golden standard metrics
 */

import { test, expect } from '@playwright/test';
import { ContentGenerator } from '../src/contentGenerator.js';
import { VideoInjectionSystem } from '../src/videoInjectionSystem.js';

test.describe('Diverse Content Generation - Beyond GLOBO', () => {
  let contentGenerator;
  let videoInjectionSystem;

  test.beforeEach(() => {
    contentGenerator = new ContentGenerator();
    videoInjectionSystem = new VideoInjectionSystem();
  });

  test('generates diverse content types beyond GLOBO character', async () => {
    // Generate batch of content to test diversity
    const batch = contentGenerator.generateBatch(10);

    // Verify we have diverse content types (VISION requirement)
    const contentTypes = batch.map(item => item.type);
    const uniqueTypes = [...new Set(contentTypes)];

    expect(uniqueTypes.length).toBeGreaterThan(1);
    expect(uniqueTypes).toContain('historical_vlog');
    expect(uniqueTypes).toContain('objects_comedy');

    // Log for verification
    console.log('📊 Content Types Generated:', uniqueTypes);
  });

  test('ensures historical figures vlogging content', async () => {
    // Generate multiple concepts to find historical content
    const concepts = [];
    for (let i = 0; i < 20; i++) {
      concepts.push(contentGenerator.generateDiverseContent());
    }

    const historicalContent = concepts.filter(c => c.type === 'historical_vlog');
    expect(historicalContent.length).toBeGreaterThan(0);

    // Verify historical figures are mentioned
    const historicalConcepts = historicalContent.map(c => c.concept.toLowerCase());
    const hasHistoricalFigures = historicalConcepts.some(concept =>
      concept.includes('napoleon') ||
      concept.includes('einstein') ||
      concept.includes('picasso') ||
      concept.includes('quixote') ||
      concept.includes('cervantes')
    );

    expect(hasHistoricalFigures).toBe(true);
    console.log('🎭 Historical Content Examples:', historicalContent.slice(0, 3));
  });

  test('validates objects doing funny things content', async () => {
    // Generate multiple concepts to find objects comedy
    const concepts = [];
    for (let i = 0; i < 20; i++) {
      concepts.push(contentGenerator.generateDiverseContent());
    }

    const objectsContent = concepts.filter(c => c.type === 'objects_comedy');
    expect(objectsContent.length).toBeGreaterThan(0);

    // Verify everyday objects are doing funny things
    const objectConcepts = objectsContent.map(c => c.concept.toLowerCase());
    const hasFunnyObjects = objectConcepts.some(concept =>
      concept.includes('coffee mug') ||
      concept.includes('smartphone') ||
      concept.includes('calculator') ||
      concept.includes('taco') ||
      concept.includes('cactus') ||
      concept.includes('scissors') ||
      concept.includes('alarm clock') ||
      concept.includes('rubber duck') ||
      concept.includes('microwave') ||
      concept.includes('lamp') ||
      concept.includes('toaster') ||
      concept.includes('refusing') ||
      concept.includes('complaining') ||
      concept.includes('arguing') ||
      concept.includes('demanding') ||
      concept.includes('protesting')
    );

    expect(hasFunnyObjects).toBe(true);
    console.log('🥄 Objects Comedy Examples:', objectsContent.slice(0, 3));
  });

  test('ensures every video has funny hook within first 3 seconds', async () => {
    const concepts = contentGenerator.generateBatch(10);

    // Check for immediate engagement hooks (VISION: 0-3 seconds) - Updated for new instant hooks
    const instantHooks = ['instantly', 'suddenly', 'immediately', 'right now', 'out of nowhere', 'without warning', 'boom!', 'wait what?', 'stop everything!', 'hold up!'];
    const funnyWords = ['refusing', 'complaining', 'arguing', 'confused', 'dramatic', 'frantically', 'desperately', 'urgently', 'aggressively', 'sarcastically'];

    concepts.forEach(concept => {
      const hasInstantHook = instantHooks.some(hook =>
        concept.concept.toLowerCase().includes(hook)
      );

      const hasFunnyAction = funnyWords.some(word =>
        concept.concept.toLowerCase().includes(word) ||
        concept.hook.toLowerCase().includes(word)
      );

      const hasImmediateEngagement = hasInstantHook || hasFunnyAction;
      expect(hasImmediateEngagement).toBe(true);
      expect(concept.viralPotential).toBeGreaterThan(30); // Minimum viral threshold
    });

    console.log('⚡ Funny Hook Validation: All concepts have immediate engagement hooks within 3 seconds');
  });

  test('validates golden standard scoring system', async () => {
    const concepts = contentGenerator.generateBatch(15);

    // Find golden standard content
    const goldenContent = concepts.filter(c => c.goldenStandard.rating === 'GOLDEN');
    const goodContent = concepts.filter(c => c.goldenStandard.rating === 'GOOD');

    // Should have some high-quality content
    expect(goldenContent.length + goodContent.length).toBeGreaterThan(0);

    // Golden content should have high viral potential
    goldenContent.forEach(content => {
      expect(content.viralPotential).toBeGreaterThan(60);
      expect(content.goldenStandard.score).toBeGreaterThanOrEqual(75);
    });

    console.log(`⭐ Golden Standard Results: ${goldenContent.length} GOLDEN, ${goodContent.length} GOOD`);
  });

  test('validates diverse video injection system integration', async () => {
    // Test video injection with diverse content
    const injectedVideo = await videoInjectionSystem.generateAndInjectVideo();

    expect(injectedVideo).toBeDefined();
    expect(injectedVideo.type).toBeDefined();
    expect(injectedVideo.concept).toBeDefined();
    expect(injectedVideo.viralHook).toBeDefined();
    expect(injectedVideo.engagementTiming).toBe('FIRST_3_SECONDS');
    expect(injectedVideo.status).toBe('DIVERSE_CONTENT_ACTIVE');

    // Should prioritize historical_vlog or objects_comedy (70% chance)
    const priorityTypes = ['historical_vlog', 'objects_comedy'];
    const isDiverseContent = priorityTypes.includes(injectedVideo.type) ||
                            injectedVideo.id.includes('diverse_');

    expect(isDiverseContent).toBe(true);
    console.log('🎬 Injected Video Type:', injectedVideo.type);
  });

  test('ensures Spanish learning integration in all content', async () => {
    const concepts = contentGenerator.generateBatch(8);

    concepts.forEach(concept => {
      // Must have Spanish learning element
      expect(concept.spanishFocus).toBeDefined();
      expect(concept.spanishFocus.length).toBeGreaterThan(0);

      // Concept should integrate Spanish naturally
      const hasSpanishIntegration = concept.concept.toLowerCase().includes('spanish') ||
                                   concept.concept.toLowerCase().includes('vocabulary') ||
                                   concept.concept.toLowerCase().includes('pronunciation') ||
                                   concept.concept.toLowerCase().includes('grammar');

      expect(hasSpanishIntegration).toBe(true);
    });

    console.log('🇪🇸 Spanish Integration: All concepts include natural language learning');
  });

  test('validates content scalability and automation', async () => {
    // Test that system can generate large batches efficiently
    const startTime = Date.now();
    const largeBatch = contentGenerator.generateBatch(25);
    const endTime = Date.now();

    expect(largeBatch.length).toBe(25);
    expect(endTime - startTime).toBeLessThan(5000); // Should be fast (< 5 seconds)

    // Verify uniqueness in large batch
    const concepts = largeBatch.map(item => item.concept);
    const uniqueConcepts = [...new Set(concepts)];
    const uniquenessRatio = uniqueConcepts.length / concepts.length;

    expect(uniquenessRatio).toBeGreaterThan(0.7); // At least 70% unique

    console.log(`🚀 Scalability Test: Generated ${largeBatch.length} concepts in ${endTime - startTime}ms`);
    console.log(`📊 Uniqueness Ratio: ${(uniquenessRatio * 100).toFixed(1)}%`);
  });
});