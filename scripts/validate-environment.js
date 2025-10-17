#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks all required environment variables and service connections
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
  green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(name, value, required = true) {
  if (value && value !== 'YOUR_xxx_HERE' && !value.includes('YOUR_')) {
    log(`✅ ${name}: Configured`, 'green');
    return true;
  } else if (required) {
    log(`❌ ${name}: MISSING (REQUIRED)`, 'red');
    return false;
  } else {
    log(`⚠️  ${name}: Not configured (optional)`, 'yellow');
    return true;
  }
}

async function validateEnvironment() {
  log('\n🔍 LANGFLIX ENVIRONMENT VALIDATION\n', 'cyan');
  log('Checking required environment variables...\n', 'blue');

  let allRequired = true;
  let optionalCount = 0;

  // SERVER CONFIGURATION
  log('📌 Server Configuration:', 'blue');
  allRequired &= check('NODE_ENV', process.env.NODE_ENV);
  allRequired &= check('PORT', process.env.PORT);
  allRequired &= check('JWT_SECRET', process.env.JWT_SECRET);
  allRequired &= check('SESSION_SECRET', process.env.SESSION_SECRET);
  console.log('');

  // DATABASE
  log('📌 Database (PostgreSQL/Neon):', 'blue');
  const hasDatabase = check('DATABASE_URL', process.env.DATABASE_URL);
  allRequired &= hasDatabase;
  console.log('');

  // SUPABASE
  log('📌 Supabase (Authentication):', 'blue');
  allRequired &= check('SUPABASE_URL', process.env.SUPABASE_URL);
  allRequired &= check('SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY);
  allRequired &= check('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('');

  // OPENAI
  log('📌 OpenAI API:', 'blue');
  allRequired &= check('OPENAI_API_KEY', process.env.OPENAI_API_KEY);
  console.log('');

  // STRIPE
  log('📌 Stripe (Payments):', 'blue');
  allRequired &= check('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
  allRequired &= check('STRIPE_PUBLISHABLE_KEY', process.env.STRIPE_PUBLISHABLE_KEY);
  check('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET, false);
  console.log('');

  // OPTIONAL SERVICES
  log('📌 Optional Services:', 'blue');
  if (check('PERPLEXITY_API_KEY', process.env.PERPLEXITY_API_KEY, false)) optionalCount++;
  if (check('DEEPL_API_KEY', process.env.DEEPL_API_KEY, false)) optionalCount++;
  if (check('GOOGLE_TRANSLATE_API_KEY', process.env.GOOGLE_TRANSLATE_API_KEY, false)) optionalCount++;
  if (check('FIRECRAWL_API_KEY', process.env.FIRECRAWL_API_KEY, false)) optionalCount++;
  if (check('SENTRY_DSN', process.env.SENTRY_DSN, false)) optionalCount++;
  console.log('');

  // TEST DATABASE CONNECTION
  if (hasDatabase) {
    log('🔌 Testing database connection...', 'blue');
    try {
      const prisma = new PrismaClient();
      await prisma.$connect();
      log('✅ Database connection successful!', 'green');
      await prisma.$disconnect();
    } catch (error) {
      log(`❌ Database connection failed: ${error.message}`, 'red');
      allRequired = false;
    }
    console.log('');
  }

  // SUMMARY
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  if (allRequired) {
    log('\n✨ ALL REQUIRED SERVICES CONFIGURED!\n', 'green');
    log('Next steps:', 'blue');
    log('1. Run: npx prisma generate', 'cyan');
    log('2. Run: npx prisma db push', 'cyan');
    log('3. Run: npm run start:server', 'cyan');
    log('4. Open: http://localhost:3001\n', 'cyan');
  } else {
    log('\n❌ SETUP INCOMPLETE\n', 'red');
    log('Missing required services. Please:', 'yellow');
    log('1. Read: SETUP_INSTRUCTIONS.md', 'cyan');
    log('2. Create .env file with all required keys', 'cyan');
    log('3. Run this script again to verify\n', 'cyan');
  }

  log(`Optional services configured: ${optionalCount}/5`, 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  process.exit(allRequired ? 0 : 1);
}

// Run validation
validateEnvironment().catch((error) => {
  log(`\n❌ Validation failed: ${error.message}\n`, 'red');
  process.exit(1);
});
