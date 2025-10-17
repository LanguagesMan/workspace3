#!/usr/bin/env node
/**
 * Script to inject Sentry configuration into all HTML pages
 * Adds meta tags and script tag to <head> section
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Sentry meta tags and script to inject
const SENTRY_INJECTION = `
    <!-- Sentry Error Tracking -->
    <meta name="sentry-dsn" content="">
    <meta name="sentry-environment" content="production">
    <meta name="sentry-traces-sample-rate" content="0.1">
    <meta name="app-version" content="1.0.0">
    <script src="/lib/sentry-client.js" defer></script>
`;

// Marker to check if already injected
const SENTRY_MARKER = 'Sentry Error Tracking';

/**
 * Inject Sentry into HTML file
 */
function injectSentryIntoHTML(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if already injected
    if (content.includes(SENTRY_MARKER)) {
        console.log(`⏭️  Skipped (already has Sentry): ${path.basename(filePath)}`);
        return false;
    }

    // Find the closing </head> tag
    const headCloseIndex = content.indexOf('</head>');

    if (headCloseIndex === -1) {
        console.warn(`⚠️  No </head> tag found in: ${path.basename(filePath)}`);
        return false;
    }

    // Inject Sentry before </head>
    const before = content.substring(0, headCloseIndex);
    const after = content.substring(headCloseIndex);
    const newContent = before + SENTRY_INJECTION + after;

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Injected Sentry: ${path.basename(filePath)}`);
    return true;
}

/**
 * Main function
 */
async function main() {
    console.log('🔍 Finding all HTML files...\n');

    // Find all HTML files in public directory
    const htmlFiles = glob.sync('public/**/*.html', {
        cwd: path.join(__dirname, '..'),
        absolute: true
    });

    console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

    let injectedCount = 0;
    let skippedCount = 0;

    // Inject Sentry into each file
    for (const filePath of htmlFiles) {
        const result = injectSentryIntoHTML(filePath);
        if (result) {
            injectedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Injected: ${injectedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📄 Total: ${htmlFiles.length}`);
    console.log(`\n✨ Done! Sentry is now configured on all pages.`);
    console.log(`\n⚠️  Next steps:`);
    console.log(`   1. Set SENTRY_DSN in .env file`);
    console.log(`   2. Update meta[name="sentry-dsn"] in HTML files with actual DSN`);
    console.log(`   3. Test error tracking in browser console`);
}

// Run script
main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
