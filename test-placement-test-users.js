// 🧪 COMPREHENSIVE USER TESTING - Placement Test
// Tests all user scenarios with different proficiency levels

const { chromium } = require('playwright');

async function testPlacementAsUser(userType) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 414, height: 896 },
    });
    const page = await context.newPage();
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing as: ${userType.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
        // Clear localStorage
        await page.goto('http://localhost:3001');
        await page.evaluate(() => localStorage.clear());
        
        // Start test
        await page.goto('http://localhost:3001/components/swipe-placement-test.html');
        await page.waitForTimeout(500);
        
        // Click start
        await page.click('.btn-primary');
        await page.waitForTimeout(500);
        
        // Simulate user's knowledge level
        const swipePattern = userType.swipePattern;
        let wordsSwiped = 0;
        
        for (let i = 0; i < 20; i++) {
            try {
                const shouldKnow = swipePattern(i);
                
                if (shouldKnow) {
                    await page.click('.btn-yes'); // Know it
                } else {
                    await page.click('.btn-no'); // Don't know
                }
                
                wordsSwiped++;
                await page.waitForTimeout(300);
            } catch (error) {
                console.log(`   ⚠️  Issue at word ${i + 1}:`, error.message);
                break;
            }
        }
        
        console.log(`   ✅ Swiped through ${wordsSwiped} words`);
        
        // Wait for results
        await page.waitForTimeout(1000);
        
        // Check results
        const resultsVisible = await page.isVisible('.results-screen.active');
        if (resultsVisible) {
            const level = await page.textContent('#levelBadge');
            const wordCount = await page.textContent('#wordCount');
            const percentile = await page.textContent('#percentile');
            const confidence = await page.textContent('#confidence');
            
            console.log(`\n   📊 Results for ${userType.name}:`);
            console.log(`   Level: ${level}`);
            console.log(`   Word Count: ${wordCount}`);
            console.log(`   Percentile: ${percentile}`);
            console.log(`   Confidence: ${confidence}`);
            
            // Validate expected level
            if (level.includes(userType.expectedLevel)) {
                console.log(`   ✅ Level matches expected: ${userType.expectedLevel}`);
            } else {
                console.log(`   ⚠️  Level mismatch! Expected: ${userType.expectedLevel}, Got: ${level}`);
            }
            
            // Check localStorage
            const savedData = await page.evaluate(() => ({
                level: localStorage.getItem('userLevel'),
                completed: localStorage.getItem('assessmentCompleted'),
                range: localStorage.getItem('frequencyRange')
            }));
            
            console.log(`\n   💾 Data Saved:`);
            console.log(`   Level: ${savedData.level}`);
            console.log(`   Completed: ${savedData.completed}`);
            console.log(`   Range: ${savedData.range}`);
            
        } else {
            console.log(`   ❌ Results screen did not appear`);
        }
        
    } catch (error) {
        console.error(`   ❌ Test Error:`, error.message);
    } finally {
        await browser.close();
    }
}

// Define user personas with different proficiency levels
const userPersonas = [
    {
        name: "Complete Beginner (Target: A1)",
        expectedLevel: "A1",
        swipePattern: (i) => {
            // Only knows first 3-4 ultra-common words
            return i < 3 && Math.random() > 0.2;
        }
    },
    {
        name: "Tourist/Basic (Target: A2)",
        expectedLevel: "A2",
        swipePattern: (i) => {
            // Knows ultra-beginner + some beginner words
            if (i < 8) return Math.random() > 0.2;
            return Math.random() > 0.7;
        }
    },
    {
        name: "Student/Intermediate (Target: B1)",
        expectedLevel: "B1",
        swipePattern: (i) => {
            // Knows most beginner, some intermediate
            if (i < 12) return Math.random() > 0.15;
            return Math.random() > 0.6;
        }
    },
    {
        name: "Fluent Speaker (Target: B2)",
        expectedLevel: "B2",
        swipePattern: (i) => {
            // Knows most words except expert level
            if (i < 16) return Math.random() > 0.1;
            return Math.random() > 0.5;
        }
    },
    {
        name: "Advanced/Native (Target: C1)",
        expectedLevel: "C1",
        swipePattern: (i) => {
            // Knows almost everything
            return Math.random() > 0.15;
        }
    }
];

async function runAllUserTests() {
    console.log('🚀 Starting Comprehensive User Testing\n');
    
    for (const persona of userPersonas) {
        await testPlacementAsUser(persona);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Pause between tests
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ ALL USER TESTS COMPLETE');
    console.log(`${'='.repeat(60)}\n`);
}

if (require.main === module) {
    runAllUserTests().catch(console.error);
}

module.exports = { runAllUserTests, testPlacementAsUser };

