const { test } = require('@playwright/test');

test('Check JavaScript errors', async ({ page }) => {
    const errors = [];
    const consoleMessages = [];
    
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('❌ PAGE ERROR:', error.message);
    });
    
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        if (text.includes('error') || text.includes('Error') || text.includes('undefined')) {
            console.log('⚠️  CONSOLE:', text);
        }
    });
    
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(4000);
    
    console.log('\n=== SUMMARY ===');
    console.log('Total errors:', errors.length);
    console.log('Total console messages:', consoleMessages.length);
    
    if (errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
    }
    
    // Show interesting console messages
    const interesting = consoleMessages.filter(m => 
        m.includes('🌍') || m.includes('✅') || m.includes('❌') || m.includes('error')
    );
    console.log('\n📝 KEY MESSAGES:');
    interesting.forEach(m => console.log('  ', m));
});
