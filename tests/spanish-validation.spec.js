import fetch from 'node-fetch';
import { SpanishFeedAlgorithm } from '../src/spanishFeedAlgorithm.js';

async function validateSpanishContent() {
  try {
    // Test Spanish feed algorithm directly
    const algorithm = new SpanishFeedAlgorithm();
    const recommendations = algorithm.generateFeedRecommendations(5);

    console.log('🔍 Testing Spanish content generation...');

    // Test each recommendation
    for (const rec of recommendations) {
      if (!algorithm.validateSpanishContent(rec)) {
        throw new Error(`Invalid Spanish content in recommendation: ${rec.id}`);
      }

      // Check for actual Spanish text
      if (!rec.spanishContent || rec.spanishContent.length === 0) {
        throw new Error(`Missing Spanish content in: ${rec.id}`);
      }

      // Validate Spanish characters or words
      const hasSpanishIndicators = /[ñáéíóúü¿¡]|(\b(el|la|los|las|un|una|y|o|pero|que|de|en|con|por|para|si|no|sí|hola|gracias|buenos|días|noches|cómo|qué|cuánto|dónde|hablas|español)\b)/gi.test(rec.spanishContent);

      if (!hasSpanishIndicators) {
        throw new Error(`No Spanish language indicators found in: ${rec.spanishContent}`);
      }

      console.log(`✅ Valid Spanish content: ${rec.type} - "${rec.spanishContent}"`);
    }

    // Test server integration
    const response = await fetch('http://localhost:3002');
    const html = await response.text();

    // Check if Spanish content appears in feed - check for language learning content
    if (!html.includes('Language Learning') && !html.includes('Spanish Learning') && !html.includes('Languide')) {
      throw new Error('Spanish feed section not found in server response');
    }

    if (!html.includes('feed') && !html.includes('container') && !html.includes('content')) {
      throw new Error('Spanish feed container not found');
    }

    // Check for Spanish text in HTML
    const spanishTextPattern = /[ñáéíóúü¿¡]|(\b(el|la|los|las|un|una|y|o|pero|que|de|en|con|por|para|si|no|sí|hola|gracias|buenos|días|noches|cómo|qué|cuánto|dónde|hablas|español)\b)/gi;

    if (!spanishTextPattern.test(html)) {
      throw new Error('No Spanish text found in server HTML response');
    }

    console.log('✅ Spanish content validation PASSED');
    console.log(`📊 Generated ${recommendations.length} valid Spanish recommendations`);
    console.log(`🎯 Average viral potential: ${Math.round(recommendations.reduce((sum, r) => sum + r.viralPotential, 0) / recommendations.length)}%`);
    console.log(`🏆 Average feed priority: ${Math.round(recommendations.reduce((sum, r) => sum + r.feedPriority, 0) / recommendations.length)}`);

    return true;

  } catch (error) {
    console.error(`❌ Spanish content validation FAILED: ${error.message}`);
    process.exit(1);
  }
}

validateSpanishContent();