// Verify Supabase Database Tables
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bsayrshgplgfrxonmreo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzYXlyc2hncGxnZnJ4b25tcmVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5MjExNjEsImV4cCI6MjA0MTQ5NzE2MX0.uUh7pQVBv8Mu-pVNjP4j2lZPMJZi5vwGf5hNQvJZbUk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyDatabase() {
  console.log('📊 Verifying Supabase database tables...\n');

  const tablesToCheck = [
    'word_interactions',
    'user_level_history',
    'user_profiles',
    'video_progress',
    'adaptive_recommendations',
    'learning_sessions'
  ];

  const results = {
    existing: [],
    missing: []
  };

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('does not exist') || error.code === 'PGRST204' || error.code === '42P01') {
          console.log(`   ❌ ${table}: NOT FOUND (${error.message})`);
          results.missing.push(table);
        } else {
          console.log(`   ⚠️  ${table}: ERROR - ${error.message}`);
          results.missing.push(table);
        }
      } else {
        console.log(`   ✅ ${table}: EXISTS (${count || 0} rows)`);
        results.existing.push(table);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ERROR - ${err.message}`);
      results.missing.push(table);
    }
  }

  console.log('\n📈 Summary:');
  console.log(`   ✅ Tables existing: ${results.existing.length}/${tablesToCheck.length}`);
  console.log(`   ❌ Tables missing: ${results.missing.length}/${tablesToCheck.length}`);

  if (results.missing.length > 0) {
    console.log('\n⚠️  Missing tables:', results.missing.join(', '));
    console.log('\n📝 TO FIX: You need to manually execute the SQL schema in Supabase SQL Editor:');
    console.log(`   1. Go to: https://supabase.com/dashboard/project/bsayrshgplgfrxonmreo/sql/new`);
    console.log(`   2. Copy the contents of: supabase-adaptive-learning-schema.sql`);
    console.log(`   3. Paste and execute in SQL Editor`);
    console.log(`   4. Re-run this script to verify`);
  } else {
    console.log('\n✅ All database tables are set up correctly!');
  }
}

verifyDatabase().catch(console.error);
