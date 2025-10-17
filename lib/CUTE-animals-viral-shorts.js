#!/usr/bin/env node

/**
 * 🐾 CUTE ANIMALS VIRAL SHORTS - DOPAMINE EXPLOSION!
 * Adorable talking animals with word repetition and hilarious punchlines
 * Each video focuses on one Spanish word repeated cutely
 * Ultra-viral short content that makes people go "AWWWW!"
 */

import { chromium } from 'playwright';

let cuteCount = 0;

// GENERATE CUTE ANIMAL VIRAL SHORTS
function generateCuteAnimalShort() {
    const timestamp = Date.now();
    const seed = Math.floor(timestamp + Math.random() * 9999999);
    
    cuteCount++;
    
    // SPANISH WORDS FOR CUTE REPETITION
    const words = [
        {spanish: 'hambre', english: 'hungry', context: 'empty food bowl, stomach growling, looking at food'},
        {spanish: 'sed', english: 'thirsty', context: 'empty water bowl, panting, looking at water'},
        {spanish: 'cansado', english: 'tired', context: 'yawning, sleepy eyes, curling up'},
        {spanish: 'feliz', english: 'happy', context: 'wagging tail, bouncing, big smile'},
        {spanish: 'asustado', english: 'scared', context: 'hiding, wide eyes, trembling'},
        {spanish: 'perdido', english: 'lost', context: 'looking around confused, wandering'},
        {spanish: 'pequeño', english: 'small', context: 'next to big objects, tiny size'},
        {spanish: 'grande', english: 'big', context: 'towering over small things'},
        {spanish: 'caliente', english: 'hot', context: 'panting, seeking shade, sweating'},
        {spanish: 'frío', english: 'cold', context: 'shivering, seeking warmth, curled up'}
    ];
    
    const word = words[seed % words.length];
    
    // CUTE ANIMALS WITH PERSONALITIES
    const animals = [
        'Tiny orange kitten with huge round eyes and innocent expression',
        'Fluffy baby panda with black patches and wondering look',
        'Small golden puppy with floppy ears and head tilt',
        'Baby bunny with twitching nose and soft fur',
        'Little duckling with bright yellow feathers and curious waddle',
        'Miniature hamster with chubby cheeks and tiny paws',
        'Young fox kit with bright eyes and fluffy tail',
        'Small koala with sleepy expression and soft gray fur',
        'Baby owl with enormous eyes and head bobbing',
        'Little lamb with curly white wool and gentle eyes'
    ];
    
    const animal = animals[seed % animals.length];
    
    // CUTE INSTRUCTION STYLES
    const styleIndex = seed % 8;
    let prompt;
    
    if (styleIndex === 0) {
        prompt = `Adorable ${animal} repeatedly saying "${word.spanish}" (${word.english}) in cute Spanish voice while ${word.context} - hilarious punchline ending`;
    } else if (styleIndex === 1) {
        prompt = `${animal} focuses on word "${word.spanish}" with repetition - ${word.context} - surprise cute twist`;
    } else if (styleIndex === 2) {
        prompt = `Cute ${animal} says "${word.spanish}" many times - ${word.context} - viral funny moment`;
    } else if (styleIndex === 3) {
        prompt = `${animal} repetitive "${word.spanish}" with ${word.context} - adorable comedy punchline`;
    } else if (styleIndex === 4) {
        prompt = `Sweet ${animal} using "${word.spanish}" repeatedly - ${word.context} - hilarious ending`;
    } else if (styleIndex === 5) {
        prompt = `${animal} cute comedy with "${word.spanish}" focus - ${word.context} - funny twist`;
    } else if (styleIndex === 6) {
        prompt = `Adorable ${animal} word "${word.spanish}" repetition - ${word.context} - viral punchline`;
    } else {
        prompt = `${animal} saying "${word.spanish}" cutely many times - ${word.context} - surprise ending`;
    }
    
    return {
        prompt: prompt,
        word: word,
        animal: animal.split(' ')[1] + ' ' + animal.split(' ')[2], // Extract animal type
        style: styleIndex,
        episode: cuteCount
    };
}

// INJECT CUTE ANIMALS
async function injectCuteAnimals() {
    try {
        console.log(`\\n🐾 CUTE ANIMALS BURST ${Math.floor(cuteCount/5) + 1}!`);
        
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const context = browser.contexts()[0];
        
        if (!context) {
            console.log('❌ NO BROWSER CONTEXT');
            return;
        }
        
        const flowPage = context.pages().find(page => page.url().includes('labs.google/fx/tools/flow'));
        
        if (!flowPage) {
            console.log('❌ NO FLOW TAB');
            return;
        }
        
        console.log('🐾 INJECTING 5 CUTE ANIMAL SHORTS:');
        
        for (let i = 0; i < 5; i++) {
            const cute = generateCuteAnimalShort();
            
            try {
                await flowPage.click('textarea, input[type=\"text\"], [contenteditable=\"true\"]', { timeout: 5000 });
                await flowPage.keyboard.press('Control+A');
                await flowPage.keyboard.press('Delete');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await flowPage.type('textarea, input[type=\"text\"], [contenteditable=\"true\"]', cute.prompt, { delay: 10 });
                await flowPage.keyboard.press('Enter');
                
                console.log(`✅ CUTE ${cute.episode}: ${cute.animal} - "${cute.word.spanish}" (${cute.word.english})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log(`❌ CUTE ERROR: ${error.message}`);
            }
        }
        
        console.log(`🎯 CUTE ANIMALS BURST COMPLETE!`);
        console.log(`📊 TOTAL CUTE VIDEOS: ${cuteCount}`);
        console.log(`🐾 Viral dopamine-inducing cuteness with Spanish learning!`);
        
    } catch (error) {
        console.log(`❌ CUTE ANIMALS ERROR: ${error.message}`);
    }
}

console.log('🐾 CUTE ANIMALS VIRAL SHORTS ACTIVATED!');
console.log('😍 DOPAMINE-INDUCING FEATURES:');
console.log('   🐱 Tiny orange kitten with huge round eyes');
console.log('   🐼 Fluffy baby panda with wondering look');
console.log('   🐶 Small golden puppy with floppy ears');
console.log('   🐰 Baby bunny with twitching nose');
console.log('   🐥 Little duckling with curious waddle');
console.log('   🐹 Miniature hamster with chubby cheeks');
console.log('   🦊 Young fox kit with bright eyes');
console.log('   🐨 Small koala with sleepy expression');
console.log('   🦉 Baby owl with enormous eyes');
console.log('   🐑 Little lamb with curly white wool');
console.log('✅ Each animal says ONE Spanish word repeatedly!');
console.log('✅ Hilarious punchlines and surprise endings!');
console.log('✅ Visual context makes meaning crystal clear!');
console.log('✅ Pure viral dopamine content!\\n');

// Start cute animals immediately
injectCuteAnimals();
setInterval(injectCuteAnimals, 25000); // Every 25 seconds