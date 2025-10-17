import { ContentGenerator } from '../src/contentGenerator.js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

const healthFile = 'autopilot/state/health.ok';

async function testViralPotential() {
  try {
    const generator = new ContentGenerator();
    const concepts = generator.generateBatch(10);

    const viralScores = concepts.map(c => c.viralPotential);
    const avgScore = viralScores.reduce((a, b) => a + b, 0) / viralScores.length;
    const minScore = Math.min(...viralScores);

    if (avgScore < 70) {
      throw new Error(`Average viral score ${avgScore}% below 70% target`);
    }

    if (minScore < 30) {
      throw new Error(`Minimum viral score ${minScore}% below 30% baseline`);
    }

    // Update health file
    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'PASS',
      viral_metrics: {
        average_score: Math.round(avgScore),
        min_score: minScore,
        max_score: Math.max(...viralScores),
        target_met: avgScore >= 70
      }
    };

    writeFileSync(healthFile, JSON.stringify(healthData, null, 2));
    console.log(`✅ Viral potential test PASSED - Avg: ${Math.round(avgScore)}%`);

  } catch (error) {
    if (existsSync(healthFile)) {
      unlinkSync(healthFile);
    }
    console.error(`❌ Viral potential test FAILED: ${error.message}`);
    process.exit(1);
  }
}

testViralPotential();