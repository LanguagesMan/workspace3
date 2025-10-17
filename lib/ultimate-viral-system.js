#!/usr/bin/env node

/**
 * ULTIMATE VIRAL SYSTEM - ALL OUR GENIUS CONCEPTS!
 * Every type of content we created: superheroes, parodies, sexy women, objects, documentaries, reality shows, ASMR, etc.
 */

import { chromium } from 'playwright';

let burstCount = 0;

function createUltimatePrompt() {
    const r = Math.floor(Date.now() + Math.random() * 1000000) % 25;
    
    // MAIN CHARACTER SERIES (our proven winners)
    if (r === 0) {
        return `LANGAI superhero character (COMPLETE DESCRIPTION): Cartoon Earth globe showing blue oceans (#1E90FF) and green continents (#228B22) with North and South America clearly visible, brown fedora hat positioned slightly tilted left on top of the globe, BLACK PIXELATED SUNGLASSES with exactly 8 black square pixels per lens arranged in 2x4 grid (retro 8-bit gaming style), lit cigar held in RIGHT HAND (not in mouth) with thin gray smoke curling upward, white cartoon gloves with black outlines four fingers visible, thin black cartoon legs with brown leather shoes with visible laces and darker brown soles. Tries to fly but crashes into building, says slowly "No puedo volar" in Spanish then dusts off cape with dignity. Deep gravelly voice like 80-year-old man who smokes cigars, speaking extremely slowly in Spanish for learning. Bold cartoon animation with thick black outlines (3px width).`;
    }
    
    if (r === 1) {
        return `MARCO the American tourist (COMPLETE DESCRIPTION): 40-year-old fat American man with big round belly and chubby face, 5'9" height, naturally tanned skin with smile lines, short brown hair with natural cowlick on left side that sticks up, warm brown eyes behind rectangular wire-frame reading glasses that are ALWAYS sliding down nose, genuine confused smile showing slightly crooked front teeth, expressive eyebrows that furrow when puzzled, confident posture despite constant bewilderment, naturally animated hand gestures when speaking. EXACT OUTFIT (NEVER CHANGES): Bright fire-engine red cotton t-shirt with large white 'I ❤️ ESPAÑA' graphic across chest (heart is actual red heart symbol), white plastic name tag pinned to left chest reading 'HOLA SOY MARCO' in black Comic Sans font. Gets lost with obvious map right next to destination, says slowly "¿Dónde está?" in Spanish while pointing at map. Friendly American accent speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 2) {
        return `Profesora Isabella: Stunning 28-year-old teacher in red blazer and heels, teaches Spanish while hanging upside down from tree branch during jungle adventure, says slowly "Los verbos son importantes" in Spanish while swinging. Beautiful face, long dark hair, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 3) {
        return `Chef Flaco: Extremely thin Spanish chef (6'2", 120 pounds), huge mustache, missing tooth, tries to cook single grain of rice with massive flamethrower, destroys kitchen, says slowly "¡Fuego perfecto!" in Spanish while standing in rubble. Speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 4) {
        return `Buck failed superhero: Chubby man in too-small blue costume, tries "heat vision" by squinting at ice cube, cube melts from room temperature, says slowly "¡Mis poderes!" in Spanish with proud expression. Speaking extremely slowly in Spanish for learning.`;
    }
    
    // SEXY WOMEN SERIES (maximum appeal)
    if (r === 5) {
        return `Stunning woman in revealing bikini on beach, teaches Spanish by pointing to objects that keep disappearing, searches confused saying slowly "¿Dónde está?" in Spanish, final object appears as giant version behind her. Speaking extremely slowly in Spanish for learning. Photorealistic beautiful woman.`;
    }
    
    if (r === 6) {
        return `Beautiful redhead in transparent top doing fitness routine, each Spanish exercise command makes reality change - says "¡Arriba!" and gravity reverses, everyone floats upward. Speaking extremely slowly in Spanish for learning. Stunning figure, maximum visual appeal.`;
    }
    
    // OBJECT COMEDY SERIES (your favorites)
    if (r === 7) {
        return `Alarm clock with sad cartoon eyes contemplates existence, stares at camera dramatically and says slowly "¿Por qué todos me odian?" in Spanish while having existential crisis. Real object with 2D face, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 8) {
        return `Coffee mug with worried cartoon face realizes it's empty, has emotional breakdown about usefulness, says slowly "¡Estoy vacío!" in Spanish while crying cartoon tears. Real object with 2D face, speaking extremely slowly in Spanish for learning.`;
    }
    
    // DOCUMENTARY PARODIES (serious comedy)
    if (r === 9) {
        return `Nature documentary: David Attenborough-style narrator seriously studying Spanish word "pequeño" in its natural habitat, observes tiny objects with scientific fascination, says slowly "El pequeño en su ambiente natural" in Spanish. Professional documentary cinematography, deadpan serious treatment.`;
    }
    
    if (r === 10) {
        return `Mockumentary: British expert in suit being interviewed about Spanish word "grande", treats it as profound scientific discovery, says slowly "Grande significa... muy grande" in Spanish with dramatic pauses. Professional documentary style, serious lighting, British deadpan comedy.`;
    }
    
    // REALITY SHOW PARODIES
    if (r === 11) {
        return `Spanish Bachelor parody: Handsome man giving rose to beautiful woman, both speak only Spanish, dramatic rose ceremony music, says slowly "¿Aceptas esta rosa?" in Spanish. Reality TV drama styling, multiple beautiful women, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 12) {
        return `Spanish Shore parody: Dramatic reality show confrontation between attractive people, all in Spanish, over-the-top emotions, says slowly "¡Esto es muy loco!" in Spanish with reality TV dramatic lighting. Speaking extremely slowly in Spanish for learning.`;
    }
    
    // ASMR PARODIES (whisper comedy)
    if (r === 13) {
        return `ASMR parody: Beautiful woman whispering Spanish words seductively close to microphone, but words get increasingly ridiculous - whispers "patata" (potato) like it's the sexiest word ever, says slowly "Patata... muy sexy" in Spanish. Speaking extremely slowly in Spanish for learning. Intimate ASMR setup.`;
    }
    
    if (r === 14) {
        return `ASMR Spanish lesson: Attractive teacher whispers Spanish vocabulary while tapping objects, creates relaxing sounds, whispers slowly "Agua... significa... water" in Spanish. Beautiful woman, ASMR microphone setup, speaking extremely slowly in Spanish for learning.`;
    }
    
    // PARODY FORMATS (genre mashups)
    if (r === 15) {
        return `Spanish cooking show parody: Over-dramatic TV chef treating simple sandwich like gourmet cuisine, says slowly "¡Pan muy importante!" in Spanish while classical music plays. Ridiculous overproduction, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 16) {
        return `Spanish news parody: Serious news anchor reporting absurd breaking news about dancing vegetables, completely straight delivery, says slowly "Las verduras están bailando" in Spanish. Professional news setup, ridiculous content, speaking extremely slowly in Spanish for learning.`;
    }
    
    // IMPOSSIBLE PHYSICS COMEDY
    if (r === 17) {
        return `Spanish word creates reality: Woman says "volar" and suddenly starts floating in air surprised, says slowly "¡Estoy volando!" in Spanish while floating around room. Beautiful woman, impossible physics, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 18) {
        return `Size manipulation: Woman says "grande" and everything around her becomes giant-sized, she's tiny in giant world, says slowly "¡Todo es muy grande!" in Spanish. Visual size comedy, speaking extremely slowly in Spanish for learning.`;
    }
    
    // NEW BRAINSTORMED CONCEPTS (never tried before!)
    if (r === 19) {
        return `Spanish Escape Room: Group of people trapped in room, must solve Spanish word puzzles to escape, panic builds as timer counts down, says slowly "¡Necesitamos la palabra!" in Spanish. Multiple attractive people, escape room tension, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 20) {
        return `Spanish Karaoke Disaster: Confident man attempts Spanish love song, pronunciation gets progressively worse, backup dancers confused, says slowly "¡Amor es... muy... difícil!" in Spanish while music stops. Comedy timing, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 21) {
        return `Magic Spanish School: Beautiful witch teaches Spanish spells that actually work, says "¡Desaparece!" and student accidentally vanishes, panics saying slowly "¿Dónde está?" in Spanish. Magical effects, attractive teacher, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 22) {
        return `Spanish Time Travel: Modern person accidentally travels to medieval Spain, tries ordering coffee with Spanish phrases, confused medieval people, says slowly "¿Dónde está Starbucks?" in Spanish. Historical comedy, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 23) {
        return `Spanish Alien Contact: Beautiful scientist first contact with aliens who only speak Spanish, tries translating with Google, aliens confused, says slowly "¡Hola extraterrestres!" in Spanish. Sci-fi comedy, attractive scientist, speaking extremely slowly in Spanish for learning.`;
    }
    
    if (r === 24) {
        return `Spanish Sleep Talking: Person sleep-talking in perfect Spanish while dreaming, roommate tries recording for language learning, dream gets weird, says slowly "¡Los elefantes están bailando!" in Spanish. Dream logic comedy, speaking extremely slowly in Spanish for learning.`;
    }
    
    // PUNCHLINE SURPRISE ENDINGS
    return `Motivational speaker: LANGAI giving inspirational Spanish speech to crowd, everyone cheering, says slowly "¡Sí pueden hacerlo!" in Spanish, immediately large object falls on him, continues speaking while flattened. Punchline timing, speaking extremely slowly in Spanish for learning.`;
}

