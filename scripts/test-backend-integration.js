#!/usr/bin/env node

/**
 * 🧪 BACKEND INTEGRATION TEST
 * 
 * Tests:
 * 1. Environment variables loaded
 * 2. Supabase connection works
 * 3. API endpoints respond correctly
 * 4. Database operations (CRUD)
 */

const axios = require('axios');
const { supabase, isConfigured } = require('../lib/supabase-client');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${icon} ${name}`, color);
    if (details) {
        log(`   ${details}`, 'cyan');
    }
}

// Test configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
let testsPassed = 0;
let testsFailed = 0;

async function testEnvironmentVariables() {
    log('\n📋 Testing Environment Variables', 'bright');
    log('─'.repeat(50), 'cyan');

    const requiredEnvVars = {
        'SUPABASE_URL': process.env.SUPABASE_URL,
        'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
        'LIBRETRANSLATE_API_URL': process.env.LIBRETRANSLATE_API_URL,
        'NODE_ENV': process.env.NODE_ENV
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
        const exists = !!value;
        const isPlaceholder = value && (
            value.includes('your_') || 
            value.includes('_here')
        );
        
        if (exists && !isPlaceholder) {
            logTest(`${key} is set`, true, value.substring(0, 30) + '...');
            testsPassed++;
        } else if (isPlaceholder) {
            logTest(`${key} needs to be configured`, false, 'Still using placeholder value');
            testsFailed++;
        } else {
            logTest(`${key} is missing`, false);
            testsFailed++;
        }
    }
}

async function testSupabaseConnection() {
    log('\n🔌 Testing Supabase Connection', 'bright');
    log('─'.repeat(50), 'cyan');

    // Test 1: Client is configured
    const configured = isConfigured();
    logTest('Supabase client configured', configured);
    if (configured) testsPassed++; else testsFailed++;

    if (!configured) {
        log('   ⚠️  Supabase is not configured. Set credentials in .env file.', 'yellow');
        return;
    }

    // Test 2: Can query a table
    try {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === 'PGRST116') {
                logTest('Query user_preferences table', false, 'Table does not exist - run migrations');
                testsFailed++;
            } else {
                logTest('Query user_preferences table', false, error.message);
                testsFailed++;
            }
        } else {
            logTest('Query user_preferences table', true, `Found ${data.length} records`);
            testsPassed++;
        }
    } catch (err) {
        logTest('Query user_preferences table', false, err.message);
        testsFailed++;
    }

    // Test 3: Check articles table
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === 'PGRST116') {
                logTest('Query articles table', false, 'Table does not exist - run migrations');
                testsFailed++;
            } else {
                logTest('Query articles table', false, error.message);
                testsFailed++;
            }
        } else {
            logTest('Query articles table', true, `Found ${data.length} records`);
            testsPassed++;
        }
    } catch (err) {
        logTest('Query articles table', false, err.message);
        testsFailed++;
    }
}

async function testAPIEndpoints() {
    log('\n🌐 Testing API Endpoints', 'bright');
    log('─'.repeat(50), 'cyan');

    // Test 1: GET /api/articles/feed
    try {
        log('Testing GET /api/articles/feed...', 'cyan');
        const response = await axios.get(`${API_BASE_URL}/articles/feed`, {
            params: {
                userId: 'test-user',
                category: 'all',
                limit: 5
            },
            timeout: 30000 // 30 second timeout
        });

        const success = response.status === 200 && response.data.success;
        logTest('GET /api/articles/feed', success, 
            success ? `Returned ${response.data.articles.length} articles` : 'Failed'
        );

        if (success) {
            testsPassed++;
            
            // Verify article structure
            if (response.data.articles.length > 0) {
                const article = response.data.articles[0];
                const hasRequiredFields = article.id && article.title && article.source;
                logTest('Article has required fields', hasRequiredFields, 
                    `Sample: ${article.title?.substring(0, 50)}...`
                );
                if (hasRequiredFields) testsPassed++; else testsFailed++;
            }
        } else {
            testsFailed++;
        }
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            logTest('GET /api/articles/feed', false, 'Server not running. Start with: node server.js');
        } else {
            logTest('GET /api/articles/feed', false, err.message);
        }
        testsFailed++;
    }

    // Test 2: POST /api/articles/analyze
    try {
        log('Testing POST /api/articles/analyze...', 'cyan');
        const response = await axios.post(`${API_BASE_URL}/articles/analyze`, {
            articleText: 'Hola, ¿cómo estás? Esta es una prueba simple.',
            userId: 'test-user'
        }, {
            timeout: 30000
        });

        const success = response.status === 200 && response.data.success;
        logTest('POST /api/articles/analyze', success,
            success ? 'Analysis completed' : 'Failed'
        );

        if (success) {
            testsPassed++;
            
            // Verify analysis structure
            if (response.data.analysis) {
                const hasAnalysis = response.data.analysis.cefrLevel;
                logTest('Analysis includes CEFR level', hasAnalysis,
                    hasAnalysis ? `Level: ${response.data.analysis.cefrLevel}` : 'Missing'
                );
                if (hasAnalysis) testsPassed++; else testsFailed++;
            }
        } else {
            testsFailed++;
        }
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            logTest('POST /api/articles/analyze', false, 'Server not running');
        } else {
            logTest('POST /api/articles/analyze', false, err.message);
        }
        testsFailed++;
    }
}

async function testDatabaseOperations() {
    log('\n💾 Testing Database Operations', 'bright');
    log('─'.repeat(50), 'cyan');

    if (!isConfigured()) {
        log('   ⚠️  Skipping - Supabase not configured', 'yellow');
        return;
    }

    // Test: Insert a test article
    try {
        const testArticle = {
            id: `test-article-${Date.now()}`,
            title: 'Test Article',
            title_english: 'Test Article',
            content: 'This is a test article for integration testing.',
            excerpt: 'Test excerpt',
            source: 'Test Source',
            article_url: `https://test.com/article-${Date.now()}`,
            category: 'technology',
            difficulty: 'B1',
            author: 'Test Author',
            published_at: new Date().toISOString(),
            fetch_time: new Date().toISOString(),
            verified: true
        };

        const { data, error } = await supabase
            .from('articles')
            .insert([testArticle])
            .select();

        if (error) {
            logTest('Insert test article', false, error.message);
            testsFailed++;
        } else {
            logTest('Insert test article', true, `ID: ${testArticle.id}`);
            testsPassed++;

            // Clean up: Delete test article
            const { error: deleteError } = await supabase
                .from('articles')
                .delete()
                .eq('id', testArticle.id);

            if (!deleteError) {
                logTest('Delete test article', true, 'Cleanup successful');
                testsPassed++;
            } else {
                logTest('Delete test article', false, deleteError.message);
                testsFailed++;
            }
        }
    } catch (err) {
        logTest('Database operations', false, err.message);
        testsFailed++;
    }
}

