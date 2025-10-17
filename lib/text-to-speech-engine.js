/**
 * 🎙️ TEXT-TO-SPEECH ENGINE
 * 
 * Professional audio narration for articles with:
 * - ElevenLabs integration (high quality)
 * - Google Cloud TTS fallback
 * - Audio caching
 * - Multiple Spanish voices (Spain, Mexico, Argentina)
 * - Variable speed control (0.5x - 1.5x)
 * - Sentence segmentation for highlighting
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class TextToSpeechEngine {
    constructor() {
        this.cacheDir = path.join(__dirname, '../cache/audio');
        this.providers = {
            elevenlabs: {
                enabled: !!process.env.ELEVENLABS_API_KEY,
                apiKey: process.env.ELEVENLABS_API_KEY,
                voices: {
                    spain_male: 'pNInz6obpgDQGcFmaJgB',      // Spanish (Spain) Male
                    spain_female: 'VR6AewLTigWG4xSOukaG',    // Spanish (Spain) Female
                    mexico_male: 'IKne3meq5aSn9XLyUdCD',     // Spanish (Mexico) Male
                    mexico_female: 'jBpfuIE2acCO8z3wKNLl',  // Spanish (Mexico) Female
                    argentina_male: 'yoZ06aMxZJJ28mfd3POQ', // Spanish (Argentina) Male
                    argentina_female: 'EXAVITQu4vr4xnSDxMaL' // Spanish (Argentina) Female
                }
            },
            google: {
                enabled: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
                voices: {
                    spain_male: 'es-ES-Standard-B',
                    spain_female: 'es-ES-Standard-A',
                    mexico_male: 'es-US-Standard-B',
                    mexico_female: 'es-US-Standard-A',
                    argentina_male: 'es-ES-Wavenet-B',
                    argentina_female: 'es-ES-Wavenet-A'
                }
            },
            browser: {
                enabled: true, // Always available as final fallback
                voices: ['es-ES', 'es-MX', 'es-AR']
            }
        };

        this.ensureCacheDirectory();
    }

    async ensureCacheDirectory() {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
        } catch (error) {
            console.error('Error creating cache directory:', error);
        }
    }

    /**
     * Generate audio for article content
     * @param {string} text - Article text content
     * @param {Object} options - Audio generation options
     * @returns {Object} - Audio data and metadata
     */
    async generateAudio(text, options = {}) {
        const {
            voice = 'spain_female',
            speed = 1.0,
            format = 'mp3',
            useCache = true
        } = options;

        // Generate cache key
        const cacheKey = this.generateCacheKey(text, voice, speed);
        
        // Check cache first
        if (useCache) {
            const cachedAudio = await this.getFromCache(cacheKey);
            if (cachedAudio) {
                console.log(`✅ Audio cache hit: ${cacheKey}`);
                return cachedAudio;
            }
        }

        console.log(`🎙️ Generating audio with voice: ${voice}, speed: ${speed}`);

        // Try providers in order of preference
        let audioData = null;

        // 1. Try ElevenLabs (highest quality)
        if (this.providers.elevenlabs.enabled) {
            try {
                audioData = await this.generateWithElevenLabs(text, voice, speed);
                console.log('✅ Generated with ElevenLabs');
            } catch (error) {
                console.error('❌ ElevenLabs failed:', error.message);
            }
        }

        // 2. Try Google Cloud TTS (good quality)
        if (!audioData && this.providers.google.enabled) {
            try {
                audioData = await this.generateWithGoogle(text, voice, speed);
                console.log('✅ Generated with Google TTS');
            } catch (error) {
                console.error('❌ Google TTS failed:', error.message);
            }
        }

        // 3. Fallback to browser TTS metadata
        if (!audioData) {
            console.log('⚠️ Using browser TTS fallback');
            audioData = this.generateBrowserTTSMetadata(text, voice, speed);
        }

        // Cache the result
        if (useCache && audioData) {
            await this.saveToCache(cacheKey, audioData);
        }

        return audioData;
    }

    /**
     * Generate audio using ElevenLabs API
     */
    async generateWithElevenLabs(text, voice, speed) {
        const voiceId = this.providers.elevenlabs.voices[voice] || 
                       this.providers.elevenlabs.voices.spain_female;

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': this.providers.elevenlabs.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            })
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return {
            provider: 'elevenlabs',
            audio: base64Audio,
            format: 'mp3',
            voice: voice,
            speed: speed,
            duration: this.estimateDuration(text, speed),
            sentences: this.segmentIntoSentences(text),
            dataUrl: `data:audio/mpeg;base64,${base64Audio}`
        };
    }

    /**
     * Generate audio using Google Cloud TTS
     */
    async generateWithGoogle(text, voice, speed) {
        // Only load if actually being used
        const textToSpeech = require('@google-cloud/text-to-speech');
        const client = new textToSpeech.TextToSpeechClient();

        const voiceName = this.providers.google.voices[voice] || 
                         this.providers.google.voices.spain_female;

        const [response] = await client.synthesizeSpeech({
            input: { text: text },
            voice: {
                languageCode: voiceName.startsWith('es-ES') ? 'es-ES' : 
                             voiceName.startsWith('es-US') ? 'es-US' : 'es-ES',
                name: voiceName
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: speed,
                pitch: 0,
                volumeGainDb: 0
            }
        });

        const base64Audio = response.audioContent.toString('base64');

        return {
            provider: 'google',
            audio: base64Audio,
            format: 'mp3',
            voice: voice,
            speed: speed,
            duration: this.estimateDuration(text, speed),
            sentences: this.segmentIntoSentences(text),
            dataUrl: `data:audio/mpeg;base64,${base64Audio}`
        };
    }

    /**
     * Generate metadata for browser-based TTS
     */
    generateBrowserTTSMetadata(text, voice, speed) {
        return {
            provider: 'browser',
            text: text,
            format: 'browser',
            voice: voice,
            speed: speed,
            duration: this.estimateDuration(text, speed),
            sentences: this.segmentIntoSentences(text),
            browserVoice: this.mapToBrowserVoice(voice)
        };
    }

    /**
     * Segment text into sentences for synchronized highlighting
     */
    segmentIntoSentences(text) {
        // Split by sentence boundaries while preserving punctuation
        const sentenceRegex = /[^.!?¿¡]+[.!?¿¡]+/g;
        const matches = text.match(sentenceRegex) || [text];
        
        let offset = 0;
        const sentences = matches.map(sentence => {
            const trimmed = sentence.trim();
            const start = offset;
            const duration = this.estimateSentenceDuration(trimmed);
            
            offset += duration;
            
            return {
                text: trimmed,
                start: start,
                end: offset,
                duration: duration,
                words: trimmed.split(/\s+/).length
            };
        });

        return sentences;
    }

    /**
     * Estimate audio duration based on text length
     */
    estimateDuration(text, speed = 1.0) {
        // Average Spanish speaking rate: 150-160 words per minute
        const words = text.split(/\s+/).length;
        const baseWPM = 155;
        const adjustedWPM = baseWPM * speed;
        const durationSeconds = (words / adjustedWPM) * 60;
        
        return Math.round(durationSeconds * 1000); // Return in milliseconds
    }

    /**
     * Estimate duration for a single sentence
     */
    estimateSentenceDuration(sentence) {
        const words = sentence.split(/\s+/).length;
        const baseWPM = 155;
        const durationSeconds = (words / baseWPM) * 60;
        
        // Add small pause between sentences
        return Math.round((durationSeconds + 0.3) * 1000);
    }

    /**
     * Map custom voice names to browser voice languages
     */
    mapToBrowserVoice(voice) {
        const mapping = {
            spain_male: 'es-ES',
            spain_female: 'es-ES',
            mexico_male: 'es-MX',
            mexico_female: 'es-MX',
            argentina_male: 'es-AR',
            argentina_female: 'es-AR'
        };

        return mapping[voice] || 'es-ES';
    }

    /**
     * Generate cache key for audio
     */
    generateCacheKey(text, voice, speed) {
        const hash = crypto
            .createHash('sha256')
            .update(`${text}-${voice}-${speed}`)
            .digest('hex');
        
        return hash.substring(0, 32);
    }

    /**
     * Get audio from cache
     */
    async getFromCache(cacheKey) {
        try {
            const metaPath = path.join(this.cacheDir, `${cacheKey}.json`);
            const metaData = await fs.readFile(metaPath, 'utf-8');
            return JSON.parse(metaData);
        } catch (error) {
            return null;
        }
    }

    /**
     * Save audio to cache
     */
    async saveToCache(cacheKey, audioData) {
        try {
            const metaPath = path.join(this.cacheDir, `${cacheKey}.json`);
            await fs.writeFile(metaPath, JSON.stringify(audioData), 'utf-8');
            
            // Clean old cache files (older than 7 days)
            await this.cleanOldCache(7);
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    /**
     * Clean old cache files
     */
    async cleanOldCache(daysOld = 7) {
        try {
            const files = await fs.readdir(this.cacheDir);
            const now = Date.now();
            const maxAge = daysOld * 24 * 60 * 60 * 1000;

            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                    console.log(`🗑️ Cleaned old cache file: ${file}`);
                }
            }
        } catch (error) {
            console.error('Error cleaning cache:', error);
        }
    }

    /**
     * Get available voices
     */
    getAvailableVoices() {
        return {
            spain: [
                { id: 'spain_male', name: 'Spanish (Spain) - Male', accent: 'Spain' },
                { id: 'spain_female', name: 'Spanish (Spain) - Female', accent: 'Spain' }
            ],
            mexico: [
                { id: 'mexico_male', name: 'Spanish (Mexico) - Male', accent: 'Mexico' },
                { id: 'mexico_female', name: 'Spanish (Mexico) - Female', accent: 'Mexico' }
            ],
            argentina: [
                { id: 'argentina_male', name: 'Spanish (Argentina) - Male', accent: 'Argentina' },
                { id: 'argentina_female', name: 'Spanish (Argentina) - Female', accent: 'Argentina' }
            ]
        };
    }

    /**
     * Get provider status
     */
    getProviderStatus() {
        return {
            elevenlabs: {
                available: this.providers.elevenlabs.enabled,
                priority: 1
            },
            google: {
                available: this.providers.google.enabled,
                priority: 2
            },
            browser: {
                available: true,
                priority: 3
            }
        };
    }
}

module.exports = TextToSpeechEngine;

