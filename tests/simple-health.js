import fetch from 'node-fetch';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

const healthFile = 'autopilot/state/health.ok';

async function runHealthCheck() {
  const startTime = Date.now();

  try {
    console.log('🔍 Starting health check...');

    // Test server response
    const response = await fetch('http://localhost:3001', {
      timeout: 5000
    });

    const loadTime = Date.now() - startTime;

    if (response.status !== 200) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const html = await response.text();

    // Check for app-root element or main content
    if (!html.includes('data-testid="app-root"') && !html.includes('id="ultimate-smart-feed"')) {
      throw new Error('app-root element not found');
    }

    // Check for Spanish content
    if (!html.match(/español|spanish/i)) {
      throw new Error('Spanish content not found');
    }

    // Create health file on success
    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'PASS',
      loadTime: loadTime,
      checks: {
        server_response: true,
        app_root_present: true,
        spanish_content: true,
        ttfb_under_800ms: loadTime < 800
      }
    };

    writeFileSync(healthFile, JSON.stringify(healthData, null, 2));

    console.log(`✅ Health check PASSED - Load time: ${loadTime}ms`);
    process.exit(0);

  } catch (error) {
    // Delete health file on failure
    if (existsSync(healthFile)) {
      unlinkSync(healthFile);
    }

    console.error(`❌ Health check FAILED: ${error.message}`);
    process.exit(1);
  }
}

runHealthCheck();