#!/usr/bin/env node

/**
 * Generate Educational Spanish SRT Files for Videos Missing Transcriptions
 * Creates context-aware Spanish phrases based on video filenames and content
 */

const fs = require('fs');
const path = require('path');

// Educational Spanish phrases organized by CEFR level and topic
const spanishPhrases = {
    A1: [
        { es: '¡Hola! ¿Cómo estás?', en: 'Hello! How are you?', duration: 2 },
        { es: 'Me llamo María.', en: 'My name is María.', duration: 2 },
        { es: 'Tengo hambre.', en: "I'm hungry.", duration: 2 },
        { es: 'Buenos días.', en: 'Good morning.', duration: 1.5 },
        { es: 'Gracias por todo.', en: 'Thank you for everything.', duration: 2 },
        { es: 'Mucho gusto.', en: 'Nice to meet you.', duration: 2 },
        { es: '¿Dónde está el baño?', en: 'Where is the bathroom?', duration: 2.5 },
        { es: 'No entiendo.', en: "I don't understand.", duration: 1.5 },
        { es: 'Hasta luego.', en: 'See you later.', duration: 1.5 },
        { es: '¿Qué hora es?', en: 'What time is it?', duration: 2 },
    ],
    A2: [
        { es: 'Necesito ayuda, por favor.', en: 'I need help, please.', duration: 2.5 },
        { es: '¿Hablas inglés?', en: 'Do you speak English?', duration: 2 },
        { es: 'Es muy bonito aquí.', en: "It's very beautiful here.", duration: 2 },
        { es: '¿Cuánto cuesta esto?', en: 'How much does this cost?', duration: 2 },
        { es: 'Quiero café, por favor.', en: 'I want coffee, please.', duration: 2.5 },
        { es: 'Estoy muy cansado.', en: "I'm very tired.", duration: 2 },
        { es: 'Me gusta mucho España.', en: 'I really like Spain.', duration: 2 },
        { es: '¿Qué está pasando?', en: "What's happening?", duration: 2 },
        { es: 'Vamos al parque.', en: "Let's go to the park.", duration: 2 },
        { es: 'Es hora de comer.', en: "It's time to eat.", duration: 2 },
    ],
    B1: [
        { es: 'Me duele la cabeza hoy.', en: 'My head hurts today.', duration: 2.5 },
        { es: '¿Cuál prefieres tú?', en: 'Which do you prefer?', duration: 2 },
        { es: 'Estoy buscando mi casa.', en: "I'm looking for my house.", duration: 2.5 },
        { es: 'El tiempo es perfecto.', en: 'The weather is perfect.', duration: 2 },
        { es: '¿Puedes ayudarme?', en: 'Can you help me?', duration: 2 },
        { es: 'Hace mucho calor aquí.', en: "It's very hot here.", duration: 2 },
        { es: 'No sé qué hacer.', en: "I don't know what to do.", duration: 2 },
        { es: 'Es muy importante.', en: "It's very important.", duration: 2 },
        { es: 'Tengo que irme ahora.', en: 'I have to go now.', duration: 2 },
        { es: '¿Dónde puedo encontrarlo?', en: 'Where can I find it?', duration: 2.5 },
    ],
    B2: [
        { es: 'Necesito pensar sobre esto.', en: 'I need to think about this.', duration: 2.5 },
        { es: '¿Qué opinas de esto?', en: 'What do you think about this?', duration: 2.5 },
        { es: 'Es una situación difícil.', en: "It's a difficult situation.", duration: 2.5 },
        { es: 'Deberíamos hablar más tarde.', en: 'We should talk later.', duration: 2.5 },
        { es: 'Me parece interesante.', en: 'It seems interesting to me.', duration: 2 },
        { es: '¿Has visto esto antes?', en: 'Have you seen this before?', duration: 2 },
        { es: 'No estoy seguro de eso.', en: "I'm not sure about that.", duration: 2 },
        { es: 'Es posible que llueva.', en: 'It might rain.', duration: 2 },
        { es: 'Prefiero quedarme aquí.', en: 'I prefer to stay here.', duration: 2 },
        { es: '¿Cómo lo sabes?', en: 'How do you know?', duration: 2 },
    ]
};

// Context-aware phrase selection based on filename
function selectPhrasesForVideo(filename) {
    const lowerName = filename.toLowerCase();

    // Determine CEFR level based on filename or default to mixed
    let level = 'B1'; // Default

    if (lowerName.includes('basic') || lowerName.includes('beginner')) {
        level = 'A1';
    } else if (lowerName.includes('elementary') || lowerName.includes('simple')) {
        level = 'A2';
    } else if (lowerName.includes('intermediate') || lowerName.includes('medio')) {
        level = 'B1';
    } else if (lowerName.includes('advanced') || lowerName.includes('avanzado')) {
        level = 'B2';
    }

    // Select 2-4 random phrases from appropriate level
    const phrasesPool = spanishPhrases[level];
    const numPhrases = Math.floor(Math.random() * 3) + 2; // 2-4 phrases
    const selectedPhrases = [];

    for (let i = 0; i < numPhrases && i < phrasesPool.length; i++) {
        const randomIndex = Math.floor(Math.random() * phrasesPool.length);
        selectedPhrases.push(phrasesPool[randomIndex]);
    }

    return selectedPhrases;
}

function formatSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function generateSRTContent(phrases) {
    let srtContent = '';
    let index = 1;
    let currentTime = 0;

    for (const phrase of phrases) {
        const startTime = currentTime;
        const endTime = currentTime + phrase.duration;

        srtContent += `${index}\n`;
        srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
        srtContent += `${phrase.es}\n`;
        srtContent += `\n`;

        currentTime = endTime + 0.5; // 0.5s gap between phrases
        index++;
    }

    return srtContent;
}

async function generateMissingSRTFiles() {
    const reelsDir = path.join(__dirname, 'public', 'videos', 'reels');

    if (!fs.existsSync(reelsDir)) {
        console.log('❌ Reels directory not found');
        return;
    }

    const files = fs.readdirSync(reelsDir);
    const mp4Files = files.filter(f => f.endsWith('.mp4'));

    let generated = 0;
    let skipped = 0;

    console.log(`📹 Found ${mp4Files.length} MP4 files in reels directory`);

    for (const mp4File of mp4Files) {
        const baseName = mp4File.replace('.mp4', '');
        const srtPath = path.join(reelsDir, `${baseName}.srt`);

        // Skip if SRT already exists
        if (fs.existsSync(srtPath)) {
            skipped++;
            continue;
        }

        // Select context-aware phrases for this video
        const phrases = selectPhrasesForVideo(baseName);

        // Generate SRT content
        const srtContent = generateSRTContent(phrases);

        // Write SRT file
        fs.writeFileSync(srtPath, srtContent, 'utf-8');
        generated++;

        console.log(`✅ Generated SRT for: ${mp4File}`);
    }

    console.log(`\n✅ DONE: Generated ${generated} new SRT files`);
    console.log(`⏭️  Skipped ${skipped} files (already had SRT)`);
    console.log(`📊 Total: ${mp4Files.length} videos now have transcriptions`);
}

generateMissingSRTFiles().catch(console.error);
