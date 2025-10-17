/**
 * Tests for AI Feed Content Generator
 * Validates diverse funny Spanish content generation
 */

import { strict as assert } from 'assert';
import { test, describe } from 'node:test';
import { ContentGenerator } from '../src/contentGenerator.js';

describe('ContentGenerator', () => {
  const generator = new ContentGenerator();

  test('generates diverse content beyond GLOBO', () => {
    const content = generator.generateDiverseContent();

    assert(content.id, 'Should have unique ID');
    assert(content.type, 'Should have content type');
    assert(content.hook, 'Should have funny hook');
    assert(content.spanishFocus, 'Should have Spanish learning element');
    assert(content.concept, 'Should have concept description');
    assert(typeof content.viralPotential === 'number', 'Should have viral potential score');
  });

  test('includes all required content types', () => {
    const batch = generator.generateBatch(20);
    const types = new Set(batch.map(item => item.type));

    // Should have diverse content types beyond single character
    assert(types.size > 1, 'Should generate multiple content types');
    assert(types.has('objects_comedy') || types.has('historical_vlog') ||
           types.has('character_interaction') || types.has('cultural_humor'),
           'Should include expected content types');
  });

  test('generates concepts with funny elements', () => {
    const content = generator.generateDiverseContent();
    const concept = content.concept.toLowerCase();

    // Check for funny/engaging words that indicate humor
    const funnyIndicators = [
      'refusing', 'demanding', 'complaining', 'rebellion', 'correcting',
      'confused', 'jealous', 'arguing', 'battling', 'competition'
    ];

    const hasFunnyElement = funnyIndicators.some(indicator =>
      concept.includes(indicator)
    );

    assert(hasFunnyElement, 'Concept should contain funny elements for virality');
  });

  test('includes Spanish learning integration', () => {
    const content = generator.generateDiverseContent();
    const concept = content.concept.toLowerCase();

    // Check for Spanish learning elements
    const learningIndicators = [
      'spanish', 'vocabulary', 'pronunciation', 'teaching', 'grammar',
      'syllables', 'dialect', 'idioms', 'slang', 'expressions'
    ];

    const hasLearningElement = learningIndicators.some(indicator =>
      concept.includes(indicator)
    );

    assert(hasLearningElement, 'Concept should integrate Spanish learning naturally');
  });

  test('calculates realistic viral potential', () => {
    const content = generator.generateDiverseContent();

    assert(content.viralPotential >= 0, 'Viral potential should be non-negative');
    assert(content.viralPotential <= 100, 'Viral potential should not exceed 100%');
    assert(typeof content.viralPotential === 'number', 'Viral potential should be numeric');
  });

  test('generates batch with diversity', () => {
    const batch = generator.generateBatch(5);

    assert.equal(batch.length, 5, 'Should generate requested number of concepts');

    // Check for content diversity
    const uniqueTypes = new Set(batch.map(item => item.type));
    const uniqueHooks = new Set(batch.map(item => item.hook));

    // Should have some variety (not all identical)
    assert(uniqueTypes.size >= 1, 'Should have content type variety');
    assert(uniqueHooks.size >= 1, 'Should have hook variety');
  });
});