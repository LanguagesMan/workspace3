/**
 * AI Feed Main Entry Point
 * Demonstrates diverse funny Spanish content generation beyond GLOBO
 */

import { ContentGenerator } from './contentGenerator.js';

async function main() {
  console.log('🎬 AI Feed: Diverse Spanish Learning Content Generator');
  console.log('🎯 Focus: Beyond GLOBO - Funny, Viral, Educational\n');

  const generator = new ContentGenerator();

  // Generate diverse content batch
  const concepts = generator.generateBatch(3);

  // Sort by golden standard score (highest first) to surface best content
  concepts.sort((a, b) => (b.goldenStandard?.score || 0) - (a.goldenStandard?.score || 0));

  console.log('📺 Generated Video Concepts (sorted by golden standard):\n');

  concepts.forEach((concept, index) => {
    console.log(`${index + 1}. Type: ${concept.type}`);
    console.log(`   Hook: ${concept.hook}`);
    console.log(`   Spanish Focus: ${concept.spanishFocus}`);
    console.log(`   Concept: ${concept.concept}`);
    console.log(`   Viral Potential: ${concept.viralPotential}%`);
    console.log(`   ID: ${concept.id}\n`);
  });

  console.log('✅ Content generation complete - Ready for video production');
  console.log('🎭 All concepts include funny hooks within first 3 seconds');
  console.log('🌍 Expanding Spanish learning beyond single character approach');

  return concepts;
}

// Export for testing and external use
export { main, ContentGenerator };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}