async function injectUltimateBurst() {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const context = browser.contexts()[0];
        const flowPage = context?.pages().find(page => page.url().includes('labs.google/fx/tools/flow'));
        
        if (!flowPage) {
            console.log(`❌ No Flow tab found for ultimate burst ${burstCount + 1}`);
            return;
        }
        
        burstCount++;
        console.log(`\n🚀 ULTIMATE BURST ${burstCount} - INJECTING 5 GENIUS CONCEPTS SIMULTANEOUSLY`);
        
        for (let i = 1; i <= 5; i++) {
            const prompt = createUltimatePrompt();
            
            // CLEAR INPUT COMPLETELY
            await flowPage.click('textarea, input[type="text"], [contenteditable="true"]');
            await flowPage.keyboard.press('Control+A');
            await flowPage.keyboard.press('Delete');
            
            // TYPE CLEAN PROMPT
            await flowPage.type('textarea, input[type="text"], [contenteditable="true"]', prompt);
            
            // PRESS ENTER TO SUBMIT
            await flowPage.keyboard.press('Enter');
            
            console.log(`✅ INJECTED ${i}/5: ${prompt.substr(0, 60)}...`);
            
            // Short delay between injections
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`🎯 ULTIMATE BURST ${burstCount} COMPLETE - 5 GENIUS VIDEOS GENERATING!`);
        console.log(`📊 TOTAL VIRAL VIDEOS: ${burstCount * 5}`);
        console.log(`🎭 CONCEPTS COVERED: Characters, Parodies, Sexy Women, Objects, Documentaries, Reality Shows, ASMR, Physics Comedy, Punchlines\n`);
        
    } catch (error) {
        console.log(`❌ Error in ultimate burst ${burstCount + 1}: ${error.message}`);
    }
}

console.log('🎬 ULTIMATE VIRAL SYSTEM ACTIVATED!');
console.log('🎯 ALL GENIUS CONCEPTS INCLUDED:');
console.log('   • Main Characters: LANGAI, Marco, Isabella, Chef Flaco, Buck');
console.log('   • Sexy Women: Bikini, fitness, revealing outfits');
console.log('   • Object Comedy: Existential alarm clocks, crying mugs');
console.log('   • Documentary Parodies: Nature docs, mockumentaries'); 
console.log('   • Reality Show Parodies: Spanish Bachelor, Spanish Shore');
console.log('   • ASMR Parodies: Seductive whispering, relaxing Spanish');
console.log('   • Physics Comedy: Flying, size changes, impossible reality');
console.log('   • Punchline Timing: Surprise endings, visual comedy');
console.log('✅ English prompts with extremely slow Spanish speech');
console.log('✅ 5 videos generated simultaneously\n');

// Start immediately, then every 45 seconds
injectUltimateBurst();
setInterval(injectUltimateBurst, 45000);
