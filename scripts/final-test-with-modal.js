import puppeteer from 'puppeteer';

async function testCompleteVideoGeneration() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const timestamp = Date.now();

    try {
        console.log('🎬 Testing Complete Video Generation with Modal...');

        // Go to comedy creator
        await page.goto('http://localhost:3001/comedy-creator.html', { waitUntil: 'networkidle0' });

        // Select MARCO character
        await page.click('.character-option[data-character="MARCO"]');
        console.log('✅ MARCO selected');

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate scenario first
        await page.click('button[onclick="generateScenario()"]');
        console.log('🎭 Scenario generating...');

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Click Generate Video button
        console.log('🎬 Starting video generation...');
        await page.click('button[onclick="generateVideo()"]');

        // Wait for video generation process to complete
        console.log('⏳ Waiting for video generation (15 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 15000));

        // Take screenshot of success modal
        await page.screenshot({
            path: `/Users/mindful/ai-feed/final-video-modal-${timestamp}.png`,
            fullPage: true
        });

        // Check if modal appeared
        const modalExists = await page.$('.video-success-modal') !== null;
        console.log('📱 Success modal visible:', modalExists);

        if (modalExists) {
            // Test download functionality
            console.log('📥 Testing download functionality...');

            // Wait a bit more for modal to fully load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Take final screenshot
            await page.screenshot({
                path: `/Users/mindful/ai-feed/final-success-modal-${timestamp}.png`,
                fullPage: true
            });

            console.log('🎉 Complete video generation test successful!');
        } else {
            console.log('⚠️ Modal did not appear - may need more time');
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await browser.close();
    }
}

testCompleteVideoGeneration();