const { test } = require('@playwright/test');

test('Check actual DOM structure', async ({ page }) => {
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Get first card and log ALL its classes and content
    const firstCard = await page.locator('.content-card').first();

    const cardHTML = await firstCard.evaluate(el => {
        return {
            outerHTML: el.outerHTML.substring(0, 500),
            classList: Array.from(el.classList),
            textContent: el.textContent.substring(0, 200),
            childrenClasses: Array.from(el.children).map(child => ({
                tag: child.tagName,
                classes: Array.from(child.classList)
            }))
        };
    });

    console.log('\n📋 FIRST CARD STRUCTURE:');
    console.log('Classes:', cardHTML.classList);
    console.log('Children:', JSON.stringify(cardHTML.childrenClasses, null, 2));
    console.log('HTML snippet:', cardHTML.outerHTML);
    console.log('Text:', cardHTML.textContent);

    // Check for spanish/english text classes
    const spanishEl = await page.locator('.spanish-text').first().count();
    const englishEl = await page.locator('.english-text').first().count();
    console.log(`\n🔍 Text elements found:`);
    console.log(`  .spanish-text: ${spanishEl}`);
    console.log(`  .english-text: ${englishEl}`);

    // Check for type classes
    const typeVideo = await page.locator('.type-video').count();
    const typeArticle = await page.locator('.type-article').count();
    const typeNews = await page.locator('.type-news').count();
    const typeMeme = await page.locator('.type-meme').count();
    const typeSocial = await page.locator('.type-social').count();

    console.log(`\n🏷️ Type classes found:`);
    console.log(`  .type-video: ${typeVideo}`);
    console.log(`  .type-article: ${typeArticle}`);
    console.log(`  .type-news: ${typeNews}`);
    console.log(`  .type-meme: ${typeMeme}`);
    console.log(`  .type-social: ${typeSocial}`);

    await page.screenshot({ path: '/tmp/dom-check.png', fullPage: true });
});
