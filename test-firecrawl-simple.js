/**
 * Simple Firecrawl Test
 * Test basic scraping functionality
 */

import Firecrawl from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

dotenv.config();

async function testFirecrawl() {
    console.log('🔥 Testing Firecrawl Integration\n');
    
    try {
        // Initialize Firecrawl
        const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
        console.log('✅ Firecrawl initialized');
        
        // Test scraping a simple page
        console.log('\n📝 Test 1: Scraping BBC Mundo homepage');
        const result = await firecrawl.scrape('https://www.bbc.com/mundo', {
            formats: ['markdown', 'html'],
            onlyMainContent: true,
        });
        
        if (result && result.success) {
            console.log('✅ Scraping successful!');
            console.log(`   - Has markdown: ${!!result.markdown}`);
            console.log(`   - Has HTML: ${!!result.html}`);
            console.log(`   - Has metadata: ${!!result.metadata}`);
            
            if (result.markdown) {
                console.log(`   - Content length: ${result.markdown.length} chars`);
                console.log(`   - First 100 chars: ${result.markdown.substring(0, 100)}...`);
            }
            
            console.log('\n✅ All tests passed!');
            return true;
        } else {
            console.log('❌ Scraping failed');
            console.log(result);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        return false;
    }
}

testFirecrawl().then(success => {
    process.exit(success ? 0 : 1);
});

