import puppeteer from 'puppeteer';

async function debugVideoGeneration() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    try {
        await page.goto('http://localhost:3001/comedy-creator.html', { waitUntil: 'networkidle0' });

        // Select character and generate scenario
        await page.click('.character-option[data-character="MARCO"]');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.click('button[onclick="generateScenario()"]');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('🎬 Attempting video generation...');

        // Check if generateVideo function exists
        const hasFunction = await page.evaluate(() => {
            return typeof window.generateVideo === 'function';
        });

        console.log('generateVideo function exists:', hasFunction);

        // Try to call the function
        await page.evaluate(() => {
            if (typeof window.generateVideo === 'function') {
                console.log('Calling generateVideo...');
                window.generateVideo();
            } else {
                console.log('generateVideo function not found');
            }
        });

        // Wait and check for any changes
        await new Promise(resolve => setTimeout(resolve, 5000));

        const timestamp = Date.now();
        await page.screenshot({
            path: `/Users/mindful/ai-feed/debug-video-${timestamp}.png`,
            fullPage: true
        });

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugVideoGeneration();