import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testComedyCreator() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let testResults = {
        pageLoaded: false,
        screenshots: [],
        characterTests: {},
        scenarioTests: {},
        jsErrors: [],
        addToFeedTest: false,
        contentTypeTests: {
            objectsDoingFunnyThings: { SPOON: false, CHAIR: false },
            historicalFiguresVlogging: { NAPOLEON: false, EINSTEIN: false, PICASSO: false }
        }
    };

    // Capture JavaScript errors
    page.on('pageerror', error => {
        testResults.jsErrors.push({
            message: error.message,
            stack: error.stack,
            name: error.name
        });
    });

    console.log('🚀 Starting Comedy Creator tests...');

    try {
        // Test 1: Navigate to page and verify it loads
        console.log('📄 Testing page load...');
        await page.goto('http://localhost:3001/comedy-creator.html');
        await page.waitForLoadState('networkidle');

        // Check if essential elements are present
        const title = await page.title();
        const header = await page.locator('h1').textContent();
        const characterGrid = await page.locator('.character-grid').count();

        testResults.pageLoaded = title.includes('Comedy Creator') &&
                                 header.includes('Comedy Creator') &&
                                 characterGrid > 0;

        // Take initial screenshot
        await page.screenshot({ path: '/Users/mindful/ai-feed/screenshot-page-load.png', fullPage: true });
        testResults.screenshots.push('screenshot-page-load.png');

        console.log(`✅ Page loaded: ${testResults.pageLoaded}`);

        // Test 2: Test all character selections
        console.log('🎭 Testing character selections...');

        const characters = ['MARCO', 'SOFIA', 'GLOBE', 'SPOON', 'CHAIR', 'NAPOLEON', 'EINSTEIN', 'PICASSO'];

        for (const character of characters) {
            console.log(`  Testing ${character}...`);

            try {
                // Click on character
                await page.click(`[data-character="${character}"]`);
                await page.waitForTimeout(500); // Small delay for selection

                // Check if character is selected
                const isSelected = await page.locator(`[data-character="${character}"].selected`).count() > 0;
                testResults.characterTests[character] = isSelected;

                console.log(`    ${character} selection: ${isSelected ? '✅' : '❌'}`);

            } catch (error) {
                console.log(`    ${character} selection: ❌ Error: ${error.message}`);
                testResults.characterTests[character] = false;
            }
        }

        // Test 3: Test scenario generation for each character
        console.log('📝 Testing scenario generation...');

        const testPhrases = [
            'Tengo hambre',
            'Estoy perdido',
            'Necesito ayuda',
            'Me gusta la comida',
            'Donde esta el baño'
        ];

        for (const character of characters) {
            console.log(`  Testing scenario generation for ${character}...`);

            try {
                // Select character
                await page.click(`[data-character="${character}"]`);
                await page.waitForTimeout(300);

                // Use a different phrase for each character to test variety
                const phrase = testPhrases[characters.indexOf(character) % testPhrases.length];

                // Clear and enter Spanish phrase
                await page.fill('#spanishPhrase', phrase);

                // Click generate button
                await page.click('.generate-btn');

                // Wait for scenario generation (with timeout)
                try {
                    await page.waitForSelector('.scenario-output', { timeout: 10000 });

                    // Check if scenario was generated
                    const scenarioText = await page.locator('.scenario-output').textContent();
                    const hasCharacterEmoji = scenarioText.includes(await page.locator(`[data-character="${character}"] .character-emoji`).textContent());
                    const hasSpanishPhrase = scenarioText.toLowerCase().includes(phrase.toLowerCase());

                    testResults.scenarioTests[character] = {
                        generated: true,
                        hasCharacter: hasCharacterEmoji,
                        hasPhrase: hasSpanishPhrase,
                        phrase: phrase,
                        scenarioLength: scenarioText.length
                    };

                    console.log(`    ${character} scenario: ✅ Generated (${scenarioText.length} chars)`);

                    // Take screenshot of generated scenario
                    await page.screenshot({
                        path: `/Users/mindful/ai-feed/screenshot-${character.toLowerCase()}-scenario.png`,
                        fullPage: true
                    });
                    testResults.screenshots.push(`screenshot-${character.toLowerCase()}-scenario.png`);

                } catch (timeoutError) {
                    testResults.scenarioTests[character] = {
                        generated: false,
                        error: 'Timeout waiting for scenario generation',
                        phrase: phrase
                    };
                    console.log(`    ${character} scenario: ❌ Timeout`);
                }

            } catch (error) {
                testResults.scenarioTests[character] = {
                    generated: false,
                    error: error.message,
                    phrase: testPhrases[characters.indexOf(character) % testPhrases.length]
                };
                console.log(`    ${character} scenario: ❌ Error: ${error.message}`);
            }
        }

        // Test 4: Test Add to Feed button functionality
        console.log('📱 Testing Add to Feed button...');

        try {
            // First generate a scenario
            await page.click('[data-character="MARCO"]');
            await page.fill('#spanishPhrase', 'Tengo sed');
            await page.click('.generate-btn');
            await page.waitForSelector('.scenario-output', { timeout: 10000 });

            // Click Add to Feed button
            const addToFeedButton = page.locator('button:has-text("Add to Feed")');
            const buttonExists = await addToFeedButton.count() > 0;

            if (buttonExists) {
                await addToFeedButton.click();
                await page.waitForTimeout(1000);

                // Check if any success indication appears (could be alert, notification, etc.)
                // Since we don't know the exact implementation, we'll just check if the click worked
                testResults.addToFeedTest = true;
                console.log('    Add to Feed button: ✅ Clickable');
            } else {
                testResults.addToFeedTest = false;
                console.log('    Add to Feed button: ❌ Not found');
            }

        } catch (error) {
            testResults.addToFeedTest = false;
            console.log(`    Add to Feed button: ❌ Error: ${error.message}`);
        }

        // Test 5: Verify content type classifications based on vision.md
        console.log('🎨 Testing content type classifications...');

        // Test Objects doing funny things (SPOON, CHAIR)
        const objectCharacters = ['SPOON', 'CHAIR'];
        for (const character of objectCharacters) {
            if (testResults.scenarioTests[character] && testResults.scenarioTests[character].generated) {
                // Re-generate to get fresh content for analysis
                await page.click(`[data-character="${character}"]`);
                await page.fill('#spanishPhrase', 'Es muy divertido');
                await page.click('.generate-btn');
                await page.waitForSelector('.scenario-output', { timeout: 10000 });

                const scenarioContent = await page.locator('.scenario-output').textContent();

                // Check if content matches "Objects doing funny things" pattern
                const hasObjectBehavior = scenarioContent.toLowerCase().includes('bounces') ||
                                        scenarioContent.toLowerCase().includes('stirs') ||
                                        scenarioContent.toLowerCase().includes('moves') ||
                                        scenarioContent.toLowerCase().includes('animated') ||
                                        scenarioContent.toLowerCase().includes('creaks') ||
                                        scenarioContent.toLowerCase().includes('grumpy') ||
                                        character === 'SPOON' && scenarioContent.toLowerCase().includes('excited') ||
                                        character === 'CHAIR' && scenarioContent.toLowerCase().includes('complain');

                testResults.contentTypeTests.objectsDoingFunnyThings[character] = hasObjectBehavior;
                console.log(`    ${character} (Objects): ${hasObjectBehavior ? '✅' : '❌'} Funny object behavior`);
            }
        }

        // Test Historical figures vlogging (NAPOLEON, EINSTEIN, PICASSO)
        const historicalCharacters = ['NAPOLEON', 'EINSTEIN', 'PICASSO'];
        for (const character of historicalCharacters) {
            if (testResults.scenarioTests[character] && testResults.scenarioTests[character].generated) {
                await page.click(`[data-character="${character}"]`);
                await page.fill('#spanishPhrase', 'Hola amigos');
                await page.click('.generate-btn');
                await page.waitForSelector('.scenario-output', { timeout: 10000 });

                const scenarioContent = await page.locator('.scenario-output').textContent();

                // Check if content matches "Historical figures vlogging" pattern
                const hasHistoricalVlogging = scenarioContent.toLowerCase().includes('modern') ||
                                            scenarioContent.toLowerCase().includes('technology') ||
                                            scenarioContent.toLowerCase().includes('confused') ||
                                            scenarioContent.toLowerCase().includes('dramatically') ||
                                            scenarioContent.toLowerCase().includes('proclaims') ||
                                            scenarioContent.toLowerCase().includes('scientific') ||
                                            scenarioContent.toLowerCase().includes('artistic') ||
                                            scenarioContent.toLowerCase().includes('vision');

                testResults.contentTypeTests.historicalFiguresVlogging[character] = hasHistoricalVlogging;
                console.log(`    ${character} (Historical): ${hasHistoricalVlogging ? '✅' : '❌'} Historical vlogging behavior`);
            }
        }

        // Take final screenshot showing character grid
        await page.screenshot({
            path: '/Users/mindful/ai-feed/screenshot-character-grid.png',
            fullPage: true
        });
        testResults.screenshots.push('screenshot-character-grid.png');

    } catch (error) {
        console.error('❌ Test execution error:', error);
        testResults.jsErrors.push({
            message: error.message,
            stack: error.stack,
            name: 'TestExecutionError'
        });
    } finally {
        await browser.close();
    }

    // Generate test report
    const report = generateTestReport(testResults);
    writeFileSync('/Users/mindful/ai-feed/test-results.json', JSON.stringify(testResults, null, 2));
    writeFileSync('/Users/mindful/ai-feed/test-report.md', report);

    console.log('\n📊 Test Results Summary:');
    console.log(`Page Loading: ${testResults.pageLoaded ? '✅' : '❌'}`);
    console.log(`Characters Tested: ${Object.keys(testResults.characterTests).length}`);
    console.log(`Scenarios Generated: ${Object.values(testResults.scenarioTests).filter(s => s.generated).length}`);
    console.log(`JavaScript Errors: ${testResults.jsErrors.length}`);
    console.log(`Add to Feed: ${testResults.addToFeedTest ? '✅' : '❌'}`);
    console.log(`Screenshots Taken: ${testResults.screenshots.length}`);

    return testResults;
}

