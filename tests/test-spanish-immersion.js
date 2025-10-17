const { chromium } = require('playwright');

async function testSpanishImmersion() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 } });

    console.log('🇪🇸 TESTING SPANISH IMMERSION (Target Language ONLY)\n');

    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Extract all visible text content
    const contentTexts = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.content-card'));
        return cards.slice(0, 5).map(card => {
            const spanishText = card.querySelector('.spanish-text');
            const titleText = card.querySelector('.title-text');
            return {
                title: titleText?.textContent || '',
                content: spanishText?.textContent || ''
            };
        });
    });

    console.log('📊 First 5 content items:\n');

    let englishCount = 0;
    let spanishCount = 0;

    contentTexts.forEach((item, i) => {
        console.log(`${i + 1}. ${item.title}`);
        console.log(`   Content: ${item.content.substring(0, 100)}...\n`);

        // Check for English indicators
        const text = item.title + ' ' + item.content;
        const hasEnglishWords = /\b(the|is|are|was|were|have|has|and|or|but|this|that)\b/i.test(text);
        const hasSpanishChars = /[¿¡ñáéíóúüÑÁÉÍÓÚÜ]/.test(text);
        const hasSpanishWords = /\b(que|para|con|por|una|este|como|más|año|está|español)\b/i.test(text);

        if (hasEnglishWords && !hasSpanishChars && !hasSpanishWords) {
            console.log('   ❌ ENGLISH DETECTED!\n');
            englishCount++;
        } else {
            console.log('   ✅ Spanish content\n');
            spanishCount++;
        }
    });

    await page.screenshot({ path: 'screenshots/SPANISH-IMMERSION-TEST.png', fullPage: true });

    console.log('='.repeat(70));
    console.log('✅ SPANISH IMMERSION TEST RESULTS:');
    console.log(`   Spanish content: ${spanishCount}/5`);
    console.log(`   English content: ${englishCount}/5`);
    console.log(`   Immersion quality: ${Math.round((spanishCount / 5) * 100)}%`);
    console.log('='.repeat(70));

    if (spanishCount >= 4) {
        console.log('\n✅ PASS: Spanish immersion working!');
    } else {
        console.log('\n❌ FAIL: Too much English content');
    }

    console.log('\n⏸️  Browser open for 15s...\n');
    await page.waitForTimeout(15000);

    await browser.close();
}

testSpanishImmersion().catch(console.error);
