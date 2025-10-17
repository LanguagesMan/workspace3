/**
 * Quick Authentication Test
 * Tests if Supabase is properly configured
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uejiwteujraxczrxbqff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaml3dGV1anJheGN6cnhicWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDMxMzksImV4cCI6MjA3NTUxOTEzOX0.iva8q5bMcLHfqd6niXqB_i-i-VrPmKLNGr9eiiPwZHQ';

async function testAuth() {
    console.log('\n🔐 Testing Supabase Authentication...\n');
    
    try {
        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
        
        // Test 1: Check if we can connect
        console.log('\n📡 Test 1: Testing connection...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.log('   ℹ️  No active session (this is normal for first run)');
        } else {
            console.log('   ✅ Connection successful');
        }
        
        // Test 2: Check if user_profiles table exists
        console.log('\n📊 Test 2: Checking database tables...');
        const { data: tables, error: tableError } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1);
        
        if (tableError) {
            if (tableError.code === '42P01') {
                console.log('   ⚠️  user_profiles table does NOT exist yet');
                console.log('   📋 You need to run the SQL migrations from AUTH_SETUP_GUIDE.md');
                return false;
            } else {
                console.log('   ⚠️  Error:', tableError.message);
                return false;
            }
        } else {
            console.log('   ✅ user_profiles table exists!');
        }
        
        // Test 3: Try to sign up (will check if auth is enabled)
        console.log('\n🔑 Test 3: Testing signup capability...');
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    learningLevel: 'B1',
                    nativeLanguage: 'en',
                    targetLanguage: 'es'
                }
            }
        });
        
        if (signupError) {
            console.log('   ⚠️  Signup test failed:', signupError.message);
            if (signupError.message.includes('Email') || signupError.message.includes('email')) {
                console.log('   ℹ️  This might be because email auth needs to be configured in Supabase');
            }
            return false;
        } else {
            console.log('   ✅ Signup works! User created:', signupData.user?.id);
            console.log('   ℹ️  Check your email for verification link');
        }
        
        console.log('\n╔══════════════════════════════════════════╗');
        console.log('║  ✅ SUPABASE AUTHENTICATION READY!      ║');
        console.log('╚══════════════════════════════════════════╝\n');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

testAuth().then(success => {
    if (success) {
        console.log('✅ All tests passed! You can use the authentication system.\n');
        console.log('📋 Next step: Open http://localhost:3001/discover-articles.html');
        console.log('   Click "Sign In" and try creating an account!\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  Setup incomplete. Follow these steps:\n');
        console.log('1. Go to https://app.supabase.com/project/uejiwteujraxczrxbqff');
        console.log('2. Go to SQL Editor');
        console.log('3. Run the SQL from AUTH_SETUP_GUIDE.md (creates user_profiles table)');
        console.log('4. Enable Email Auth in Authentication > Providers\n');
        process.exit(1);
    }
});

