import fetch from 'node-fetch';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

const healthFile = 'autopilot/state/health.ok';

async function testAccessibility() {
  try {
    const response = await fetch('http://localhost:3002');
    const html = await response.text();

    // Check for ARIA labels
    if (!html.includes('aria-label=')) {
      throw new Error('Missing ARIA labels for accessibility');
    }

    // Check for semantic roles
    if (!html.includes('role="main"')) {
      throw new Error('Missing semantic role attributes');
    }

    // Check for proper heading structure (h1 present but may be visually hidden)
    if (!html.includes('h1')) {
      throw new Error('Missing proper heading structure');
    }

    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'PASS',
      accessibility_checks: {
        aria_labels: true,
        semantic_roles: true,
        heading_structure: true
      }
    };

    writeFileSync(healthFile, JSON.stringify(healthData, null, 2));
    console.log('✅ Accessibility test PASSED');

  } catch (error) {
    if (existsSync(healthFile)) {
      unlinkSync(healthFile);
    }
    console.error(`❌ Accessibility test FAILED: ${error.message}`);
    process.exit(1);
  }
}

testAccessibility();