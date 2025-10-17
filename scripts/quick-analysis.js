import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

async function takeScreenshots() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const timestamp = Date.now();

    try {
        // Homepage
        console.log('📸 Taking homepage screenshot...');
        await page.goto('http://localhost:3001/index.html', { waitUntil: 'networkidle0' });
        await page.screenshot({
            path: `/Users/mindful/ai-feed/before-homepage-${timestamp}.png`,
            fullPage: true
        });

        // Comedy Creator
        console.log('📸 Taking Comedy Creator screenshot...');
        await page.goto('http://localhost:3001/comedy-creator.html', { waitUntil: 'networkidle0' });
        await page.screenshot({
            path: `/Users/mindful/ai-feed/before-comedy-creator-${timestamp}.png`,
            fullPage: true
        });

        // Enhanced Feed
        console.log('📸 Taking Enhanced Feed screenshot...');
        await page.goto('http://localhost:3001/enhanced-feed.html', { waitUntil: 'networkidle0' });
        await page.screenshot({
            path: `/Users/mindful/ai-feed/before-enhanced-feed-${timestamp}.png`,
            fullPage: true
        });

        // Test content generation
        console.log('🎭 Testing content generation...');
        await page.goto('http://localhost:3001/comedy-creator.html', { waitUntil: 'networkidle0' });

        // Click first character if available
        const characterBtn = await page.$('.character-option');
        if (characterBtn) {
            await characterBtn.click();
            await page.screenshot({
                path: `/Users/mindful/ai-feed/before-character-selected-${timestamp}.png`,
                fullPage: true
            });

            // Try to generate content
            const generateBtn = await page.$('#generateBtn') || await page.$('.generate-btn') || await page.$('button[onclick*="generate"]');
            if (generateBtn) {
                await generateBtn.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
                await page.screenshot({
                    path: `/Users/mindful/ai-feed/before-content-generated-${timestamp}.png`,
                    fullPage: true
                });
            }
        }

        console.log('✅ Screenshots taken successfully!');

    } catch (error) {
        console.error('Error taking screenshots:', error);
    } finally {
        await browser.close();
    }
}

takeScreenshots();