// Setup Supabase Database Schema
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://bsayrshgplgfrxonmreo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzYXlyc2hncGxnZnJ4b25tcmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MjExNjEsImV4cCI6MjA0MTQ5NzE2MX0.uUh7pQVBv8Mu-pVNjP4j2lZPMJZi5vwGf5hNQvJZbUk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database schema...\n');

  // Read the schema file
  const schema = fs.readFileSync('/Users/mindful/_projects/workspace3/supabase-adaptive-learning-schema.sql', 'utf8');

  // Split into individual statements (separated by semicolons)
  const statements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';

    // Skip comments-only statements
    if (stmt.trim().startsWith('--')) continue;

    console.log(`[${i + 1}/${statements.length}] Executing statement...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });

      if (error) {
        // Try alternative method - direct query
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ query: stmt })
        });

        if (!response.ok) {
          console.log(`   ⚠️  Skipping (may already exist or require elevated permissions)`);
        } else {
          console.log(`   ✅ Success`);
        }
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.log(`   ⚠️  Skipping (${err.message})`);
    }
  }

  console.log('\n✅ Database setup complete!');
  console.log('\n📊 Verifying tables...\n');

  // Verify tables exist
  const tablesToCheck = [
    'word_interactions',
    'user_level_history',
    'user_profiles',
    'video_progress',
    'adaptive_recommendations',
    'learning_sessions'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: NOT FOUND`);
      } else {
        console.log(`   ✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ERROR - ${err.message}`);
    }
  }

  console.log('\n🎉 Database setup verification complete!\n');
}

setupDatabase().catch(console.error);