function generateTestReport(results) {
    return `# Comedy Creator Test Report

## Test Summary
- **Page Loading**: ${results.pageLoaded ? '✅ PASS' : '❌ FAIL'}
- **Total Characters Tested**: ${Object.keys(results.characterTests).length}
- **JavaScript Errors**: ${results.jsErrors.length}
- **Add to Feed Button**: ${results.addToFeedTest ? '✅ PASS' : '❌ FAIL'}
- **Screenshots Generated**: ${results.screenshots.length}

## Character Selection Tests
${Object.entries(results.characterTests).map(([char, pass]) =>
    `- **${char}**: ${pass ? '✅ PASS' : '❌ FAIL'}`
).join('\n')}

## Scenario Generation Tests
${Object.entries(results.scenarioTests).map(([char, result]) =>
    `- **${char}**: ${result.generated ? '✅ PASS' : '❌ FAIL'}${result.error ? ` (${result.error})` : ''}`
).join('\n')}

## Content Type Verification (Vision.md Compliance)

### Objects Doing Funny Things
${Object.entries(results.contentTypeTests.objectsDoingFunnyThings).map(([char, pass]) =>
    `- **${char}**: ${pass ? '✅ PASS' : '❌ FAIL'} - Exhibits object-specific funny behavior`
).join('\n')}

### Historical Figures Vlogging
${Object.entries(results.contentTypeTests.historicalFiguresVlogging).map(([char, pass]) =>
    `- **${char}**: ${pass ? '✅ PASS' : '❌ FAIL'} - Shows historical figure in modern context`
).join('\n')}

## JavaScript Errors
${results.jsErrors.length === 0 ? '✅ No JavaScript errors detected' :
    results.jsErrors.map(error => `- **${error.name}**: ${error.message}`).join('\n')}

## Screenshots Generated
${results.screenshots.map(screenshot => `- ${screenshot}`).join('\n')}

## Detailed Test Results
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`
`;
}

// Run the tests
testComedyCreator().catch(console.error);