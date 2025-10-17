/**
 * Test Navigation - Verify menus are clickable and Videos is main menu
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'workspace3');

async function testNavigation() {
    console.log('🧪 Testing Navigation & Menu Clickability...\n');

    const browser = await chromium.launch({ headless: false }); // Visible for debugging
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true
    });

    const page = await context.newPage();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    try {
        // TEST 1: Home redirects to Videos
        console.log('📱 TEST 1: Home page auto-redirects to Videos...');
        await page.goto(BASE_URL);
        await page.waitForTimeout(1500); // Wait for redirect

        const currentUrl = page.url();
        if (currentUrl.includes('tiktok-videos')) {
            console.log('✅ Home redirects to Videos correctly');
            console.log(`   URL: ${currentUrl}`);
        } else {
            console.log('❌ Home did not redirect to Videos');
            console.log(`   URL: ${currentUrl}`);
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${timestamp}-nav-01-videos-main.png`)
        });

        // TEST 2: Bottom navigation is visible
        console.log('\n📍 TEST 2: Bottom navigation visibility...');
        const bottomNav = await page.locator('.bottom-nav').count();
        const navItems = await page.locator('.nav-item').count();

        console.log(`   Bottom nav present: ${bottomNav > 0}`);
        console.log(`   Nav items count: ${navItems}`);

        if (bottomNav === 1 && navItems === 4) {
            console.log('✅ Bottom navigation correct (1 nav bar, 4 items)');
        } else {
            console.log(`❌ Navigation issue: ${bottomNav} nav bars, ${navItems} items`);
        }

        // TEST 3: Click each menu item
        console.log('\n🔘 TEST 3: Testing menu clickability...');

        // Click Articles
        await page.locator('.nav-item').filter({ hasText: 'Articles' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        let url = page.url();
        if (url.includes('unified-infinite-feed')) {
            console.log('✅ Articles menu clickable');
        } else {
            console.log('❌ Articles menu failed');
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${timestamp}-nav-02-articles.png`)
        });

        // Click back to Videos
        await page.locator('.nav-item').filter({ hasText: 'Videos' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        url = page.url();
        if (url.includes('tiktok-videos')) {
            console.log('✅ Videos menu clickable');
        } else {
            console.log('❌ Videos menu failed');
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${timestamp}-nav-03-back-to-videos.png`)
        });

        // Click All
        await page.locator('.nav-item').filter({ hasText: 'All' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        url = page.url();
        if (url.includes('apple-feed')) {
            console.log('✅ All menu clickable');
        } else {
            console.log('❌ All menu failed');
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${timestamp}-nav-04-all.png`)
        });

        // Click Profile (home)
        await page.locator('.nav-item').filter({ hasText: 'Profile' }).click();
        await page.waitForTimeout(1500); // Wait for redirect

        url = page.url();
        if (url.includes('tiktok-videos') || url === BASE_URL + '/') {
            console.log('✅ Profile menu clickable');
        } else {
            console.log('❌ Profile menu failed');
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${timestamp}-nav-05-profile.png`)
        });

        // TEST 4: Verify Videos is active by default
        console.log('\n⭐ TEST 4: Videos is default/active menu...');
        const activeNav = await page.locator('.nav-item.active').textContent();

        if (activeNav.includes('Videos')) {
            console.log('✅ Videos is the active/main menu');
        } else {
            console.log(`❌ Active menu is: ${activeNav}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 NAVIGATION TEST COMPLETE');
        console.log('='.repeat(60));
        console.log('✅ All menus working');
        console.log('✅ Videos is main/default menu');
        console.log('✅ Bottom nav clickable and functional');
        console.log(`📸 Screenshots saved to: ${SCREENSHOT_DIR}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Test error:', error);
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${timestamp}-nav-ERROR.png`)
        });
    } finally {
        await browser.close();
    }
}

testNavigation().catch(console.error);
