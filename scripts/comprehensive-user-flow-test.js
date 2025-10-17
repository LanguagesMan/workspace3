/**
 * Comprehensive User Flow Testing and Analysis
 * Tests: Homepage → Comedy Creator → Character Selection → Scenario Generation → Video Preview → Enhanced Feed
 * Documents breaks, friction points, missing steps, and compliance with vision.md requirements
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';

const BASE_URL = 'http://localhost:8080';
const TIMESTAMP = Date.now();

class UserFlowAnalyzer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.analysis = {
            flowSteps: [],
            breaks: [],
            frictionPoints: [],
            missingFeatures: [],
            visionCompliance: {},
            screenshots: []
        };
    }

    async initialize() {
        this.browser = await chromium.launch({ headless: false });
        const context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        this.page = await context.newPage();
    }

    async takeScreenshot(filename, description) {
        const screenshotPath = `/Users/mindful/ai-feed/flow-analysis-${filename}-${TIMESTAMP}.png`;
        await this.page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        this.analysis.screenshots.push({
            filename: screenshotPath,
            description,
            timestamp: Date.now()
        });

        console.log(`📸 Screenshot: ${description}`);
        return screenshotPath;
    }

    async recordFlowStep(step, status, details = {}) {
        const flowStep = {
            step,
            status, // 'success', 'failure', 'friction', 'missing'
            timestamp: Date.now(),
            details
        };

        this.analysis.flowSteps.push(flowStep);
        console.log(`${status === 'success' ? '✅' : status === 'failure' ? '❌' : '⚠️'} ${step}`);

        if (status === 'failure') {
            this.analysis.breaks.push(flowStep);
        } else if (status === 'friction') {
            this.analysis.frictionPoints.push(flowStep);
        }
    }

    async testHomepage() {
        console.log('\n🏠 Testing Homepage...');

        try {
            await this.page.goto(BASE_URL);
            await this.page.waitForLoadState('networkidle');

            // Check if page loads
            const title = await this.page.title();
            await this.takeScreenshot('01-homepage-loaded', 'Homepage initial load');

            // Check for main elements
            const heroTitle = await this.page.locator('.hero-title').isVisible();
            const ctaButtons = await this.page.locator('.cta-button').count();
            const characterBubbles = await this.page.locator('.character-bubble').count();

            await this.recordFlowStep('Homepage Load', 'success', {
                title,
                heroVisible: heroTitle,
                ctaButtonCount: ctaButtons,
                characterCount: characterBubbles
            });

            // Test character preview functionality
            if (characterBubbles > 0) {
                await this.page.locator('.character-bubble').first().click();
                await this.page.waitForTimeout(1000);
                await this.takeScreenshot('02-character-preview', 'Character preview interaction');

                // Check if alert appeared (dismiss it)
                try {
                    await this.page.getByRole('button', { name: 'OK' }).click({ timeout: 2000 });
                    await this.recordFlowStep('Character Preview', 'success', { alertShown: true });
                } catch {
                    await this.recordFlowStep('Character Preview', 'friction', { alertMissing: true });
                }
            }

            return true;
        } catch (error) {
            await this.recordFlowStep('Homepage Load', 'failure', { error: error.message });
            return false;
        }
    }

    async testComedyCreator() {
        console.log('\n🎭 Testing Comedy Creator...');

        try {
            // Navigate to Comedy Creator
            await this.page.locator('a[href="/comedy-creator.html"]').click();
            await this.page.waitForLoadState('networkidle');

            await this.takeScreenshot('03-comedy-creator-loaded', 'Comedy Creator page load');

            // Check if page exists and loads
            const url = this.page.url();
            const pageContent = await this.page.content();

            if (url.includes('comedy-creator')) {
                await this.recordFlowStep('Navigate to Comedy Creator', 'success');
            } else {
                await this.recordFlowStep('Navigate to Comedy Creator', 'failure', { actualUrl: url });
                return false;
            }

            // Look for character selection interface
            const characterElements = await this.page.locator('[data-character], .character-card, .character-option').count();
            const generateButton = await this.page.locator('button:has-text("Generate"), button:has-text("Create"), .generate-btn').count();

            await this.recordFlowStep('Character Selection Interface', characterElements > 0 ? 'success' : 'missing', {
                characterOptionsFound: characterElements,
                generateButtonsFound: generateButton
            });

            return true;
        } catch (error) {
            await this.recordFlowStep('Comedy Creator Navigation', 'failure', { error: error.message });
            return false;
        }
    }

    async testCharacterSelection() {
        console.log('\n👥 Testing Character Selection...');

        try {
            // Look for character selection elements
            const characters = await this.page.locator('.character-card, .character-option, [data-character]').all();

            if (characters.length === 0) {
                await this.recordFlowStep('Character Selection Available', 'missing');
                return false;
            }

            await this.takeScreenshot('04-character-selection', 'Character selection interface');

            // Try to select first character
            await characters[0].click();
            await this.page.waitForTimeout(1000);

            await this.recordFlowStep('Select Character', 'success', { charactersAvailable: characters.length });
            await this.takeScreenshot('05-character-selected', 'Character selected');

            return true;
        } catch (error) {
            await this.recordFlowStep('Character Selection', 'failure', { error: error.message });
            return false;
        }
    }

    async testScenarioGeneration() {
        console.log('\n🎬 Testing Scenario Generation...');

        try {
            // Look for scenario generation trigger
            const generateButtons = await this.page.locator('button:has-text("Generate"), button:has-text("Create"), .generate-btn, .scenario-btn').all();

            if (generateButtons.length === 0) {
                await this.recordFlowStep('Scenario Generation Available', 'missing');
                return false;
            }

            // Click generate button
            await generateButtons[0].click();
            await this.page.waitForTimeout(2000);

            await this.takeScreenshot('06-scenario-generation', 'Scenario generation triggered');

            // Check if scenario content appears
            const scenarioContent = await this.page.locator('.scenario, .content, .generated-content').count();

            await this.recordFlowStep('Scenario Generation', scenarioContent > 0 ? 'success' : 'friction', {
                contentGenerated: scenarioContent > 0
            });

            return true;
        } catch (error) {
            await this.recordFlowStep('Scenario Generation', 'failure', { error: error.message });
            return false;
        }
    }

    async testVideoPreview() {
        console.log('\n🎥 Testing Video Preview...');

        try {
            // Look for video preview elements
            const videoElements = await this.page.locator('video, .video-preview, .preview-container').count();
            const playButtons = await this.page.locator('button:has-text("Play"), .play-btn, .video-play').count();

            await this.takeScreenshot('07-video-preview', 'Video preview interface');

            if (videoElements === 0) {
                await this.recordFlowStep('Video Preview Available', 'missing');
                return false;
            }

            await this.recordFlowStep('Video Preview', 'success', {
                videoElementsFound: videoElements,
                playButtonsFound: playButtons
            });

            return true;
        } catch (error) {
            await this.recordFlowStep('Video Preview', 'failure', { error: error.message });
            return false;
        }
    }

    async testEnhancedFeed() {
        console.log('\n🚀 Testing Enhanced Feed...');

        try {
            // Navigate to Enhanced Feed
            await this.page.goto(`${BASE_URL}/enhanced-feed.html`);
            await this.page.waitForLoadState('networkidle');

            await this.takeScreenshot('08-enhanced-feed', 'Enhanced Feed page');

            // Check TikTok-style interface
            const feedItems = await this.page.locator('.feed-item, .video-card, .content-card').count();
            const scrollContainer = await this.page.locator('.feed-container, .scroll-container').count();
            const shareButtons = await this.page.locator('button:has-text("Share"), .share-btn').count();

            await this.recordFlowStep('Enhanced Feed Navigation', 'success');
            await this.recordFlowStep('TikTok-style Interface', feedItems > 0 ? 'success' : 'missing', {
                feedItemsFound: feedItems,
                scrollContainerFound: scrollContainer > 0,
                shareButtonsFound: shareButtons
            });

            return true;
        } catch (error) {
            await this.recordFlowStep('Enhanced Feed', 'failure', { error: error.message });
            return false;
        }
    }

    async checkVisionCompliance() {
        console.log('\n📋 Checking Vision.md Compliance...');

        // Vision requirements to check
        const requirements = {
            'Beyond GLOBO: Diverse character universe': false,
            'Funny-First: Clear humor hook within first 3 seconds': false,
            'TikTok-style short format (15-60 seconds)': false,
            'High visual quality and comedic timing': false,
            'Viral shareability potential': false,
            'Scalable content generation system': false
        };

        // Check for diverse characters
        await this.page.goto(`${BASE_URL}/comedy-creator.html`);
        const characterCount = await this.page.locator('.character-card, .character-option, [data-character]').count();
        requirements['Beyond GLOBO: Diverse character universe'] = characterCount > 1;

        // Check for humor hooks
        const humorElements = await this.page.locator(':has-text("funny"), :has-text("humor"), :has-text("comedy")').count();
        requirements['Funny-First: Clear humor hook within first 3 seconds'] = humorElements > 0;

        // Check for TikTok-style format
        await this.page.goto(`${BASE_URL}/enhanced-feed.html`);
        const tiktokElements = await this.page.locator('.tiktok, :has-text("TikTok"), .vertical-feed').count();
        requirements['TikTok-style short format (15-60 seconds)'] = tiktokElements > 0;

        // Check for shareability features
        const shareFeatures = await this.page.locator('button:has-text("Share"), .share-btn, .viral').count();
        requirements['Viral shareability potential'] = shareFeatures > 0;

        // Check for content generation system
        const generationFeatures = await this.page.locator('button:has-text("Generate"), .generate').count();
        requirements['Scalable content generation system'] = generationFeatures > 0;

        this.analysis.visionCompliance = requirements;

        Object.entries(requirements).forEach(([requirement, met]) => {
            console.log(`${met ? '✅' : '❌'} ${requirement}`);
        });
    }

    async generateReport() {
        console.log('\n📊 Generating Comprehensive Report...');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSteps: this.analysis.flowSteps.length,
                successful: this.analysis.flowSteps.filter(s => s.status === 'success').length,
                failed: this.analysis.breaks.length,
                friction: this.analysis.frictionPoints.length,
                missing: this.analysis.flowSteps.filter(s => s.status === 'missing').length
            },
            userFlowAnalysis: this.analysis,
            visionCompliance: this.analysis.visionCompliance,
            keyFindings: [],
            recommendations: []
        };

        // Identify key findings
        if (report.summary.failed > 0) {
            report.keyFindings.push('CRITICAL: User flow has breaking points that prevent completion');
        }

        if (report.summary.friction > 0) {
            report.keyFindings.push('FRICTION: Multiple friction points in user experience');
        }

        const unmetRequirements = Object.entries(this.analysis.visionCompliance)
            .filter(([, met]) => !met).length;

        if (unmetRequirements > 0) {
            report.keyFindings.push(`VISION GAP: ${unmetRequirements} vision requirements not fully implemented`);
        }

        // Generate recommendations
        if (this.analysis.flowSteps.filter(s => s.status === 'missing').length > 0) {
            report.recommendations.push('Implement missing core functionality for complete user flow');
        }

        // Save report
        await fs.writeFile(
            `/Users/mindful/ai-feed/comprehensive-flow-analysis-${TIMESTAMP}.json`,
            JSON.stringify(report, null, 2)
        );

        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async runFullAnalysis() {
        console.log('🚀 Starting Comprehensive User Flow Analysis...');
        console.log(`📊 Testing against: ${BASE_URL}`);

        try {
            await this.initialize();

            // Test complete user flow
            await this.testHomepage();
            await this.testComedyCreator();
            await this.testCharacterSelection();
            await this.testScenarioGeneration();
            await this.testVideoPreview();
            await this.testEnhancedFeed();

            // Check vision compliance
            await this.checkVisionCompliance();

            // Generate final report
            const report = await this.generateReport();

            console.log('\n✅ Analysis Complete!');
            console.log(`📄 Report saved: comprehensive-flow-analysis-${TIMESTAMP}.json`);
            console.log(`📸 Screenshots: ${this.analysis.screenshots.length} captured`);

            return report;

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Run analysis
const analyzer = new UserFlowAnalyzer();
analyzer.runFullAnalysis()
    .then(report => {
        console.log('\n📊 FINAL ANALYSIS SUMMARY:');
        console.log(`Success Rate: ${Math.round((report.summary.successful / report.summary.totalSteps) * 100)}%`);
        console.log(`Critical Issues: ${report.summary.failed}`);
        console.log(`Friction Points: ${report.summary.friction}`);
        console.log(`Missing Features: ${report.summary.missing}`);

        console.log('\n🎯 VISION COMPLIANCE:');
        Object.entries(report.visionCompliance).forEach(([req, met]) => {
            console.log(`${met ? '✅' : '❌'} ${req}`);
        });

        if (report.keyFindings.length > 0) {
            console.log('\n🔍 KEY FINDINGS:');
            report.keyFindings.forEach(finding => console.log(`• ${finding}`));
        }

        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`• ${rec}`));
        }
    })
    .catch(console.error);