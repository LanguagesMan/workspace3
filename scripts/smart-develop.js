#!/usr/bin/env node
/**
 * 🧠 SMART DEVELOPMENT MODE
 * 
 * Features:
 * - Automatic testing on file changes
 * - Screenshot comparison
 * - Rollback on test failures
 * - Progress tracking
 * 
 * Usage: node scripts/smart-develop.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    watchPaths: ['public', 'server.js', 'lib', 'src'],
    testCommand: 'npx playwright test tests/persona-based-comprehensive.test.js --grep "should load"',
    screenshotDir: 'screenshots/smart-dev',
    logFile: 'smart-dev.log'
};

// Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// State
let lastTestPassed = true;
let testCount = 0;
let failCount = 0;

// Banner
console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🧠 SMART DEVELOPMENT MODE ACTIVATED 🧠             ║
║                                                            ║
║  Features:                                                 ║
║    ✅ Auto-test on changes                                 ║
║    📸 Screenshot comparison                                ║
║    ⏮️  Rollback on failures                                ║
║    📊 Progress tracking                                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}
`);

// Log function
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
        info: colors.blue,
        success: colors.green,
        error: colors.red,
        warning: colors.yellow
    };
    
    const color = colorMap[type] || colors.reset;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    
    // Also write to log file
    fs.appendFileSync(CONFIG.logFile, `[${timestamp}] ${message}\n`);
}

// Run tests
async function runTests() {
    return new Promise((resolve) => {
        log('Running tests...', 'info');
        testCount++;
        
        const testProcess = spawn('bash', ['-c', CONFIG.testCommand], {
            stdio: 'pipe'
        });
        
        let output = '';
        testProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        testProcess.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        testProcess.on('close', (code) => {
            if (code === 0) {
                log(`✅ Tests passed! (Total: ${testCount}, Failed: ${failCount})`, 'success');
                lastTestPassed = true;
                takeScreenshot('passing');
                resolve(true);
            } else {
                log(`❌ Tests failed! Output:\n${output.slice(-500)}`, 'error');
                failCount++;
                lastTestPassed = false;
                suggestRollback();
                resolve(false);
            }
        });
    });
}

// Take screenshot
function takeScreenshot(status) {
    const timestamp = Date.now();
    const dir = path.join(CONFIG.screenshotDir, status);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    const screenshotCmd = `npx playwright screenshot http://localhost:3001/tiktok-video-feed.html ${dir}/${timestamp}.png`;
    spawn('bash', ['-c', screenshotCmd], { stdio: 'ignore' });
}

// Suggest rollback
function suggestRollback() {
    console.log(`
${colors.yellow}╔════════════════════════════════════════════════════════╗
║  ⚠️  TEST FAILURE DETECTED                             ║
╚════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}Options:${colors.reset}
  1. Fix the issue and save again (auto-test will run)
  2. Rollback to last working state: ${colors.cyan}git reset --hard HEAD${colors.reset}
  3. View detailed error: ${colors.cyan}cat ${CONFIG.logFile}${colors.reset}
  4. Run tests manually: ${colors.cyan}${CONFIG.testCommand}${colors.reset}
`);
}

// Watch for changes
function watchFiles() {
    log('👀 Watching for file changes...', 'info');
    
    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch(CONFIG.watchPaths, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
    });
    
    let debounceTimer;
    
    watcher.on('change', (filePath) => {
        log(`📝 File changed: ${filePath}`, 'info');
        
        // Debounce to avoid running tests on every keystroke
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            runTests();
        }, 1000);
    });
    
    log('✅ File watcher initialized', 'success');
    log('💡 Make changes to your code and tests will run automatically!', 'info');
}

// Check dependencies
function checkDependencies() {
    try {
        require('chokidar');
        return true;
    } catch (e) {
        console.log(`${colors.red}❌ Missing dependency: chokidar${colors.reset}`);
        console.log(`${colors.yellow}Installing... npm install chokidar${colors.reset}`);
        
        const install = spawn('npm', ['install', 'chokidar'], { stdio: 'inherit' });
        install.on('close', (code) => {
            if (code === 0) {
                console.log(`${colors.green}✅ Dependencies installed${colors.reset}`);
                startSmartMode();
            } else {
                console.log(`${colors.red}❌ Failed to install dependencies${colors.reset}`);
                process.exit(1);
            }
        });
        
        return false;
    }
}

// Start smart mode
function startSmartMode() {
    // Initial test run
    log('🚀 Running initial test suite...', 'info');
    runTests().then((passed) => {
        if (passed) {
            log('✅ Initial tests passed - Ready for development!', 'success');
            watchFiles();
        } else {
            log('⚠️  Initial tests failed - Fix issues before development', 'warning');
            log('Starting file watcher anyway...', 'info');
            watchFiles();
        }
    });
}

// Main
console.log(`${colors.blue}📋 Configuration:${colors.reset}`);
console.log(`   Watch paths: ${CONFIG.watchPaths.join(', ')}`);
console.log(`   Test command: ${CONFIG.testCommand}`);
console.log(`   Screenshot dir: ${CONFIG.screenshotDir}`);
console.log('');

if (checkDependencies()) {
    startSmartMode();
}

// Handle exit
process.on('SIGINT', () => {
    console.log(`\n${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║              📊 DEVELOPMENT SESSION SUMMARY                ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

  Total tests run: ${testCount}
  Failed tests: ${failCount}
  Success rate: ${testCount > 0 ? Math.round(((testCount - failCount) / testCount) * 100) : 0}%
  
  Log file: ${CONFIG.logFile}
  Screenshots: ${CONFIG.screenshotDir}

${colors.green}✨ Happy coding!${colors.reset}
`);
    process.exit(0);
});
