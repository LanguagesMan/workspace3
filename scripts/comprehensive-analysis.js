import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

class AIFeedAnalyzer {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.browser = null;
        this.page = null;
        this.analysis = {
            visionCompliance: {},
            userJourney: {},
            missingFeatures: [],
            technicalIssues: [],
            screenshots: []
        };
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1280, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();

        // Set up error monitoring
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.analysis.technicalIssues.push({
                    type: 'console_error',
                    message: msg.text(),
                    location: msg.location()
                });
            }
        });

        this.page.on('pageerror', error => {
            this.analysis.technicalIssues.push({
                type: 'page_error',
                message: error.message,
                stack: error.stack
            });
        });
    }

    async takeScreenshot(name, description) {
        const timestamp = Date.now();
        const filename = `analysis-${name}-${timestamp}.png`;
        const path = `/Users/mindful/ai-feed/${filename}`;

        await this.page.screenshot({
            path: path,
            fullPage: true
        });

        this.analysis.screenshots.push({
            name,
            description,
            filename,
            path,
            timestamp
        });

        console.log(`📸 Screenshot taken: ${description}`);
        return path;
    }

    async analyzeHomepage() {
        console.log('🏠 Analyzing Homepage...');
        await this.page.goto(`${this.baseUrl}/index.html`, { waitUntil: 'networkidle0' });
        await this.takeScreenshot('homepage', 'Initial homepage load');

        // Check for vision compliance elements
        const features = await this.page.evaluate(() => {
            const elements = {
                diverseCharacters: document.querySelector('.characters-preview') !== null,
                viralDesign: document.querySelector('.tiktok-style') !== null,
                spanishLearning: document.textContent.includes('Spanish'),
                comedyCreator: document.querySelector('a[href="/comedy-creator.html"]') !== null,
                enhancedFeed: document.querySelector('a[href="/enhanced-feed.html"]') !== null,
                statsPresent: document.querySelector('.stats-section') !== null
            };

            return elements;
        });

        this.analysis.visionCompliance.homepage = features;

        // Test navigation buttons
        const buttons = await this.page.$$('.cta-button');
        console.log(`Found ${buttons.length} navigation buttons`);

        return features;
    }

    async analyzeComedyCreator() {
        console.log('🎭 Analyzing Comedy Creator...');
        await this.page.goto(`${this.baseUrl}/comedy-creator.html`, { waitUntil: 'networkidle0' });
        await this.takeScreenshot('comedy-creator-load', 'Comedy Creator initial load');

        // Check character diversity
        const characters = await this.page.evaluate(() => {
            const characterElements = document.querySelectorAll('.character-option');
            return Array.from(characterElements).map(el => ({
                name: el.getAttribute('data-character') || el.textContent,
                visible: el.offsetHeight > 0
            }));
        });

        console.log(`Found ${characters.length} characters:`, characters);

        // Test scenario generation
        if (characters.length > 0) {
            // Select first character
            await this.page.click('.character-option:first-child');
            await this.takeScreenshot('character-selected', 'Character selected');

            // Try to generate content
            const generateBtn = await this.page.$('#generateBtn, .generate-btn, button[onclick*="generate"]');
            if (generateBtn) {
                await generateBtn.click();
                await this.page.waitForTimeout(3000); // Wait for generation
                await this.takeScreenshot('content-generated', 'Content generation attempt');

                // Check for timeline/video preview
                const hasTimeline = await this.page.$('.timeline-container, .video-preview, .tiktok-preview') !== null;
                const hasVideo = await this.page.$('video, .video-player') !== null;

                this.analysis.visionCompliance.comedyCreator = {
                    characterCount: characters.length,
                    hasGeneration: true,
                    hasTimeline,
                    hasVideo
                };
            }
        }

        return characters;
    }

    async analyzeEnhancedFeed() {
        console.log('🚀 Analyzing Enhanced Feed...');
        await this.page.goto(`${this.baseUrl}/enhanced-feed.html`, { waitUntil: 'networkidle0' });
        await this.takeScreenshot('enhanced-feed', 'Enhanced Feed page');

        const feedFeatures = await this.page.evaluate(() => {
            return {
                hasInfiniteScroll: document.querySelector('.infinite-scroll, .feed-container') !== null,
                hasVideoCards: document.querySelectorAll('.video-card, .feed-item').length,
                hasSpanishLearning: document.textContent.includes('Spanish') || document.querySelector('.vocabulary, .translation') !== null,
                hasTikTokStyle: document.querySelector('.tiktok-style, .vertical-video') !== null
            };
        });

        this.analysis.visionCompliance.enhancedFeed = feedFeatures;
        return feedFeatures;
    }

    async testUserJourney() {
        console.log('🔍 Testing Complete User Journey...');

        // Start from homepage
        await this.page.goto(`${this.baseUrl}/index.html`, { waitUntil: 'networkidle0' });

        // Click Comedy Creator
        await this.page.click('a[href="/comedy-creator.html"]');
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Select a character and generate content
        const hasCharacters = await this.page.$('.character-option') !== null;
        if (hasCharacters) {
            await this.page.click('.character-option:first-child');

            const generateBtn = await this.page.$('#generateBtn, .generate-btn, button[onclick*="generate"]');
            if (generateBtn) {
                await generateBtn.click();
                await this.page.waitForTimeout(5000);

                // Check if content was actually generated
                const hasContent = await this.page.evaluate(() => {
                    return document.querySelector('.scenario-content, .generated-content, .video-preview') !== null;
                });

                this.analysis.userJourney.contentGeneration = hasContent;
            }
        }

        // Try to navigate to Enhanced Feed
        await this.page.goto(`${this.baseUrl}/enhanced-feed.html`, { waitUntil: 'networkidle0' });

        this.analysis.userJourney.completed = true;
        await this.takeScreenshot('user-journey-complete', 'Complete user journey test');
    }

    async identifyMissingFeatures() {
        console.log('🔍 Identifying Missing Features...');

        // Vision.md requirements checklist
        const visionRequirements = [
            'Diverse content types beyond single character',
            'Immediate funny hook engagement (0-3 seconds)',
            'Natural Spanish learning integration',
            'Viral shareability potential',
            'TikTok-style short format (15-60 seconds)',
            'High visual quality and comedic timing',
            'Consistent Spanish learning value',
            'Scalable content generation system'
        ];

        // Test each requirement
        const missing = [];

        // Check for actual video generation with timing
        await this.page.goto(`${this.baseUrl}/comedy-creator.html`, { waitUntil: 'networkidle0' });
        const hasRealVideoGeneration = await this.page.evaluate(() => {
            return document.querySelector('video[src], video source') !== null;
        });

        if (!hasRealVideoGeneration) {
            missing.push('Actual video file generation - currently only text scenarios');
        }

        // Check for Spanish learning integration
        const hasSpanishLearning = await this.page.evaluate(() => {
            return document.querySelector('.vocabulary, .translation, .spanish-lesson') !== null;
        });

        if (!hasSpanishLearning) {
            missing.push('Interactive Spanish learning features integrated into videos');
        }

        // Check for viral mechanics (sharing, engagement features)
        const hasViralFeatures = await this.page.evaluate(() => {
            return document.querySelector('.share-button, .like-button, .viral-metrics') !== null;
        });

        if (!hasViralFeatures) {
            missing.push('Viral mechanics - share buttons, engagement features, social integration');
        }

        // Check for multiple content types
        const contentTypes = await this.page.evaluate(() => {
            const characters = document.querySelectorAll('.character-option');
            const hasObjects = Array.from(characters).some(el =>
                el.textContent.includes('CHAIR') || el.textContent.includes('SPOON')
            );
            const hasHistorical = Array.from(characters).some(el =>
                el.textContent.includes('NAPOLEON') || el.textContent.includes('EINSTEIN')
            );
            const hasCultural = Array.from(characters).some(el =>
                el.textContent.includes('FLAMENCO') || el.textContent.includes('CULTURAL')
            );

            return { hasObjects, hasHistorical, hasCultural };
        });

        if (!contentTypes.hasObjects || !contentTypes.hasHistorical || !contentTypes.hasCultural) {
            missing.push('Complete content type diversity - missing some of: Objects, Historical, Cultural');
        }

        this.analysis.missingFeatures = missing;
        return missing;
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            analysis: this.analysis,
            recommendations: []
        };

        // Determine the ONE most critical missing feature
        if (this.analysis.missingFeatures.length > 0) {
            // Prioritize based on vision.md goals
            const criticalFeature = this.analysis.missingFeatures[0]; // Most critical is first
            report.recommendations.push({
                priority: 'CRITICAL',
                feature: criticalFeature,
                impact: 'Blocks core vision.md requirement',
                implementation: 'Required for viral Spanish learning success'
            });
        }

        // Save report
        await fs.writeFile(
            '/Users/mindful/ai-feed/comprehensive-analysis-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log('📊 Analysis Complete!');
        console.log('Missing Features:', this.analysis.missingFeatures);
        console.log('Screenshots taken:', this.analysis.screenshots.length);

        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run analysis
async function runAnalysis() {
    const analyzer = new AIFeedAnalyzer();

    try {
        await analyzer.initialize();
        await analyzer.analyzeHomepage();
        await analyzer.analyzeComedyCreator();
        await analyzer.analyzeEnhancedFeed();
        await analyzer.testUserJourney();
        await analyzer.identifyMissingFeatures();
        const report = await analyzer.generateReport();

        console.log('\n🎯 CRITICAL ANALYSIS COMPLETE');
        console.log('Most Critical Missing Feature:', report.recommendations[0]?.feature || 'None identified');

    } catch (error) {
        console.error('Analysis failed:', error);
    } finally {
        await analyzer.cleanup();
    }
}

runAnalysis();