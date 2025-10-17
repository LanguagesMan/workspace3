/**
 * Test Firecrawl Deep Article Scraping
 * Test scraping 10 articles from different Spanish news sources
 */

import firecrawlScraper from './lib/firecrawl-scraper.js';
import scrapingQueue from './lib/article-scraping-queue.js';

// Test articles from various Spanish news sources
const TEST_ARTICLES = [
    {
        id: 'test-1',
        url: 'https://elpais.com/ciencia/',
        title: 'El País - Ciencia',
        source: 'El País'
    },
    {
        id: 'test-2',
        url: 'https://www.bbc.com/mundo',
        title: 'BBC Mundo - Noticias',
        source: 'BBC Mundo'
    },
    {
        id: 'test-3',
        url: 'https://www.elmundo.es/tecnologia.html',
        title: 'El Mundo - Tecnología',
        source: 'El Mundo'
    },
    {
        id: 'test-4',
        url: 'https://www.20minutos.es/',
        title: '20 Minutos - Portada',
        source: '20 Minutos'
    },
    {
        id: 'test-5',
        url: 'https://cnnespanol.cnn.com/',
        title: 'CNN Español - Portada',
        source: 'CNN Español'
    },
    {
        id: 'test-6',
        url: 'https://www.marca.com/',
        title: 'Marca - Deportes',
        source: 'Marca'
    },
    {
        id: 'test-7',
        url: 'https://hipertextual.com/',
        title: 'Hipertextual - Tecnología',
        source: 'Hipertextual'
    },
    {
        id: 'test-8',
        url: 'https://www.as.com/',
        title: 'AS - Deportes',
        source: 'AS'
    },
    {
        id: 'test-9',
        url: 'https://www.abc.es/cultura/',
        title: 'ABC - Cultura',
        source: 'ABC'
    },
    {
        id: 'test-10',
        url: 'https://www.eldiario.es/',
        title: 'El Diario - Portada',
        source: 'El Diario'
    }
];

async function testFirecrawlScraping() {
    console.log('🔥 FIRECRAWL DEEP SCRAPING TEST');
    console.log('================================\n');

    const results = {
        total: TEST_ARTICLES.length,
        successful: 0,
        failed: 0,
        paywalled: 0,
        details: []
    };

    // Test 1: Single article scraping
    console.log('📝 Test 1: Single Article Scraping\n');
    
    for (let i = 0; i < 3; i++) {
        const article = TEST_ARTICLES[i];
        console.log(`Scraping: ${article.title}`);
        console.log(`URL: ${article.url}`);
        
        try {
            const result = await firecrawlScraper.scrapeArticle(article.url);
            
            if (result.success) {
                results.successful++;
                console.log('✅ Success!');
                console.log(`   - Word count: ${result.wordCount}`);
                console.log(`   - Images found: ${result.images.length}`);
                console.log(`   - Content length: ${result.fullContent.length} chars`);
            } else if (result.paywall) {
                results.paywalled++;
                console.log('🔒 Paywall detected');
            } else {
                results.failed++;
                console.log(`❌ Failed: ${result.error}`);
            }
            
            results.details.push({
                article: article.title,
                ...result
            });
            
        } catch (error) {
            results.failed++;
            console.error(`❌ Error: ${error.message}`);
            results.details.push({
                article: article.title,
                success: false,
                error: error.message
            });
        }
        
        console.log('');
    }

    // Test 2: Batch scraping
    console.log('\n📦 Test 2: Batch Scraping (5 articles)\n');
    
    const batchArticles = TEST_ARTICLES.slice(3, 8);
    const batchUrls = batchArticles.map(a => a.url);
    
    try {
        const batchResults = await firecrawlScraper.scrapeBatch(batchUrls);
        
        batchResults.forEach((result, idx) => {
            const article = batchArticles[idx];
            console.log(`${article.title}:`);
            
            if (result.success) {
                results.successful++;
                console.log(`   ✅ Success (${result.wordCount} words)`);
            } else if (result.paywall) {
                results.paywalled++;
                console.log('   🔒 Paywall');
            } else {
                results.failed++;
                console.log(`   ❌ Failed: ${result.error}`);
            }
            
            results.details.push({
                article: article.title,
                ...result
            });
        });
        
    } catch (error) {
        console.error(`❌ Batch error: ${error.message}`);
    }

    // Test 3: Queue system
    console.log('\n\n🚀 Test 3: Queue System (2 articles)\n');
    
    const queueArticles = TEST_ARTICLES.slice(8, 10);
    
    for (const article of queueArticles) {
        console.log(`Queuing: ${article.title}`);
        await scrapingQueue.addToQueue(article);
    }
    
    console.log('\nQueue status:');
    const queueStatus = scrapingQueue.getStatus();
    console.log(`   - Items in queue: ${queueStatus.queueLength}`);
    console.log(`   - Processing: ${queueStatus.processing}`);
    
    // Wait for queue to process
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
    
    const finalStatus = scrapingQueue.getStatus();
    console.log('\nFinal queue status:');
    console.log(`   - Items remaining: ${finalStatus.queueLength}`);
    console.log(`   - Processing: ${finalStatus.processing}`);

    // Print summary
    console.log('\n\n📊 FINAL RESULTS');
    console.log('================');
    console.log(`Total articles tested: ${results.total}`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`🔒 Paywalled: ${results.paywalled}`);
    console.log(`📈 Success rate: ${Math.round((results.successful / results.total) * 100)}%`);

    // Print detailed results
    console.log('\n\n📋 DETAILED RESULTS');
    console.log('==================');
    results.details.forEach((detail, idx) => {
        console.log(`\n${idx + 1}. ${detail.article}`);
        if (detail.success) {
            console.log(`   ✅ ${detail.wordCount} words, ${detail.images?.length || 0} images`);
            console.log(`   📝 First 100 chars: ${detail.fullContent?.substring(0, 100)}...`);
        } else {
            console.log(`   ❌ ${detail.error || 'Unknown error'}`);
        }
    });

    console.log('\n\n✅ Test completed!');
}

// Run tests
testFirecrawlScraping().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

