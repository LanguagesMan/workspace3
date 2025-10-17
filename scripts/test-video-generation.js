import puppeteer from 'puppeteer';

async function testVideoGeneration() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const timestamp = Date.now();

    try {
        console.log('🧪 Testing Video Generation Feature...');

        // Go to comedy creator
        await page.goto('http://localhost:3001/comedy-creator.html', { waitUntil: 'networkidle0' });

        // Take initial screenshot
        await page.screenshot({
            path: `/Users/mindful/ai-feed/after-comedy-creator-${timestamp}.png`,
            fullPage: true
        });

        // Select MARCO character
        await page.click('.character-option[data-character="MARCO"]');
        console.log('✅ MARCO character selected');

        await page.screenshot({
            path: `/Users/mindful/ai-feed/after-character-selected-${timestamp}.png`,
            fullPage: true
        });

        // Click generate scenario
        await page.click('button[onclick="generateScenario()"]');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Take screenshot after scenario generation
        await page.screenshot({
            path: `/Users/mindful/ai-feed/after-scenario-generated-${timestamp}.png`,
            fullPage: true
        });

        // Click Generate Video button (the new functionality)
        console.log('🎬 Testing video generation...');
        await page.click('button[onclick="generateVideo()"]');

        // Wait for video generation to complete
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Take screenshot of the success modal
        await page.screenshot({
            path: `/Users/mindful/ai-feed/after-video-generated-${timestamp}.png`,
            fullPage: true
        });

        console.log('🎉 Video generation test complete!');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await browser.close();
    }
}

testVideoGeneration();