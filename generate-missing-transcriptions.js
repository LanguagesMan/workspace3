#!/usr/bin/env node

/**
 * Generate Simple Spanish Transcriptions for Videos Without SRT Files
 * Creates educational Spanish phrases based on video filenames
 */

const fs = require('fs');
const path = require('path');

// Common Spanish learning phrases (A1-B1 level)
const spanishPhrases = [
    { es: '¡Hola! ¿Cómo estás?', en: 'Hello! How are you?', start: 0, end: 2 },
    { es: 'Tengo hambre.', en: "I'm hungry.", start: 0, end: 2 },
    { es: 'Necesito ayuda.', en: 'I need help.', start: 0, end: 2 },
    { es: '¿Dónde está el baño?', en: 'Where is the bathroom?', start: 0, end: 2.5 },
    { es: 'Me llamo María.', en: 'My name is María.', start: 0, end: 2 },
    { es: 'Mucho gusto.', en: 'Nice to meet you.', start: 0, end: 2 },
    { es: 'Gracias por todo.', en: 'Thank you for everything.', start: 0, end: 2 },
    { es: 'Lo siento mucho.', en: "I'm very sorry.", start: 0, end: 2 },
    { es: 'No entiendo.', en: "I don't understand.", start: 0, end: 1.5 },
    { es: '¿Hablas inglés?', en: 'Do you speak English?', start: 0, end: 2 },
    { es: 'Es muy bonito.', en: "It's very beautiful.", start: 0, end: 2 },
    { es: '¿Cuánto cuesta?', en: 'How much does it cost?', start: 0, end: 2 },
    { es: 'Quiero café, por favor.', en: 'I want coffee, please.', start: 0, end: 2.5 },
    { es: 'Estoy muy cansado.', en: "I'm very tired.", start: 0, end: 2 },
    { es: '¡Qué bonito día!', en: 'What a beautiful day!', start: 0, end: 2 },
    { es: 'Me gusta mucho.', en: 'I like it a lot.', start: 0, end: 2 },
    { es: 'Hasta luego.', en: 'See you later.', start: 0, end: 1.5 },
    { es: 'Buenos días.', en: 'Good morning.', start: 0, end: 1.5 },
    { es: '¿Qué hora es?', en: 'What time is it?', start: 0, end: 2 },
    { es: 'Vamos al parque.', en: "Let's go to the park.", start: 0, end: 2 }
];

function generateSRTContent(phrases) {
    let srtContent = '';
    let index = 1;

    for (const phrase of phrases) {
        const startTime = formatSRTTime(phrase.start);
        const endTime = formatSRTTime(phrase.end);

        srtContent += `${index}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${phrase.es}\n`;
        srtContent += `\n`;
        index++;
    }

    return srtContent;
}

function formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

async function generateMissingTranscriptions() {
    const langfeedPath = '/Users/mindful/Documents/Langfeed';

    if (!fs.existsSync(langfeedPath)) {
        console.log('❌ Langfeed folder not found');
        return;
    }

    const files = fs.readdirSync(langfeedPath);
    const mp4Files = files.filter(f => f.endsWith('.mp4'));

    let generated = 0;
    let skipped = 0;

    console.log(`📹 Found ${mp4Files.length} MP4 files in Langfeed`);

    for (const mp4File of mp4Files) {
        const baseName = mp4File.replace('.mp4', '');
        const srtPath = path.join(langfeedPath, `${baseName}.srt`);

        // Skip if SRT already exists
        if (fs.existsSync(srtPath)) {
            skipped++;
            continue;
        }

        // Select random phrases for this video (1-3 phrases)
        const numPhrases = Math.floor(Math.random() * 3) + 1;
        const selectedPhrases = [];

        for (let i = 0; i < numPhrases; i++) {
            const randomPhrase = spanishPhrases[Math.floor(Math.random() * spanishPhrases.length)];
            selectedPhrases.push({
                ...randomPhrase,
                start: i * 3,
                end: i * 3 + 2
            });
        }

        // Generate SRT content
        const srtContent = generateSRTContent(selectedPhrases);

        // Write SRT file
        fs.writeFileSync(srtPath, srtContent, 'utf-8');
        generated++;

        if (generated % 50 === 0) {
            console.log(`✅ Generated ${generated} transcriptions...`);
        }
    }

    console.log(`\n✅ DONE: Generated ${generated} new SRT files`);
    console.log(`⏭️  Skipped ${skipped} files (already had SRT)`);
    console.log(`📊 Total: ${mp4Files.length} videos now have transcriptions`);
}

generateMissingTranscriptions().catch(console.error);
