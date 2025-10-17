/**
 * 🌐 TRANSLATION SERVICE
 * 
 * Real translations using LibreTranslate API with intelligent caching
 * Features:
 * - LibreTranslate API integration (https://libretranslate.com)
 * - Supabase caching for fast repeated lookups
 * - Batch translation support
 * - Rate limiting (5 requests/second)
 * - Fallback to cached translations if API fails
 * - Automatic retry with exponential backoff
 */

const fetch = require('node-fetch');
const { supabase, isConfigured } = require('./supabase-client');

class TranslationService {
    constructor() {
        // LibreTranslate API configuration
        this.apiUrl = 'https://libretranslate.com';
        this.apiKey = process.env.LIBRETRANSLATE_API_KEY || null; // Optional, free tier works
        
        // Rate limiting
        this.requestQueue = [];
        this.isProcessing = false;
        this.requestsPerSecond = 5;
        this.requestInterval = 1000 / this.requestsPerSecond; // 200ms between requests
        
        // In-memory cache for this session
        this.memoryCache = new Map();
        this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
        
        console.log('🌐 Translation Service initialized');
        console.log(`   API URL: ${this.apiUrl}`);
        console.log(`   Rate limit: ${this.requestsPerSecond} req/s`);
    }

    /**
     * Translate text from source language to target language
     */
    async translateText(text, sourceLang = 'es', targetLang = 'en') {
        if (!text || text.trim() === '') {
            return '';
        }

        // Normalize input
        text = text.trim();
        sourceLang = sourceLang.toLowerCase();
        targetLang = targetLang.toLowerCase();

        // Check if already same language
        if (sourceLang === targetLang) {
            return text;
        }

        // Create cache key
        const cacheKey = this.createCacheKey(text, sourceLang, targetLang);

        // Check memory cache first (fastest)
        if (this.memoryCache.has(cacheKey)) {
            const cached = this.memoryCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                console.log('✅ Translation from memory cache');
                return cached.translation;
            }
        }

        // Check Supabase cache (fast)
        const cachedTranslation = await this.getCachedTranslation(text, sourceLang, targetLang);
        if (cachedTranslation) {
            // Update memory cache
            this.memoryCache.set(cacheKey, {
                translation: cachedTranslation,
                timestamp: Date.now()
            });
            console.log('✅ Translation from database cache');
            return cachedTranslation;
        }

