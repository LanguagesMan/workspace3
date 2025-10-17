// 🔥 BEST FEED TEST - TikTok/Instagram 2025 Standards
// Tests multi-source news integration + viral scoring algorithm

const { chromium } = require('playwright');

async function testBestFeed() {
    console.log('🚀 Testing BEST FEED with multi-source news integration...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, // iPhone 14 Pro dimensions
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();

    try {
        // TEST 1: Multi-source news API
        console.log('📰 TEST 1: Multi-source news API (5 sources)...');
        const newsResponse = await page.goto('http://localhost:3001/api/news/spanish?count=15&level=A2');
        const newsData = await newsResponse.json();

        console.log(`✅ Success: ${newsData.success}`);
        console.log(`📊 Articles fetched: ${newsData.count}`);
        console.log(`🌍 Sources: ${newsData.sources?.join(', ') || 'N/A'}`);
        console.log(`💬 Message: ${newsData.message}\n`);

        if (newsData.count === 0) {
            console.log('⚠️  WARNING: No articles fetched - check API keys in .env');
        } else {
            // Show sample article
            const sample = newsData.articles[0];
            console.log('📄 Sample Article:');
            console.log(`   Source: ${sample.source} (${sample.apiSource})`);
            console.log(`   Title: ${sample.title.substring(0, 80)}...`);
            console.log(`   Age: ${Math.floor((Date.now() - sample.publishedAt) / (1000 * 60 * 60))}h ago\n`);
        }

        // TEST 2: Personalized feed with viral scoring
        console.log('🎯 TEST 2: Personalized feed with TikTok 2025 algorithm...');
        const feedResponse = await page.goto('http://localhost:3001/api/videos/personalized?userId=test&level=A2&count=20');
        const feedData = await feedResponse.json();

        console.log(`✅ Feed generated: ${feedData.success}`);
        console.log(`📊 Total items: ${feedData.count}`);
        console.log(`⚡ Response time: ${feedData.responseTime}ms`);
        console.log(`🔥 Algorithm: ${feedData.algorithm}\n`);

        // Analyze feed composition
        const feedTypes = {};
        let totalViralScore = 0;
        let newsItemsCount = 0;

        feedData.videos.forEach(item => {
            feedTypes[item.type] = (feedTypes[item.type] || 0) + 1;
            totalViralScore += item.viralScore || 0;
            if (item.type === 'news') {
                newsItemsCount++;
            }
        });

        console.log('📊 Feed Composition:');
        Object.entries(feedTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} items`);
        });

        console.log(`\n🎯 Viral Scoring:`);
        console.log(`   Average viral score: ${Math.round(totalViralScore / feedData.count)}/100`);
        console.log(`   News items with real APIs: ${newsItemsCount}`);

        // Show top 5 items by viral score
        console.log(`\n🔥 Top 5 Items (by viral score):`);
        const sortedItems = feedData.videos
            .sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0))
            .slice(0, 5);

        sortedItems.forEach((item, index) => {
            console.log(`   ${index + 1}. [${item.type}] Score: ${item.viralScore || 'N/A'} - ${item.spanishText?.substring(0, 50) || item.title?.substring(0, 50) || 'Video'}...`);
            if (item.apiSource) {
                console.log(`      Source: ${item.source} (${item.apiSource}) - ${item.ageInHours}h ago`);
            }
        });

        // TEST 3: Load main feed page
        console.log('\n🌐 TEST 3: Loading main feed page...');
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const title = await page.title();
        console.log(`✅ Page loaded: ${title}`);

        // Check for key elements
        const feedExists = await page.locator('#feed, .feed-container, [class*="feed"]').count() > 0;
        console.log(`📱 Feed container found: ${feedExists}`);

        // TEST 4: Performance check (TikTok 2025: <200ms response time)
        console.log('\n⚡ TEST 4: Performance benchmark (TikTok 2025 standard: <200ms)...');
        const perfStart = Date.now();
        await page.goto('http://localhost:3001/api/videos/personalized?userId=perf-test&level=A2&count=10');
        const perfEnd = Date.now();
        const responseTime = perfEnd - perfStart;

        console.log(`⏱️  Response time: ${responseTime}ms`);
        if (responseTime < 200) {
            console.log('✅ EXCELLENT: Meets TikTok 2025 performance standard!');
        } else if (responseTime < 500) {
            console.log('✅ GOOD: Acceptable for production');
        } else {
            console.log('⚠️  SLOW: Consider caching/optimization');
        }

        // FINAL VERDICT
        console.log('\n' + '='.repeat(60));
        console.log('🎯 FINAL VERDICT: BEST FEED QUALITY CHECK');
        console.log('='.repeat(60));

        const checks = {
            'Multi-source news integration': newsData.sources?.length >= 2,
            'Real news articles fetched': newsData.count > 0,
            'Personalized feed generated': feedData.success,
            'Viral scoring active': totalViralScore > 0,
            'News diversity (multiple sources)': newsData.sources?.length >= 3,
            'Performance < 500ms': feedData.responseTime < 500,
            'Feed page loads': feedExists
        };

        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
        });

        const passedChecks = Object.values(checks).filter(v => v).length;
        const totalChecks = Object.values(checks).length;
        const score = Math.round((passedChecks / totalChecks) * 100);

        console.log(`\n📊 Overall Score: ${score}% (${passedChecks}/${totalChecks} checks passed)`);

        if (score >= 90) {
            console.log('🏆 EXCELLENT: Matches TikTok/Instagram 2025 standards!');
        } else if (score >= 70) {
            console.log('✅ GOOD: Production ready with minor improvements needed');
        } else {
            console.log('⚠️  NEEDS WORK: Review failed checks above');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run tests
testBestFeed()
    .then(() => {
        console.log('\n✅ All tests completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Tests failed:', error);
        process.exit(1);
    });