async function printSummary() {
    log('\n' + '═'.repeat(50), 'cyan');
    log('📊 TEST SUMMARY', 'bright');
    log('═'.repeat(50), 'cyan');
    
    const total = testsPassed + testsFailed;
    const successRate = total > 0 ? Math.round((testsPassed / total) * 100) : 0;
    
    log(`\nTotal Tests: ${total}`, 'cyan');
    log(`Passed: ${testsPassed}`, 'green');
    log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
    log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');

    if (testsFailed === 0) {
        log('\n🎉 All tests passed! Backend is ready.', 'green');
    } else {
        log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
        
        if (process.env.SUPABASE_URL?.includes('your_')) {
            log('\n💡 Next steps:', 'bright');
            log('   1. Copy .env.example to .env', 'cyan');
            log('   2. Fill in your Supabase credentials', 'cyan');
            log('   3. Run migrations: node scripts/apply-supabase-migrations.js', 'cyan');
            log('   4. Start server: node server.js', 'cyan');
            log('   5. Re-run tests: node scripts/test-backend-integration.js', 'cyan');
        }
    }
    
    log('');
}

async function main() {
    log('\n🧪 BACKEND INTEGRATION TEST SUITE', 'bright');
    log('═'.repeat(50), 'cyan');

    try {
        await testEnvironmentVariables();
        await testSupabaseConnection();
        await testAPIEndpoints();
        await testDatabaseOperations();
        await printSummary();

        process.exit(testsFailed > 0 ? 1 : 0);

    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        log(`Stack: ${error.stack}`, 'red');
        process.exit(1);
    }
}

// Run tests
main();

