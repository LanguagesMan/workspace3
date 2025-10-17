/**
 * 🧪 PERSONALIZATION SYSTEM TEST
 * 
 * Quick test script to verify personalization system is working
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ID = 'test_user_' + Date.now();

async function testPersonalizationSystem() {
    console.log('🧪 Testing Personalization System\n');
    console.log(`Test User ID: ${TEST_USER_ID}\n`);
    console.log('='.repeat(60));

    let allPassed = true;

    // Test 1: Get default preferences
    console.log('\n1️⃣  Test: GET /api/preferences (default)');
    try {
        const response = await fetch(`${BASE_URL}/api/preferences`, {
            headers: { 'x-user-id': TEST_USER_ID }
        });
        const data = await response.json();
        
        if (data.success && data.preferences) {
            console.log('✅ PASS: Got default preferences');
            console.log(`   - Favorite artists: ${data.preferences.favorite_artists?.length || 0}`);
            console.log(`   - Is default: ${data.isDefault}`);
        } else {
            console.log('❌ FAIL: Invalid response');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL:', error.message);
        allPassed = false;
    }

    // Test 2: Update preferences
    console.log('\n2️⃣  Test: PATCH /api/preferences (update)');
    try {
        const response = await fetch(`${BASE_URL}/api/preferences`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': TEST_USER_ID
            },
            body: JSON.stringify({
                favorite_artists: ['Bad Bunny', 'Shakira'],
                favorite_topics: ['technology', 'sports']
            })
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ PASS: Updated preferences');
            console.log(`   - Favorite artists: ${data.preferences.favorite_artists?.join(', ')}`);
            console.log(`   - Favorite topics: ${data.preferences.favorite_topics?.join(', ')}`);
        } else {
            console.log('❌ FAIL: Invalid response');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL:', error.message);
        allPassed = false;
    }

    // Test 3: Add to preference list
    console.log('\n3️⃣  Test: POST /api/preferences/add (add artist)');
    try {
        const response = await fetch(`${BASE_URL}/api/preferences/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': TEST_USER_ID
            },
            body: JSON.stringify({
                field: 'favorite_artists',
                value: 'J Balvin'
            })
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ PASS: Added J Balvin to favorites');
            console.log(`   - Current artists: ${data.favorite_artists?.join(', ')}`);
        } else {
            console.log('❌ FAIL: Invalid response');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL:', error.message);
        allPassed = false;
    }

    // Test 4: Track interaction
    console.log('\n4️⃣  Test: POST /api/personalization/track-interaction');
    try {
        const response = await fetch(`${BASE_URL}/api/personalization/track-interaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': TEST_USER_ID
            },
            body: JSON.stringify({
                userId: TEST_USER_ID,
                contentId: 'test_song_1',
                contentType: 'music',
                interactionType: 'complete',
                watchTime: 180,
                completionPercentage: 95,
                artist: 'Bad Bunny',
                genre: 'reggaeton'
            })
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ PASS: Tracked music interaction');
            console.log(`   - Interaction ID: ${data.interaction?.id || 'N/A'}`);
        } else {
            console.log('❌ FAIL: Invalid response');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL:', error.message);
        allPassed = false;
    }

    // Test 5: Get personalized music
    console.log('\n5️⃣  Test: GET /api/music/personalized');
    try {
        const response = await fetch(`${BASE_URL}/api/music/personalized?limit=5`, {
            headers: { 'x-user-id': TEST_USER_ID }
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ PASS: Got personalized music');
            console.log(`   - Count: ${data.count}`);
            console.log(`   - Personalized: ${data.personalized}`);
        } else {
            console.log('❌ FAIL: Invalid response');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL:', error.message);
        allPassed = false;
    }

    // Test 6: Get collections
    console.log('\n6️⃣  Test: GET /api/collections');
    try {
        const response = await fetch(`${BASE_URL}/api/collections`, {
            headers: { 'x-user-id': TEST_USER_ID }
        });
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ PASS: Got collections');
            console.log(`   - Count: ${data.count}`);
        } else {
            console.log('❌ FAIL: Invalid response');
            allPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL:', error.message);
        allPassed = false;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        console.log('✅ ALL TESTS PASSED!');
        console.log('\nPersonalization system is working correctly.');
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('\nPlease check the errors above.');
    }
    console.log('='.repeat(60));
}

// Run tests
console.log('Starting server connection test...');
console.log('Make sure the server is running on http://localhost:3001\n');

testPersonalizationSystem()
    .then(() => {
        console.log('\n✅ Test complete');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });

