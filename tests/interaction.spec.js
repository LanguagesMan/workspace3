import fetch from 'node-fetch';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

const healthFile = 'autopilot/state/health.ok';

async function testInteractivity() {
  try {
    const response = await fetch('http://localhost:3002');
    const html = await response.text();

    // Check for interactive elements
    if (!html.includes('onclick=')) {
      throw new Error('No interactive elements found');
    }

    // Check for clickable words in subtitles
    if (!html.includes('translate(')) {
      throw new Error('Translation functionality not found');
    }

    // Check for video elements
    if (!html.includes('<video')) {
      throw new Error('Video elements missing');
    }

    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'PASS',
      interaction_checks: {
        clickable_elements: true,
        translation_functionality: true,
        video_elements: true
      }
    };

    writeFileSync(healthFile, JSON.stringify(healthData, null, 2));
    console.log('✅ Interactivity test PASSED');

  } catch (error) {
    if (existsSync(healthFile)) {
      unlinkSync(healthFile);
    }
    console.error(`❌ Interactivity test FAILED: ${error.message}`);
    process.exit(1);
  }
}

testInteractivity();