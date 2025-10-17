#!/usr/bin/env node

/**
 * INFINITE VIRAL GENERATOR
 * Simple infinite loop that keeps generating viral Spanish content
 */

import puppeteer from 'puppeteer';

const words = ["amor", "casa", "agua", "tiempo", "vida", "mano", "comida", "trabajo", "familia", "amigo", "bueno", "grande", "nuevo"];

const LANGAI_CHARACTER = `
Character: LANGAI - Cartoon Earth globe with blue oceans and green continents, brown fedora hat tilted left, BLACK PIXELATED SUNGLASSES (8 black squares per lens in 2x4 grid), lit cigar held in RIGHT HAND with gray smoke, white cartoon gloves, thin black legs with brown shoes. HOLDS SMALL VINTAGE MICROPHONE close to mouth.
Voice: SLOW NATURAL SPEECH like 80-year-old man, deep gravelly voice, Spanish with heavy American accent, continuous natural rhythm (no pauses between words). SPEAKING INTO MICROPHONE with natural mic distortion, P-pops on P sounds, slight echo.
Animation: Bold cartoon with thick black outlines, flat bright colors, bouncy 1940s cartoon physics, NOT photorealistic.
Audio: Vintage microphone pickup with realistic audio artifacts, breath sounds, slight static.
`;

const approaches = [
    (word) => `${LANGAI_CHARACTER}
Funny scene in very slow Spanish that uses the word "${word}" in many many contexts so it teaches the users what ${word} is. Then a REALLY funny hilarious ending unexpected. Make it REALLY exaggerated so language learners can understand EACH word said from the visual context alone!`,
    (word) => `${LANGAI_CHARACTER}
Professor Absurdo teaches "${word}" while swimming with crocodiles. Carries whiteboard. Hilarious unexpected ending. EXTREME visual expressions - everything extravagant and out-of-the-blue weird!`,
    (word) => `${LANGAI_CHARACTER}
Bizarre Spanish lesson teaching "${word}" through multiple examples. Everything goes funnily wrong in extreme ways. Ultra-exaggerated visuals for learning!`,
    (word) => `${LANGAI_CHARACTER}
Teaching Spanish word "${word}" in impossible situation. Shocking twist ending where everything becomes hilariously weird. Extreme visual comedy!`,
    (word) => `${LANGAI_CHARACTER}
LANGAI uses "${word}" repeatedly in different contexts. Everything escalates to absurdly funny chaos. REALLY exaggerated expressions!`,
    (word) => `${LANGAI_CHARACTER}
Spanish comedy with "${word}" - starts normal, becomes completely extravagant and out-of-the-blue weird. Visual learning through extreme reactions!`
];

let wordIndex = 0;
let approachIndex = 0;
let count = 0;

async function pasteToFlow(prompt) {
    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
    });
    
    const pages = await browser.pages();
    let flowPage = pages.find(page => page.url().includes('flow'));
    
    if (!flowPage) {
        flowPage = await browser.newPage();
        await flowPage.goto('https://labs.google/fx/tools/flow');
        await flowPage.waitForTimeout(3000);
    }
    
    await flowPage.focus('textarea');
    await flowPage.evaluate(() => document.querySelector('textarea').value = '');
    await flowPage.type('textarea', prompt);
}

async function generate() {
    while (true) {
        try {
            const word = words[wordIndex];
            const approach = approaches[approachIndex];
            const prompt = approach(word);
            
            console.log(`🎬 GENERATING ${count + 1}: ${word} (${approachIndex + 1})`);
            console.log(`📝 ${prompt.substring(0, 60)}...`);
            
            await pasteToFlow(prompt);
            console.log(`✅ PASTED TO GOOGLE FLOW\n`);
            
            count++;
            wordIndex = (wordIndex + 1) % words.length;
            approachIndex = (approachIndex + 1) % approaches.length;
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

console.log('🔥 INFINITE VIRAL GENERATOR STARTED');
console.log('📚 Rotating through frequency words with viral approaches');
console.log('⚡ Will generate continuously...\n');

generate().catch(console.error);