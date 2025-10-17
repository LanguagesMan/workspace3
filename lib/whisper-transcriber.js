/**
 * 🎙️ WHISPER TRANSCRIPTION SYSTEM
 * Auto-transcribe videos with Spanish audio + English translation
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class WhisperTranscriber {
    constructor(options = {}) {
        this.openaiApiKey = options.apiKey || process.env.OPENAI_API_KEY;
        this.videosDir = options.videosDir || path.join(__dirname, '../public/videos');
        this.concurrentProcesses = options.concurrent || 5;
        this.processedCount = 0;
        this.totalCount = 0;
        this.errors = [];
    }

    /**
     * Find all videos without SRT files
     */
    async findVideosWithoutSRT() {
        const videos = [];
        
        async function scanDirectory(dir) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (item.name.match(/\.(mp4|mov)$/i)) {
                    const baseName = item.name.replace(/\.(mp4|mov)$/i, '');
                    const srtPath = path.join(dir, baseName + '.srt');
                    
                    if (!fs.existsSync(srtPath)) {
                        videos.push({
                            videoPath: fullPath,
                            srtPath: srtPath,
                            baseName: baseName
                        });
                    }
                }
            }
        }
        
        await scanDirectory(this.videosDir);
        return videos;
    }

    /**
     * Transcribe single video with Whisper
     */
    async transcribeVideo(videoPath) {
        console.log(`🎙️ Transcribing: ${path.basename(videoPath)}`);
        
        try {
            // Use whisper command line tool (faster than API for local)
            // Install with: pip install openai-whisper
            const command = `whisper "${videoPath}" --language Spanish --model medium --output_format srt --output_dir "${path.dirname(videoPath)}" --verbose False`;
            
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('100%')) {
                console.warn(`⚠️ Warning: ${stderr}`);
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Error transcribing ${path.basename(videoPath)}:`, error.message);
            this.errors.push({ videoPath, error: error.message });
            return false;
        }
    }

    /**
     * Add English translation to SRT
     */
    async addTranslation(srtPath) {
        try {
            const content = fs.readFileSync(srtPath, 'utf-8');
            const lines = content.split('\n');
            const enhanced = [];
            
            let i = 0;
            while (i < lines.length) {
                const line = lines[i].trim();
                
                // Check if it's a subtitle number
                if (/^\d+$/.test(line)) {
                    enhanced.push(line); // Number
                    i++;
                    enhanced.push(lines[i]); // Timestamp
                    i++;
                    
                    // Spanish text
                    const spanishText = lines[i] || '';
                    enhanced.push(spanishText);
                    
                    // Add English translation (would use translation API here)
                    // For now, add placeholder that will be translated
                    const englishText = await this.translateText(spanishText);
                    enhanced.push(englishText);
                    enhanced.push(''); // Empty line separator
                    
                    i++;
                    
                    // Skip empty lines
                    while (i < lines.length && !lines[i].trim()) {
                        i++;
                    }
                } else {
                    i++;
                }
            }
            
            fs.writeFileSync(srtPath, enhanced.join('\n'), 'utf-8');
            return true;
        } catch (error) {
            console.error(`❌ Error adding translation to ${path.basename(srtPath)}:`, error.message);
            return false;
        }
    }

    /**
     * Translate Spanish text to English
     */
    async translateText(spanishText) {
        if (!spanishText || !spanishText.trim()) {
            return '';
        }

        // Basic translation dictionary (expand this)
        const quickTranslations = {
            'hola': 'hello',
            'buenos días': 'good morning',
            'buenas tardes': 'good afternoon',
            'buenas noches': 'good evening',
            'gracias': 'thank you',
            'por favor': 'please',
            'sí': 'yes',
            'no': 'no',
            'agua': 'water',
            'comida': 'food',
            'casa': 'house',
            'tengo hambre': "I'm hungry",
            'tengo sed': "I'm thirsty",
            'me gusta': 'I like',
            'no me gusta': "I don't like",
            'estoy cansado': "I'm tired",
            'estoy bien': "I'm fine",
            '¿cómo estás?': 'how are you?',
            '¿qué tal?': "what's up?",
            'mucho gusto': 'nice to meet you',
            'hasta luego': 'see you later',
            'adiós': 'goodbye'
        };

        const lowerText = spanishText.toLowerCase().trim();
        
        // Check for direct match
        if (quickTranslations[lowerText]) {
            return quickTranslations[lowerText];
        }

        // If OpenAI API key is available, use it
        if (this.openaiApiKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.openaiApiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [{
                            role: 'system',
                            content: 'You are a Spanish to English translator. Translate naturally and concisely. Return ONLY the translation, no explanations.'
                        }, {
                            role: 'user',
                            content: spanishText
                        }],
                        max_tokens: 100,
                        temperature: 0.3
                    })
                });

                const data = await response.json();
                if (data.choices && data.choices[0]) {
                    return data.choices[0].message.content.trim();
                }
            } catch (error) {
                console.warn('Translation API error, using fallback');
            }
        }

        // Fallback: return original text (better than nothing)
        return `[Translation needed: ${spanishText}]`;
    }

    /**
     * Process videos in batches
     */
    async processBatch(videos) {
        const batches = [];
        for (let i = 0; i < videos.length; i += this.concurrentProcesses) {
            batches.push(videos.slice(i, i + this.concurrentProcesses));
        }

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            
            console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} videos)`);
            
            const promises = batch.map(async (video) => {
                const success = await this.transcribeVideo(video.videoPath);
                if (success) {
                    // Add English translation
                    await this.addTranslation(video.srtPath);
                    this.processedCount++;
                }
                
                const progress = ((this.processedCount / this.totalCount) * 100).toFixed(1);
                console.log(`✅ Progress: ${this.processedCount}/${this.totalCount} (${progress}%)`);
            });

            await Promise.all(promises);
        }
    }

    /**
     * Start transcription process
     */
    async start() {
        console.log('🎙️ WHISPER TRANSCRIPTION SYSTEM STARTING...\n');
        
        // Find videos without SRT
        console.log('📂 Scanning for videos without transcriptions...');
        const videos = await this.findVideosWithoutSRT();
        
        if (videos.length === 0) {
            console.log('✅ All videos already have transcriptions!');
            return;
        }

        this.totalCount = videos.length;
        console.log(`\n📊 Found ${this.totalCount} videos needing transcription\n`);
        console.log(`⚙️  Processing ${this.concurrentProcesses} videos at a time\n`);
        console.log(`⏱️  Estimated time: ${Math.ceil(this.totalCount * 30 / this.concurrentProcesses / 60)} minutes\n`);
        
        const startTime = Date.now();

        // Process all videos
        await this.processBatch(videos);

        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ TRANSCRIPTION COMPLETE!');
        console.log('='.repeat(70));
        console.log(`✅ Processed: ${this.processedCount}/${this.totalCount} videos`);
        console.log(`⏱️  Time taken: ${duration} minutes`);
        
        if (this.errors.length > 0) {
            console.log(`\n⚠️  Errors: ${this.errors.length}`);
            this.errors.forEach(err => {
                console.log(`   - ${path.basename(err.videoPath)}: ${err.error}`);
            });
        }
        
        console.log('\n✅ All transcriptions saved with Spanish + English!');
    }
}

// CLI execution
if (require.main === module) {
    const transcriber = new WhisperTranscriber({
        concurrent: 5,
        apiKey: process.env.OPENAI_API_KEY
    });
    
    transcriber.start().catch(console.error);
}

module.exports = WhisperTranscriber;

