/**
 * 🧪 FULL INTEGRATION TEST
 * Tests complete system integration: Backend + Frontend + Database
 */

const http = require('http');
const fs = require('fs');

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
    console.log('');
    log('═'.repeat(70), 'magenta');
    log(`  ${title}`, 'magenta');
    log('═'.repeat(70), 'magenta');
}

async function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(data)
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

async function testIntegration() {
    log('\n🚀 Starting Full Integration Test...', 'cyan');
    
    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };
    
    // ==================== TEST 1: SERVER HEALTH ====================
    section('TEST 1: Server Health Check');
    
    try {
        const response = await makeRequest('/api/health');
        
        if (response.statusCode === 200) {
            log('✅ Server is running', 'green');
            results.passed++;
        } else {
            log(`❌ Server health check failed: ${response.statusCode}`, 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ Server not running: ${error.message}`, 'red');
        log('   Please start server: node server.js', 'yellow');
        results.failed++;
        results.total++;
    }
    
    // ==================== TEST 2: ADAPTIVE API ENDPOINTS ====================
    section('TEST 2: Adaptive API Endpoints');
    
    // Test user profile endpoint
    try {
        const response = await makeRequest('/api/adaptive/user-profile/test_user_123');
        
        if (response.statusCode === 200 && response.data.success) {
            log('✅ User profile endpoint working', 'green');
            results.passed++;
        } else {
            log(`❌ User profile endpoint failed`, 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ User profile endpoint error: ${error.message}`, 'red');
        results.failed++;
        results.total++;
    }
    
    // Test track interaction endpoint
    try {
        const response = await makeRequest('/api/adaptive/track-interaction', 'POST', {
            userId: 'test_user_123',
            interactionType: 'word_click',
            data: {
                word: 'hola',
                timestamp: Date.now()
            }
        });
        
        if (response.statusCode === 200 && response.data.success) {
            log('✅ Track interaction endpoint working', 'green');
            results.passed++;
        } else {
            log(`❌ Track interaction endpoint failed`, 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ Track interaction endpoint error: ${error.message}`, 'red');
        results.failed++;
        results.total++;
    }
    
    // Test adjust level endpoint
    try {
        const response = await makeRequest('/api/adaptive/adjust-level', 'POST', {
            userId: 'test_user_123',
            signal: 'too_hard',
            value: 'content_123'
        });
        
        if (response.statusCode === 200 && response.data.success) {
            log('✅ Adjust level endpoint working', 'green');
            log(`   Level adjustment: ${response.data.adjustment?.action || 'completed'}`, 'yellow');
            results.passed++;
        } else {
            log(`❌ Adjust level endpoint failed`, 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ Adjust level endpoint error: ${error.message}`, 'red');
        results.failed++;
        results.total++;
    }
    
    // Test simplify endpoint
    try {
        const response = await makeRequest('/api/adaptive/simplify', 'POST', {
            text: 'El gobierno implementó nuevas políticas económicas',
            targetLevel: 'A2'
        });
        
        if (response.statusCode === 200 && response.data.success) {
            log('✅ Simplify endpoint working', 'green');
            log(`   Simplified: ${response.data.wordsChanged} words changed`, 'yellow');
            results.passed++;
        } else {
            log(`❌ Simplify endpoint failed`, 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ Simplify endpoint error: ${error.message}`, 'red');
        results.failed++;
        results.total++;
    }
    
    // Test perfect content endpoint
    try {
        const response = await makeRequest('/api/adaptive/perfect-content/test_user_123?limit=5');
        
        if (response.statusCode === 200 && response.data.success) {
            log('✅ Perfect content endpoint working', 'green');
            results.passed++;
        } else {
            log(`❌ Perfect content endpoint failed`, 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ Perfect content endpoint error: ${error.message}`, 'red');
        results.failed++;
        results.total++;
    }
    
    // ==================== TEST 3: UI COMPONENTS ====================
    section('TEST 3: UI Components Integration');
    
    // Check if video feed has adaptive components
    try {
        const videoFeed = fs.readFileSync('public/tiktok-video-feed.html', 'utf8');
        
        const hasAdaptiveControls = videoFeed.includes('adaptive-difficulty-controls.html');
        const hasBeginnerHelper = videoFeed.includes('beginner-mode-helper.html');
        const hasIntegration = videoFeed.includes('AdaptiveDifficultyControls');
        
        if (hasAdaptiveControls && hasBeginnerHelper && hasIntegration) {
            log('✅ UI components integrated in video feed', 'green');
            results.passed++;
        } else {
            log('❌ UI components not fully integrated', 'red');
            results.failed++;
        }
        results.total++;
    } catch (error) {
        log(`❌ UI integration check failed: ${error.message}`, 'red');
        results.failed++;
        results.total++;
    }
    
    // ==================== TEST 4: SYSTEM FILES ====================
    section('TEST 4: System Files Verification');
    
    const requiredFiles = [
        'lib/spanish-frequency-words-extended.js',
        'lib/genius-adaptive-system.js',
        'lib/behavioral-tracker.js',
        'api/adaptive/adjust-level.js',
        'api/adaptive/perfect-content.js',
        'api/adaptive/simplify.js',
        'api/adaptive/track-interaction.js',
        'api/adaptive/user-profile.js',
        'public/components/adaptive-difficulty-controls.html',
        'public/components/beginner-mode-helper.html',
        'supabase-genius-adaptive-schema.sql'
    ];
    
    let filesPresent = 0;
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            filesPresent++;
        }
    });
    
    if (filesPresent === requiredFiles.length) {
        log(`✅ All ${requiredFiles.length} required files present`, 'green');
        results.passed++;
    } else {
        log(`❌ Missing ${requiredFiles.length - filesPresent} files`, 'red');
        results.failed++;
    }
    results.total++;
    
    // ==================== FINAL RESULTS ====================
    section('INTEGRATION TEST RESULTS');
    
    const percentage = ((results.passed / results.total) * 100).toFixed(1);
    
    log('', 'reset');
    log(`Total Tests: ${results.total}`, 'cyan');
    log(`✅ Passed: ${results.passed}`, 'green');
    log(`❌ Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
    log(`Success Rate: ${percentage}%`, results.failed === 0 ? 'green' : 'yellow');
    log('', 'reset');
    
    if (results.failed === 0) {
        log('🎉 FULL INTEGRATION TEST PASSED!', 'green');
        log('   ✅ Server running', 'green');
        log('   ✅ API endpoints working', 'green');
        log('   ✅ UI components integrated', 'green');
        log('   ✅ All files present', 'green');
        log('', 'reset');
        log('🚀 System is ready for production deployment!', 'cyan');
    } else {
        log('⚠️  Some integration tests failed', 'yellow');
        log('   Please review the errors above', 'yellow');
    }
    
    return results.failed === 0;
}

if (require.main === module) {
    testIntegration()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            log(`\n❌ Integration test failed: ${error.message}`, 'red');
            console.error(error);
            process.exit(1);
        });
}

module.exports = { testIntegration };