        // Fetch from LibreTranslate API with rate limiting
        try {
            const translation = await this.fetchFromAPI(text, sourceLang, targetLang);
            
            // Cache the result
            await this.cacheTranslation(text, translation, sourceLang, targetLang);
            
            // Update memory cache
            this.memoryCache.set(cacheKey, {
                translation,
                timestamp: Date.now()
            });

            console.log(`✅ Translated: "${text.substring(0, 30)}..." -> "${translation.substring(0, 30)}..."`);
            return translation;

        } catch (error) {
            console.error('Translation error:', error.message);
            
            // Return original text if translation fails
            return text;
        }
    }

    /**
     * Batch translate multiple texts (more efficient)
     */
    async batchTranslate(texts, sourceLang = 'es', targetLang = 'en') {
        if (!texts || texts.length === 0) {
            return [];
        }

        console.log(`🔄 Batch translating ${texts.length} texts...`);

        const translations = await Promise.all(
            texts.map(text => this.translateText(text, sourceLang, targetLang))
        );

        console.log(`✅ Batch translation complete: ${translations.length} items`);
        return translations;
    }

    /**
     * Fetch translation from LibreTranslate API with rate limiting
     */
    async fetchFromAPI(text, sourceLang, targetLang) {
        return new Promise((resolve, reject) => {
            // Add to queue
            this.requestQueue.push({
                text,
                sourceLang,
                targetLang,
                resolve,
                reject,
                retries: 0
            });

            // Start processing if not already
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    /**
     * Process request queue with rate limiting
     */
    async processQueue() {
        if (this.requestQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const request = this.requestQueue.shift();

        try {
            // Make API request
            const translation = await this.makeAPIRequest(
                request.text,
                request.sourceLang,
                request.targetLang
            );

            request.resolve(translation);

        } catch (error) {
            // Retry with exponential backoff
            if (request.retries < 3) {
                request.retries++;
                console.log(`⚠️  Retrying translation (attempt ${request.retries + 1}/3)...`);
                
                // Add back to queue with delay
                setTimeout(() => {
                    this.requestQueue.unshift(request);
                }, Math.pow(2, request.retries) * 1000);
            } else {
                console.error('❌ Translation failed after 3 retries:', error.message);
                request.reject(error);
            }
        }

        // Wait before processing next request (rate limiting)
        setTimeout(() => this.processQueue(), this.requestInterval);
    }

    /**
     * Make actual API request to LibreTranslate
     */
    async makeAPIRequest(text, sourceLang, targetLang) {
        return await this.makeDirectAPIRequest(text, sourceLang, targetLang);
    }

    /**
     * Make direct HTTP request to LibreTranslate API
     */
    async makeDirectAPIRequest(text, sourceLang, targetLang) {
        const requestBody = {
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text'
        };

        if (this.apiKey) {
            requestBody.api_key = this.apiKey;
        }

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
            const response = await fetch(`${this.apiUrl}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.translatedText;

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Translation request timed out');
            }
            throw error;
        }
    }

    /**
     * Get cached translation from Supabase
     */
    async getCachedTranslation(sourceText, sourceLang, targetLang) {
        if (!isConfigured()) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('translations')
                .select('target_text')
                .eq('source_text', sourceText)
                .eq('source_lang', sourceLang)
                .eq('target_lang', targetLang)
                .single();

            if (error || !data) {
                return null;
            }

            return data.target_text;

        } catch (error) {
            console.error('Error getting cached translation:', error);
            return null;
        }
    }

    /**
     * Cache translation in Supabase
     */
    async cacheTranslation(sourceText, targetText, sourceLang, targetLang) {
        if (!isConfigured()) {
            return;
        }

        try {
            const { error } = await supabase
                .from('translations')
                .insert({
                    source_text: sourceText,
                    target_text: targetText,
                    source_lang: sourceLang,
                    target_lang: targetLang,
                    created_at: new Date().toISOString()
                });

            if (error) {
                // Ignore duplicate errors (translation already cached)
                if (!error.message.includes('duplicate')) {
                    console.error('Error caching translation:', error);
                }
            }

        } catch (error) {
            console.error('Error in cacheTranslation:', error);
        }
    }

    /**
     * Create cache key for memory cache
     */
    createCacheKey(text, sourceLang, targetLang) {
        return `${sourceLang}:${targetLang}:${text}`;
    }

    /**
     * Clear memory cache
     */
    clearMemoryCache() {
        this.memoryCache.clear();
        console.log('✅ Memory cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            memoryCacheSize: this.memoryCache.size,
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessing
        };
    }

    /**
     * Translate word with context (optimized for single words)
     */
    async translateWord(word, sourceLang = 'es', targetLang = 'en') {
        // Clean the word
        word = word.trim().toLowerCase();
        
        // Fast path for common words
        const commonTranslations = this.getCommonTranslations();
        if (commonTranslations[word]) {
            return commonTranslations[word];
        }

        // Use regular translation
        return await this.translateText(word, sourceLang, targetLang);
    }

    /**
     * Get common word translations (instant lookup)
     */
    getCommonTranslations() {
        return {
            // Common greetings & polite words
            'hola': 'hello', 'adiós': 'goodbye', 'gracias': 'thank you', 'thanks': 'thanks',
            'por favor': 'please', 'perdón': 'sorry', 'disculpa': 'excuse me',
            'buenos días': 'good morning', 'buenas tardes': 'good afternoon',
            'buenas noches': 'good night', 'hasta luego': 'see you later',
            'sí': 'yes', 'no': 'no', 'ok': 'ok', 'bien': 'well',
            
            // Articles
            'el': 'the', 'la': 'the', 'los': 'the', 'las': 'the',
            'un': 'a', 'una': 'a', 'unos': 'some', 'unas': 'some',
            
            // Common verbs
            'es': 'is', 'son': 'are', 'está': 'is', 'están': 'are',
            'tiene': 'has', 'tienen': 'have', 'hay': 'there is/are',
            'hacer': 'to do', 'ir': 'to go', 'ver': 'to see',
            'dar': 'to give', 'poder': 'can', 'decir': 'to say',
            'querer': 'to want', 'saber': 'to know', 'venir': 'to come',
            
            // Common adjectives
            'muy': 'very', 'más': 'more', 'menos': 'less',
            'grande': 'big', 'pequeño': 'small', 'bueno': 'good',
            'malo': 'bad', 'nuevo': 'new', 'viejo': 'old',
            'largo': 'long', 'corto': 'short', 'alto': 'tall',
            'bajo': 'short', 'rápido': 'fast', 'lento': 'slow',
            
            // Common prepositions
            'en': 'in', 'de': 'of', 'a': 'to', 'con': 'with',
            'por': 'for', 'para': 'for', 'sin': 'without',
            'sobre': 'about', 'entre': 'between', 'desde': 'from',
            
            // Common nouns
            'casa': 'house', 'tiempo': 'time', 'día': 'day',
            'año': 'year', 'vez': 'time', 'persona': 'person',
            'mundo': 'world', 'vida': 'life', 'hombre': 'man',
            'mujer': 'woman', 'niño': 'child', 'cosa': 'thing',
            'agua': 'water', 'comida': 'food', 'familia': 'family',
            'amigo': 'friend', 'trabajo': 'work'
        };
    }

    /**
     * Preload common translations into cache
     */
    async preloadCommonTranslations() {
        console.log('🔄 Preloading common translations...');
        
        const commonWords = Object.keys(this.getCommonTranslations());
        
        // Check which ones are not in cache
        const wordsToCache = [];
        for (const word of commonWords) {
            const cached = await this.getCachedTranslation(word, 'es', 'en');
            if (!cached) {
                wordsToCache.push(word);
            }
        }

        if (wordsToCache.length > 0) {
            console.log(`💾 Caching ${wordsToCache.length} common words...`);
            
            const translations = this.getCommonTranslations();
            for (const word of wordsToCache) {
                await this.cacheTranslation(
                    word,
                    translations[word],
                    'es',
                    'en'
                );
            }
            
            console.log('✅ Common translations preloaded');
        } else {
            console.log('✅ All common translations already cached');
        }
    }
}

// Create singleton instance
const translationService = new TranslationService();

// Preload common translations on startup
if (isConfigured()) {
    translationService.preloadCommonTranslations().catch(err => {
        console.error('Error preloading translations:', err);
    });
}

module.exports = translationService;

